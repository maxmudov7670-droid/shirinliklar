// Boshlang'ich kategoriyalarni bazaga yozadi — birinchi marta deploy qilingach
// bir marta ishga tushiriladi (Render Shell'da: node prisma/seed.js).
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const categories = [
  { emoji: "🍰", nameUz: "Tortlar", nameRu: "Торты", sortOrder: 1 },
  { emoji: "🧁", nameUz: "Kapkeyk", nameRu: "Капкейки", sortOrder: 2 },
  { emoji: "🍩", nameUz: "Donut", nameRu: "Донаты", sortOrder: 3 },
  { emoji: "🍪", nameUz: "Pechenye", nameRu: "Печенье", sortOrder: 4 },
  { emoji: "🥐", nameUz: "Kruassan", nameRu: "Круассаны", sortOrder: 5 },
  { emoji: "🍮", nameUz: "Desertlar", nameRu: "Десерты", sortOrder: 6 },
  { emoji: "🍫", nameUz: "Shokoladli shirinliklar", nameRu: "Шоколадные сладости", sortOrder: 7 },
  { emoji: "🎁", nameUz: "Sovg'alik shirinliklar", nameRu: "Подарочные сладости", sortOrder: 8 },
];

async function main() {
  for (const cat of categories) {
    const existing = await prisma.category.findFirst({ where: { nameUz: cat.nameUz } });
    if (existing) {
      await prisma.category.update({ where: { id: existing.id }, data: cat });
    } else {
      await prisma.category.create({ data: cat });
    }
  }
  console.log(`✅ ${categories.length} ta boshlang'ich kategoriya yozildi`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
