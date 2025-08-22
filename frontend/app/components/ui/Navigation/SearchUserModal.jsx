import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { EnvelopeIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import EmailSearchModal from "@frontend/components/ui/Navigation/EmailSearchModal";
import UsernameSearchModal from "@frontend/components/ui/Navigation/UsernameSearchModal";

export default function SearchUserModal({
  searchModalOpens,
  setSearchModalOpens,
}) {
  const [emailSearchOpens, setEmailSearchOpens] = useState(false);
  const [usernameSearchOpens, setUsernameSearchOpens] = useState(false);

  return (
    <div>
      <Dialog
        open={searchModalOpens}
        onClose={() => setSearchModalOpens(false)}
        className="relative z-10"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-400/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <DialogPanel
              transition
              className="relative w-[90%] max-w-sm h-[18rem] transform overflow-hidden rounded-lg bg-white px-4 pt-4 text-left shadow-xl transition-all sm:p-6"
            >
              <div className="px-4 sm:px-6">
                <div className="ml-3 flex h-7 items-center">
                  <button
                    type="button"
                    onClick={() => setSearchModalOpens(false)}
                    className="relative rounded-md bg-white text-gray-400 hover:text-gray-500"
                  >
                    <span className="absolute -inset-2.5" />
                    <span className="sr-only">Close panel</span>
                    <XMarkIcon aria-hidden="true" className="size-6" />
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center justify-center gap-2 px-4 sm:px-6 mb-10">
                <p className="text-lg font-medium text-gray-900">
                  Search a friend
                </p>
              </div>

              <div className="flex items-center justify-center gap-14">
                <div
                  className="pt-6 sm:pb-0.5 flex flex-col items-center justify-center gap-2 py-4 cursor-pointer"
                  onClick={() => {
                    setEmailSearchOpens(true);
                  }}
                >
                  <EnvelopeIcon className="h-7 w-7 text-gray-700" />

                  <div className="inline-flex justify-center text-sm font-semibold text-gray-700">
                    with email
                  </div>
                </div>
                <div
                  className="pt-6 sm:pb-0.5 flex flex-col items-center justify-center gap-2 py-4 cursor-pointer"
                  onClick={() => {
                    setUsernameSearchOpens(true);
                  }}
                >
                  <UserCircleIcon className="h-7 w-7 text-gray-700" />

                  <div className="inline-flex justify-center text-sm font-semibold text-gray-700">
                    with username
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      {emailSearchOpens && (
        <EmailSearchModal
          open={emailSearchOpens}
          onClose={() => {
            setEmailSearchOpens(false);
          }}
        />
      )}
      {usernameSearchOpens && (
        <UsernameSearchModal
          open={usernameSearchOpens}
          onClose={() => {
            setUsernameSearchOpens(false);
          }}
        />
      )}
    </div>
  );
}
