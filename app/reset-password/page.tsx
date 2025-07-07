import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";
import { validateResetToken } from "./actions";

interface PageProps {
  searchParams: Promise<{
    token?: string;
    email?: string;
  }>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const { token, email } = await searchParams;

  const validation = token && email ? await validateResetToken(token, email) : null;

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Invalid Reset Link</h2>
            <p className="mt-2 text-sm text-gray-600">This password reset link is invalid or incomplete. Please request a new password reset.</p>
          </div>
        </div>
      </div>
    );
  }

  if (validation && !validation.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">{validation.expired ? "Link Expired" : "Invalid Link"}</h2>
            <p className="mt-2 text-sm text-gray-600">{validation.message}</p>
            <div className="mt-4">
              <a href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Request a new password reset
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset Your Password</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Enter your new password below</p>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <ResetPasswordForm token={token} email={email} />
        </Suspense>
      </div>
    </div>
  );
}
