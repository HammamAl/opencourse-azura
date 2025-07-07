"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, AlertCircle, Upload, X } from "lucide-react";
import Link from "next/link";
import { createLecturer, type FormState } from "./actions";
import { useActionState, useState, useRef, useEffect } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      <Save className="h-4 w-4 mr-2" />
      {pending ? "Menyimpan..." : "Simpan Dosen"}
    </Button>
  );
}

function ImageUpload({
  onImageUpload,
  imageUrl,
  onRemoveImage
}: {
  onImageUpload: (url: string) => void;
  imageUrl?: string;
  onRemoveImage: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/webp', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Format file tidak didukung. Gunakan WEBP, JPEG, atau PNG.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran file terlalu besar. Maksimal 5MB.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const response = await fetch('/api/user-management/profile-picture', {
        method: 'POST',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error('Upload gagal');
      }

      const data = await response.json();
      onImageUpload(data.users_profile_picture_url);
    } catch (error) {
      setUploadError('Gagal mengunggah gambar. Silakan coba lagi.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onRemoveImage();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>Foto Profil</Label>

      {imageUrl ? (
        <div className="relative w-32 h-32 mx-auto">
          <Image
            src={imageUrl}
            alt="Preview"
            fill
            className="object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-xs text-gray-500">
            WEBP, JPEG, PNG (maksimal 5MB)
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/webp,image/jpeg,image/png"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full"
      >
        {uploading ? 'Mengupload...' : 'Pilih Gambar'}
      </Button>

      {uploadError && (
        <p className="text-sm text-red-600">{uploadError}</p>
      )}
    </div>
  );
}

export default function AddLecturer() {
  const router = useRouter();
  const [state, formAction] = useActionState<FormState, FormData>(createLecturer, {});
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const formRef = useRef<HTMLFormElement>(null);
  const successShownRef = useRef(false);

  useEffect(() => {
    if (state?.success && !successShownRef.current) {
      toast.success(<span>Dosen <strong>{state.data?.name}</strong> telah ditambahkan ke sistem</span>);

      successShownRef.current = true;

      // Redirect after toast is shown
      const redirectTimer = setTimeout(() => {
        router.push('/a/user-management/lecturer');
      });

      return () => clearTimeout(redirectTimer);
    }
  }, [state, router]);

  return (
    <div className="space-y-6 px-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/a/user-management/lecturer">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Link>
        </Button>
        <h1 className="text-xl font-bold">Tambah Dosen Baru</h1>
      </div>

      {state.error && (
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informasi Dosen</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            ref={formRef}
            key={state?.success ? 'reset' : 'form'} // Force reset on success
            action={formAction}
            className="space-y-4"
          >
            {/* Profile Image Upload */}
            <div className="flex justify-center mb-6">
              <ImageUpload
                onImageUpload={setProfileImageUrl}
                imageUrl={profileImageUrl}
                onRemoveImage={() => setProfileImageUrl('')}
              />
            </div>

            {/* Hidden input to pass image URL to server action */}
            <input
              type="hidden"
              name="profile_image_url"
              value={profileImageUrl}
            />

            <div className="space-y-2">
              <Label htmlFor="name">
                Nama Lengkap <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Masukkan nama lengkap"
                defaultValue={state.data?.name || ""}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Posisi</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="misal Kepala Prodi Ternak lele..."
                  defaultValue={state.data?.title || ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nama@email.com"
                  defaultValue={state.data?.email || ""}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nidn_number">
                  NIDN <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nidn_number"
                  name="nidn_number"
                  type="text"
                  placeholder="NIDN"
                  defaultValue={state.data?.nidn_number || ""}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Nomor Telepon</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  defaultValue={state.data?.phone_number || ""}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Minimal 8 karakter"
                  required
                  minLength={8}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">
                  Konfirmasi Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirm_password"
                  name="confirm_password"
                  type="password"
                  placeholder="Ulangi password"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" asChild>
                  <Link href="/a/user-management/lecturer">
                    Batal
                  </Link>
                </Button>
                <SubmitButton />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="text-sm text-gray-600 max-w-2xl">
        <p className="font-medium mb-2">Catatan:</p>
        <ul className="space-y-1 text-gray-500">
          <li>• Field yang bertanda <span className="text-red-500">*</span> wajib diisi</li>
          <li>• Email harus unik dan belum pernah digunakan</li>
          <li>• NIDN harus unik dan belum pernah digunakan</li>
          <li>• Password minimal 8 karakter</li>
          <li>• Password dan konfirmasi password harus cocok</li>
          <li>• Foto profil opsional, format WEBP/JPEG/PNG maksimal 5MB</li>
          <li>• Data dosen akan langsung aktif setelah disimpan</li>
        </ul>
      </div>
    </div>
  );
}
