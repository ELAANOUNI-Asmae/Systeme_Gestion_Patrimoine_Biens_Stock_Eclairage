import {
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import ResetPasswordForm from "../../components/auth/ResetPasswordForm";
import ResetSuccessCard from "../../components/auth/ResetSuccessCard";

function ResetPasswordPage() {
  const [
    searchParams,
  ] = useSearchParams();

  const token =
    searchParams.get(
      "token",
    );

  const [
    passwordReset,
    setPasswordReset,
  ] = useState(false);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 transition-colors dark:bg-slate-950">
      {passwordReset ? (
        <ResetSuccessCard />
      ) : (
        <ResetPasswordForm
          token={token}
          onSuccess={() =>
            setPasswordReset(
              true,
            )
          }
        />
      )}
    </main>
  );
}

export default ResetPasswordPage;