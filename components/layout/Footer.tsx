"use client";

import { FaFacebookF, FaTwitter, FaYoutube, FaGooglePlusG, FaRss, FaMapMarkerAlt, FaPhoneAlt, FaWhatsapp, FaEnvelope } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-brand-green-light text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">FE Open Course</h2>
            <div>
              <p className="text-white mb-4">Informasi Lebih Lanjut:</p>
              <div className="flex space-x-4">
                <a href="#" aria-label="Facebook" className="w-8 h-8 flex items-center justify-center bg-white/20 rounded hover:bg-white/30 transition-colors">
                  <FaFacebookF className="text-white text-sm" />
                </a>
                <a href="#" aria-label="Twitter" className="w-8 h-8 flex items-center justify-center bg-white/20 rounded hover:bg-white/30 transition-colors">
                  <FaTwitter className="text-white text-sm" />
                </a>
                <a href="#" aria-label="YouTube" className="w-8 h-8 flex items-center justify-center bg-white/20 rounded hover:bg-white/30 transition-colors">
                  <FaYoutube className="text-white text-sm" />
                </a>
                <a href="#" aria-label="Google Plus" className="w-8 h-8 flex items-center justify-center bg-white/20 rounded hover:bg-white/30 transition-colors">
                  <FaGooglePlusG className="text-white text-sm" />
                </a>
                <a href="#" aria-label="RSS" className="w-8 h-8 flex items-center justify-center bg-white/20 rounded hover:bg-white/30 transition-colors">
                  <FaRss className="text-white text-sm" />
                </a>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Kontak Kami:</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-white">
                <FaMapMarkerAlt className="text-white mt-1 flex-shrink-0" />
                <span>JL. Raya Kaligawe Km.4 Semarang 50112</span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <FaPhoneAlt className="text-white flex-shrink-0" />
                <span>(024) 6583584 ext 537</span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <FaWhatsapp className="text-white flex-shrink-0" />
                <span>081329262505</span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <FaEnvelope className="text-white flex-shrink-0" />
                <span>fe@unissula.ac.id</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/30 py-4">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row justify-between items-center text-sm text-white">
          <p>copyright©2020</p>
          <p className="flex items-center gap-2 mt-2 sm:mt-0">
            <span>Dibuat penuh dengan</span>
            <span className="text-red-500">❤️</span>
            <span>oleh Azuralabs</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
