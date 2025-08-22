import { jwtDecode } from "jwt-decode";
import { useContext, useEffect, useState } from "react";
import { socket } from "@frontend/services/socket";
import toast from "react-hot-toast";
import AuthContext from "@frontend/contexts/auth-context";
import UnreadContext from "@frontend/contexts/unread-context";
import Spinner from "@frontend/components/shared/Spinner";
import ChatService from "@frontend/services/chat.service";
import ChatRoom from "@frontend/components/ui/ChatRoom/ChatRoom";
import ChatListItem from "@frontend/components/ui/ChatRoom/ChatListItem";
import useUpdateChatSummaryHook from "@frontend/hooks/useUpdateChatSummaryHook";
import useUpdateEnvelopeHook from "@frontend/hooks/useUpdateEnvelopeHook";

export default function Chat() {
  const { unreadCount } = useContext(UnreadContext);
  const authContext = useContext(AuthContext);
  const decodedUser = authContext.accessToken
    ? jwtDecode(authContext.accessToken)
    : null;

  const [page, setPage] = useState({
    isLoading: true,
    error: null,
    chatSummaries: [],
  });

  const [selectedFriend, setSelectedFriend] = useState(null);
  const [startChat, setStartChat] = useState(false);
  const totalMsgs = Object.values(unreadCount).reduce(
    (sum, count) => sum + Number(count),
    0
  );
  // {id, username, userImgSrc, lastMsg, lastMsgId, lastMsgAt, lastMsgSenderId, lastMsgIsRead, room_id, }
  const fetchPageData = async () => {
    const abortController = new AbortController();
    const chatService = new ChatService(abortController, authContext);

    try {
      setPage((state) => ({ ...state, isLoading: true }));
      const data = await chatService.getChatSummaries();

      const sortedDataByDate = data
        .slice()
        .sort((a, b) => new Date(b.lastMsgAt) - new Date(a.lastMsgAt));

      setPage((state) => ({
        ...state,
        isLoading: false,
        chatSummaries: sortedDataByDate,
      }));
    } catch (err) {
      if (!abortController.signal.aborted) {
        console.error(err);
        setPage((state) => ({
          ...state,
          error: "Unexpected error while loading data",
          isLoading: false,
        }));
        toast.error("Unexpected error while loading data");
      }
    }
  };

  useUpdateChatSummaryHook(setPage);
  useUpdateEnvelopeHook(setPage);

  useEffect(() => {
    document.title = "ChatJam, Talk Smart";

    fetchPageData();

    socket.on("connect", fetchPageData); // 소켓 재연결 시 동기화

    return () => {
      socket.off("connect", fetchPageData);
    };
  }, []);

  if (page.isLoading || !decodedUser) {
    return <Spinner />;
  }

  return (
    <div className="w-full md:w-[600px] lg:w-[800px] xl:w-[1000px] mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">
        💬{" "}
        {totalMsgs > 0
          ? `${totalMsgs} Message${totalMsgs === 1 ? "" : "s"}`
          : "Message"}
      </h1>

      {page.chatSummaries.length > 0 && (
        <ul className="border border-gray-200 p-1 rounded-md w-full">
          {page.chatSummaries.map((sum) => (
            <li
              key={sum.id}
              onClick={() => {
                setStartChat(true);
                setSelectedFriend(sum);
              }}
              className="flex flex-col gap-1 p-2 hover:bg-gray-100 cursor-pointer"
            >
              <ChatListItem
                lastMsgAt={sum.lastMsgAt}
                lastMsg={sum.lastMsg}
                friendUsername={sum.username}
                friendUserImgSrc={sum.userImgSrc}
                lastMsgSenderIsFriend={sum.lastMsgSenderId !== decodedUser.id}
                msgIsUnread={!sum.lastMsgIsRead}
              />
            </li>
          ))}
        </ul>
      )}
      {startChat && selectedFriend && (
        <ChatRoom
          friendObj={selectedFriend}
          startChatRoom={startChat}
          closeModal={() => {
            setStartChat(false);
            setSelectedFriend(null);
          }}
        />
      )}
    </div>
  );
}
