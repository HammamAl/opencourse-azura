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
    nidn_number?: string;
    phone_number?: string;
    title?: string;
    profile_image_url?: string;
  };
};

// Zod schema
const LecturerSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  email: z.string().email("Format email tidak valid"),
  nidn_number: z.string().min(1, "NIDN harus diisi"),
  phone_number: z.string().optional(),
  title: z.string().optional(),
  profile_image_url: z.string().optional(),
  password: z.string().min(8, "Password minimal 8 karakter"),
  confirm_password: z.string().min(8, "Konfirmasi password minimal 8 karakter"),
}).refine((data) => data.password === data.confirm_password, {
  message: "Password dan konfirmasi password tidak cocok",
  path: ["confirm_password"],
});

export async function createLecturer(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const input = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    nidn_number: formData.get("nidn_number") as string,
    phone_number: formData.get("phone_number") as string,
    title: formData.get("title") as string,
    profile_image_url: formData.get("profile_image_url") as string,
    password: formData.get("password") as string,
    confirm_password: formData.get("confirm_password") as string,
  };

  const parse = LecturerSchema.safeParse(input);

  if (!parse.success) {
    const firstError = parse.error.errors[0];
    return {
      error: firstError.message,
      data: {
        name: input.name,
        email: input.email,
        nidn_number: input.nidn_number,
        phone_number: input.phone_number,
        title: input.title,
        profile_image_url: input.profile_image_url,
      },
    };
  }

  const {
    name,
    email,
    nidn_number,
    phone_number,
    title,
    profile_image_url,
    password,
  } = parse.data;

  try {
    const existingEmail = await prisma.users.findFirst({ where: { email } });
    if (existingEmail) {
      return {
        error: "Email sudah digunakan",
        data: {
          name,
          email,
          nidn_number,
          phone_number,
          title,
          profile_image_url,
        },
      };
    }

    const existingNIDN = await prisma.users.findFirst({
      where: { nidn_number },
    });
    if (existingNIDN) {
      return {
        error: "NIDN sudah digunakan",
        data: {
          name,
          email,
          nidn_number,
          phone_number,
          title,
          profile_image_url,
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
        nidn_number,
        phone_number: phone_number || null,
        title: title || null,
        users_profile_picture_url: profile_image_url || null,
        password: hashedPassword,
        role: "lecturer",
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

    console.error("Error creating lecturer:", error);
    return {
      error: "Gagal membuat dosen baru. Silakan coba lagi.",
      data: {
        name,
        email,
        nidn_number,
        phone_number,
        title,
        profile_image_url,
      },
    };
  }
}
