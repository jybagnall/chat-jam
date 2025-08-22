import { useState } from "react";
import DeleteAccountModal from "@frontend/components/ui/Navigation/DeleteAccountModal";
import ChangePasswordModal from "@frontend/components/ui/Navigation/ChangePasswordModal";

export default function AccountSettings() {
  const [changePwModalOpens, setChangePwModalOpens] = useState(false);
  const [deleteAccountModalOpens, setDeleteAccountModalOpens] = useState(false);
  const [isUpdatingPw, setIsUpdatingPw] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-12 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Change password</h2>
        <p className="mt-2 text-sm text-gray-600">
          Update your password to keep your account secure.
        </p>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setChangePwModalOpens(true)}
            disabled={isUpdatingPw}
            className="rounded-md bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 transition disabled:opacity-50"
          >
            {isUpdatingPw ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>

      <hr className="border-t border-gray-200" />

      <div>
        <h2 className="text-lg font-semibold text-gray-900">Delete Account</h2>
        <p className="mt-2 text-sm text-gray-600">
          This will permanently delete your account and remove all your data.
          This action cannot be undone.
        </p>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setDeleteAccountModalOpens(true)}
            disabled={isDeleting}
            className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition disabled:opacity-50"
          >
            {isDeleting ? "Deleting account..." : "Delete Account"}
          </button>
        </div>
      </div>

      {changePwModalOpens && (
        <ChangePasswordModal
          isUpdatingPw={isUpdatingPw}
          changePwModalOpens={changePwModalOpens}
          setIsUpdatingPw={setIsUpdatingPw}
          onClose={() => setChangePwModalOpens(false)}
        />
      )}

      {deleteAccountModalOpens && (
        <DeleteAccountModal
          isDeleting={isDeleting}
          setIsDeleting={setIsDeleting}
          deleteAccountModalOpens={deleteAccountModalOpens}
          onClose={() => setDeleteAccountModalOpens(false)}
        />
      )}
    </div>
  );
}
