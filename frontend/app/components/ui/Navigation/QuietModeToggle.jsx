import QuietModeContext from "@frontend/contexts/quiet-mode-context";
import { BellAlertIcon, BellSlashIcon } from "@heroicons/react/24/solid";
import { useContext, useEffect, useState } from "react";

import { isPushNotificationEnabled } from "@frontend/utils/pushHelper";

export default function QuietModeToggle() {
  const { mode, toggleMode } = useContext(QuietModeContext);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    async function checkPushStatus() {
      const result = await isPushNotificationEnabled();
      console.log("🔹checkPushStatus result:", result);
      console.log("🔹mode:", mode);
      setEnabled(result);
    }
    checkPushStatus();
  }, []);

  const showBellAlert = !!enabled && mode === "alert";
  const icon = showBellAlert ? (
    <BellAlertIcon
      className="h-5 w-5 text-orange-400 cursor-pointer"
      title="Notification is on"
    />
  ) : (
    <BellSlashIcon
      className="h-5 w-5 text-gray-400 cursor-pointer"
      title="Notification is off"
    />
  );

  return (
    <div className="relative">
      <div
        onClick={() => {
          toggleMode();
        }}
        className="focus:outline-none"
      >
        {icon}
      </div>
    </div>
  );
}

//  const { mode, toggleMode } = useContext(QuietModeContext);
//   const isPushEnabled = useIsPushEnabledHook(); // true or false

//   const showBellAlert = isPushEnabled && mode === "alert";
//   const icon = showBellAlert ? (
//     <BellAlertIcon className="h-5 w-5 text-orange-400 cursor-pointer" />
//   ) : (
//     <BellSlashIcon className="h-5 w-5 text-gray-400 cursor-pointer" />
//   );
