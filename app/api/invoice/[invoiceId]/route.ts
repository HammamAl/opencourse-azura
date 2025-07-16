import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { invoiceId: string } }) {
  try {
    const { invoiceId } = params;

    const payment = await prisma.payment.findFirst({
      where: {
        invoice_id: invoiceId,
      },
      include: {
        course: {
          select: {
            title: true,
            price: true,
            cover_image_url: true,
            users: {
              select: {
                name: true,
                full_name: true,
              },
            },
          },
        },
        users: {
          select: {
            name: true,
            full_name: true,
            email: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json({
      invoiceId: payment.invoice_id,
      amount: payment.amount,
      status: payment.payment_status,
      createdAt: payment.created_at,
      course: payment.course,
      user: payment.users,
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
