import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allCategories = await prisma.category.findMany({
      where: { deleted_at: null },
      select: { id: true, name: true },
    });

    return NextResponse.json(allCategories);
  } catch (e) {
    return NextResponse.json({ error: "Internal Server Error" }, {
      status: 500,
    });
  }
}
