/**
 * Seed: Add news item — Draft Sunday March 1st 2026
 *
 * Run: npx ts-node --project tsconfig.seed.json prisma/seed-news-march-draft-2026.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const title = 'Draft this Sunday — March 1st, 2026';
  const existing = await prisma.news.findFirst({
    where: { title },
  });
  if (existing) {
    console.log('News item already exists:', title);
    return;
  }

  await prisma.news.create({
    data: {
      title,
      excerpt: 'Next draft is this Sunday, March 1st, 2026. See you there!',
      category: 'Announcements',
      author: 'League',
      publishedAt: new Date(),
    },
  });
  console.log('Created news:', title);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
