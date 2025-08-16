// 앱 서버의 연결을 받아 알림을 띄움 (채팅앱 백그라운드 프로세싱 담당).
// DOM(리액트 컴포넌트)에 접근을 못함.
// 앱에서 등록(register)을 해야 활성화됨.
// 앱이 꺼져 있어도 서버 푸시 → 서비스워커 → OS 알림 흐름으로 알림이 뜸.
import { indexedDbGet, indexedDbSet } from "@frontend/utils/indexedDb";

const DB_NAME = "chatJam"; // db 이름
const STORE = "quietMode"; // 저장소 이름 (table 처럼)
const MODE_KEY = "quietMode";

// 'message' 이벤트를 듣고, IndexedDB에 quietMode 값 저장.
// 외부(리액트 앱)에서 모드 변경 명령을 받으면 DB에 저장.
self.addEventListener("message", (e) => {
  const { type, mode } = e.data || {};

  if (type === "SET_MODE" && (mode === "alert" || mode === "quiet")) {
    indexedDbSet("quietMode", mode);
  }
});

async function getQuietMode() {
  try {
    return (await indexedDbGet(STORE, MODE_KEY)) || "alert";
  } catch {
    return "alert";
  }
}

// push 이벤트 (비동기) 수신, 시스템 알림을 띄움.
// 이벤트가 끝날 때까지 서비스워커가 죽지 않도록 waitUntil 사용
self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      const mode = await getQuietMode();
      if (mode === "quiet") return;

      // data: 서버가 보낸 push 알림 데이터(보통 JSON)
      const data = event.data ? event.data.json() : {};
      const title = "New Message";

      const options = {
        body: data.body || "New message has arrived.",
        data: {
          url: data.url || "/chat",
        },
        icon: "/chatjam.png",
        badge: "/chatjam.png",
        vibrate: [100, 50, 200],
        tag: "message-notification",
        renotify: true,
        actions: [
          { action: "open", title: "Open", icon: "/chat-icon.png" },
          { action: "ignore", title: "Ignore", icon: "/chat-icon.png" },
        ],
      };

      // data: 알림을 띄우며 숨겨서 저장하는 데이터. (클릭시 url로 이동 가능)
      await self.registration.showNotification(title, options);
    })()
  );
});

// 현재 브라우저에서 서비스 워커가 제어하는 모든 탭(창)을 가져옴.
// 이미 앱이 열려 ('focus') 있으면 그 탭을 앞으로 가져옴(focus()) + 해당 url로 이동

//📍위의 push 이벤트를 받고, 클릭을 하면 "notificationclick" e가 발생
// notification:브라우저 안의 Notification 객체.
// clients: 서비스 워커 전용 전역 객체. 워커 컨텍스트에서만 존재.
self.addEventListener("notificationclick", (e) => {
  const url = (e.notification.data && e.notification.data.url) || "/chat";

  if (e.action === "open") {
    e.waitUntil(
      (async () => {
        const all = await self.clients.matchAll({
          type: "window",
          includeUncontrolled: true,
        });
        for (const client of all) {
          if ("focus" in client) {
            await client.focus();
            if (client.navigate) await client.navigate(url);
            return;
          }
        }
        // 열린 창이 없으면 새 탭을 열어서 해당 URL로 이동.
        if (self.clients.openWindow) await self.clients.openWindow(url);
      })()
    );
    e.notification.close();
  }
});
