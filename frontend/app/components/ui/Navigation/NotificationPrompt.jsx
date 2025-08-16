import QuietModeContext from "@frontend/contexts/quiet-mode-context";
import { denyNotification } from "@frontend/localforage/quietModeStore";
import {
  sendModeToSW,
  subscribePush,
  unsubscribePush,
} from "@frontend/services/pushClient";
// import { useContext } from "react";

export default function NotificationPrompt({ userId }) {
  const handleAllow = async () => {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      await subscribePush(userId);
      await sendModeToSW("alert");
    }
  };

  const handleDeny = async () => {
    denyNotification();
    await unsubscribePush(userId);
    await sendModeToSW("quiet");
  };

  return (
    <div className="p-12 border-1px solid br-8 m-12">
      <div className="flex items-center justify-center">
        Notify me when new messages arrive.
      </div>
      <button onClick={handleAllow} className="px-10">
        Allow
      </button>
      <button onClick={handleDeny} className="px-10">
        Deny
      </button>
    </div>
  );
}
