"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Course {
  id: string;
  title: string;
  price: number;
  cover_image_url: string;
}

export function CartList({ courseId }: { courseId?: string }) {
  const { data: session, status } = useSession();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const router = useRouter();

  const formatToIDR = (number: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const handlePurchase = async () => {
    if (!session?.user || !course) return;

    setIsProcessing(true);
    try {
      const response = await fetch("/api/payment/create-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: course.id,
          userId: session.user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create invoice");
      }

      const data = await response.json();
      // Redirect to invoice page
      router.push(`/invoice/${data.invoiceId}`);
    } catch (error) {
      console.error("Error creating invoice:", error);
      setError("Gagal membuat invoice. Silakan coba lagi.");
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    setCourse(null);
    setError(null);
    if (courseId) {
      setIsLoading(true);
      fetch(`/api/course/${courseId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Kursus tidak ditemukan");
          }
          return res.json();
        })
        .then((data) => {
          setCourse(data);
        })
        .catch((err) => {
          setError(err.message);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse animation-delay-200"></div>
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse animation-delay-400"></div>
        </div>
        <span className="ml-3 text-gray-600">Memuat...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center justify-center mb-2">
            <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-700 font-medium">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (course) {
    const isUserLoggedIn = status === "authenticated";

    return (
      <div className="space-y-6">
        {/* Course Item */}
        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex-shrink-0">
            <Image src={course.cover_image_url} alt={`Cover image for ${course.title}`} width={80} height={120} className="object-cover rounded-lg shadow-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-lg mb-1">{course.title}</h3>
            <p className="text-2xl font-bold text-blue-600">{formatToIDR(course.price)}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Summary */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Ringkasan Pesanan</h2>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">{formatToIDR(course.price)}</span>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-blue-600">{formatToIDR(course.price)}</span>
              </div>
            </div>
          </div>

          {/* Purchase Button */}
          <div className="pt-4">
            <Button
              onClick={handlePurchase}
              disabled={!isUserLoggedIn || isProcessing}
              className={`w-full h-12 text-lg font-medium transition-all duration-200 ${
                isUserLoggedIn ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]" : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isProcessing ? "Memproses..." : isUserLoggedIn ? "Beli Sekarang" : "Login untuk membeli"}
            </Button>
            {!isUserLoggedIn && <p className="text-sm text-gray-500 text-center mt-2">Silakan login terlebih dahulu untuk melanjutkan pembelian</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <div className="bg-gray-50 rounded-lg p-8">
        <div className="flex items-center justify-center mb-4">
          <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Keranjang kosong</h2>
        <p className="text-gray-500">Belum ada kursus yang ditambahkan ke keranjang</p>
      </div>
    </div>
  );
}
