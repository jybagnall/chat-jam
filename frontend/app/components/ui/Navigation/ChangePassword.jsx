import { useContext } from "react";
import { useForm } from "react-hook-form";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import AccountService from "@frontend/services/account.service";
import AuthContext from "@frontend/contexts/auth-context";
import Label from "@frontend/components/shared/Label";
import Button from "@frontend/components/shared/Button";
import Spinner from "@frontend/components/shared/Spinner";

const inputStyle =
  "block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-gray-800 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-gray-500 sm:text-sm/6";
const buttonStyle =
  "flex w-full justify-center rounded-md bg-orange-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-orange-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600";

export default function ChangePassword({
  isUpdatingPw,
  setIsUpdatingPw,
  onClose,
}) {
  const {
    register,
    handleSubmit,
    clearErrors,
    getValues,
    formState: { errors },
  } = useForm();

  const authContext = useContext(AuthContext);
  const accountService = new AccountService(new AbortController(), authContext);
  const decodedUser = authContext.accessToken
    ? jwtDecode(authContext.accessToken)
    : null;

  const onPasswordUpdate = async ({ password }) => {
    try {
      clearErrors();
      setIsUpdatingPw(true);
      await accountService.changePassword(password);
      toast.success("Password is updated!");
      onClose();
    } catch (err) {
      const errorMsg = err?.response?.data?.error;
      toast.error(errorMsg || "Unexpected error");
    }
    setIsUpdatingPw(false);
  };

  if (!decodedUser) {
    return <Spinner />;
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onPasswordUpdate)} className="space-y-6">
        <div>
          <Label htmlFor="password" labelText="New Password" />
          <input
            type="password"
            id="password"
            name="password"
            {...register("password", {
              required: true,
              minLength: 6,
              maxLength: 12,
            })}
            className={inputStyle}
          />
          <div className="mt-2">
            <Label htmlFor="password" labelText="Confirm Password" />
            <input
              type="password"
              {...register("confirmPassword", {
                required: true,
                validate: (value) =>
                  value === getValues("password") || "Passwords do not match",
              })}
              className={inputStyle}
            />
          </div>
        </div>
        {errors.email?.type === "required" && (
          <p className="text-red-500">Please enter new password.</p>
        )}
        {(errors.password?.type === "minLength" ||
          errors.password?.type === "maxLength") && (
          <p className="text-red-500">
            Password must be between 6 and 12 characters.
          </p>
        )}
        {errors.confirmPassword && (
          <p className="text-red-500">{errors.confirmPassword.message}</p>
        )}
        <div>
          <Button
            type="submit"
            isProcessing={isUpdatingPw}
            text="Processing..."
            buttonStyle={buttonStyle}
          >
            Reset new password
          </Button>
        </div>
      </form>
    </div>
  );
}
