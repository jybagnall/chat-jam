import { ExclamationCircleIcon, UserIcon } from "@heroicons/react/24/solid";
import { format } from "date-fns";
import { useState } from "react";
import FriendProfile from "../FriendsPage/FriendProfile";

export default function FriendMsgBubble({
  friendInfo,
  text,
  createdAt,
  msgIsDeleted,
}) {
  const { userImgSrc: friendImg, username: friendName } = friendInfo;

  const [friendProfileOpens, setFriendProfileOpens] = useState(false);

  return (
    <div className="flex items-start gap-2">
      <div
        onClick={() => setFriendProfileOpens(true)}
        className="cursor-pointer"
      >
        {friendImg ? (
          <img
            src={friendImg.replace(
              "/upload/",
              "/upload/w_100,h_100,c_fill,f_auto,q_auto/"
            )}
            alt="user"
            className="size-8 shrink-0 rounded-full"
          />
        ) : (
          <span className="inline-flex items-center justify-center size-10 rounded-full bg-gray-100 shrink-0">
            <UserIcon className="size-8 text-gray-500" />
          </span>
        )}
      </div>

      <div>
        <div className="text-xs text-gray-500 mb-1">{friendName}</div>
        <div className="flex items-end gap-2">
          <div className="relative px-3 py-2 rounded-xl max-w-xs bg-gray-200 text-sm text-gray-900 rounded-bl-none">
            {msgIsDeleted ? (
              <div className="flex items-center gap-1 italic text-sm text-gray-600">
                <span>
                  <ExclamationCircleIcon className="size-5 text-gray-600" />
                </span>
                This message is deleted.
              </div>
            ) : (
              text
            )}
          </div>
          <span className="text-xs text-gray-500">
            {createdAt && !isNaN(new Date(createdAt))
              ? format(new Date(createdAt), "HH:mm")
              : "??:??"}
          </span>
        </div>
      </div>
      {friendProfileOpens && (
        <FriendProfile
          userInfo={friendInfo}
          friendProfileOpens={friendProfileOpens}
          setFriendProfileOpens={setFriendProfileOpens}
        />
      )}
    </div>
  );
}
