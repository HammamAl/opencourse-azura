"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Upload, Trash2, Loader2 } from "lucide-react";
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validasi file
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Tipe file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error("Ukuran file terlalu besar. Maksimal 5MB");
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadImage = async () => {
    if (!selectedFile) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/user-management/profile-picture", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengupload foto");
      }

      toast.success("Foto profil berhasil diupload!");
      setCurrentUser(data.user);
      setPreviewUrl(null);
      setSelectedFile(null);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Gagal mengupload foto profil");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!isValidImageUrl(currentUser.users_profile_picture_url)) return;

    setIsUploadingImage(true);
    try {
      const response = await fetch("/api/user-management/profile-picture", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menghapus foto");
      }

      toast.success("Foto profil berhasil dihapus!");
      setCurrentUser(data.user);
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Gagal menghapus foto profil");
    } finally {
      setIsUploadingImage(false);
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
      // Merge the updated user data with current profile picture
      const updatedUser = {
        ...data.user,
        users_profile_picture_url: currentUser.users_profile_picture_url,
      };
      onUpdateSuccess(updatedUser);
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

  const handleSelectPhoto = () => {
    fileInputRef.current?.click();
  };

  // Helper function to check if image URL is valid
  const isValidImageUrl = (url: string | null): boolean => {
    return url !== null && url !== undefined && url.trim() !== "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-0 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">Edit Profil</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Section */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              {isValidImageUrl(previewUrl) ? (
                <AvatarImage src={previewUrl!} alt={currentUser.full_name} />
              ) : isValidImageUrl(currentUser.users_profile_picture_url) ? (
                <AvatarImage src={currentUser.users_profile_picture_url!} alt={currentUser.full_name} />
              ) : null}
              <AvatarFallback className="bg-gray-200">{isValidImageUrl(currentUser.users_profile_picture_url) || isValidImageUrl(previewUrl) ? <User className="w-8 h-8 text-gray-400" /> : getInitials(currentUser.full_name)}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col space-y-2">
                <div className="flex space-x-2">
                  <Button type="button" variant="outline" size="sm" className="text-blue-600 border-blue-600 hover:bg-blue-50" onClick={handleSelectPhoto} disabled={isUploadingImage}>
                    <Upload className="w-4 h-4 mr-1" />
                    Pilih foto
                  </Button>

                  {isValidImageUrl(currentUser.users_profile_picture_url) && !selectedFile && (
                    <Button type="button" variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50" onClick={handleDeleteImage} disabled={isUploadingImage}>
                      {isUploadingImage ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />}
                      Hapus
                    </Button>
                  )}
                </div>

                {selectedFile && (
                  <div className="flex space-x-2">
                    <Button type="button" variant="default" size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleUploadImage} disabled={isUploadingImage}>
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Upload Foto"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      disabled={isUploadingImage}
                    >
                      Batal
                    </Button>
                  </div>
                )}

                <p className="text-xs text-gray-500">{selectedFile ? selectedFile.name : "JPG, PNG, GIF, WebP. Max 5MB"}</p>
              </div>
            </div>

            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleFileSelect} className="hidden" />
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap</Label>
              <Input id="full_name" type="text" value={formData.full_name} onChange={(e) => handleInputChange("full_name", e.target.value)} placeholder="Masukkan nama lengkap" className={errors.full_name ? "border-red-500" : ""} />
              {errors.full_name && <p className="text-sm text-red-500">{errors.full_name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} placeholder="Masukkan email" className={errors.email ? "border-red-500" : ""} />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading || isUploadingImage}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading || isUploadingImage} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? "Menyimpan..." : "Simpan Profil"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
