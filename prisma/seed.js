import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const IMAGE_URLS = [
  'https://images.unsplash.com/photo-1662370761575-05ff1ee40d7d?q=80&w=1035&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1590868309235-ea34bed7bd7f?q=80&w=927&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'https://images.unsplash.com/photo-1558818498-28c1e002b655?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
];

function randomImage() {
  return IMAGE_URLS[Math.floor(Math.random() * IMAGE_URLS.length)];
}

async function main() {
  // ── Admin user ──
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

  console.log('✔ Admin user created/updated:', admin.email);

  // ── Categories ──
  const categoriesData = [
    { name: 'Sayuran Hijau', slug: 'sayuran-hijau', sequence: 1 },
    { name: 'Buah Segar', slug: 'buah-segar', sequence: 2 },
    { name: 'Bumbu & Rempah', slug: 'bumbu-rempah', sequence: 3 },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const created = await prisma.productCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, sequence: cat.sequence, isActive: true },
      create: { name: cat.name, slug: cat.slug, sequence: cat.sequence, isActive: true },
    });
    categories.push(created);
    console.log(`✔ Category: ${created.name}`);
  }

  // ── Products per category ──
  const productsData = {
    'sayuran-hijau': [
      { name: 'Bayam Segar', slug: 'bayam-segar', description: 'Bayam hijau segar dipetik langsung dari kebun organik.', units: [{ label: '250g', price: 8000 }, { label: '500g', price: 14000 }] },
      { name: 'Kangkung', slug: 'kangkung', description: 'Kangkung segar berkualitas tinggi untuk tumis dan lalapan.', units: [{ label: '1 Ikat', price: 5000 }, { label: '3 Ikat', price: 12000 }] },
      { name: 'Sawi Hijau', slug: 'sawi-hijau', description: 'Sawi hijau renyah, cocok untuk tumis dan sup.', units: [{ label: '250g', price: 7000 }, { label: '500g', price: 12000 }] },
      { name: 'Brokoli', slug: 'brokoli', description: 'Brokoli segar kaya nutrisi dan antioksidan.', units: [{ label: '250g', price: 15000 }, { label: '500g', price: 27000 }] },
      { name: 'Selada Keriting', slug: 'selada-keriting', description: 'Selada keriting renyah untuk salad segar Anda.', units: [{ label: '150g', price: 10000 }, { label: '300g', price: 18000 }] },
      { name: 'Daun Kemangi', slug: 'daun-kemangi', description: 'Daun kemangi harum, sempurna untuk lalapan dan sambal.', units: [{ label: '100g', price: 5000 }, { label: '250g', price: 10000 }] },
      { name: 'Kacang Panjang', slug: 'kacang-panjang', description: 'Kacang panjang segar, ideal untuk tumis dan urap.', units: [{ label: '250g', price: 8000 }, { label: '500g', price: 14000 }] },
      { name: 'Terong Ungu', slug: 'terong-ungu', description: 'Terong ungu berkualitas untuk berbagai masakan Indonesia.', units: [{ label: '500g', price: 10000 }, { label: '1 Kg', price: 18000 }] },
      { name: 'Pare', slug: 'pare', description: 'Pare segar, kaya manfaat untuk kesehatan tubuh.', units: [{ label: '250g', price: 7000 }, { label: '500g', price: 12000 }] },
      { name: 'Labu Siam', slug: 'labu-siam', description: 'Labu siam segar untuk sayur bening dan tumisan.', units: [{ label: '1 Buah', price: 6000 }, { label: '3 Buah', price: 15000 }] },
      { name: 'Daun Singkong', slug: 'daun-singkong', description: 'Daun singkong muda, lembut untuk gulai dan urap.', units: [{ label: '250g', price: 6000 }, { label: '500g', price: 10000 }] },
      { name: 'Gambas (Oyong)', slug: 'gambas-oyong', description: 'Gambas segar untuk tumis dan sup sayur.', units: [{ label: '500g', price: 9000 }, { label: '1 Kg', price: 16000 }] },
      { name: 'Wortel', slug: 'wortel', description: 'Wortel segar manis dari dataran tinggi.', units: [{ label: '250g', price: 8000 }, { label: '500g', price: 14000 }] },
      { name: 'Timun Jepang', slug: 'timun-jepang', description: 'Timun jepang renyah untuk salad dan lalapan.', units: [{ label: '250g', price: 10000 }, { label: '500g', price: 18000 }] },
      { name: 'Kubis', slug: 'kubis', description: 'Kubis segar dan padat untuk berbagai masakan.', units: [{ label: '1 Buah', price: 12000 }, { label: '½ Buah', price: 7000 }] },
      { name: 'Pakcoy', slug: 'pakcoy', description: 'Pakcoy baby segar, cocok untuk tumis dan hotpot.', units: [{ label: '200g', price: 9000 }, { label: '500g', price: 20000 }] },
    ],
    'buah-segar': [
      { name: 'Pisang Cavendish', slug: 'pisang-cavendish', description: 'Pisang cavendish manis dan lembut, kaya kalium.', units: [{ label: '1 Sisir', price: 25000 }, { label: '½ Sisir', price: 14000 }] },
      { name: 'Apel Fuji', slug: 'apel-fuji', description: 'Apel fuji import manis dan renyah.', units: [{ label: '3 Buah', price: 35000 }, { label: '6 Buah', price: 65000 }] },
      { name: 'Jeruk Mandarin', slug: 'jeruk-mandarin', description: 'Jeruk mandarin manis tanpa biji, mudah dikupas.', units: [{ label: '500g', price: 30000 }, { label: '1 Kg', price: 55000 }] },
      { name: 'Mangga Harum Manis', slug: 'mangga-harum-manis', description: 'Mangga harum manis matang pohon, daging tebal.', units: [{ label: '1 Buah', price: 18000 }, { label: '3 Buah', price: 48000 }] },
      { name: 'Pepaya California', slug: 'pepaya-california', description: 'Pepaya california matang sempurna, kaya enzim papain.', units: [{ label: '1 Buah', price: 15000 }, { label: '½ Buah', price: 9000 }] },
      { name: 'Semangka Merah', slug: 'semangka-merah', description: 'Semangka merah segar, manis dan menyegarkan.', units: [{ label: '1 Buah', price: 35000 }, { label: '½ Buah', price: 20000 }] },
      { name: 'Melon Hijau', slug: 'melon-hijau', description: 'Melon hijau manis dan juicy untuk hidangan penutup.', units: [{ label: '1 Buah', price: 28000 }, { label: '½ Buah', price: 16000 }] },
      { name: 'Anggur Merah', slug: 'anggur-merah', description: 'Anggur merah import tanpa biji, rasa manis segar.', units: [{ label: '250g', price: 35000 }, { label: '500g', price: 65000 }] },
      { name: 'Strawberry', slug: 'strawberry', description: 'Strawberry segar dari dataran tinggi Bandung.', units: [{ label: '250g', price: 40000 }, { label: '500g', price: 72000 }] },
      { name: 'Nanas Madu', slug: 'nanas-madu', description: 'Nanas madu manis tanpa rasa asam, dagingnya lembut.', units: [{ label: '1 Buah', price: 20000 }, { label: '½ Buah', price: 12000 }] },
      { name: 'Alpukat Mentega', slug: 'alpukat-mentega', description: 'Alpukat mentega lembut, perfect untuk jus dan salad.', units: [{ label: '1 Buah', price: 15000 }, { label: '3 Buah', price: 40000 }] },
      { name: 'Kelengkeng', slug: 'kelengkeng', description: 'Kelengkeng manis, daging tebal dan biji kecil.', units: [{ label: '500g', price: 32000 }, { label: '1 Kg', price: 58000 }] },
      { name: 'Salak Pondoh', slug: 'salak-pondoh', description: 'Salak pondoh super manis dari Sleman, Yogyakarta.', units: [{ label: '500g', price: 18000 }, { label: '1 Kg', price: 32000 }] },
      { name: 'Jambu Kristal', slug: 'jambu-kristal', description: 'Jambu kristal renyah tanpa biji, rasa manis segar.', units: [{ label: '1 Buah', price: 12000 }, { label: '3 Buah', price: 30000 }] },
      { name: 'Jeruk Bali', slug: 'jeruk-bali', description: 'Jeruk bali merah segar, manis dan menyegarkan.', units: [{ label: '1 Buah', price: 25000 }] },
      { name: 'Kiwi', slug: 'kiwi', description: 'Kiwi import segar, kaya vitamin C dan serat.', units: [{ label: '3 Buah', price: 30000 }, { label: '6 Buah', price: 55000 }] },
    ],
    'bumbu-rempah': [
      { name: 'Bawang Merah', slug: 'bawang-merah', description: 'Bawang merah Brebes pilihan, aroma kuat.', units: [{ label: '250g', price: 10000 }, { label: '500g', price: 18000 }, { label: '1 Kg', price: 32000 }] },
      { name: 'Bawang Putih', slug: 'bawang-putih', description: 'Bawang putih tunggal berkualitas, rasa lebih pekat.', units: [{ label: '250g', price: 12000 }, { label: '500g', price: 22000 }] },
      { name: 'Cabai Merah Keriting', slug: 'cabai-merah-keriting', description: 'Cabai merah keriting segar, pedas mantap.', units: [{ label: '100g', price: 8000 }, { label: '250g', price: 18000 }] },
      { name: 'Cabai Rawit', slug: 'cabai-rawit', description: 'Cabai rawit super pedas untuk sambal dan masakan.', units: [{ label: '100g', price: 10000 }, { label: '250g', price: 22000 }] },
      { name: 'Jahe Emprit', slug: 'jahe-emprit', description: 'Jahe emprit berkhasiat untuk minuman dan masakan.', units: [{ label: '250g', price: 8000 }, { label: '500g', price: 14000 }] },
      { name: 'Kunyit Segar', slug: 'kunyit-segar', description: 'Kunyit segar alami untuk bumbu masak dan jamu.', units: [{ label: '250g', price: 7000 }, { label: '500g', price: 12000 }] },
      { name: 'Lengkuas', slug: 'lengkuas', description: 'Lengkuas segar untuk rendang, soto, dan gulai.', units: [{ label: '250g', price: 6000 }, { label: '500g', price: 10000 }] },
      { name: 'Serai', slug: 'serai', description: 'Serai segar harum, cocok untuk berbagai masakan.', units: [{ label: '100g', price: 5000 }, { label: '250g', price: 10000 }] },
      { name: 'Daun Salam', slug: 'daun-salam', description: 'Daun salam segar untuk aroma masakan yang khas.', units: [{ label: '50g', price: 3000 }, { label: '100g', price: 5000 }] },
      { name: 'Daun Jeruk', slug: 'daun-jeruk', description: 'Daun jeruk purut segar, wangi untuk aneka masakan.', units: [{ label: '50g', price: 4000 }, { label: '100g', price: 7000 }] },
      { name: 'Kemiri', slug: 'kemiri', description: 'Kemiri kupas pilihan untuk bumbu dasar masakan.', units: [{ label: '100g', price: 8000 }, { label: '250g', price: 18000 }] },
      { name: 'Ketumbar Biji', slug: 'ketumbar-biji', description: 'Ketumbar biji utuh, aroma lebih segar saat ditumbuk.', units: [{ label: '100g', price: 6000 }, { label: '250g', price: 13000 }] },
      { name: 'Lada Hitam', slug: 'lada-hitam', description: 'Lada hitam butiran premium dari Bangka.', units: [{ label: '50g', price: 10000 }, { label: '100g', price: 18000 }] },
      { name: 'Kayu Manis', slug: 'kayu-manis', description: 'Kayu manis batangan asli untuk masakan dan minuman.', units: [{ label: '50g', price: 8000 }, { label: '100g', price: 14000 }] },
      { name: 'Pala Utuh', slug: 'pala-utuh', description: 'Pala utuh pilihan, aroma kuat untuk kue dan masakan.', units: [{ label: '50g', price: 12000 }, { label: '100g', price: 22000 }] },
      { name: 'Cengkeh', slug: 'cengkeh', description: 'Cengkeh kering berkualitas untuk bumbu dan rempah.', units: [{ label: '50g', price: 15000 }, { label: '100g', price: 28000 }] },
    ],
  };

  for (const cat of categories) {
    const items = productsData[cat.slug];
    if (!items) continue;

    for (const item of items) {
      const existing = await prisma.product.findUnique({
        where: { slug: item.slug },
        include: { images: true },
      });

      if (existing) {
        // Add image if product exists but has no images
        if (existing.images.length === 0) {
          await prisma.productImage.create({
            data: { productId: existing.id, imageUrl: randomImage(), sequence: 0 },
          });
          console.log(`  🖼 Added image to existing: ${item.name}`);
        } else {
          console.log(`  ⏭ Product already exists: ${item.name}`);
        }
        continue;
      }

      await prisma.product.create({
        data: {
          name: item.name,
          slug: item.slug,
          description: item.description,
          productCategoryId: cat.id,
          isActive: true,
          units: {
            create: item.units.map(u => ({ label: u.label, price: u.price })),
          },
          images: {
            create: [{ imageUrl: randomImage(), sequence: 0 }],
          },
        },
      });
      console.log(`  ✔ Product: ${item.name} (${item.units.length} units)`);
    }

    console.log(`✔ Seeded ${items.length} products for "${cat.name}"`);
  }

  console.log('\n🌱 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
