use std::cell::{Cell, RefCell};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::OnceLock;
use std::time::{Duration, Instant};

use futures::channel::oneshot;
use gpui::{App, SharedString, Window};

const MAX_RUNNING: usize = 2;
const TIMEOUT: Duration = Duration::from_secs(20);
const POLL_EVERY: Duration = Duration::from_millis(50);
const SEEK_SECONDS: [&str; 2] = ["0.5", "0"];
const READ_TIMEOUT_MICROS: &str = "10000000";
const FRAME_FILTER: &str = "scale='min(640,iw)':-2";
const FALLBACK_FFMPEG_DIRS: [&str; 3] = ["/opt/homebrew/bin", "/usr/local/bin", "/usr/bin"];

enum FrameState {
    Running,
    Ready(SharedString),
    Failed,
}

thread_local! {
    static FRAMES: RefCell<HashMap<SharedString, FrameState>> = RefCell::new(HashMap::new());
    static RUNNING: Cell<usize> = const { Cell::new(0) };
}

fn env_path(name: &str) -> Option<PathBuf> {
    std::env::var_os(name)
        .filter(|value| !value.is_empty())
        .map(PathBuf::from)
}

fn platform_cache_root() -> Option<PathBuf> {
    let home = env_path("HOME");
    if cfg!(target_os = "macos") {
        return home.map(|home| home.join("Library").join("Caches"));
    }
    env_path("XDG_CACHE_HOME").or_else(|| home.map(|home| home.join(".cache")))
}

fn app_id() -> String {
    std::env::var("RNGPUI_APP_ID")
        .ok()
        .filter(|id| !id.is_empty())
        .unwrap_or_else(|| "chatterino-gpui".to_string())
}

fn cache_dir() -> Option<&'static Path> {
    static DIR: OnceLock<Option<PathBuf>> = OnceLock::new();
    DIR.get_or_init(|| {
        let base = if let Some(dir) = env_path("RNGPUI_CACHE_DIR") {
            dir
        } else if std::env::var_os("RNGPUI_TEST_MODE").is_some() {
            std::env::temp_dir().join(format!("chatterino-gpui-{}", std::process::id()))
        } else {
            platform_cache_root()?.join(app_id())
        };
        let dir = base.join("video-frames");
        std::fs::create_dir_all(&dir).ok()?;
        Some(dir)
    })
    .as_deref()
}

fn ffmpeg() -> Option<&'static Path> {
    static BINARY: OnceLock<Option<PathBuf>> = OnceLock::new();
    BINARY
        .get_or_init(|| {
            let path_dirs = std::env::var_os("PATH")
                .map(|paths| std::env::split_paths(&paths).collect::<Vec<_>>())
                .unwrap_or_default();
            path_dirs
                .into_iter()
                .chain(FALLBACK_FFMPEG_DIRS.iter().map(PathBuf::from))
                .map(|dir| dir.join("ffmpeg"))
                .find(|candidate| candidate.is_file())
        })
        .as_deref()
}

fn fnv1a(text: &str) -> u64 {
    let mut hash: u64 = 0xcbf2_9ce4_8422_2325;
    for byte in text.bytes() {
        hash ^= u64::from(byte);
        hash = hash.wrapping_mul(0x0000_0100_0000_01b3);
    }
    hash
}

fn frame_file(dir: &Path, url: &str) -> PathBuf {
    dir.join(format!("{:016x}-{}.jpg", fnv1a(url), url.len()))
}

fn is_remote(url: &str) -> bool {
    url.starts_with("https://") || url.starts_with("http://")
}

fn path_string(path: &Path) -> SharedString {
    SharedString::from(path.to_string_lossy().into_owned())
}

pub fn frame(url: &SharedString, window: &mut Window, cx: &mut App) -> Option<SharedString> {
    let known = FRAMES.with_borrow(|frames| {
        frames.get(url).map(|state| match state {
            FrameState::Ready(path) => Some(path.clone()),
            FrameState::Running | FrameState::Failed => None,
        })
    });
    if let Some(result) = known {
        return result;
    }
    let target = cache_dir().map(|dir| frame_file(dir, url));
    let (Some(target), Some(binary), true) = (target, ffmpeg(), is_remote(url)) else {
        settle(url.clone(), FrameState::Failed);
        return None;
    };
    if target.is_file() {
        let path = path_string(&target);
        settle(url.clone(), FrameState::Ready(path.clone()));
        return Some(path);
    }
    if RUNNING.get() >= MAX_RUNNING {
        return None;
    }
    RUNNING.set(RUNNING.get() + 1);
    settle(url.clone(), FrameState::Running);
    let (sender, receiver) = oneshot::channel();
    let source = url.to_string();
    let binary = binary.to_path_buf();
    let output = target.clone();
    std::thread::Builder::new()
        .name("chat-video-frame".into())
        .spawn(move || {
            let _ = sender.send(extract(&binary, &source, &output));
        })
        .ok()?;
    let url = url.clone();
    window
        .spawn(cx, async move |cx| {
            let extracted = receiver.await.unwrap_or(false);
            RUNNING.set(RUNNING.get().saturating_sub(1));
            let state = if extracted {
                FrameState::Ready(path_string(&target))
            } else {
                FrameState::Failed
            };
            settle(url, state);
            let _ = cx.update(|window, _cx| {
                react_native_gpui::native_element::arm_paint_only_frame();
                window.refresh();
            });
        })
        .detach();
    None
}

fn settle(url: SharedString, state: FrameState) {
    FRAMES.with_borrow_mut(|frames| frames.insert(url, state));
}

fn extract(binary: &Path, url: &str, output: &Path) -> bool {
    let temp = output.with_extension(format!("{}.part.jpg", std::process::id()));
    for seek in SEEK_SECONDS {
        let _ = std::fs::remove_file(&temp);
        let child = Command::new(binary)
            .args(["-nostdin", "-hide_banner", "-loglevel", "error"])
            .args(["-protocol_whitelist", "http,https,tcp,tls,crypto"])
            .args(["-rw_timeout", READ_TIMEOUT_MICROS, "-ss", seek, "-i", url])
            .args(["-frames:v", "1", "-vf", FRAME_FILTER, "-q:v", "4"])
            .args(["-f", "image2", "-y"])
            .arg(&temp)
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn();
        let Ok(mut child) = child else {
            return false;
        };
        let finished = wait_with_timeout(&mut child);
        let wrote_frame = std::fs::metadata(&temp).is_ok_and(|meta| meta.len() > 0);
        if finished && wrote_frame {
            return std::fs::rename(&temp, output).is_ok();
        }
        if !finished {
            break;
        }
    }
    let _ = std::fs::remove_file(&temp);
    false
}

fn wait_with_timeout(child: &mut Child) -> bool {
    let started = Instant::now();
    loop {
        match child.try_wait() {
            Ok(Some(_)) => return true,
            Ok(None) if started.elapsed() < TIMEOUT => std::thread::sleep(POLL_EVERY),
            _ => {
                let _ = child.kill();
                let _ = child.wait();
                return false;
            }
        }
    }
}

pub fn counts() -> (usize, usize, usize) {
    FRAMES.with_borrow(|frames| {
        frames
            .values()
            .fold((0, 0, 0), |(ready, running, failed), state| match state {
                FrameState::Ready(_) => (ready + 1, running, failed),
                FrameState::Running => (ready, running + 1, failed),
                FrameState::Failed => (ready, running, failed + 1),
            })
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn frame_files_are_stable_per_url() {
        let dir = Path::new("/cache");
        let first = frame_file(dir, "https://f.feridinha.com/8gxpl.mp4");
        assert_eq!(first, frame_file(dir, "https://f.feridinha.com/8gxpl.mp4"));
        assert_ne!(first, frame_file(dir, "https://f.feridinha.com/other.mp4"));
        assert!(first.to_string_lossy().ends_with("-33.jpg"));
    }

    #[test]
    fn only_remote_urls_reach_ffmpeg() {
        assert!(is_remote("https://a.b/c.mp4"));
        assert!(is_remote("http://a.b/c.mp4"));
        assert!(!is_remote("file:///etc/passwd"));
        assert!(!is_remote("concat:a|b"));
    }
}
