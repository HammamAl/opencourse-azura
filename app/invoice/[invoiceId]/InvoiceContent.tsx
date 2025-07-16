"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Clock, CheckCircle } from "lucide-react";

interface InvoiceContentProps {
  payment: {
    id: string;
    invoice_id: string;
    amount: string; // Changed from any to string
    payment_status: string;
    created_at: string; // Changed from Date to string
    course: {
      title: string;
      price: string; // Changed from any to string
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

export default function InvoiceContent({ payment }: InvoiceContentProps) {
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

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
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getExpiryTime = (createdAtString: string): string => {
    const expiry = new Date(createdAtString);
    expiry.setHours(expiry.getHours() + 24);
    return expiry.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePayment = async () => {
    if (!selectedBank) {
      alert("Pilih metode pembayaran terlebih dahulu");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/payment/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceId: payment.invoice_id,
          paymentMethod: selectedBank,
        }),
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert("Gagal memproses pembayaran");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Terjadi kesalahan");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600";
      case "completed":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Anda berhasil melakukan Pemesanan Kelas Manajemen</h1>
        <p className="text-lg text-gray-600">Keuangan Pribadi Seharga {formatToIDR(payment.amount)}</p>
      </div>

      {/* Invoice Number */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">No Invoice</p>
            <p className="text-xl font-bold text-gray-900">#{payment.invoice_id}</p>
          </div>
        </CardContent>
      </Card>

      {/* Status and Instructions */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              {getStatusIcon(payment.payment_status)}
              <span className={`font-medium ${getStatusColor(payment.payment_status)}`}>
                {payment.payment_status === "pending" && "Menunggu Pembayaran"}
                {payment.payment_status === "completed" && "Pembayaran Berhasil"}
                {payment.payment_status === "failed" && "Pembayaran Gagal"}
              </span>
            </div>

            {payment.payment_status === "pending" && (
              <p className="text-gray-600">
                Harap segera melakukan pembayaran untuk
                <br />
                menikmati fitur kelas premium.
              </p>
            )}

            {payment.payment_status === "completed" && <p className="text-green-600">Pembayaran berhasil! Anda dapat mengakses kelas sekarang.</p>}
          </div>
        </CardContent>
      </Card>

      {/* Payment Deadline */}
      {payment.payment_status === "pending" && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-700">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">NOTE:</span>
            <span>Batas Waktu Pembayaran {getExpiryTime(payment.created_at)}</span>
          </div>
        </div>
      )}

      {/* Payment Method Selection */}
      {payment.payment_status === "pending" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pilih Metode Pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handlePayment} disabled={!selectedBank || isProcessing}>
                {isProcessing ? "Memproses..." : "Konfirmasi Pembayaran"}
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Daftar Nomor Rekening Pembayaran</label>
              <Select value={selectedBank} onValueChange={setSelectedBank}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih metode pembayaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bca">Bank BCA - 123456789</SelectItem>
                  <SelectItem value="mandiri">Bank Mandiri - 987654321</SelectItem>
                  <SelectItem value="bni">Bank BNI - 456789123</SelectItem>
                  <SelectItem value="bri">Bank BRI - 789123456</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detail Pesanan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Kelas</span>
            <span className="font-medium">{payment.course.title}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Instruktur</span>
            <span className="font-medium">{payment.course.users.full_name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Harga</span>
            <span className="font-medium">{formatToIDR(payment.course.price)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Tanggal Pemesanan</span>
            <span className="font-medium">{formatDate(payment.created_at)}</span>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Pembayaran</span>
              <span className="text-lg font-bold text-blue-600">{formatToIDR(payment.amount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informasi Pembeli</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Nama</span>
            <span className="font-medium">{payment.users.full_name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Email</span>
            <span className="font-medium">{payment.users.email}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
