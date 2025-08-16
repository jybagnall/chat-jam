import { isPushNotificationEnabled } from "@frontend/services/pushClient";
import { useEffect, useState } from "react";

/// remove this file
export default function useIsPushEnabledHook() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkPushStatus() {
      try {
        const isTrue = await isPushNotificationEnabled();
        if (mounted) setEnabled(isTrue);
      } catch {
        if (mounted) setEnabled(false);
      }
    }

    checkPushStatus();

    return () => {
      mounted = false;
    };
  }, []);

  return enabled;
}
