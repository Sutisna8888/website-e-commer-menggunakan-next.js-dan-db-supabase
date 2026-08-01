import { prisma } from './src/lib/prisma';

async function main() {
  await prisma.globalTopping.deleteMany();

  const toppings = [
    { name: 'Telur Mata Sapi', price: 4000, categories: 'Makanan' },
    { name: 'Telur Dadar', price: 5000, categories: 'Makanan' },
    { name: 'Kerupuk Udang', price: 3000, categories: 'Makanan' },
    { name: 'Sate Usus', price: 3500, categories: 'Makanan' },
    { name: 'Sate Telur Puyuh', price: 4000, categories: 'Makanan' },
    { name: 'Ekstra Ayam Suwir', price: 8000, categories: 'Makanan' },
    { name: 'Ceker Ayam', price: 5000, categories: 'Makanan' },
    { name: 'Bakso Sapi', price: 6000, categories: 'Makanan' },
    { name: 'Dumpling Keju', price: 5000, categories: 'Makanan' },
    { name: 'Keju Cheddar Parut', price: 5000, categories: 'Makanan,Cemilan' },
    { name: 'Cokelat Meses', price: 3000, categories: 'Cemilan,Minuman' },
    { name: 'Susu Kental Manis', price: 2000, categories: 'Cemilan,Minuman' },
    { name: 'Kacang Almond', price: 7000, categories: 'Cemilan,Minuman' },
    { name: 'Boba', price: 4000, categories: 'Minuman' },
    { name: 'Jelly Kelapa', price: 3000, categories: 'Minuman' },
    { name: 'Ekstra Cincau', price: 3000, categories: 'Minuman' },
    { name: 'Ekstra Selasih', price: 2000, categories: 'Minuman' }
  ];

  console.log('Menambahkan data GlobalTopping...');
  
  for (const t of toppings) {
    await prisma.globalTopping.create({
      data: t
    });
    console.log(`Dibuat: ${t.name} (Rp ${t.price})`);
  }
  
  console.log('Selesai!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
