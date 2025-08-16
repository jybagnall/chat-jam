import localforage from "localforage";

const base = {
  name: "chatJam", // 데이터베이스 이름
  description: "ChatJam storage",
};

export const messageStore = localforage.createInstance({
  ...base,
  storeName: "localMessages", // IndexedDB object store 이름
});

// 브라우저에 문자열 형태로 영구 저장됨.
// 앱을 껐다 켜도, 새로고침해도, 브라우저를 재시작해도 데이터가 남아있음.
