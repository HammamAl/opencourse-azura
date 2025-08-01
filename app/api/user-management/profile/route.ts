import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateProfileSchema = z.object({
  full_name: z.string().min(2, "Nama lengkap minimal 2 karakter"),
  email: z.string().email("Email tidak valid").optional(),
});

// Helper function to extract first name
function extractFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0];
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Tidak terauthorisasi" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // Check if email already exists (if email is being updated)
    if (validatedData.email) {
      const existingUser = await prisma.users.findFirst({
        where: {
          email: validatedData.email,
          id: { not: session.user.id },
        },
      });

      if (existingUser) {
        return NextResponse.json({ error: "Email sudah digunakan" }, { status: 400 });
      }
    }

    // Extract first name from full name
    const firstName = extractFirstName(validatedData.full_name);

    // Update user profile
    const updatedUser = await prisma.users.update({
      where: { id: session.user.id },
      data: {
        full_name: validatedData.full_name,
        name: firstName, // Update name field with first name
        ...(validatedData.email && { email: validatedData.email }),
        updated_at: new Date(),
      },
      select: {
        id: true,
        name: true,
        full_name: true,
        email: true,
        users_profile_picture_url: true,
        title: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: "Profile berhasil diperbarui",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }

    return NextResponse.json({ error: "Terjadi kesalahan internal server" }, { status: 500 });
  }
}
