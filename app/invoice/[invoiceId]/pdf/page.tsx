import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InvoicePDFContent from "./InvoicePDFContent";

interface InvoicePDFPageProps {
  params: Promise<{
    invoiceId: string;
  }>;
}

export default async function InvoicePDFPage({ params }: InvoicePDFPageProps) {
  const { invoiceId } = await params;

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
    notFound();
  }

  // Serialize the payment data to handle Decimal objects
  const serializedPayment = {
    id: payment.id,
    invoice_id: payment.invoice_id,
    amount: payment.amount.toString(),
    payment_status: payment.payment_status,
    created_at: payment.created_at.toISOString(),
    course: {
      title: payment.course.title,
      price: payment.course.price.toString(),
      cover_image_url: payment.course.cover_image_url,
      users: {
        name: payment.course.users.name,
        full_name: payment.course.users.full_name,
      },
    },
    users: {
      name: payment.users.name,
      full_name: payment.users.full_name,
      email: payment.users.email,
    },
  };

  return <InvoicePDFContent payment={serializedPayment} />;
}
