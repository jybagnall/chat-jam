import CurrentRoomContext from "@frontend/contexts/current-room-context";
import { socket } from "@frontend/services/socket";
import { useContext, useEffect } from "react";

export default function useUpdateSenderChatRoom(setLocalMsgs) {
  const { currentRoomId } = useContext(CurrentRoomContext);

  useEffect(() => {
    const updateChatRoom = (insertedMsg) => {
      if (insertedMsg.room_id === currentRoomId) {
        setLocalMsgs((prev) =>
          prev.map((m) =>
            m.id === insertedMsg.id ? { ...m, is_read: true } : m
          )
        );
      }
    };

    socket.on("updateSenderChatRoom", updateChatRoom);

    return () => socket.off("updateSenderChatRoom", updateChatRoom);
  }, [setLocalMsgs, currentRoomId]);
}

// {
//     ...msg,
//     id: serverId,
//     status: "sent",
//     created_at: serverCreatedAt,
//   }
