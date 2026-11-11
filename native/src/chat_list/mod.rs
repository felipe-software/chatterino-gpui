mod debug;
mod element;
mod events;
mod frames;
mod images;
mod layout;
mod model;
mod preview;
mod state;

use std::collections::HashSet;
use std::sync::Arc;
use std::time::Instant;

use gpui::{AnyElement, IntoElement, MouseButton, Window};
use serde_json::Value;

use element::ReactChatListElement;
use model::{ChatListOp, ChatListOptions};
use react_native_gpui::native_element::{
    NativeCommand, NativeDump, NativeElement, NativeProps, ReactElement, arm_paint_only_frame,
};

const ELEMENT_TYPE: &str = "chatlist";
const STATE_COMMAND: &str = "chatListState";

pub struct ChatList;

impl NativeElement for ChatList {
    fn element_type(&self) -> &'static str {
        ELEMENT_TYPE
    }

    fn parse_props(&self, props: Option<&Value>) -> NativeProps {
        NativeProps::new(ChatListOptions::parse(props))
    }

    fn render(&self, element: Arc<ReactElement>, _window_id: u64) -> AnyElement {
        ReactChatListElement::new(element).into_any_element()
    }

    fn props_change_is_paint_only(&self, _previous: &NativeProps, _next: &NativeProps) -> bool {
        true
    }

    fn parse_command(&self, name: &str, args: &Value) -> Option<NativeCommand> {
        model::parse_command(name, args).map(NativeCommand::new)
    }

    fn apply_command(&self, id: u64, command: NativeCommand) {
        let Some(op) = command.take::<ChatListOp>() else {
            return;
        };
        state::with_list(id, |list| list.apply(op));
        arm_paint_only_frame();
    }

    fn retain(&self, live: &HashSet<u64>) {
        state::retain(live);
    }

    fn forget_window(&self, window: u64) {
        images::forget_window(window);
    }

    fn selected_text(&self) -> Option<String> {
        state::selected_text()
    }

    fn selection_changed_at(&self) -> Option<Instant> {
        state::selection_changed_at()
    }

    fn clear_selection(&self) -> bool {
        state::clear_selection()
    }

    fn holds_image(&self, url: &str) -> bool {
        images::is_tracked(url)
    }

    fn handles_pointer(&self) -> bool {
        true
    }

    fn debug_tap(&self, id: u64, x: f32, y: f32, button: MouseButton) -> Option<Value> {
        debug::debug_tap(id, x, y, button)
    }

    fn scroll_by(&self, id: u64, _dx: f32, dy: f32, window: &Window) -> Option<bool> {
        let moved = element::scroll_list(id, dy, window);
        if moved {
            arm_paint_only_frame();
        }
        Some(moved)
    }

    fn dump(&self, id: u64) -> Option<NativeDump> {
        let (state, children) = debug::dump(id)?;
        Some(NativeDump { state, children })
    }

    fn debug_commands(&self) -> &'static [&'static str] {
        &[STATE_COMMAND]
    }

    fn debug_command(&self, _name: &str, request: &Value) -> Value {
        let flag = |key: &str| request.get(key).and_then(Value::as_bool).unwrap_or(false);
        debug::state_json(
            request.get("id").and_then(Value::as_u64),
            flag("images"),
            flag("timings"),
        )
    }
}
