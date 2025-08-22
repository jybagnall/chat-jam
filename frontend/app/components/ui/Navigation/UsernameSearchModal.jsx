import { XMarkIcon } from "@heroicons/react/24/outline";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useContext, useState } from "react";
import toast from "react-hot-toast";
import UsersService from "@frontend/services/users.service";
import AuthContext from "@frontend/contexts/auth-context";
import FriendsContext from "@frontend/contexts/friends-context";
import ErrorPage from "@frontend/components/notifications/ErrorPage";
import SearchResult from "@frontend/components/ui/Navigation/SearchResult";
import UsernameSearchForm from "@frontend/components/ui/Navigation/UsernameSearchForm";

export default function UsernameSearchModal({ open, onClose }) {
  const authContext = useContext(AuthContext);
  const abortController = new AbortController();
  const usersService = new UsersService(abortController, authContext);

  const { setFriends } = useContext(FriendsContext);

  const [searchState, setSearchState] = useState({
    searchedUser: null,
    isSearching: false,
    hasSearched: false,
    error: null,
  });

  const [friendState, setFriendState] = useState({
    isAdding: false,
    isFriend: false,
    error: null,
  });

  const handleAddFriend = async (friendId) => {
    try {
      setFriendState((state) => ({ ...state, isAdding: true }));
      await usersService.addFriend(friendId);
      setFriendState((state) => ({
        ...state,
        isFriend: true,
        isAdding: false,
      }));
      setFriends((friends) => [...friends, searchState.searchedUser]);
      toast.success(
        `Successfully added ${searchState.searchedUser.name} as a new friend`
      );
    } catch (err) {
      if (!abortController.signal.aborted) {
        console.error(err);
        toast.error("Unexpected error while adding friend.");
      }
    }
  };

  if (searchState.error) {
    return <ErrorPage text={searchState.error} />;
  }

  return (
    <div>
      <Dialog open={open} onClose={onClose} className="relative z-10">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-400/100 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <DialogPanel
              transition
              className="relative w-[90%] max-w-sm h-[14rem] transform overflow-hidden rounded-lg bg-white px-4 pt-4 text-left shadow-xl transition-all sm:p-6"
            >
              <div className="px-4 sm:px-6">
                <div className="ml-3 flex h-7 items-center">
                  <button
                    type="button"
                    onClick={onClose}
                    className="relative rounded-md bg-white text-gray-400 hover:text-gray-500"
                  >
                    <span className="absolute -inset-2.5" />
                    <span className="sr-only">Close panel</span>
                    <XMarkIcon aria-hidden="true" className="size-6" />
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center justify-center gap-2 px-4 sm:px-6 mb-5">
                <UsernameSearchForm setSearchState={setSearchState} />
              </div>
              <div>
                <SearchResult
                  searchState={searchState}
                  friendState={friendState}
                  handleAddFriend={handleAddFriend}
                />
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
