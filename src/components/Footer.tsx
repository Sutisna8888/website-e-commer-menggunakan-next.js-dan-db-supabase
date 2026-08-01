'use client';

import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-brand-gray-100 bg-brand-dark-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          
          {/* Logo & Slogan */}
          <div className="flex flex-col gap-4">
            <span className="text-2xl font-extrabold tracking-tight text-brand-orange-500">
              Rasa<span className="text-white">Nusantara</span>
            </span>
            <p className="text-xs leading-relaxed text-brand-gray-400">
              Menghadirkan kelezatan masakan tradisional khas Nusantara yang diolah dengan bahan premium dan diantar dengan penuh kehangatan.
            </p>
            {/* Social Media icons */}
            <div className="flex items-center gap-3">
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-dark-900 text-xs font-bold text-brand-gray-400 hover:bg-brand-orange-600 hover:text-white transition-all">
                IG
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-dark-900 text-xs font-bold text-brand-gray-400 hover:bg-brand-orange-600 hover:text-white transition-all">
                FB
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-dark-900 text-xs font-bold text-brand-gray-400 hover:bg-brand-orange-600 hover:text-white transition-all">
                YT
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Tautan Cepat</h4>
            <ul className="mt-4 flex flex-col gap-2.5 text-xs text-brand-gray-400">
              <li><a href="#" className="hover:text-brand-orange-500 transition-colors">Beranda</a></li>
              <li><a href="#menu-section" className="hover:text-brand-orange-500 transition-colors">Menu Pilihan</a></li>
              <li><a href="#" className="hover:text-brand-orange-500 transition-colors">Tentang Kami</a></li>
              <li><a href="#" className="hover:text-brand-orange-500 transition-colors">Promo Hari Ini</a></li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Jam Operasional</h4>
            <ul className="mt-4 flex flex-col gap-2 text-xs text-brand-gray-400">
              <li>Senin - Jumat: 09:00 - 21:00 WIB</li>
              <li>Sabtu - Minggu: 08:00 - 22:00 WIB</li>
              <li className="mt-2 text-brand-orange-500 font-semibold">Toko Buka Setiap Hari</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Kontak Kami</h4>
            <ul className="mt-4 flex flex-col gap-3 text-xs text-brand-gray-400">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-brand-orange-500 shrink-0" />
                <span>Jl. Kuliner Nusantara No. 88, Jakarta Selatan, Indonesia</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-brand-orange-500 shrink-0" />
                <span>+62 812-3456-7890</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-brand-orange-500 shrink-0" />
                <span>halo@rasanusantara.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Line */}
        <div className="mt-12 border-t border-brand-dark-900 pt-6 text-center text-xs text-brand-gray-500">
          <p>© {new Date().getFullYear()} RasaNusantara. Hak Cipta Dilindungi Undang-Undang.</p>
        </div>
      </div>
    </footer>
  );
}
