"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Copy, Download, User, Calendar, Info, Clock, CheckCircle, XCircle, CreditCard, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface InvoiceDetailContentProps {
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

export default function InvoiceDetailContent({ payment }: InvoiceDetailContentProps) {
  const [copying, setCopying] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

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

  const copyToClipboard = async (text: string, label: string) => {
    setCopying(label);
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} berhasil disalin!`);
    } catch (error) {
      toast.error(`Gagal menyalin ${label}`);
    } finally {
      setCopying(null);
    }
  };

  const handleGeneratePDF = () => {
    const pdfUrl = `/invoice/${payment.invoice_id}/pdf`;
    window.open(pdfUrl, "_blank");
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/payment/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceId: payment.invoice_id,
          paymentMethod: "manual_confirmation", // Default method untuk konfirmasi manual
        }),
      });

      if (response.ok) {
        toast.success("Pembayaran berhasil dikonfirmasi!");
        // Refresh halaman untuk update status
        window.location.reload();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Gagal memproses pembayaran");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Terjadi kesalahan saat memproses pembayaran");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToInvoice = () => {
    router.push(`/invoice/${payment.invoice_id}`);
  };

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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Button */}
      <div className="flex items-center">
        <Button variant="ghost" onClick={handleBackToInvoice} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Invoice
        </Button>
      </div>

      {/* Status Badge */}
      <Card className={`border-2 ${statusInfo.borderColor} ${statusInfo.bgColor}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-3">
            {statusInfo.icon}
            <span className={`text-lg font-semibold ${statusInfo.color}`}>{statusInfo.text}</span>
          </div>
          {payment.payment_status === "completed" && <p className="text-center text-green-700 mt-2">Pembayaran dikonfirmasi pada: {formatDateTime(payment.created_at)}</p>}
          {payment.payment_status === "pending" && <p className="text-center text-yellow-700 mt-2">Batas waktu pembayaran: {getExpiryDate(payment.created_at)}</p>}
        </CardContent>
      </Card>

      {/* Invoice Summary Section */}
      <Card className="border-2">
        <CardHeader className="bg-white border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl font-bold text-gray-900">INVOICE</CardTitle>
              <p className="text-lg text-gray-600">#{payment.invoice_id}</p>
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
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Customer Info */}
            <div className="flex flex-col">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Kepada
              </h3>
              <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 flex-1 min-h-[100px] flex flex-col justify-center">
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">{payment.users.full_name}</p>
                  <p className="text-gray-600 text-sm">{payment.users.email}</p>
                </div>
              </div>
            </div>

            {/* Payment Status Info */}
            <div className="flex flex-col">
              <h3 className="font-semibold text-gray-900 mb-4">Status Pembayaran</h3>
              <div className={`p-4 rounded-lg border ${statusInfo.borderColor} ${statusInfo.bgColor} flex-1 min-h-[100px] flex flex-col justify-center`}>
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

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={handleBackToInvoice} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 border-gray-300 hover:border-gray-400">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>

            <div className="flex gap-4">
              <Button onClick={handleGeneratePDF} variant="outline" className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 px-6 py-2 flex items-center gap-2">
                <Download className="h-4 w-4" />
                PDF
              </Button>

              {payment.payment_status === "pending" && (
                <Button onClick={handleConfirmPayment} disabled={isProcessing} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  {isProcessing ? "Memproses..." : "Konfirmasi Pembayaran"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Transfer Method Section - Show for all statuses */}
      <Card className="border-2">
        <CardHeader className="bg-white border-b border-gray-200">
          <CardTitle className="text-xl font-bold text-gray-900">
            Metode Pembayaran Transfer Bank
            {payment.payment_status === "completed" && <span className="text-sm font-normal text-green-600 ml-2">(Sudah Dibayar)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              {payment.payment_status === "pending" ? (
                <>
                  Lakukan pembayaran sebesar <span className="font-bold text-blue-600">{formatToIDR(payment.amount)}</span> tepat 3 digit terakhir (JANGAN dibulatkan) dan tambahkan berita{" "}
                  <span className="font-bold">{payment.invoice_id}</span> sehingga dapat diproses oleh sistem secara otomatis (tidak perlu konfirmasi secara manual).
                </>
              ) : (
                <>
                  Pembayaran sebesar <span className="font-bold text-blue-600">{formatToIDR(payment.amount)}</span> dengan kode berita <span className="font-bold">{payment.invoice_id}</span> telah berhasil diproses.
                </>
              )}
            </p>
            <p className="text-gray-700 mb-6">{payment.payment_status === "pending" ? "Pembayaran dapat dilakukan dengan transfer ke akun berikut:" : "Berikut adalah detail rekening yang digunakan untuk pembayaran:"}</p>
          </div>

          <div className="space-y-6">
            {banks.map((bank, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3 text-lg">{bank.name}</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">{bank.accountNumber}</span>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(bank.accountNumber, "Nomor rekening")} disabled={copying === "Nomor rekening"} className="text-blue-600 hover:text-blue-700 p-1">
                      <Copy className="h-4 w-4" />
                      <span className="ml-1 text-sm">copy</span>
                    </Button>
                  </div>
                  <p className="text-gray-600">{bank.accountName}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">{bank.berita}</span>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(payment.invoice_id, "Kode berita")} disabled={copying === "Kode berita"} className="text-blue-600 hover:text-blue-700 p-1">
                      <Copy className="h-4 w-4" />
                      <span className="ml-1 text-sm">copy</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {payment.payment_status === "pending" && (
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-yellow-800">Penting!</p>
                  <p className="text-yellow-700 mt-1">Jika setelah 15 menit pembayaran yang Anda lakukan dan tagihan Anda belum diproses, silakan konfirmasi secara manual.</p>
                </div>
              </div>
            </div>
          )}

          {payment.payment_status === "completed" && (
            <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800">Pembayaran Berhasil!</p>
                  <p className="text-green-700 mt-1">Terima kasih atas pembayaran Anda. Anda sekarang dapat mengakses kelas yang telah dibeli.</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
