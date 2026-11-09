# chatterino-gpui

A Twitch chat client that looks and behaves like [Chatterino 2](https://chatterino.com), written in
React with [react-native-gpui](https://github.com/felipe-software/react-native-gpui). No browser or
Electron: the UI is drawn natively on the GPU (Vulkan on Linux, Metal on macOS).

Not an official Chatterino project.

![chatterino-gpui on Linux](docs/screenshots/main-tab.png)

## Requirements

- [Bun](https://bun.sh) 1.4+ and Node.js 18+
- Linux x64/arm64 with Vulkan and `libjavascriptcoregtk-4.1-0`, or macOS on Apple Silicon
- Rust and a [react-native-gpui](https://github.com/felipe-software/react-native-gpui) checkout
  next to this one: the chat list is a native element, so the app builds its own renderer
  binary (`native/`) on the library's Rust crate. On Linux it also needs the library's build
  dependencies (`pkg-config`, `libjavascriptcoregtk-4.1-dev`, `libxkbcommon-x11-dev`,
  `libasound2-dev`).

## Run

```sh
git clone https://github.com/felipe-software/react-native-gpui.git
git clone https://github.com/felipe-software/chatterino-gpui.git
cd chatterino-gpui
bun install
bun run build:native
bun run start
```

## Test

```sh
bun test
bun run typecheck
```

## License

MIT, see [LICENSE](LICENSE). Icons, sounds and avatars in `assets/` and `src/ui/assets/` come from
Chatterino 2.5.5 under its [MIT license](assets/CHATTERINO-LICENSE.txt).
