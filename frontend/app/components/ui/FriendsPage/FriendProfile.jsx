import { useContext, useState } from "react";
import toast from "react-hot-toast";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { UserIcon } from "@heroicons/react/24/solid";
import ChatRoom from "@frontend/components/ui/ChatRoom/ChatRoom";
import FriendsContext from "@frontend/contexts/friends-context";
import AuthContext from "@frontend/contexts/auth-context";
import UsersService from "@frontend/services/users.service";
import FriendProfileAction from "@frontend/components/ui/FriendsPage/FriendProfileAction";
import EnlargedImgModal from "@frontend/components/ui/FriendsPage/EnlargedImgModal";

export default function FriendProfile({
  userInfo,
  friendProfileOpens,
  setFriendProfileOpens,
}) {
  const { id, username, userImgSrc } = userInfo;
  const { setFriends } = useContext(FriendsContext);
  const [startChat, setStartChat] = useState(false);
  const [openImage, setOpenImage] = useState(false);
  const authContext = useContext(AuthContext);
  const abortController = new AbortController();
  const usersService = new UsersService(abortController, authContext);

  const handleUnfriend = async () => {
    try {
      await usersService.removeFriend(id);
      setFriends((prev) => prev.filter((f) => f.id !== id));
      setFriendProfileOpens(false);
    } catch (err) {
      if (!abortController.signal.aborted) {
        console.error(err);
        toast.error("Unexpected error happened.");
      }
    }
  };
  return (
    <div>
      <Dialog
        open={friendProfileOpens}
        onClose={() => {}}
        className="relative z-10"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-400/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <DialogPanel
              transition
              className="relative w-[90%] max-w-sm min-h-[20rem] sm:min-h-[20rem] transform overflow-hidden rounded-lg bg-white px-4 pt-4  text-left shadow-xl transition-all sm:p-6"
            >
              <div className="px-4 sm:px-6">
                <div className="ml-3 flex h-7 items-center">
                  <button
                    type="button"
                    onClick={() => setFriendProfileOpens(false)}
                    className="relative rounded-md bg-white text-gray-400 hover:text-gray-500"
                  >
                    <span className="absolute -inset-2.5" />
                    <span className="sr-only">Close panel</span>
                    <XMarkIcon aria-hidden="true" className="size-6" />
                  </button>
                </div>
              </div>
              <div className="mt-6 flex flex-col items-center justify-center gap-2 px-4 sm:px-6">
                {userImgSrc ? (
                  <img
                    alt="user image"
                    onClick={() => setOpenImage(true)}
                    src={userImgSrc.replace(
                      "/upload/",
                      "/upload/w_100,h_100,c_fill,f_auto,q_auto/"
                    )}
                    className="size-16 rounded-full"
                  />
                ) : (
                  <span className="inline-flex items-center justify-center size-22 rounded-full bg-gray-100">
                    <UserIcon className="h-14 w-14 text-gray-500" />
                  </span>
                )}
                <p className="text-lg font-medium text-gray-900">{username}</p>
              </div>

              <div className="flex flex-col items-center justify-center mt-12  border-t border-gray-300">
                <FriendProfileAction
                  setStartChat={setStartChat}
                  handleUnfriend={handleUnfriend}
                />
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {startChat && (
        <ChatRoom
          friendObj={userInfo}
          startChatRoom={startChat}
          closeModal={() => {
            setStartChat(false);
            setFriendProfileOpens(false);
          }}
        />
      )}
      {openImage && (
        <EnlargedImgModal
          imgSrc={userImgSrc}
          onClose={() => setOpenImage(false)}
        />
      )}
    </div>
  );
}
