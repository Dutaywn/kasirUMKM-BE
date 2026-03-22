import { prisma } from '../lib/prisma';
import { faker } from '@faker-js/faker';

// Use the shared prisma instance which is already configured with accelerateUrl

async function main() {
  console.log('Starting seeding...');

  // Optional: Clean up existing data in the correct order to respect FK constraints
  // Note: Uncheck these if you want to keep existing data
  await prisma.stock.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // 1. Create Categories
  const categoryNames = ['Makanan', 'Minuman', 'Kebutuhan Pokok', 'Elektronik', 'Pakaian'];
  const categories = [];

  for (const name of categoryNames) {
    const category = await prisma.category.create({
      data: {
        name,
        description: faker.commerce.productDescription(),
      },
    });
    categories.push(category);
    console.log(`Created category: ${name}`);
  }

  // 2. Create Products for each category
  for (const category of categories) {
    // 3-7 products per category
    const productCount = faker.number.int({ min: 3, max: 7 });

    for (let i = 0; i < productCount; i++) {
      const initialStock = faker.number.int({ min: 5, max: 100 });
      const price = Number(faker.commerce.price({ min: 5000, max: 500000, dec: 0 }));
      const name = faker.commerce.productName();

      await prisma.product.create({
        data: {
          name,
          price,
          imgUrl: faker.image.url({ width: 640, height: 480 }),
          stocks: initialStock,
          stockType: faker.helpers.arrayElement(['pcs', 'kg', 'liter', 'pack']),
          categoryId: category.id,
          stockId: {
            create: {
              total: initialStock,
              type: 'IN',
              note: 'Initial seeding stock',
            },
          },
        },
      });
      console.log(`  Added product: ${name} with stock ${initialStock}`);
    }
  }

  console.log('Seeding finished successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
