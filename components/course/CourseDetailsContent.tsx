"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Users, Tag, Globe, User } from "lucide-react";

interface CourseDetailsProps {
  course: {
    id: string;
    title: string;
    description: string;
    price: number;
    course_duration: number;
    estimated_time_per_week: number;
    language: string;
    cover_image_url: string | null;
    users: {
      full_name: string;
      title: string | null;
      users_profile_picture_url: string | null;
    };
    category: {
      name: string;
    };
    course_learning_target: {
      id: string;
      description: string;
      order_index: number;
    }[];
  };
  enrollmentCount: number;
  instructors: {
    id: string;
    full_name: string;
    title: string | null;
    users_profile_picture_url: string | null;
  }[];
}

export function CourseDetailsContent({ course, enrollmentCount, instructors }: CourseDetailsProps) {
  const [isRegistered, setIsRegistered] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDuration = (weeks: number) => {
    return weeks === 1 ? "1 minggu" : `${weeks} minggu`;
  };

  const formatTimePerWeek = (hours: number) => {
    return `${hours}-3 jam per minggu`;
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 mb-25">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-text-primary">{course.title}</h1>
          <p className="text-lg text-text-secondary leading-relaxed">{course.description}</p>

          <div className="flex items-center gap-6">
            <Link href="/register">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors cursor-pointer">Daftar Sekarang</button>
            </Link>
            <div className="text-text-secondary">
              <span className="font-semibold">{enrollmentCount}</span> telah mendaftar
            </div>
          </div>

          {isRegistered && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">✓ Anda telah terdaftar dalam kelas ini</p>
            </div>
          )}
        </div>

        <div className="lg:pl-8">
          <div className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center">
            {course.cover_image_url ? (
              <img src={course.cover_image_url} alt={course.title} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <div className="text-gray-400 text-6xl">
                <Users className="w-16 h-16" />
              </div>
            )}
          </div>
        </div>
      </div>

      <hr className="border-gray-300 mb-12" />

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className="flex-1 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">Tentang Kelas Ini</h2>
            <p className="text-gray-600 mb-2">1.201 Dilihat</p>
            <div className="space-y-4 text-text-secondary leading-relaxed">
              <p>{course.description}</p>
              <p>Si ergo illa tantum fastidium compesce contra naturalem usum habili, quem habetis vestra potestate, non aliud quam aversantur incurrere. Sed si ipse aversaris, ad languorem: et mors, paupertas et tu miseros fore.</p>
              <p>
                Tollere odium autem in nostra potestate sint, ab omnibus et contra naturam transferre in nobis. Sed interim toto desiderio supprimunt: si vis aliqua quae in manu tua tibi necesse confundentur et quae, quod laudabile esset,
                nihil tamen possides.
              </p>
              <p>Oportet uti solum de actibus prosequutionem et fugam, haec leniter et blandus et reservato.</p>
              <p>Quae tibi placent quicunq prosunt aut diligebat multum, quod memor sis ad communia sunt ab initio minima. Quod si, exempli gratia, cupidum rerum in</p>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <div className="w-80 bg-white border border-gray-200 rounded-lg p-4 h-fit">
            {/* Duration Row */}
            <div className="flex items-start py-3 border-b border-gray-200">
              <div className="flex items-center w-24 flex-shrink-0">
                <Clock className="w-4 h-4 text-gray-600 mr-2" />
                <span className="text-sm text-gray-600">Lamanya:</span>
              </div>
              <div className="flex-1 text-right">
                <span className="text-sm font-semibold text-gray-900">{formatDuration(course.course_duration)}</span>
              </div>
            </div>

            <div className="flex items-start py-3 border-b border-gray-200">
              <div className="flex items-center w-24 flex-shrink-0">
                <Users className="w-4 h-4 text-gray-600 mr-2" />
                <span className="text-sm text-gray-600">Upaya:</span>
              </div>
              <div className="flex-1 text-right">
                <span className="text-sm font-semibold text-gray-900">{formatTimePerWeek(course.estimated_time_per_week)}</span>
              </div>
            </div>

            <div className="flex items-start py-3 border-b border-gray-200">
              <div className="flex items-center w-24 flex-shrink-0">
                <Tag className="w-4 h-4 text-gray-600 mr-2" />
                <span className="text-sm text-gray-600">Harga:</span>
              </div>
              <div className="flex-1 text-right">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-gray-900">{formatPrice(course.price)}</div>
                </div>
              </div>
            </div>

            <div className="flex items-start py-3 border-b border-gray-200">
              <div className="flex items-center w-24 flex-shrink-0">
                <Globe className="w-4 h-4 text-gray-600 mr-2" />
                <span className="text-sm text-gray-600">Bahasa:</span>
              </div>
              <div className="flex-1 text-right">
                <span className="text-sm font-semibold text-gray-900">{course.language}</span>
              </div>
            </div>

            <div className="flex items-start py-3">
              <div className="flex items-center w-24 flex-shrink-0">
                <Tag className="w-4 h-4 text-gray-600 mr-2" />
                <span className="text-sm text-gray-600">Kategori:</span>
              </div>
              <div className="flex-1 text-right">
                <span className="text-sm font-semibold text-gray-900">{course.category.name || "Tidak ada kategori"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 space-y-16">
        <div className="border-t border-gray-300 pt-12">
          <h2 className="text-2xl font-bold text-text-primary mb-8">Apa yang akan Kamu pelajari:</h2>
          <div className="space-y-4">
            {course.course_learning_target
              .sort((a, b) => a.order_index - b.order_index)
              .map((target) => (
                <div key={target.id} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  </div>
                  <p className="text-text-secondary text-lg leading-relaxed">{target.description}</p>
                </div>
              ))}
          </div>
        </div>

        <div className="border-t border-gray-300 pt-12">
          <h2 className="text-2xl font-bold text-text-primary mb-8">Temui instruktur Anda</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {instructors.map((instructor) => (
              <div key={instructor.id} className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  {instructor.users_profile_picture_url ? <img src={instructor.users_profile_picture_url} alt={instructor.full_name} className="w-full h-full rounded-full object-cover" /> : <User className="w-8 h-8 text-gray-400" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary mb-1">{instructor.full_name}</h3>
                  <p className="text-text-secondary text-sm mb-1">{instructor.title || "Instructor"}</p>
                  <p className="text-text-secondary text-sm">Science Center</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-300 pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-text-primary">Mulai Belajar Hari Ini</h2>
              <p className="text-text-secondary leading-relaxed">Dapatkan Sertifikat Terverifikasi untuk menyoroti pengetahuan dan keterampilan yang Anda peroleh {formatPrice(course.price)}</p>
              <Link href="/register">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors cursor-pointer">Dapatkan Sertifikat</button>
              </Link>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="w-80 h-56 relative rounded-lg overflow-hidden shadow-md">
                <Image src="https://mmrisk.blob.core.windows.net/images/sertifikat.png" alt="Certificate Preview" fill className="object-cover" sizes="(max-width: 768px) 100vw, 320px" priority={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
