import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/button/LogoutButton";
import Navbar from "@/components/layout/Navbar";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Navbar />
      <div className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 h-full">
          <div className="px-4 py-6 sm:px-0 h-full">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-8 h-full flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Dashboard</h1>
                <p className="text-lg text-gray-600 mb-4">Hello, {session.user?.name || "User"}!</p>
                <p className="text-gray-500 mb-8">You are successfully logged in.</p>
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
