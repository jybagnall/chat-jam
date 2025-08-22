import { UserIcon, EnvelopeIcon } from "@heroicons/react/24/solid";
import TimestampInChatSum from "./TimestampInChatSum";

export default function ChatListItem({
  lastMsgAt,
  lastMsg,
  friendUsername,
  friendUserImgSrc,
  lastMsgSenderIsFriend,
  msgIsUnread,
}) {
  return (
    <div className="flex items-center gap-4">
      {friendUserImgSrc ? (
        <img
          alt="user image"
          src={friendUserImgSrc.replace(
            "/upload/",
            "/upload/w_100,h_100,c_fill,f_auto,q_auto/"
          )}
          className="size-14 shrink-0 rounded-full bg-gray-300"
        />
      ) : (
        <span className="inline-flex items-center justify-center size-14 rounded-full bg-gray-100">
          <UserIcon className="h-10 w-10 text-gray-500" />
        </span>
      )}

      <div className="flex-1 items-center gap-x-1">
        <div className="flex">
          <span className="text-lg font-semibold">{friendUsername}</span>
          {lastMsgSenderIsFriend && msgIsUnread && (
            <span className="ml-2 pt-2">
              <EnvelopeIcon className="text-orange-500 size-4" />
            </span>
          )}
        </div>
        <div className="flex flex-1 overflow-hidden justify-between items-center">
          <div
            className="text-sm text-gray-500 truncate w-full
    max-w-[220px] sm:max-w-[280px] md:max-w-[360px] lg:max-w-[480px]"
          >
            {lastMsg}
          </div>
          <div className="text-xs text-gray-400 whitespace-nowrap ml-4 shrink-0">
            {lastMsgAt && <TimestampInChatSum lastMsgAt={lastMsgAt} />}
          </div>
        </div>
      </div>
    </div>
  );
}
