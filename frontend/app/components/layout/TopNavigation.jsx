import { useState } from "react";
import { UserPlusIcon } from "@heroicons/react/24/solid";
import SettingsPanel from "@frontend/components/ui/Navigation/SettingsPanel";
import SearchUserModal from "@frontend/components/ui/Navigation/SearchUserModal";
import QuietModeToggle from "@frontend/components/ui/Navigation/QuietModeToggle";

export default function TopNavigation() {
  const [searchModalOpens, setSearchModalOpens] = useState(false);

  return (
    <div className="fixed top-0 left-0 w-full bg-white shadow-xs border-t border-gray-50 z-50">
      <div className="flex justify-end items-center h-14 pr-22 gap-8">
        <div
          onClick={() => {
            setSearchModalOpens(true);
          }}
          className="flex flex-col items-center text-xs font-medium cursor-pointer"
        >
          <span className="size-5 text-gray-400">
            <UserPlusIcon />
          </span>
        </div>
        <SettingsPanel />

        {"Notification" in window && <QuietModeToggle />}
      </div>

      {searchModalOpens && (
        <SearchUserModal
          searchModalOpens={searchModalOpens}
          setSearchModalOpens={setSearchModalOpens}
        />
      )}
    </div>
  );
}
