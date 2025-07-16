import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InvoiceContent from "./InvoiceContent";

interface InvoicePageProps {
  params: Promise<{
    invoiceId: string;
  }>;
}

export default async function InvoicePage({ params }: InvoicePageProps) {
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
    amount: payment.amount.toString(), // Convert Decimal to string
    payment_status: payment.payment_status,
    created_at: payment.created_at.toISOString(), // Convert Date to string
    course: {
      title: payment.course.title,
      price: payment.course.price.toString(), // Convert Decimal to string
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <InvoiceContent payment={serializedPayment} />
      </div>
    </div>
  );
}
