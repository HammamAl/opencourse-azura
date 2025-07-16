"use client";
import Navbar from "@/components/layout/Navbar";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-sm w-full space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">FE Open Course</h2>
            <p className="text-gray-600 text-sm">Selamat datang kembali!</p>
          </div>
          <LoginForm />
          <div className="text-center text-xs text-gray-500">
            <p>Dengan masuk, Anda menyetujui syarat dan ketentuan kami</p>
          </div>
        </div>
      </div>
    </div>
  );
}
