import { PlusIcon } from "@heroicons/react/24/solid";
import ListedFriend from "@frontend/components/ui/FriendsPage/ListedFriend";

export default function SearchResult({
  searchState,
  friendState,
  handleAddFriend,
}) {
  return (
    <div>
      {searchState.hasSearched &&
        (searchState.searchedUser ? (
          <div className="flex items-center justify-center">
            <ListedFriend person={searchState.searchedUser} />
            <div
              onClick={() => {
                if (!friendState.isFriend && !friendState.isAdding) {
                  handleAddFriend(searchState.searchedUser.id);
                }
              }}
              disabled={friendState.isAdding}
              className={`relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 
                  rounded-bl-lg border border-transparent py-4 text-sm font-semibold 
                  text-gray-900 
                  ${
                    friendState.isFriend
                      ? "opacity-50 pointer-events-none"
                      : "cursor-pointer"
                  }`}
            >
              {!friendState.isFriend && (
                <PlusIcon aria-hidden="true" className="size-5 text-gray-400" />
              )}
              {friendState.isFriend ? "Added friend" : "Add to friend"}
            </div>
          </div>
        ) : (
          <p className="text-red-500 font-semibold text-center">
            User not found
          </p>
        ))}
    </div>
  );
}
