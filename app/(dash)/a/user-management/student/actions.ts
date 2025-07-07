"use server";

import { prisma } from "@/lib/db";
import * as argon2 from "argon2";
import { v7 } from "uuid";
import { z } from "zod";

export type FormState = {
  error?: string;
  success?: boolean;
  data?: {
    name?: string;
    email?: string;
  };
};

const StudentSchema = z
  .object({
    name: z.string().min(1, "Nama harus diisi"),
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirm_password: z.string().min(8, "Konfirmasi password minimal 8 karakter"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Password dan konfirmasi password tidak cocok",
    path: ["confirm_password"],
  });

export async function createStudent(prevState: FormState, formData: FormData): Promise<FormState> {
  const input = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirm_password: formData.get("confirm_password") as string,
  };

  const parse = StudentSchema.safeParse(input);

  if (!parse.success) {
    const firstError = parse.error.errors[0];
    return {
      error: firstError.message,
      data: {
        name: input.name,
        email: input.email,
      },
    };
  }

  const { name, email, password } = parse.data;

  try {
    const existingEmail = await prisma.users.findFirst({ where: { email } });
    if (existingEmail) {
      return {
        error: "Email sudah digunakan",
        data: {
          name,
          email,
        },
      };
    }

    const hashedPassword = await argon2.hash(password);

    await prisma.users.create({
      data: {
        id: v7(),
        name,
        full_name: name,
        email,
        password: hashedPassword,
        role: "student",
        created_at: new Date(),
      },
    });

    return {
      success: true,
      data: {
        name: name,
      },
    };
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }

    console.error("Error creating student:", error);
    return {
      error: "Gagal membuat siswa baru. Silakan coba lagi.",
      data: {
        name,
        email,
      },
    };
  }
}

export async function toggleStudentStatus(userId: string, currentStatus: boolean) {
  try {
    if (currentStatus) {
      await prisma.users.update({
        where: { id: userId },
        data: { deleted_at: new Date() },
      });
    } else {
      await prisma.users.update({
        where: { id: userId },
        data: { deleted_at: null },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error toggling student status:", error);
    return { error: "Gagal mengubah status siswa" };
  }
}
