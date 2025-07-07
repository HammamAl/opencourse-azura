"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Mail,
  User,
  Hash,
  Phone,
  Loader2} from "lucide-react";
import { useEffect, useState } from "react";

interface LecturerDetailModalProps {
  lecturerId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface LecturerDetail {
  id: string;
  email: string | null;
  name: string;
  full_name: string;
  password: string;
  role: string;
  phone_number: string | null;
  users_profile_picture_url: string | null;
  nidn_number: string | null;
  title: string | null;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}

export function LecturerDetailModal({ lecturerId, isOpen, onClose }: LecturerDetailModalProps) {
  const [lecturer, setLecturer] = useState<LecturerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && lecturerId) {
      fetchLecturerDetail();
    }
  }, [isOpen, lecturerId]);

  const fetchLecturerDetail = async () => {
    if (!lecturerId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user-management/lecturer/${lecturerId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch lecturer details");
      }

      const data = await response.json();
      setLecturer(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lecturer details");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setLecturer(null);
    setError(null);
    onClose();
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "Tidak ada";
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Detail Dosen
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Memuat data...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-600">
            <p>{error}</p>
          </div>
        )}

        {lecturer && !loading && (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="text-center space-y-2">
              {lecturer.users_profile_picture_url ? (
                <img
                  src={lecturer.users_profile_picture_url}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover mx-auto"
                />
              ) : (
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <User className="h-10 w-10 text-blue-600" />
                </div>
              )}
              <h3 className="text-xl font-semibold">{lecturer.full_name}</h3>
              {lecturer.title && (
                <p className="text-sm text-gray-500">{lecturer.title}</p>
              )}
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                ID: {lecturer.id}
              </Badge>
            </div>

            <Separator />

            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Informasi Personal</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={<Hash />} label="NIDN" value={lecturer.nidn_number} />
                <InfoItem icon={<Phone />} label="Nomor Telepon" value={lecturer.phone_number} />
              </div>
              <InfoItem icon={<Mail />} label="Email" value={lecturer.email} />
            </div>

            <Separator />

            {/* System Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Informasi Sistem</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={<Calendar />} label="Tanggal Dibuat" value={formatDate(lecturer.created_at)} />
                <InfoItem icon={<Calendar />} label="Terakhir Diupdate" value={formatDate(lecturer.updated_at)} />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium break-words">{value || "Tidak ada"}</p>
      </div>
    </div>
  );
}
