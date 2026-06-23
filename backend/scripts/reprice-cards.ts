import { PrismaClient } from '@prisma/client';

function priceFromRarity(rarity?: string): number {
  const r = (rarity ?? '').toLowerCase();

  if (r.includes('secret') || r.includes('hyper rare')) return 75;
  if (r.includes('special illustration')) return 55;
  if (r.includes('illustration rare')) return 30;
  if (r.includes('double rare') || r.includes('ultra rare')) return 18;
  if (r.includes('ace spec')) return 22;
  if (r.includes('rare holo') || r === 'rare') return 10;
  if (r.includes('rare')) return 12;
  if (r.includes('uncommon')) return 2;
  if (r.includes('common') || r.includes('promo')) return 1;

  return 3;
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const cards = await prisma.pokemonCard.findMany({
      select: { id: true, rarity: true },
    });

    for (const card of cards) {
      await prisma.pokemonCard.update({
        where: { id: card.id },
        data: { price: priceFromRarity(card.rarity) },
      });
    }

    console.log(`Prix mis à jour pour ${cards.length} cartes.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
