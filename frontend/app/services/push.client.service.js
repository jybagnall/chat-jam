import { urlBase64ToUint8Array } from "@frontend/utils/pushHelper";
import Client from "./client";

const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
// Voluntary Application Server Identification
// 'VAPID_PUBLIC_KEY'는 암호화된 키(배송장, 네트워크에서 안전하므로)

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
