import { useContext, useEffect } from "react";
import PushService, {
  registerSW,
  checkNotifyPermission,
} from "@frontend/services/pushClient";
import AuthContext from "@frontend/contexts/auth-context";
import toast from "react-hot-toast";

export default function usePushNotifications() {
  const authContext = useContext(AuthContext);
  const abortController = new AbortController();
  const pushService = new PushService(abortController, authContext);

  const notifyStatus = checkNotifyPermission(); // 'default', 'granted', 'denied'

  useEffect(() => {
    const setNotificationPermission = async () => {
      if (notifyStatus === "granted") {
        try {
          await registerSW(); // 1) SW 등록 (앱 시작 시)
          await pushService.subscribePush(); // 2. push 구독
        } catch (e) {
          if (!abortController.signal.aborted) {
            console.error(e);
          }
        } // 최신 구독 정보를 보냄.
      }

      if (notifyStatus === "default") {
        const permission = await Notification.requestPermission();

        if (permission === "granted") {
          try {
            await registerSW();
            await pushService.subscribePush(); // 2. push 구독
            toast.success("Message alert is activated!");
          } catch (e) {
            if (!abortController.signal.aborted) {
              console.error(e);
            }
          }
        }
      }

      if (notifyStatus === "denied") {
        return;
      }
    };

    setNotificationPermission();

    return () => {
      abortController.abort();
    };
  }, [notifyStatus]);
}
