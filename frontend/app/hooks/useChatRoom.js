import toast from "react-hot-toast";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import CurrentRoomContext from "@frontend/contexts/current-room-context";
import SocketContext from "@frontend/contexts/socket-context";
import { getMessagesByStatus } from "@frontend/localforage/messageStore";
import AccountService from "@frontend/services/account.service";
import ChatService from "@frontend/services/chat.service";
import useMsgToFriendHook from "@frontend/hooks/useMsgToFriendHook";
import useEmitUnreadMsgHook from "@frontend/hooks/useEmitUnreadMsgHook";
import useReceiveReadMsgHook from "@frontend/hooks/useReceiveReadMsgHook";
import useScrollToBottomHook from "@frontend/hooks/useScrollToBottomHook";
import useChatHandlers from "@frontend/hooks/useChatHandlers";
import { joinRoom, leaveRoom } from "@frontend/services/socket";
import {
  normalizeLocalMsg,
  normalizeServerMsg,
} from "@frontend/utils/unifyMsgSchema";
import useUpdateSenderChatRoom from "./useUpdateSenderChatRoom";

export function useChatRoom(friendId, authContext, closeModal) {
  const { userExitedOnPurpose } = useContext(SocketContext);
  const { setCurrentRoomId } = useContext(CurrentRoomContext);

  const [localMsgs, setLocalMsgs] = useState([]);
  const [roomState, setRoomState] = useState({
    isLoading: false,
    error: null,
    roomId: "",
    msgHistory: [],
    myInfo: {},
  });
  const [isRoomReady, setIsRoomReady] = useState(false);
  const [messageCursor, setMessageCursor] = useState({
    createdAt: null,
    id: null,
  });
  const [isFetchingMoreMsg, setIsFetchingMoreMsg] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [hasMoreChatHistory, setHasMoreChatHistory] = useState(true);
  const scrollBottomRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const abortController = new AbortController();
    const accountService = new AccountService(abortController, authContext);
    const chatService = new ChatService(abortController, authContext);

    const prepareChatRoom = async () => {
      try {
        setRoomState((state) => ({ ...state, isLoading: true }));
        const myData = await accountService.getUserInfo();
        const chatRoomId = await chatService.getChatRoomId(friendId);
        const { messages, nextCursor, hasMore } =
          await chatService.getChatHistory(chatRoomId, friendId, messageCursor);

        setRoomState((state) => ({
          ...state,
          isLoading: false,
          roomId: chatRoomId,
          msgHistory: [...messages].reverse(),
          myInfo: myData,
        }));
        const allFailed = await getMessagesByStatus("failed");
        const thisRoomFailedMsgs = allFailed.filter(
          (m) => m.room_id === chatRoomId
        );
        setLocalMsgs(thisRoomFailedMsgs);
        setIsRoomReady(true);
        setMessageCursor(nextCursor);
        setHasMoreChatHistory(hasMore);
      } catch (err) {
        if (!abortController.signal.aborted) {
          console.error(err);
          setRoomState((state) => ({
            ...state,
            error: "Unexpected error while loading data",
            isLoading: false,
          }));
        }
      }
    };

    prepareChatRoom();
    return () => {
      abortController.abort();
    };
  }, [friendId]);

  // socket hooks
  useUpdateSenderChatRoom(setLocalMsgs);
  useMsgToFriendHook(setRoomState, roomState.myInfo.id);

  useEmitUnreadMsgHook(
    roomState.msgHistory,
    roomState.roomId,
    roomState.myInfo.id,
    friendId
  );
  useReceiveReadMsgHook(setRoomState, roomState.myInfo.id);

  // custom hooks
  useScrollToBottomHook(
    scrollBottomRef,
    roomState.msgHistory,
    shouldAutoScroll && hasMoreChatHistory
  );

  const { onLocalMsgDelete, loadMoreMessages } = useChatHandlers({
    authContext,
    friendId,
    roomState,
    setRoomState,
    setShouldAutoScroll,
    isFetchingMoreMsg,
    setIsFetchingMoreMsg,
    messageCursor,
    setMessageCursor,
    hasMoreChatHistory,
    setHasMoreChatHistory,
  });

  useEffect(() => {
    if (roomState.error) {
      toast.dismiss();
      toast.error(roomState.error);
    }
  }, [roomState.error]);

  useEffect(() => {
    if (!roomState.roomId) return;
    joinRoom(roomState.roomId);
    setCurrentRoomId(roomState.roomId);
  }, [roomState.roomId]);

  useEffect(() => {
    userExitedOnPurpose.current = false;
  }, [userExitedOnPurpose]);

  const mergedChat = useMemo(() => {
    if (!isRoomReady) return [];

    const fromServer = roomState.msgHistory.map(normalizeServerMsg);
    const fromLocal = localMsgs.map(normalizeLocalMsg);
    const serverIds = new Set(fromServer.map((m) => String(m.id)));
    const filteredLocal = fromLocal.filter((m) => !serverIds.has(String(m.id)));
    // 메시지가 일단 보내지면 서버에 저장된 아이디로 로컬 아이디가 바뀜. 중복 제거 필수.

    return [...fromServer, ...filteredLocal].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [roomState.msgHistory, localMsgs, isRoomReady]);

  const handleLeaveRoom = () => {
    userExitedOnPurpose.current = true;
    setCurrentRoomId(null);
    leaveRoom(roomState.roomId);
    closeModal();
  };

  const handleScroll = async () => {
    const msgContainer = scrollRef.current;
    const { scrollTop, scrollHeight, clientHeight } = msgContainer;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;
    // 스크롤이 맨 아래에 있나 확인함. 5px 이내로 가까우면 true.

    if (isAtBottom) {
      setShouldAutoScroll(true);
    } else {
      setShouldAutoScroll(false);
    }

    // 메시지를 더 부르기 전, 현재 스크롤이 가능한 높이를 저장함
    if (scrollTop === 0 && !isFetchingMoreMsg && hasMoreChatHistory) {
      const currentScrollHeight = msgContainer.scrollHeight;

      await loadMoreMessages();

      requestAnimationFrame(() => {
        const newScrollHeight = msgContainer.scrollHeight;
        const heightDiff = newScrollHeight - currentScrollHeight;
        msgContainer.scrollTop = heightDiff;
      }); // 과거의 메시지 불러와도 스크롤의 위치는 유지
    }
  };

  return {
    roomState,
    setLocalMsgs,
    isRoomReady,
    mergedChat,
    scrollRef,
    scrollBottomRef,
    isFetchingMoreMsg,
    onLocalMsgDelete,
    handleLeaveRoom,
    handleScroll,
  };
}

// scrollTop: 맨 위에서 스크롤이 얼마나 내려갔나 (내려가면 값 증가)
// scrollHeight: 스크롤 가능한 높이 (메시지가 증가하면 높이도 증가)
// clientHeight: 메시지가 보여지는 채팅 컨테이너 높이
