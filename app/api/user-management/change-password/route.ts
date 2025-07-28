import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import * as argon2 from "argon2";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password lama harus diisi"),
    newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password harus diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terauthorisasi" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = changePasswordSchema.parse(body);

    // Get current user with password
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    // Verify current password
    const isValidPassword = await argon2.verify(user.password, validatedData.currentPassword);

    if (!isValidPassword) {
      return NextResponse.json({ error: "Password lama tidak benar" }, { status: 400 });
    }

    // Hash new password
    const hashedNewPassword = await argon2.hash(validatedData.newPassword);

    // Update password
    await prisma.users.update({
      where: { id: session.user.id },
      data: {
        password: hashedNewPassword,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      message: "Password berhasil diubah",
    });
  } catch (error) {
    console.error("Error changing password:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    return NextResponse.json({ error: "Terjadi kesalahan internal server" }, { status: 500 });
  }
}
