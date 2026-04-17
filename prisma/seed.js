import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mail.com' },
    update: {
      password: hashedPassword,
      role: 'admin'
    },
    create: {
      name: 'Admin',
      email: 'admin@mail.com',
      password: hashedPassword,
      role: 'admin'
    },
  });
  
  console.log('Admin user created/updated:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
