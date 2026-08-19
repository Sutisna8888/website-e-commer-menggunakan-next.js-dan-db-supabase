import { FoodItem } from '../types';

export const FOOD_ITEMS: FoodItem[] = [
  {
    id: '1',
    name: 'Nasi Goreng Spesial Rempah',
    description: 'Nasi goreng dengan bumbu rempah pilihan, dilengkapi telur mata sapi, ayam suwir, acar segar, dan kerupuk renyah.',
    price: 28000,
    imageUrl: '/images/nasi-goreng.png',
    category: 'Makanan Utama',
    prepTime: '10-15 mnt',
    isAvailable: true,
    soldCount: 50
  },
  {
    id: '2',
    name: 'Sate Ayam Madura Premium',
    description: '10 tusuk sate daging ayam pilihan yang empuk, dibalur saus kacang gurih khas Madura dan kecap manis, ditaburi bawang goreng.',
    price: 32000,
    imageUrl: '/images/sate-ayam.png',
    category: 'Makanan Utama',
    prepTime: '15-20 mnt',
    isAvailable: true,
    soldCount: 50
  },
  {
    id: '3',
    name: 'Burger Rendang Double Cheese',
    description: 'Burger premium perpaduan barat dan lokal, dengan double beef patty rasa rendang autentik, keju meleleh, dan sayuran segar.',
    price: 45000,
    imageUrl: '/images/burger-rendang.png',
    category: 'Makanan Utama',
    prepTime: '12-18 mnt',
    isAvailable: true,
    soldCount: 0
  },
  {
    id: '4',
    name: 'Pisang Goreng Keju Karamel',
    description: 'Pisang kepok manis digoreng krispi dengan topping parutan keju cheddar melimpah dan siraman saus karamel manis.',
    price: 18000,
    imageUrl: '/images/pisang-goreng.png',
    category: 'Cemilan',
    prepTime: '8-12 mnt',
    isAvailable: true,
    soldCount: 0
  },
  {
    id: '5',
    name: 'Gado-Gado Ibu Restu',
    description: 'Menu sehat tradisional berupa sayuran rebus segar, tahu, tempe, kentang, telur, disiram dengan bumbu kacang kental yang medok.',
    price: 22000,
    imageUrl: '/images/gado-gado.png',
    category: 'Sehat',
    prepTime: '10-15 mnt',
    isAvailable: true,
    soldCount: 50
  },
  {
    id: '6',
    name: 'Salad Buah Segar Yogurt',
    description: 'Campuran potongan buah segar (apel, melon, anggur, stroberi) disiram yogurt premium manis-asam, ditaburi keju parut.',
    price: 25000,
    imageUrl: '/images/salad-buah.png',
    category: 'Sehat',
    prepTime: '5-10 mnt',
    isAvailable: true,
    soldCount: 0
  },
  {
    id: '7',
    name: 'Es Teh Manis Selasih Jelly',
    description: 'Es teh melati segar dengan gula asli, ditambah biji selasih bertekstur, serta potongan jelly kelapa kenyal yang manis.',
    price: 10000,
    imageUrl: '/images/es-teh.png',
    category: 'Minuman',
    prepTime: '3-5 mnt',
    isAvailable: true,
    soldCount: 50
  },
  {
    id: '8',
    name: 'Jus Alpukat Kocok Melted Choco',
    description: 'Jus alpukat mentega segar bertekstur kental kasar, dipadukan dengan kental manis cokelat premium di pinggiran gelas.',
    price: 18000,
    imageUrl: '/images/jus-alpukat.png',
    category: 'Minuman',
    prepTime: '5-8 mnt',
    isAvailable: true,
    soldCount: 0
  }
];
