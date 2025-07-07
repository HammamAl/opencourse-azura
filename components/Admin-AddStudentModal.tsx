"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, AlertCircle, Eye, EyeOff } from "lucide-react";
import { createStudent, type FormState } from "@/app/(dash)/a/user-management/student/actions";
import { useActionState, useState, useRef, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full cursor-pointer">
      <Save className="h-4 w-4 mr-2" />
      {pending ? "Menyimpan..." : "Tambah Siswa"}
    </Button>
  );
}

export function AddStudentModal({ isOpen, onClose, onSuccess }: Props) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(createStudent, {});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const successShownRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      successShownRef.current = false;
      setShowPassword(false);
      setShowConfirmPassword(false);
      setFormKey((prev) => prev + 1);

      setTimeout(() => {
        if (formRef.current) {
          formRef.current.reset();
        }
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (state?.success && !successShownRef.current) {
      toast.success(
        <span>
          Siswa <strong>{state.data?.name}</strong> telah ditambahkan ke sistem
        </span>
      );

      successShownRef.current = true;

      const timer = setTimeout(() => {
        onSuccess();
        onClose();
        setFormKey((prev) => prev + 1);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [state, onSuccess, onClose]);

  const handleClose = () => {
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormKey((prev) => prev + 1);
    onClose();
  };

  const handleModalOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Siswa Baru</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {state.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <form ref={formRef} key={formKey} action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nama Lengkap <span className="text-red-500">*</span>
              </Label>
              <Input id="name" name="name" type="text" placeholder="Masukkan nama lengkap" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input id="email" name="email" type="email" placeholder="example@email.com" required />
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

            <div className="pt-4 border-t space-y-4">
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Batal
                </Button>
                <SubmitButton />
              </div>
            </div>
          </form>

          <div className="text-sm text-gray-600">
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
      </DialogContent>
    </Dialog>
  );
}
