// prisma/seed.ts
import { PrismaClient } from "../generated/prisma";
import argon2 from "argon2";
import { v7 as uuidv7 } from "uuid";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding ...");

  const password = await argon2.hash("password123");
  const lecturer1 = await prisma.users.upsert({
    where: { email: "khong.guan@example.com" },
    update: {},
    create: {
      id: uuidv7(),
      email: "khong.guan@example.com",
      name: "khongguan",
      full_name: "Prof. Dr. Khong Guan, S.E., M.E.",
      password: password,
      role: "lecturer",
      title: "Professor of Finance",
    },
  });

  const lecturer2 = await prisma.users.upsert({
    where: { email: "sugeng.raharjo@example.com" },
    update: {},
    create: {
      id: uuidv7(),
      email: "sugeng.raharjo@example.com",
      name: "sugengraharjo",
      full_name: "Dr. Sugeng Raharjo, Ak., CA.",
      password: password,
      role: "lecturer",
      title: "Accounting Expert",
    },
  });

  const financeCategory = await prisma.category.upsert({
    where: { name: "Keuangan" },
    update: {},
    create: {
      id: uuidv7(),
      name: "Keuangan",
    },
  });

  const coursesData = [
    {
      title: "Manajemen Keuangan Pribadi",
      description: "Post votum promissa memini cuius adeptione cupis: quem pollicitus est.",
      price: 235000,
      lecturer_id: lecturer1.id,
      status: "published",
    },
    {
      title: "Dasar-Dasar Investasi Saham",
      description: "Cuius adeptione cupis: quem pollicitus est post votum promissa memini.",
      price: 150000,
      lecturer_id: lecturer1.id,
      status: "reviewed",
    },
    {
      title: "Akuntansi untuk Pemula",
      description: "Quem pollicitus est post votum promissa memini cuius adeptione cupis.",
      price: 150000,
      lecturer_id: lecturer2.id,
      status: "need-review",
    },
    {
      title: "Perencanaan Dana Pensiun",
      description: "Adeptione cupis post votum promissa memini cuius: quem pollicitus est.",
      price: 185000,
      lecturer_id: lecturer1.id,
      status: "draft",
    },
    {
      title: "Analisis Laporan Keuangan",
      description: "Memini cuius adeptione cupis: quem pollicitus est post votum promissa.",
      price: 250000,
      lecturer_id: lecturer2.id,
      status: "published",
    },
    {
      title: "Manajemen Risiko Keuangan",
      description: "Post votum promissa memini cuius adeptione cupis: quem pollicitus est.",
      price: 210000,
      lecturer_id: lecturer1.id,
      status: "published",
    },
  ];

  for (const course of coursesData) {
    await prisma.course.create({
      data: {
        id: uuidv7(),
        title: course.title,
        description: course.description,
        price: course.price,
        lecturer_id: course.lecturer_id,
        category_id: financeCategory.id,
        course_duration: 4,
        estimated_time_per_week: 5,
        language: "Indonesia",
        status: course.status,
      },
    });
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
