import Navbar from "@/components/layout/Navbar";
import React from "react";
import { CartList } from "./CartList";
import LoginForm from "../../components/LoginForm";
import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { authOptions } from "@/lib/authOptions";
import Image from "next/image";

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const rawCourseId = resolvedSearchParams.courseId;
  const courseId = Array.isArray(rawCourseId) ? rawCourseId[0] : rawCourseId;
  const session = await getServerSession(authOptions);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Cart Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                  Keranjang kamu
                </h1>
                <CartList courseId={courseId} />
              </div>
            </div>

            {/* Login/User Info Section */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                {session ? (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      Bank Transfer
                    </h3>
                    <div className="flex gap-4">
                      <div>
                        <Image
                          src={"https://mmrisk.blob.core.windows.net/images/019807fb-4043-776e-8e82-b56e91cbf216.png"}
                          alt="Logo Bank Sendiri"
                          width={100}
                          height={50}
                        />
                      </div>
                      <div className="flex flex-col">
                        <p className="font-bold">123456789</p>
                        <p>a.n. FE Online Course</p>
                        <p>UNISSULA</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Separator for mobile */}
                    <div className="lg:hidden">
                      <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-gray-50 text-gray-500 font-medium">
                            atau masuk untuk melanjutkan
                          </span>
                        </div>
                      </div>
                    </div>
                    <LoginForm enableRedirection={false} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
