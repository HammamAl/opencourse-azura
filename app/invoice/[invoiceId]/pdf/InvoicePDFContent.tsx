"use client";
import { useEffect } from "react";
import { Info, Calendar, User, Clock, CheckCircle, XCircle } from "lucide-react";

interface InvoicePDFContentProps {
  payment: {
    id: string;
    invoice_id: string;
    amount: string;
    payment_status: string;
    created_at: string;
    course: {
      title: string;
      price: string;
      cover_image_url: string | null;
      users: {
        name: string;
        full_name: string;
      };
    };
    users: {
      name: string;
      full_name: string;
      email: string | null;
    };
  };
}

export default function InvoicePDFContent({ payment }: InvoicePDFContentProps) {
  const formatToIDR = (amount: string): string => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getExpiryDate = (createdAtString: string): string => {
    const expiry = new Date(createdAtString);
    expiry.setHours(expiry.getHours() + 24);
    return expiry.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          icon: <Clock className="h-5 w-5 text-yellow-600" />,
          text: "Menunggu Pembayaran",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
        };
      case "completed":
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          text: "Pembayaran Berhasil",
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      case "failed":
        return {
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          text: "Pembayaran Gagal",
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        };
      default:
        return {
          icon: <Clock className="h-5 w-5 text-gray-600" />,
          text: "Status Tidak Diketahui",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        };
    }
  };

  useEffect(() => {
    // Add print styles
    const style = document.createElement("style");
    style.innerHTML = `
      @media print {
        body { margin: 0; padding: 20px; }
        .no-print { display: none !important; }
        .print-container { max-width: none !important; margin: 0 !important; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const statusInfo = getStatusInfo(payment.payment_status);

  const banks = [
    {
      name: "BCA",
      accountNumber: "0127072102",
      accountName: "a.n. FE Online Course UNISSULA",
      berita: `News : ${payment.invoice_id}`,
    },
    {
      name: "Bank Mandiri",
      accountNumber: "0127072102",
      accountName: "a.n. FE Online Course UNISSULA",
      berita: `News : ${payment.invoice_id}`,
    },
    {
      name: "BNI",
      accountNumber: "0127072102",
      accountName: "a.n. FE Online Course UNISSULA",
      berita: `News : ${payment.invoice_id}`,
    },
    {
      name: "BRI",
      accountNumber: "0127072102",
      accountName: "a.n. FE Online Course UNISSULA",
      berita: `News : ${payment.invoice_id}`,
    },
  ];

  return (
    <div className="print-container min-h-screen bg-white p-8 max-w-4xl mx-auto">
      {/* Print/Download Controls */}
      <div className="no-print mb-8 flex justify-end gap-4">
        <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2">
          Download PDF
        </button>
        <button onClick={() => window.close()} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg">
          Tutup
        </button>
      </div>

      {/* Invoice Content */}
      <div className="space-y-8">
        {/* Invoice Header */}
        <div className="border-2 border-gray-300 rounded-lg">
          <div className="bg-white p-6 border-b border-gray-300">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">INVOICE</h1>
                <p className="text-xl text-gray-600 mt-2">#{payment.invoice_id}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-orange-600 mb-2">
                  <Info className="h-5 w-5" />
                  <span className="font-medium">Tanggal Invoice {formatDate(payment.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-orange-600">
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">Batas terakhir {getExpiryDate(payment.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Customer Info */}
              <div className="flex flex-col">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Kepada
                </h3>
                <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 flex-1 min-h-[80px] flex flex-col justify-center">
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">{payment.users.full_name}</p>
                    <p className="text-gray-600 text-sm">{payment.users.email}</p>
                  </div>
                </div>
              </div>

              {/* Payment Status Info */}
              <div className="flex flex-col">
                <h3 className="font-semibold text-gray-900 mb-4">Status Pembayaran</h3>
                <div className={`p-4 rounded-lg border ${statusInfo.borderColor} ${statusInfo.bgColor} flex-1 min-h-[80px] flex flex-col justify-center`}>
                  <div className="flex items-center gap-2 mb-3">
                    {statusInfo.icon}
                    <span className={`font-medium ${statusInfo.color}`}>{statusInfo.text}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Dibuat: {formatDateTime(payment.created_at)}</p>
                    {payment.payment_status === "pending" && <p className="text-sm text-gray-600">Batas: {getExpiryDate(payment.created_at)}</p>}
                    {payment.payment_status === "completed" && <p className="text-sm text-green-600">✓ Pembayaran Terkonfirmasi</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Course Details */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 text-xl">Ringkasan</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-900 font-medium">{payment.course.title}</span>
                  <span className="font-bold text-gray-900">{formatToIDR(payment.course.price)}</span>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatToIDR(payment.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Diskon</span>
                    <span className="font-medium">Rp.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Kode unik</span>
                    <span className="font-medium">264</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">TOTAL</span>
                      <span className="text-lg font-bold text-blue-600">{formatToIDR(payment.amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
