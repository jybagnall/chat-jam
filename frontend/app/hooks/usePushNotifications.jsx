import { useContext, useEffect } from "react";
import {
  registerSW,
  checkNotifyPermission,
  sendModeToSW,
} from "@frontend/utils/pushHelper";

import AuthContext from "@frontend/contexts/auth-context";
import toast from "react-hot-toast";
import { indexedDbSet } from "@frontend/utils/indexedDb";
import PushService from "@frontend/services/push.client.service";

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
            await sendModeToSW("alert");
            await indexedDbSet("quietMode", "alert");
            toast.success("Message alert is activated!");
          } catch (e) {
            if (!abortController.signal.aborted) {
              await sendModeToSW("quiet");
              await indexedDbSet("quietMode", "quiet");
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
