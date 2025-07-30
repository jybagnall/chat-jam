import { useState, useEffect, useRef, useContext } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";

import { joinRoom, leaveRoom } from "@frontend/services/socket";
import MessageBubble from "@frontend/components/ui/ChatRoom/MessageBubble";
import AuthContext from "@frontend/contexts/auth-context";
import SocketContext from "@frontend/contexts/socket-context";
import CurrentRoomContext from "@frontend/contexts/current-room-context";
import AccountService from "@frontend/services/account.service";
import ChatService from "@frontend/services/chat.service";
import Spinner from "@frontend/components/shared/Spinner";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import useMsgToMeHook from "@frontend/hooks/useMsgToMeHook";
import useScrollToBottomHook from "@frontend/hooks/useScrollToBottomHook";
import useEmitUnreadMsgHook from "@frontend/hooks/useEmitUnreadMsgHook";
import useReceiveReadMsgHook from "@frontend/hooks/useReceiveReadMsgHook";
import useSocketErrorHook from "@frontend/hooks/useSocketErrorHook";
import useMsgToRoomHook from "@frontend/hooks/useMsgToRoomHook";
import SpinnerMini from "@frontend/components/shared/SpinnerMini";
import useChatHandlers from "@frontend/hooks/useChatHandlers";
import useBlockStatusHooks from "@frontend/hooks/useBlockStatusHook";

export default function ChatRoom({ friendObj, startChatRoom, closeModal }) {
  const authContext = useContext(AuthContext);
  const { userExitedOnPurpose } = useContext(SocketContext);
  const { setCurrentRoomId } = useContext(CurrentRoomContext);
  const decodedUser = authContext.accessToken
    ? jwtDecode(authContext.accessToken)
    : null;

  const [roomState, setRoomState] = useState({
    isLoading: false,
    error: null,
    roomId: "",
    msgHistory: [],
    myInfo: {},
  });

  const { id: friendId, username: friendName } = friendObj;
  const [isRoomReady, setIsRoomReady] = useState(false);
  const [messageCursor, setMessageCursor] = useState({
    createdAt: null,
    id: null,
  });
  const [isFetchMoreMsg, setIsFetchMoreMsg] = useState(false);
  const [blockFriend, setBlockFriend] = useBlockStatusHooks(
    friendId,
    authContext
  );
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [hasMoreChatHistory, setHasMoreChatHistory] = useState(true);
  const scrollBottomRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    userExitedOnPurpose.current = false;
  }, [userExitedOnPurpose]);

  useMsgToMeHook(roomState.roomId, setRoomState);
  useMsgToRoomHook(setRoomState, roomState.myInfo.id);

  useEmitUnreadMsgHook(
    roomState.msgHistory,
    roomState.roomId,
    roomState.myInfo.id
  );
  useReceiveReadMsgHook(setRoomState, roomState.myInfo.id);

  useScrollToBottomHook(
    scrollBottomRef,
    roomState.msgHistory,
    shouldAutoScroll && hasMoreChatHistory
  );
  useSocketErrorHook();

  const { onLocalMsgDelete, loadMoreMessages } = useChatHandlers({
    authContext,
    friendId,
    roomState,
    setRoomState,
    setShouldAutoScroll,
    isFetchMoreMsg,
    setIsFetchMoreMsg,
    messageCursor,
    setMessageCursor,
    hasMoreChatHistory,
    setHasMoreChatHistory,
  });

  const handleLeaveRoom = () => {
    userExitedOnPurpose.current = true;
    setCurrentRoomId(null);
    leaveRoom(roomState.roomId);
    closeModal();
  };

  useEffect(() => {
    if (roomState.error) {
      toast.dismiss();
      toast.error(roomState.error);
    }
  }, [roomState.error]);

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

  useEffect(() => {
    if (!roomState.roomId) return;
    joinRoom(roomState.roomId);
    setCurrentRoomId(roomState.roomId);
  }, [roomState.roomId]);

  // scrollTop: 맨 위에서 스크롤이 얼마나 내려갔나 (내려가면 값 증가)
  // scrollHeight: 스크롤 가능한 높이 (메시지가 증가하면 높이도 증가)
  // clientHeight: 메시지가 보여지는 채팅 컨테이너 높이
  const handleScroll = async () => {
    const msgContainer = scrollRef.current;

    const { scrollTop, scrollHeight, clientHeight } = msgContainer;

    // 스크롤이 맨 아래에 있나 확인함. 5px 이내로 가까우면 true.
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5;

    if (isAtBottom) {
      setShouldAutoScroll(true);
    } else {
      setShouldAutoScroll(false);
    }

    // 메시지를 더 부르기 전, 현재 스크롤이 가능한 높이를 저장함
    if (scrollTop === 0 && !isFetchMoreMsg && hasMoreChatHistory) {
      const currentScrollHeight = msgContainer.scrollHeight;

      await loadMoreMessages();

      requestAnimationFrame(() => {
        const newScrollHeight = msgContainer.scrollHeight;
        const heightDiff = newScrollHeight - currentScrollHeight;
        msgContainer.scrollTop = heightDiff;
        // 과거의 메시지 불러와도 스크롤의 위치는 유지
      });
    }
  };

  if (roomState.isLoading || !decodedUser) {
    return <Spinner />;
  }
  if (blockFriend === null) return <Spinner />;
  return (
    <div>
      <Dialog open={startChatRoom} onClose={() => {}} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-400/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <DialogPanel
              transition
              className="relative w-[90%] max-w-md h-[80vh] sm:min-h-[28rem] 
             bg-white px-4 pt-4 pb-3 text-left rounded-lg shadow-xl flex flex-col"
            >
              <ChatHeader
                friendName={friendName}
                closeModal={handleLeaveRoom}
                friendId={friendId}
                blockFriend={blockFriend}
                setBlockFriend={setBlockFriend}
              />

              {/* list of messages & each msg has msg obj.📌 */}
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto space-y-2 px-1"
              >
                {isFetchMoreMsg && (
                  <div className="flex justify-center py-2">
                    <SpinnerMini />
                  </div>
                )}

                {roomState.msgHistory.map((msg, i) => (
                  <MessageBubble
                    key={i}
                    msg={msg}
                    myInfo={roomState.myInfo}
                    friendInfo={friendObj}
                    onLocalMsgDelete={onLocalMsgDelete}
                    loadMoreMessages={loadMoreMessages}
                    fetchMoreMsg={isFetchMoreMsg}
                    setFetchMoreMsg={setIsFetchMoreMsg}
                  />
                ))}
                <div ref={scrollBottomRef} />
              </div>

              <MessageInput
                roomId={roomState.roomId}
                senderId={roomState.myInfo.id || decodedUser.id}
                wrongConditon={!isRoomReady || !roomState.myInfo?.id}
                friendId={friendId}
                blockFriend={blockFriend}
              />
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
