// Boshlang'ich kategoriyalarni bazaga yozadi. Bepul Render tarifida Shell
// mavjud emas, shuning uchun bu skript HAR BIR deploy'da (build bosqichida)
// avtomatik ishga tushadi — lekin faqat bazada UMUMAN kategoriya bo'lmasa
// ("birinchi marta") narsa yozadi. Agar admin keyinchalik kategoriyalarni
// Admin Panel orqali o'zgartirsa/qo'shsa/o'chirsa, bu skript ularga
// tegmaydi va hech narsani qayta yaratmaydi.
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
  const count = await prisma.category.count();
  if (count > 0) {
    console.log(`ℹ️  Bazada allaqachon ${count} ta kategoriya bor — seed o'tkazib yuborildi.`);
    return;
  }
  for (const cat of categories) {
    await prisma.category.create({ data: cat });
  }
  console.log(`✅ ${categories.length} ta boshlang'ich kategoriya yozildi`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
