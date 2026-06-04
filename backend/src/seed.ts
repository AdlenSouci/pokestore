import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SeedAppModule } from './seed-app.module';
import { CardsService } from './cards/cards.service';

/**
 * Appelé par `npx prisma db seed` (voir package.json → prisma.seed).
 * Variables optionnelles (.env ou shell) :
 * - SEED_SETS : liste d’ids de sets (ex: sv1,swsh12) — sinon POKEMON_TCG_SET_IDS ou défaut dans CardsService
 * - SEED_CARD_LIMIT : même chose que ?limit= sur l’API — sinon POKEMON_TCG_IMPORT_MAX ou 100
 */
async function main() {
  const app = await NestFactory.createApplicationContext(SeedAppModule, {
    logger: ['error', 'warn', 'log'],
  });
  try {
    const cards = app.get(CardsService);
    const sets = process.env.SEED_SETS?.trim();
    const limit = process.env.SEED_CARD_LIMIT?.trim();
    const result = await cards.importCards(sets || undefined, limit || undefined);
    console.log('[prisma seed] Import cartes Pokémon TCG :', JSON.stringify(result, null, 2));
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error('[prisma seed] Erreur :', err);
  process.exit(1);
});
