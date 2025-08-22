import {
  ChatBubbleBottomCenterIcon,
  PlusIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import { useContext, useState } from "react";
import { toast } from "react-hot-toast";
import UsersService from "@frontend/services/users.service";
import AuthContext from "@frontend/contexts/auth-context";
import ChatRoom from "@frontend/components/ui/ChatRoom/ChatRoom";
import EnlargedImgModal from "../FriendsPage/EnlargedImgModal";

export default function ExploredUserProfile({ searchedUser }) {
  const { id: friendId, username, userImgSrc, city, state } = searchedUser;
  const authContext = useContext(AuthContext);

  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [startChatRoom, setStartChatRoom] = useState(false);
  const [openImage, setOpenImage] = useState(false);

  const abortController = new AbortController();
  const usersService = new UsersService(abortController, authContext);

  const handleAddFriend = async (friendId) => {
    try {
      setIsAddingFriend(true);
      await usersService.addFriend(friendId);
      setIsFriend(true);
      toast.success(`Successfully added ${username} as a new friend`);
    } catch (err) {
      if (!abortController.signal.aborted) {
        console.error(err);
        toast.error("Unexpected error while adding friend.");
      }
    }
  };

  return (
    <>
      <div className="flex w-full items-center justify-between space-x-6 p-6">
        <div className="flex-1 truncate">
          <div className="flex items-center space-x-3">
            <h3 className="truncate text-sm font-medium text-gray-900">
              {username}
            </h3>
          </div>
          <p className="mt-1 truncate text-sm text-gray-500">
            {city}, {state}
          </p>
        </div>

        {userImgSrc ? (
          <img
            alt="user image"
            onClick={() => setOpenImage(true)}
            src={userImgSrc.replace(
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
      </div>
      <div>
        <div className="-mt-px flex divide-x divide-gray-200">
          <div className="flex w-0 flex-1">
            <div
              onClick={() => {
                if (!isFriend && !isAddingFriend) {
                  handleAddFriend(friendId);
                }
              }}
              disabled={isAddingFriend}
              className={`relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 
              rounded-bl-lg border border-transparent py-4 text-sm font-semibold 
              text-gray-900 
              ${
                isFriend
                  ? "opacity-50 pointer-events-none"
                  : "cursor-pointer hover:bg-gray-100"
              }`}
            >
              {!isFriend && (
                <PlusIcon aria-hidden="true" className="size-5 text-gray-400" />
              )}
              {isFriend ? "Added friend" : "Add to friend"}
            </div>
          </div>
          <div className="-ml-px flex w-0 flex-1">
            <div
              onClick={() => {
                setStartChatRoom(true);
              }}
              className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-100"
            >
              <ChatBubbleBottomCenterIcon
                aria-hidden="true"
                className="size-5 text-gray-400"
              />
              Send a message
            </div>
          </div>
        </div>
      </div>

      {startChatRoom && (
        <ChatRoom
          friendObj={searchedUser}
          startChatRoom={startChatRoom}
          closeModal={() => {
            setStartChatRoom(false);
          }}
        />
      )}
      {openImage && (
        <EnlargedImgModal
          imgSrc={userImgSrc}
          onClose={() => setOpenImage(false)}
        />
      )}
    </>
  );
}
