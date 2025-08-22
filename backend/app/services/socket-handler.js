import { insertMsg, updateMsgAsRead } from "./chat-service.js";
import { sendPushToUser } from "./push-service.js";
import { isSenderBlocked } from "./users-service.js";

// io: 카톡 본사 서버
// io.on("connection", ..} 의 뜻은
// 내가 로그인을 했고, (프론트에서 socket.connect() 실행함 )
// 본사 서버로 내 소켓이 연결 요청을 하자 "connection" 콜백 실행

export default function socketHandler(io) {
  const pendingLastMsgs = new Map();
  const timers = new Map();

  io.on("connection", (socket) => {
    console.log("📍Backend socket is connected: ", socket.id);

    socket.on("register", async (userId) => {
      socket.userId = userId;
      socket.join(`user_${userId}`); // 개인 알림용 룸에 들어감.
    });

    socket.on("joinRoom", (roomId) => {
      socket.join(`room_${roomId}`);
      console.log("📍Joined the chat room");
    });

    socket.on("leaveRoom", (roomId) => {
      socket.leave(`room_${roomId}`);
    });

    // { id, room_id, user_id, friend_id, text, created_at, status, is_deleted, is_read} = pendingInfo
    // { room_id, user_id, friend_id, text, client_created_at, is_read } = insertedMsg
    socket.on("sendMsg", async (pendingMsgInfo, callback) => {
      const { room_id, text, user_id, friend_id, created_at } = pendingMsgInfo;

      try {
        const insertedMsg = await insertMsg(
          room_id,
          text,
          user_id,
          friend_id,
          created_at
        );
        const senderIsBlocked = await isSenderBlocked(user_id, friend_id);
        pendingLastMsgs.set(room_id, insertedMsg);

        callback({
          status: "sent",
          tempId: pendingMsgInfo.id,
          serverId: insertedMsg.id,
          serverCreatedAt: insertedMsg.created_at,
        });

        if (!senderIsBlocked) {
          //📍친구가 방에 없는지를 확인하고 텍스트도 같이 보내자
          const socketsInRoom = io.sockets.adapter.rooms.get(`room_${room_id}`);
          const friendSockets = io.sockets.adapter.rooms.get(
            `user_${friend_id}`
          );
          const isFriendInChatRoom =
            socketsInRoom &&
            friendSockets &&
            [...friendSockets].some((socketId) => socketsInRoom.has(socketId));

          if (isFriendInChatRoom) {
            io.to(`user_${friend_id}`).emit("messageToFriend", insertedMsg);
            io.to(`user_${user_id}`).emit("updateSenderChatRoom", {
              ...insertedMsg,
              is_read: true,
            });
          } else {
            await sendPushToUser(friend_id, text);
            io.to(`user_${friend_id}`).emit("notifyMessage", insertedMsg);
          }

          // 이 방에 타이머 없음 (첫 메시지일 때). 200ms 후 이벤트 보냄.
          if (!timers.has(room_id)) {
            const timerId = setTimeout(() => {
              const last = pendingLastMsgs.get(room_id);

              // 차단 안됨, 모두의 chat 페이지도 동시에 업데이트
              io.to(`user_${user_id}`).emit("updateChatSummary", {
                id: friend_id,
                lastMsg: last.text,
                lastMsgAt: last.created_at,
              });

              io.to(`user_${friend_id}`).emit("updateChatSummary", {
                id: user_id,
                lastMsg: last.text,
                lastMsgAt: last.created_at,
                lastMsgIsRead: false,
              });
              pendingLastMsgs.delete(room_id); // 마지막 메시지 지워놓음
              timers.delete(room_id); // 시간 안에 들어온 메시지 다 보내고 타이머 지움
            }, 200);

            timers.set(room_id, timerId);
          }
        } else {
          io.to(`user_${user_id}`).emit("updateChatSummary", {
            id: friend_id,
            lastMsg: insertedMsg.text,
            lastMsgAt: insertedMsg.created_at,
          });
        }
      } catch (err) {
        console.error("Failed to insert message:", err.message);
        callback({ status: "failed", tempId: pendingMsgInfo.id });
      }
    });

    // 나의 chat 페이지에서 Envelope 아이콘을 지움.
    // 상대방의 채팅방을 업데이트함 (unread를 없애줌)
    // { id, is_read: true, user_id, friend_id, room_id } = readMsg
    socket.on(
      "sendUnreadMsg",
      async ({ unreadMsgIds, roomId, myId, friendId }, callback) => {
        try {
          const updatedMsgs = await updateMsgAsRead(unreadMsgIds, roomId);
          const payload = { roomId, ids: updatedMsgs.map((m) => m.id) };

          io.to(`user_${friendId}`).emit("receiveReadMsg", payload);
          io.to(`user_${myId}`).emit("receiveReadMsg", payload);
          callback?.({ success: true });
        } catch (err) {
          console.error("Failed while receiving messages:", err.message);
          callback?.({ success: false });
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
}
