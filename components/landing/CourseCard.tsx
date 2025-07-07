"use client";

import Image from "next/image";
import Link from "next/link";

interface CourseCardProps {
  course: {
    id: string;
    cover_image_url: string | null;
    title: string;
    description: string;
    users: {
      full_name: string;
    };
    course_duration: number;
    price: number;
  };
}

const formatRupiah = (price: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const CourseCard = ({ course }: CourseCardProps) => {
  const handleRegisterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = "/register";
  };

  return (
    <Link href={`/course/${course.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative h-48 w-full">
          <Image src={course.cover_image_url || "https://placehold.co/400x225.png"} alt={course.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" priority={false} />
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-bold text-text-primary mb-2">{course.title}</h3>
          <p className="text-sm text-text-secondary mb-4 flex-grow line-clamp-3">{course.description}</p>
          <div className="text-sm text-text-secondary mb-4">
            <div className="flex items-center mb-2">
              <span className="mr-2">👤</span>
              <span>{course.users.full_name}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">📚</span>
              <span>Kelas satuan</span>
            </div>
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center text-sm text-text-secondary">
              <span className="mr-1">🕓</span>
              <span>{course.course_duration} Minggu</span>
            </div>
            <p className="text-lg font-bold text-brand-green">{formatRupiah(course.price)}</p>
          </div>
          <button className="w-full bg-brand-green text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors" onClick={handleRegisterClick}>
            Daftar
          </button>
        </div>
      </div>
    </Link>
  );
};
