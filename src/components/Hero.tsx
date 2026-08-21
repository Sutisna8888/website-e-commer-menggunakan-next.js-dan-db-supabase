'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, Star } from 'lucide-react';

interface HeroProps {
  onActionClick: () => void;
}

export default function Hero({ onActionClick }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-orange-50/50 via-white to-brand-green-50/20 dark:from-brand-dark-950 dark:via-brand-dark-900/80 dark:to-brand-dark-950 py-8 sm:py-12 transition-colors duration-300">
      
      {/* Decorative Glow Blobs (Dark Mode focus) */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-brand-orange-500/20 blur-[100px] dark:bg-brand-orange-600/20"></div>
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-brand-green-500/20 blur-[100px] dark:bg-brand-orange-500/10"></div>
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent blur-[120px] dark:bg-brand-orange-900/20"></div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          
          {/* Text Content */}
          <div className="text-center lg:col-span-7 lg:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange-100 dark:bg-brand-orange-500/20 px-3.5 py-1.5 text-xs font-semibold text-brand-orange-700 dark:text-brand-orange-400 sm:text-sm">
              <Star className="h-4 w-4 fill-brand-orange-500 text-brand-orange-500" />
              Pilihan Kuliner Terbaik di Kota Anda
            </span>
            
            <h1 className="mt-3 text-4xl font-black tracking-tight text-brand-dark-950 dark:text-white sm:text-5xl md:text-6xl">
              Nikmati Kelezatan <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-brand-orange-500 to-brand-orange-700 dark:to-brand-orange-400 bg-clip-text text-transparent">
                Kuliner Nusantara
              </span> <br />
              di Rumah Anda
            </h1>
            
            <p className="mt-4 text-base leading-relaxed text-brand-gray-500 dark:text-brand-gray-400 sm:text-lg">
              Pesan makanan tradisional & modern favoritmu secara online. Cepat, higienis, dan diantar dalam keadaan hangat langsung ke depan pintu Anda.
            </p>
            
            {/* CTA Buttons */}
            <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <button
                onClick={onActionClick}
                className="group flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange-600 px-8 py-3.5 text-base font-bold text-white shadow-premium transition-all hover:bg-brand-orange-700 hover:shadow-premium-hover sm:w-auto"
              >
                Jelajahi Menu
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
              
              <button
                onClick={onActionClick}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-brand-gray-200 dark:border-brand-dark-700 bg-white dark:bg-brand-dark-800 px-8 py-3.5 text-base font-bold text-brand-dark-800 dark:text-brand-gray-200 transition-all hover:bg-brand-gray-50 dark:hover:bg-brand-dark-700 sm:w-auto"
              >
                Lihat Promo Hari Ini
              </button>
            </div>
            

          </div>
          
          {/* Image Content */}
          <div className="relative flex justify-center lg:col-span-5">
            <div className="relative h-[300px] w-[300px] overflow-hidden rounded-full border-[8px] border-white dark:border-brand-dark-800 shadow-2xl sm:h-[400px] sm:w-[400px] lg:h-[450px] lg:w-[450px] transition-colors duration-300">
              <Image
                src="/images/hero-food.jpg"
                alt="Makanan Rasa Nusantara"
                fill
                priority
                className="object-cover object-center transition-transform duration-700 hover:scale-105"
              />
            </div>
            {/* Small Floating badge */}
            <div className="absolute top-10 left-4 animate-bounce rounded-2xl bg-white p-4 shadow-xl sm:left-10">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <div>
                  <h5 className="text-xs font-black text-brand-dark-900">Promo Spesial</h5>
                  <p className="text-[10px] text-brand-gray-500">Diskon hingga 50%</p>
                </div>
              </div>
            </div>
            
            <div className="absolute right-4 bottom-10 animate-pulse rounded-2xl bg-white p-4 shadow-xl sm:right-10">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🥗</span>
                <div>
                  <h5 className="text-xs font-black text-brand-dark-900">Menu Sehat</h5>
                  <p className="text-[10px] text-brand-gray-500">Nutrisi Terjaga</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
