import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v7 as uuidv7 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const { courseId, userId } = await request.json();

    if (!courseId || !userId) {
      return NextResponse.json({ error: "Course ID and User ID are required" }, { status: 400 });
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        users: {
          select: {
            name: true,
            full_name: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if user exists
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already enrolled
    const existingEnrollment = await prisma.course_enrollment.findUnique({
      where: {
        id_course_id: {
          id: userId,
          course_id: courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({ error: "User already enrolled in this course" }, { status: 400 });
    }

    // Generate invoice ID
    const invoiceId = `FEOC${Date.now()}`;

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        id: uuidv7(),
        user_id: userId,
        course_id: courseId,
        amount: course.price,
        payment_status: "pending",
        created_at: new Date(),
        invoice_id: invoiceId,
      },
    });

    return NextResponse.json({
      invoiceId: payment.invoice_id,
      paymentId: payment.id,
      amount: payment.amount,
      status: payment.payment_status,
    });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
