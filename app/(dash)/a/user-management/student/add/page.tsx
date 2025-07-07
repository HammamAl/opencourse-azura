"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { createStudent, type FormState } from "../actions";
import { useActionState, useState, useRef, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      <Save className="h-4 w-4 mr-2" />
      {pending ? "Menyimpan..." : "Tambah Siswa"}
    </Button>
  );
}

export default function AddStudent() {
  const router = useRouter();
  const [state, formAction] = useActionState<FormState, FormData>(createStudent, {});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const successShownRef = useRef(false);

  useEffect(() => {
    if (state?.success && !successShownRef.current) {
      toast.success(
        <span>
          Siswa <strong>{state.data?.name}</strong> telah ditambahkan ke sistem
        </span>
      );

      successShownRef.current = true;

      // Redirect after toast is shown
      const redirectTimer = setTimeout(() => {
        router.push("/a/user-management/student");
      }, 1500);

      return () => clearTimeout(redirectTimer);
    }
  }, [state, router]);

  return (
    <div className="space-y-6 px-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/a/user-management/student">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Link>
        </Button>
        <h1 className="text-xl font-bold">Tambah Siswa Baru</h1>
      </div>

      {state.error && (
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Informasi Siswa</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} key={state?.success ? "reset" : "form"} action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nama Lengkap <span className="text-red-500">*</span>
              </Label>
              <Input id="name" name="name" type="text" placeholder="Masukkan nama lengkap" defaultValue={state.data?.name || ""} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input id="email" name="email" type="email" placeholder="nama@email.com" defaultValue={state.data?.email || ""} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="Minimal 8 karakter" required minLength={8} />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">
                  Ulangi Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input id="confirm_password" name="confirm_password" type={showConfirmPassword ? "text" : "password"} placeholder="Ulangi password" required minLength={8} />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" asChild>
                  <Link href="/a/user-management/student">Batal</Link>
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
          <li>
            • Field yang bertanda <span className="text-red-500">*</span> wajib diisi
          </li>
          <li>• Email harus unik dan belum pernah digunakan</li>
          <li>• Password minimal 8 karakter</li>
          <li>• Password dan konfirmasi password harus cocok</li>
          <li>• Data siswa akan langsung aktif setelah disimpan</li>
        </ul>
      </div>
    </div>
  );
}
