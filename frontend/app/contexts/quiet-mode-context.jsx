import { createContext, useEffect, useState } from "react";
import { sendModeToSW } from "@frontend/services/pushClient";
import { indexedDbGet } from "@frontend/utils/indexedDb";

const QuietModeContext = createContext();

export const QuietModeProvider = ({ children }) => {
  const [mode, setMode] = useState("");

  const toggleMode = async () => {
    const newMode = mode === "alert" ? "quiet" : "alert";
    setMode(newMode);
    await sendModeToSW(newMode);
  };

  useEffect(() => {
    let mounted = true;

    async function getCurrentMode() {
      const currentMode = await indexedDbGet("quietMode", "quietMode");
      if (mounted) setMode(currentMode);
    }

    getCurrentMode();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <QuietModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </QuietModeContext.Provider>
  );
};

export default QuietModeContext;
