"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, X } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  full_name: string;
  email: string | null;
  users_profile_picture_url: string | null;
  title: string | null;
  role: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdateSuccess: (updatedUser: User) => void;
}

export default function EditProfileModal({ isOpen, onClose, user, onUpdateSuccess }: EditProfileModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user.full_name,
    email: user.email || "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/user-management/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          toast.error(data.error);
        } else {
          throw new Error(data.error || "Terjadi kesalahan");
        }
        return;
      }

      toast.success("Profile berhasil diperbarui!");
      onUpdateSuccess(data.user);
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Terjadi kesalahan saat memperbarui profile");
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">Edit Profil</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 p-0">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Section */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.users_profile_picture_url || ""} alt={user.full_name} />
              <AvatarFallback className="bg-gray-200">{user.users_profile_picture_url ? <User className="w-8 h-8 text-gray-400" /> : getInitials(user.full_name)}</AvatarFallback>
            </Avatar>
            <div>
              <Button type="button" variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50">
                Pilih foto
              </Button>
              <p className="text-sm text-gray-500 mt-1">fotoku.jpg</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap</Label>
              <Input id="full_name" type="text" value={formData.full_name} onChange={(e) => handleInputChange("full_name", e.target.value)} placeholder="Masukkan nama lengkap" className={errors.full_name ? "border-red-500" : ""} />
              {errors.full_name && <p className="text-sm text-red-500">{errors.full_name}</p>}
              <p className="text-xs text-red-500">Digunakan untuk penerbitan Sertifikat</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} placeholder="Masukkan email" className={errors.email ? "border-red-500" : ""} />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? "Menyimpan..." : "Simpan Profil"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
