import {
  ChatBubbleBottomCenterIcon,
  UserMinusIcon,
} from "@heroicons/react/24/solid";

export default function FriendProfileAction({ setStartChat, handleUnfriend }) {
  return (
    <div className="flex items-center justify-center pt-6 pb-2">
      <div
        className="flex flex-col items-center justify-center gap-2 px-6"
        onClick={() => setStartChat(true)}
      >
        <ChatBubbleBottomCenterIcon className="size-6 text-gray-700" />
        <div className="text-sm font-semibold text-gray-700">
          Send a message
        </div>
      </div>
      <div
        className="flex flex-col items-center justify-center gap-2 px-6"
        onClick={handleUnfriend}
      >
        <UserMinusIcon className="size-6 text-red-400" />
        <div className="text-sm font-semibold text-red-500">Unfriend</div>
      </div>
    </div>
  );
}
