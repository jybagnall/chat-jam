import Client from "./client";

const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
// Voluntary Application Server Identification

// endpoint: 특정 브라우저에서 구독을 하면 브라우저 전용 URL이 만들어짐.

// Base64URL 문자열을 Uint8Array(바이너리 배열)로 변환하는 함수.
// 웹 푸시를 구독할 때 applicationServerKey 값을 Uint8Array 형식으로 요구함. 왜?
// 'VAPID_PUBLIC_KEY'는 암호화된 키(배송장, 네트워크에서 안전하므로)

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i);
  return output;
}

class PushService {
  constructor(abortController, authContext) {
    this.client = new Client(abortController, authContext);
  }
  // 서버에 구독 정보를 전송 -> 나중에 푸시 메시지를 보낼 때 쓸 예정.
  async subscribePush() {
    if (!("serviceWorker" in navigator)) return null; // 알림 권한 확인

    const registered = await navigator.serviceWorker.ready; // 등록된 SW 객체

    //  브라우저가 푸시 구독 정보를 서버에 저장해두었는지 확인
    let activeSubscription = await registered.pushManager.getSubscription();

    if (!activeSubscription) {
      activeSubscription = await registered.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
    }

    await this.client.post(`/api/push/subscribe`, {
      subscription: activeSubscription,
    });
  }

  // 브라우저의 푸시 구독을 취소하고, 서버에도 구독 취소 사실을 알려줌.
  async unsubscribePush() {
    const registered = await navigator.serviceWorker.ready;
    const currentSubscription = await registered.pushManager.getSubscription();

    if (currentSubscription) {
      await currentSubscription.unsubscribe(); // 브라우저 측 해제
      await this.client.delete(`/api/push/unsubscribe`, {
        endpoint: currentSubscription.endpoint,
      });
    }
  }
}
export default PushService;

// 서비스 워커를 등록하는 함수.
// 브라우저가 서비스 워커를 지원하지 않으면 null 반환 후 종료.
// `/sw.js` 파일을 서비스 워커로 등록하고, 그 Promise를 반환.
export async function registerSW() {
  if (!("serviceWorker" in navigator)) return null;
  const existing = await navigator.serviceWorker.getRegistration("/sw.js", {
    type: "module",
  });
  if (existing) return existing;

  return navigator.serviceWorker.register("/sw.js");
}

// 해당 사이트 알림(Notification) 권한을 확인.
// 'denied': 브라우저가 알림 API를 지원하지 않거나 거부로 설정됨.
// 권한이 아직 'default'(미정).
export function checkNotifyPermission() {
  if (!("Notification" in window)) return "denied";
  return Notification.permission; // 'default' | 'granted' | 'denied'
}

export async function isPushNotificationEnabled() {
  if (!("serviceWorker" in navigator) || !("Notification" in window))
    return false;
  if (Notification.permission !== "granted") return false;

  const registered = await navigator.serviceWorker.ready;
  const currentSubscription = await registered.pushManager.getSubscription();

  return Boolean(currentSubscription); // 구독이 존재하는지의 여부.
}

// 특정 모드('alert'/'quiet')를 서비스워커에 전달해 저장하거나 동작을 변경
// 활성 상태인(active) 또는 페이지를 제어 중인(controller) sw 가져오기
export async function sendModeToSW(mode) {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registered = await navigator.serviceWorker.ready;
    const sw = registered.active || navigator.serviceWorker.controller;

    if (sw) {
      sw.postMessage({ type: "SET_MODE", mode });
    } else {
      // 서비스 워커가 설치되었지만 아직 페이지를 컨트롤하지 않는 상태
      const handler = () => {
        navigator.serviceWorker.controller?.postMessage({
          type: "SET_MODE",
          mode,
        });
        navigator.serviceWorker.removeEventListener(
          "controllerchange",
          handler
        );
      };

      navigator.serviceWorker.addEventListener("controllerchange", handler);
    }
  } catch (e) {
    console.warn("Failed to send mode to Service Worker", e);
  }
}
//  서비스 워커가 설치되었지만 아직 페이지를 컨트롤하지 않는 상태라면
// "controllerchange" 이벤트를 기다렸다가 handler 실행.
// "controllerchange"→ 서비스 워커가 페이지의 컨트롤러로 승격될 때 발생.

// .postMessage()의 역할: 서비스워커(백엔드)로 정보를 보냄.
