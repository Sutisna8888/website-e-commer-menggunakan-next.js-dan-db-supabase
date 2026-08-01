import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DIRECT_URL
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const FOOD_ITEMS = [
  {
    id: '1',
    name: 'Nasi Goreng Spesial Rempah',
    description: 'Nasi goreng dengan bumbu rempah pilihan, dilengkapi telur mata sapi, ayam suwir, acar segar, dan kerupuk renyah.',
    price: 28000,
    imageUrl: '/images/nasi-goreng.png',
    category: 'Makanan Utama',
    rating: 4.8,
    reviewsCount: 142,
    prepTime: '10-15 mnt',
    isAvailable: true,
    isPopular: true
  },
  {
    id: '2',
    name: 'Sate Ayam Madura Premium',
    description: '10 tusuk sate daging ayam pilihan yang empuk, dibalur saus kacang gurih khas Madura dan kecap manis, ditaburi bawang goreng.',
    price: 32000,
    imageUrl: '/images/sate-ayam.png',
    category: 'Makanan Utama',
    rating: 4.9,
    reviewsCount: 215,
    prepTime: '15-20 mnt',
    isAvailable: true,
    isPopular: true
  },
  {
    id: '3',
    name: 'Burger Rendang Double Cheese',
    description: 'Burger premium perpaduan barat dan lokal, dengan double beef patty rasa rendang autentik, keju meleleh, dan sayuran segar.',
    price: 45000,
    imageUrl: '/images/burger-rendang.png',
    category: 'Makanan Utama',
    rating: 4.7,
    reviewsCount: 98,
    prepTime: '12-18 mnt',
    isAvailable: true,
    isPopular: false
  },
  {
    id: '4',
    name: 'Pisang Goreng Keju Karamel',
    description: 'Pisang kepok manis digoreng krispi dengan topping parutan keju cheddar melimpah dan siraman saus karamel manis.',
    price: 18000,
    imageUrl: '/images/pisang-goreng.png',
    category: 'Cemilan',
    rating: 4.6,
    reviewsCount: 88,
    prepTime: '8-12 mnt',
    isAvailable: true,
    isPopular: false
  },
  {
    id: '5',
    name: 'Gado-Gado Ibu Restu',
    description: 'Menu sehat tradisional berupa sayuran rebus segar, tahu, tempe, kentang, telur, disiram dengan bumbu kacang kental yang medok.',
    price: 22000,
    imageUrl: '/images/gado-gado.png',
    category: 'Sehat',
    rating: 4.8,
    reviewsCount: 120,
    prepTime: '10-15 mnt',
    isAvailable: true,
    isPopular: true
  },
  {
    id: '6',
    name: 'Salad Buah Segar Yogurt',
    description: 'Campuran potongan buah segar (apel, melon, anggur, stroberi) disiram yogurt premium manis-asam, ditaburi keju parut.',
    price: 25000,
    imageUrl: '/images/salad-buah.png',
    category: 'Sehat',
    rating: 4.5,
    reviewsCount: 64,
    prepTime: '5-10 mnt',
    isAvailable: true,
    isPopular: false
  },
  {
    id: '7',
    name: 'Es Teh Manis Selasih Jelly',
    description: 'Es teh melati segar dengan gula asli, ditambah biji selasih bertekstur, serta potongan jelly kelapa kenyal yang manis.',
    price: 10000,
    imageUrl: '/images/es-teh.png',
    category: 'Minuman',
    rating: 4.9,
    reviewsCount: 310,
    prepTime: '3-5 mnt',
    isAvailable: true,
    isPopular: true
  },
  {
    id: '8',
    name: 'Jus Alpukat Kocok Melted Choco',
    description: 'Jus alpukat mentega segar bertekstur kental kasar, dipadukan dengan kental manis cokelat premium di pinggiran gelas.',
    price: 18000,
    imageUrl: '/images/jus-alpukat.png',
    category: 'Minuman',
    rating: 4.7,
    reviewsCount: 154,
    prepTime: '5-8 mnt',
    isAvailable: true,
    isPopular: false
  }
];

async function main() {
  console.log('Menghapus data transaksi lama (Order & OrderItem)...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();

  console.log('Menghapus data makanan lama...');
  // Prisma onDelete: Cascade di schema akan otomatis menghapus Topping & Variant terkait
  await prisma.foodItem.deleteMany();

  console.log('Memasukkan data makanan baru (seeding) beserta Topping & Variant...');
  for (const item of FOOD_ITEMS) {
    let toppingsData: { name: string; price: number }[] = [];
    let variantsData: { name: string; options: string; defaultValue: string }[] = [];

    if (item.category === 'Minuman') {
      toppingsData = [
        { name: 'Ekstra Selasih', price: 2000 },
        { name: 'Jelly Kelapa', price: 3000 },
        { name: 'Ekstra Cincau', price: 3000 }
      ];
      variantsData = [
        {
          name: 'Tingkat Kemanisan',
          options: 'Tanpa Gula,Sedikit Gula,Manis Normal',
          defaultValue: 'Manis Normal'
        }
      ];
    } else if (item.category === 'Cemilan') {
      toppingsData = [
        { name: 'Ekstra Keju Parut', price: 4000 },
        { name: 'Cokelat Meses', price: 3000 },
        { name: 'Susu Kental Manis', price: 2000 }
      ];
    } else {
      // Makanan Utama / Sehat
      toppingsData = [
        { name: 'Telur Mata Sapi', price: 4000 },
        { name: 'Keju Cheddar', price: 5000 },
        { name: 'Ekstra Ayam Suwir', price: 8000 }
      ];
      variantsData = [
        {
          name: 'Tingkat Kepedasan',
          options: 'Tidak Pedas,Sedang,Pedas,Sangat Pedas',
          defaultValue: 'Sedang'
        }
      ];
    }

    await prisma.foodItem.create({
      data: {
        ...item,
        toppings: {
          create: toppingsData
        },
        variants: {
          create: variantsData
        }
      }
    });
  }
  console.log('Seeding selesai dengan sukses!');
}

main()
  .catch((e) => {
    console.error('Error saat seeding:', e);
    process.exit(1);
  });
