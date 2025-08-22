import { useContext } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { jwtDecode } from "jwt-decode";
import MessageBubble from "@frontend/components/ui/ChatRoom/MessageBubble";
import AuthContext from "@frontend/contexts/auth-context";
import Spinner from "@frontend/components/shared/Spinner";
import ChatHeader from "@frontend/components/ui/ChatRoom/ChatHeader";
import MessageInput from "@frontend/components/ui/ChatRoom/MessageInput";
import SpinnerMini from "@frontend/components/shared/SpinnerMini";
import useBlockStatusHooks from "@frontend/hooks/useBlockStatusHook";
import { useChatRoom } from "@frontend/hooks/useChatRoom";
import DateSeparator from "@frontend/components/ui/ChatRoom/DateSeperator";

export default function ChatRoom({ friendObj, startChatRoom, closeModal }) {
  const authContext = useContext(AuthContext);
  const decodedUser = authContext.accessToken
    ? jwtDecode(authContext.accessToken)
    : null;

  const { id: friendId, username: friendName } = friendObj;

  const [blockFriend, setBlockFriend] = useBlockStatusHooks(
    friendId,
    authContext
  );
  const {
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
  } = useChatRoom(friendId, authContext, closeModal);

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
                {isFetchingMoreMsg && (
                  <div className="flex justify-center py-2">
                    <SpinnerMini />
                  </div>
                )}

                {mergedChat.map((msg, i) => {
                  const prev = mergedChat[i - 1]; // previous msg obj
                  const currentDay = new Date(msg.created_at).toDateString();
                  const prevDay = prev
                    ? new Date(prev.created_at).toDateString()
                    : null;

                  // 첫 메시지 혹은 날짜가 이전 메시지와 다름
                  const showSeparator = i === 0 || currentDay !== prevDay;

                  // map 콜백의 결과물을 반환
                  return (
                    <div
                      key={String(msg.id) || msg.tempId}
                      className="flex flex-col gap-2"
                    >
                      {showSeparator && (
                        <DateSeparator createdAt={msg.created_at} />
                      )}

                      <MessageBubble
                        msg={msg}
                        myInfo={roomState.myInfo}
                        friendInfo={friendObj}
                        onLocalMsgDelete={onLocalMsgDelete}
                        setLocalMsgs={setLocalMsgs}
                      />
                    </div>
                  );
                })}

                <div ref={scrollBottomRef} />
              </div>

              <MessageInput
                roomId={roomState.roomId}
                senderId={roomState.myInfo.id || decodedUser.id}
                wrongConditon={!isRoomReady || !roomState.myInfo?.id}
                friendId={friendId}
                blockFriend={blockFriend}
                setLocalMsgs={setLocalMsgs}
              />
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
{
  /* { id, room_id, text, user_id, friend_id, status, created_at, is_deleted, is_read } = mergedChat */
}
