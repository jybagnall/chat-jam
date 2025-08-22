// {id, created_at, text, user_id, is_deleted, is_read, status} = msg bubble needs
//  {id, room_id, text, user_id, friend_id, status, created_at } pending
// {id, room_id, text, user_id, friend_id, status, created_at, is_deleted, is_read} = combined
// { id, created_at, room_id, user_id, friend_id, text, is_deleted, is_read, client_created_at } s

export function normalizeServerMsg(serverMsg) {
  return {
    id: serverMsg.id,
    room_id: serverMsg.room_id,
    text: serverMsg.text,
    user_id: serverMsg.user_id,
    friend_id: serverMsg.friend_id,
    status: "sent",
    created_at: serverMsg.created_at || serverMsg.client_created_at,
    is_deleted: serverMsg.is_deleted,
    is_read: serverMsg.is_read,
  };
}

export function normalizeLocalMsg(localMsg) {
  return {
    id: localMsg.id,
    room_id: localMsg.room_id,
    text: localMsg.text,
    user_id: localMsg.user_id,
    friend_id: localMsg.friend_id,
    status: localMsg.status,
    created_at: localMsg.created_at,
    is_deleted: false,
    is_read: localMsg.is_read ?? false,
  };
}
