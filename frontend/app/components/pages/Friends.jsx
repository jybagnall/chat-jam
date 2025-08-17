import { useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import AuthContext from "@frontend/contexts/auth-context";
import FriendsContext from "@frontend/contexts/friends-context";
import AccountService from "@frontend/services/account.service";
import Spinner from "@frontend/components/shared/Spinner";
import ErrorPage from "@frontend/components/notifications/ErrorPage";
import ListedFriend from "@frontend/components/ui/ListedFriend";
import MyProfile from "@frontend/components/ui/MyProfile";
import FriendProfile from "@frontend/components/ui/FriendProfile";
import UsersService from "@frontend/services/users.service";
//import usePushNotifications from "@frontend/hooks/usePushNotifications";

export default function Friends() {
  const authContext = useContext(AuthContext);
  const decodedUser = authContext.accessToken
    ? jwtDecode(authContext.accessToken)
    : null;
  const { friends, setFriends } = useContext(FriendsContext);

  const [myProfileOpens, setMyProfileOpens] = useState(false);
  const [friendProfileOpens, setFriendProfileOpens] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [page, setPage] = useState({
    isLoading: true,
    error: null,
    userData: {},
  });

  //usePushNotifications(decodedUser?.id);

  useEffect(() => {
    document.title = "ChatJam, Talk Smart";

    const accountController = new AbortController();
    const userController = new AbortController();
    const accountService = new AccountService(accountController, authContext);
    const usersService = new UsersService(userController, authContext);

    const fetchPageData = async () => {
      try {
        setPage((state) => ({ ...state, isLoading: true }));
        const data = await accountService.getUserInfo();
        const fetchedFriends = await usersService.getUserFriends();

        setPage((state) => ({
          ...state,
          userData: data,
          isLoading: false,
        }));
        setFriends(fetchedFriends);
      } catch (err) {
        if (
          !accountController.signal.aborted &&
          !userController.signal.aborted
        ) {
          console.error(err);
          setPage((state) => ({
            ...state,
            error: "Unexpected error while loading data",
            isLoading: false,
          }));
        }
      }
    };

    fetchPageData();

    return () => {
      accountController.abort();
      userController.abort();
    };
  }, [authContext.accessToken, friends.length]);

  if (page.isLoading || !decodedUser) {
    return <Spinner />;
  }

  if (page.error) {
    return <ErrorPage text={page.error} />;
  }

  return (
    <>
      {!page.isLoading && !page.error && (
        <ul
          role="list of friends"
          className="divide-y divide-gray-200 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <li
            key="myProfile"
            onClick={() => setMyProfileOpens(true)}
            className="py-1"
          >
            <ListedFriend person={page.userData} isMe={true} />
          </li>

          {friends.map((friend) => (
            <li
              key={friend.id}
              onClick={() => {
                setSelectedFriend(friend);
                setFriendProfileOpens(true);
              }}
              className="py-1"
            >
              <ListedFriend person={friend} />
            </li>
          ))}
        </ul>
      )}

      {myProfileOpens && (
        <MyProfile
          userInfo={page.userData}
          myProfileOpens={myProfileOpens}
          setMyProfileOpens={setMyProfileOpens}
        />
      )}

      {friendProfileOpens && (
        <FriendProfile
          userInfo={selectedFriend}
          friendProfileOpens={friendProfileOpens}
          setFriendProfileOpens={setFriendProfileOpens}
        />
      )}
    </>
  );
}
