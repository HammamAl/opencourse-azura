import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v7 as uuidv7 } from "uuid";
import argon2 from "argon2";
import { Prisma } from "@/generated/prisma";

interface RequestBody {
  fullName: string;
  email: string;
  password: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: RequestBody = await req.json();
    const { fullName, email, password } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json({ message: "Semua field wajib diisi" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Format email tidak valid" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ message: "Password minimal 8 karakter" }, { status: 400 });
    }

    if (fullName.trim().length < 2) {
      return NextResponse.json({ message: "Nama lengkap minimal 2 karakter" }, { status: 400 });
    }

    const existingUser = await prisma.users.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        deleted_at: null,
      },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 409 });
    }

    const hashedPassword = await argon2.hash(password);

    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0];

    const newUser = await prisma.$transaction(async (tx) => {
      return await tx.users.create({
        data: {
          id: uuidv7(),
          email: email.toLowerCase().trim(),
          name: firstName,
          full_name: fullName.trim(),
          password: hashedPassword,
          role: "student",
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    });

    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      {
        message: "Registrasi berhasil!",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 409 });
      }

      if (error.code === "P2003") {
        return NextResponse.json({ message: "Terjadi kesalahan referensi data" }, { status: 400 });
      }
    }

    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan pada server";
    console.error("Unexpected error:", errorMessage);

    return NextResponse.json({ message: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
