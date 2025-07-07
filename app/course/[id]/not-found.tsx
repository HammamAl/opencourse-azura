import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <main className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-bold text-text-primary mb-4">Kelas Tidak Ditemukan</h1>
        <p className="text-lg text-text-secondary mb-8">Maaf, kelas yang Anda cari tidak tersedia atau telah dihapus.</p>
        <Link href="/" className="bg-brand-green text-white font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-colors">
          Kembali ke Beranda
        </Link>
      </main>
      <Footer />
    </div>
  );
}
