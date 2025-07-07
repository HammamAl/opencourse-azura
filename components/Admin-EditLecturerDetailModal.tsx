"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Loader2,
  Save,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Separator } from "./ui/separator";
import { toast } from "sonner";

interface UpdateLecturerModalProps {
  lecturerId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
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

interface UpdateLecturerData {
  full_name: string;
  email: string;
  phone_number: string;
  nidn_number: string;
  title: string;
  password?: string;
  users_profile_picture_url?: string;
}

export function UpdateLecturerModal({
  lecturerId,
  isOpen,
  onClose,
  onSuccess
}: UpdateLecturerModalProps) {
  const [lecturer, setLecturer] = useState<LecturerDetail | null>(null);
  const [formData, setFormData] = useState<UpdateLecturerData>({
    full_name: "",
    email: "",
    phone_number: "",
    nidn_number: "",
    title: "",
    users_profile_picture_url: "",
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

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

      // Initialize form data with current lecturer data
      const newFormData = {
        full_name: data.full_name || "",
        email: data.email || "",
        phone_number: data.phone_number || "",
        nidn_number: data.nidn_number || "",
        title: data.title || "",
        users_profile_picture_url: data.users_profile_picture_url || "", // Note: API uses users_ but form uses user_
      };

      setFormData(newFormData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load lecturer details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateLecturerData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lecturerId) return;

    setUpdating(true);
    setError(null);

    try {
      const submitData: UpdateLecturerData = { ...formData };

      // Handle profile picture upload
      if (selectedFile) {

        const uploadResponse = await fetch(`/api/user-management/profile-picture`, {
          method: "POST",
          headers: {
            "content-type": selectedFile.type,
          },
          body: selectedFile,
        });

        if (uploadResponse.status === 413) {
          throw new Error("Gagal mengunggah. Ukuran foto lebih dari 5 MB.");
        } else if (!uploadResponse.ok) {
          throw new Error("Gagal mengunggah foto profil");
        }

        const uploadResult = await uploadResponse.json();

        submitData.users_profile_picture_url = uploadResult.users_profile_picture_url;
      }

      // Handle password update
      if (password.trim() !== "") {
        submitData.password = password;
      } else {
        // Remove password field if not updating
        delete submitData.password;
      }

      const response = await fetch(`/api/user-management/lecturer/${lecturerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error("Failed to update lecturer");
      }

      const updateResult = await response.json();

      toast.success(<span><strong>{formData.full_name}</strong> berhasil diperbarui</span>);

      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update lecturer");
    } finally {
      setUpdating(false);
    }
  };

  const handleClose = () => {
    setLecturer(null);
    setFormData({
      full_name: "",
      email: "",
      phone_number: "",
      nidn_number: "",
      title: "",
      users_profile_picture_url: "",
    });
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError(null);
    setSelectedFile(null);
    setImagePreviewUrl(null);
    onClose();
  };

  const getPasswordError = () => {
    if (password === "" && confirmPassword === "") {
      return null; // No error if both are empty
    }

    if (password !== "" && password.length < 8) {
      return "Password minimal 8 karakter";
    }

    if (password !== confirmPassword) {
      return "Konfirmasi password tidak cocok";
    }

    return null;
  };

  const isFormValid = () => {
    const passwordError = getPasswordError();
    return formData.full_name.trim() !== "" &&
      formData.email.trim() !== "" &&
      passwordError === null;
  };

  const getCurrentProfilePictureUrl = () => {

    if (imagePreviewUrl) {
      return imagePreviewUrl;
    }

    if (formData.users_profile_picture_url) {
      return formData.users_profile_picture_url;
    }

    if (lecturer?.users_profile_picture_url) {
      return lecturer.users_profile_picture_url;
    }

    return null;
  };

  const passwordError = getPasswordError();
  const currentProfilePictureUrl = getCurrentProfilePictureUrl();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Update Dosen
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Memuat data...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {lecturer && !loading && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Section */}
            <div className="text-center space-y-2">
              {currentProfilePictureUrl ? (
                <img
                  src={currentProfilePictureUrl}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover mx-auto"
                />
              ) : (
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
              )}

              <div className="flex flex-col items-center space-y-2">
                <Label className="cursor-pointer text-sm text-blue-600 underline">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file) {
                        setSelectedFile(file);
                        setImagePreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                  />
                  Pilih Foto Profil Baru
                </Label>
                {selectedFile && (
                  <span className="text-xs text-gray-500">{selectedFile.name}</span>
                )}
              </div>

              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                ID: {lecturer.id}
              </Badge>
            </div>

            <Separator />

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nama Lengkap *</Label>
                  <Input
                    id="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Masukkan email"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nidn_number">NIDN</Label>
                  <Input
                    id="nidn_number"
                    type="text"
                    value={formData.nidn_number}
                    onChange={(e) => handleInputChange('nidn_number', e.target.value)}
                    placeholder="Masukkan NIDN"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">Nomor Telepon</Label>
                  <Input
                    id="phone_number"
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => handleInputChange('phone_number', e.target.value)}
                    placeholder="Masukkan nomor telepon"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Jabatan</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Masukkan jabatan (misal Kepala Prodi Ternak Lele)"
                />
              </div>

              <Separator />

              {/* Password Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Ubah Password (Opsional)</Label>
                  <p className="text-xs text-gray-500">Kosongkan jika tidak ingin mengubah password</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password Baru</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 8 karakter"
                        className={passwordError && password !== "" ? "border-red-300" : ""}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi password baru"
                        className={passwordError && confirmPassword !== "" ? "border-red-300" : ""}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {passwordError && (
                  <p className="text-red-600 text-sm">{passwordError}</p>
                )}
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={updating}
              >
                <X className="h-4 w-4 mr-2" />
                Batal
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid() || updating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {updating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mengupdate...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Dosen
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
