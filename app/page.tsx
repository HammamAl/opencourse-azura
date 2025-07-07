import { PrismaClient } from "../generated/prisma";
import { CourseCard } from "@/components/landing/CourseCard";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const prisma = new PrismaClient();

async function getCourses() {
  const courses = await prisma.course.findMany({
    where: { status: "published" },
    take: 6,
    include: {
      users: {
        select: {
          full_name: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });

  // Convert Decimal objects to numbers for client component compatibility
  return courses.map((course) => ({
    ...course,
    course_duration: Number(course.course_duration),
    estimated_time_per_week: Number(course.estimated_time_per_week),
    price: Number(course.price),
  }));
}

export default async function LandingPage() {
  const courses = await getCourses();

  return (
    <div className="bg-white">
      <Navbar />
      <main>
        <section className="bg-brand-gray text-center py-20">
          <div className="container mx-auto px-6">
            <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">Bangun keterampilan pertama Anda</h1>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">Quod Enchiridion Epictetus stoici scripsit. Rodrigo Abela et Technologiae apud Massachusetts Instituta Opera collectio. Ex anglicus latine translata sunt.</p>
          </div>
        </section>
        <section className="container mx-auto px-6 py-20">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/3">
              <h2 className="text-3xl font-bold text-text-primary mb-4">KENAPA HARUS FE OPEN COURSE?</h2>
              <p className="text-text-secondary">Et omnia in potestate nostra esse natura liber, libera, libere valeant; sed illis non est in nostra</p>
            </div>
            <div className="md:w-2/3 grid grid-cols-2 sm:grid-cols-3 gap-6">
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="bg-brand-yellow-light p-6 rounded-lg text-center">
                    <div className="text-4xl font-bold mb-2">G</div>
                    <p className="text-text-secondary text-sm">Et omnia in potestate</p>
                  </div>
                ))}
            </div>
          </div>
        </section>

        <section className="bg-brand-gray py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-text-primary">Semua Kelas</h2>
              <p className="text-lg text-text-secondary mt-2">Oportet uti solum de actibus prosequutionem et fugam, haec leniter et</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
            <div className="text-center mt-12">
              <a href="#" className="text-brand-green font-bold hover:underline">
                Selengkapnya
              </a>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-20 flex flex-col md:flex-row items-center justify-center gap-12">
          <div className="text-4xl text-gray-400">&lt;</div>
          <div className="flex gap-8">
            <div className="bg-brand-yellow-light p-8 rounded-lg text-4xl">GH</div>
            <div className="bg-brand-yellow-light p-8 rounded-lg text-4xl">PP</div>
          </div>
          <div className="text-4xl text-gray-400">&gt;</div>
          <div className="md:w-1/3 text-center md:text-left">
            <h2 className="text-3xl font-bold text-text-primary mb-4">Kerja Sama Kami</h2>
            <p className="text-text-secondary">Et omnia in potestate nostra esse natura liber, libera, libere valeant; sed illis non est in nostra</p>
          </div>
        </section>

        <section className="bg-brand-blue-light py-20">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-text-primary mb-4">Tulis Email Anda untuk Mendapat Informasi Kelas Terbaru dari Kami</h2>
            <form className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-xl mx-auto mt-8">
              <input type="email" placeholder="Tuliskan email Anda" className="w-full sm:w-auto flex-grow px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-green" />
              <button type="submit" className="w-full sm:w-auto bg-brand-green text-white font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
