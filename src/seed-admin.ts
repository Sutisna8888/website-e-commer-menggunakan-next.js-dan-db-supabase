import 'dotenv/config';
import { prisma } from './lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const email = 'admin@rasanusantara.com';
  const password = 'admin321';
  
  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  
  if (existingAdmin) {
    console.log('Akun admin sudah ada. Memperbarui password dan role jika perlu...');
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    console.log('Berhasil update akun admin!');
    return;
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  
  await prisma.user.create({
    data: {
      email,
      name: 'Administrator',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });
  
  console.log('Berhasil membuat akun admin!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
