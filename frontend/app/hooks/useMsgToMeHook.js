import { socket } from "@frontend/services/socket";
import { useEffect } from "react";
import { updateMessageStatus } from "@frontend/localforage/messageStore";

// { id: tempId, roomId, text, senderId, friendId, status: "pending", created_at}
export default function useMsgToMeHook() {
  useEffect(() => {
    const handleNewMsg = (tempMsg) => {
      updateMessageStatus(tempMsg.id, "sent");
    };

    socket.on("msgToMe", handleNewMsg); // 메시지를 받는 이벤트가 발생함.

    return () => socket.off("msgToMe", handleNewMsg);
  }, []);
}
// not using now
