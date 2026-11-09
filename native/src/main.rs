mod chat_list;

fn main() {
    react_native_gpui::run(vec![Box::new(chat_list::ChatList)]);
}
