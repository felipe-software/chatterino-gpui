import { useEffect, useRef, useState } from "react";
import { AppRegistry, Text, View, Window } from "@felipe-software/react-native-gpui";
import type { ChatListHandle, ChatListMessage } from "../../src/native/chatList";
import { ChatWindowContent } from "./chat-list-window/ChatWindowContent";
import { FixtureButton } from "./chat-list-window/FixtureButton";
import { COLORS, log, message } from "./chat-list-window/shared";

function App() {
    const [count, setCount] = useState(0);
    const [chatOpen, setChatOpen] = useState(false);
    const chatRef = useRef<ChatListHandle | null>(null);
    const nextMessage = useRef(0);

    useEffect(() => {
        log("ready");
        console.log("MW_READY");
    }, []);

    const appendMessages = (amount: number) => {
        const batch: ChatListMessage[] = [];
        for (let index = 0; index < amount; index++) batch.push(message(nextMessage.current++));
        chatRef.current?.append(batch);
        log("appended", { total: nextMessage.current });
    };

    return (
        <View testID="main-root" style={{ flex: 1, backgroundColor: COLORS.page, padding: 12 }}>
            <Text testID="main-count" style={{ color: COLORS.text, fontSize: 14 }}>{`count: ${count}`}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10 }}>
                <FixtureButton testID="open-chat" label="Chat window" onPress={() => setChatOpen(true)} />
                <FixtureButton testID="append" label="Append" onPress={() => appendMessages(5)} />
                <FixtureButton testID="increment" label="Increment" onPress={() => setCount((value) => value + 1)} />
                <FixtureButton testID="chat-top" label="Top" onPress={() => chatRef.current?.scrollToTop()} />
                <FixtureButton testID="chat-reveal" label="Reveal m-3" onPress={() => chatRef.current?.scrollToMessage("m-3", { align: "top" })} />
                <FixtureButton testID="chat-page-up" label="Page up" onPress={() => chatRef.current?.pageUp()} />
                <FixtureButton testID="chat-page-down" label="Page down" onPress={() => chatRef.current?.pageDown()} />
            </View>
            {chatOpen ? (
                <Window
                    testID="fixture-chat"
                    kind="normal"
                    title="Fixture Chat"
                    width={420}
                    height={300}
                    position={{ x: 40, y: 40 }}
                    onClose={(event) => {
                        log("chatClose", { reason: event.reason });
                        setChatOpen(false);
                    }}
                >
                    <ChatWindowContent chatRef={chatRef} count={count} />
                </Window>
            ) : null}
        </View>
    );
}

AppRegistry.registerComponent("ChatListWindowConformance", () => App);
AppRegistry.runApplication("ChatListWindowConformance", { width: 640, height: 420 });
