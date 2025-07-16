import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { invoiceId, paymentMethod } = await request.json();

    if (!invoiceId || !paymentMethod) {
      return NextResponse.json({ error: "Invoice ID and payment method are required" }, { status: 400 });
    }

    // Find payment record
    const payment = await prisma.payment.findFirst({
      where: {
        invoice_id: invoiceId,
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Update payment status to completed
    const updatedPayment = await prisma.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        payment_status: "completed",
      },
    });

    // Create course enrollment
    await prisma.course_enrollment.create({
      data: {
        id: payment.user_id,
        course_id: payment.course_id,
        progress: "ongoing",
        enrolled_at: new Date(),
      },
    });

    // Remove from cart if exists
    await prisma.cart.deleteMany({
      where: {
        user_id: payment.user_id,
        course_id: payment.course_id,
      },
    });

    return NextResponse.json({
      success: true,
      paymentId: updatedPayment.id,
      status: updatedPayment.payment_status,
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
