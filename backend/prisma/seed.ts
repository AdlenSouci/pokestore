import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Import des cartes Pokémon depuis les fichiers JSON locaux...');

  const dataDir = path.join(__dirname, '../src/data/pokemon-tcg-data/cards/en');

  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

  let total = 0;
  const maxCards = 15; // limite le nombre de cartes à importer

  outerLoop:
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    for (const card of jsonData) {
      if (!card.images?.large) continue;

      await prisma.pokemonCard.upsert({
        where: { pokemonId: card.id },
        update: {},
        create: {
          pokemonId: card.id,
          name: card.name,
          type: card.types?.[0] ?? 'Unknown',
          rarity: card.rarity ?? 'Common',
          imageUrl: card.images.large,
          price: fakePrice(card.rarity),
        },
      });

      total++;
      if (total >= maxCards) break outerLoop; // stoppe après maxCards
    }
  }

  console.log(`Import terminé : ${total} cartes traitées.`);

  await prisma.$disconnect();
}

function fakePrice(rarity?: string): number {
  switch (rarity) {
    case 'Rare':
      return 500;
    case 'Ultra Rare':
      return 1200;
    case 'Secret Rare':
      return 2000;
    default:
      return 200;
  }
}

main().catch(err => {
  console.error(err);
  prisma.$disconnect();
});
