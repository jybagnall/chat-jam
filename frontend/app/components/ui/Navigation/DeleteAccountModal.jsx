import AccountService from "@frontend/services/account.service";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "@frontend/components/shared/Spinner";
import AuthContext from "@frontend/contexts/auth-context";
import toast from "react-hot-toast";

export default function DeleteAccountModal({
  isDeleting,
  setIsDeleting,
  deleteAccountModalOpens,
  onClose,
}) {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const accountService = new AccountService(new AbortController(), authContext);
  const decodedUser = authContext.accessToken
    ? jwtDecode(authContext.accessToken)
    : null;

  const handleDeletion = async (e) => {
    e.preventDefault();
    try {
      setIsDeleting(true);
      await accountService.deleteAccount();
      Cookies.remove("refreshToken", { path: "/", sameSite: "strict" });
      authContext.setAccessToken(null);
      onClose();
      navigate("/account-deleted");
    } catch (err) {
      const errorMsg = err?.response?.data?.error;
      toast.error(errorMsg || "Unexpected error");
    }
    setIsDeleting(false);
  };

  if (!decodedUser) {
    return <Spinner />;
  }

  return (
    <div>
      <Dialog
        open={deleteAccountModalOpens}
        onClose={onClose}
        className="relative z-10"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6 data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div>
                <div className="mx-auto flex size-12 items-center justify-center rounded-full mb-2">
                  <ExclamationTriangleIcon
                    aria-hidden="true"
                    className="size-7 text-rose-500"
                  />
                </div>
                <div className="mt-1 text-center sm:mt-2">
                  <DialogTitle
                    as="h3"
                    className="text-base font-semibold text-gray-900"
                  >
                    Are you sure?
                  </DialogTitle>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      This cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <form
                  onSubmit={handleDeletion}
                  className="inline-flex w-full justify-center rounded-md bg-rose-500 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-rose-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 sm:col-start-2"
                >
                  <button type="submit" disabled={isDeleting}>
                    Yes, Delete Account
                  </button>
                </form>

                <button
                  type="button"
                  data-autofocus
                  onClick={onClose}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                >
                  Cancel
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
