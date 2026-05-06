import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.product.updateMany({
    where: { id: 1 },
    data: { imageUrl: 'https://cdn.tgdd.vn/Products/Images/2443/235777/whey-protein-isolate-1kg-thumb-600x600.jpg' }
  });
  await prisma.product.updateMany({
    where: { id: 3 },
    data: { imageUrl: 'https://dasani.com.vn/wp-content/uploads/2021/04/dasani-500ml.png' }
  });
  console.log('Updated existing products with sample images');
}

main().catch(console.error).finally(() => prisma.$disconnect());
