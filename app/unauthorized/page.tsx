"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const attemptedPath = searchParams.get("attempted") || "this page";
  const userRole = searchParams.get("userRole") || "unknown";

  const getRoleDashboard = (role: string) => {
    switch (role) {
      case "admin":
        return "/a/dash";
      case "student":
        return "/s/dash";
      case "lecturer":
        return "/l/dash";
      default:
        return "/login";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-4">
          <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">403 - Access Denied</h1>
        <p className="text-lg text-gray-600 mb-2">Unauthorized Access</p>
        <p className="text-gray-500 mb-6">
          You don't have permission to access <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{attemptedPath}</span>
        </p>
        <div className="mb-6">
          <p className="text-sm text-gray-500">
            Your current role: <span className="font-semibold capitalize">{userRole}</span>
          </p>
        </div>
        <div className="space-y-3">
          <Link href={getRoleDashboard(userRole)} className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200">
            Go to Your Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="animate-pulse">
          <div className="h-16 w-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 rounded mb-6"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-300 rounded"></div>
            <div className="h-10 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UnauthorizedContent />
    </Suspense>
  );
}
