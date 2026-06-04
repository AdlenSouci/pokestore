import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const DEFAULT_SOURCE_URL = 'postgresql://postgres:root@localhost:5432/pokemonWeb';

type ModelName =
  | 'User'
  | 'PokemonCard'
  | 'Cart'
  | 'CartItem'
  | 'Favorite'
  | 'Order'
  | 'OrderItem';

const COPY_ORDER: ModelName[] = [
  'User',
  'PokemonCard',
  'Cart',
  'CartItem',
  'Favorite',
  'Order',
  'OrderItem',
];

const DELETE_ORDER: ModelName[] = [...COPY_ORDER].reverse();

const SERIAL_TABLES: ModelName[] = [...COPY_ORDER];

function envFlag(name: string): boolean {
  return ['1', 'true', 'yes', 'on'].includes((process.env[name] || '').toLowerCase());
}

function getDelegate(prisma: PrismaClient, modelName: ModelName): any {
  const delegateName = modelName.charAt(0).toLowerCase() + modelName.slice(1);
  return (prisma as any)[delegateName];
}

async function wipeTargetIfRequested(target: PrismaClient): Promise<void> {
  if (!envFlag('WIPE_TARGET')) {
    console.log('[migrate] WIPE_TARGET not enabled, keeping existing Neon data.');
    return;
  }

  console.log('[migrate] WIPE_TARGET enabled, deleting target data...');
  for (const model of DELETE_ORDER) {
    const delegate = getDelegate(target, model);
    const result = await delegate.deleteMany();
    console.log(`[migrate] ${model}: deleted ${result.count} rows`);
  }
}

async function copyTable(source: PrismaClient, target: PrismaClient, model: ModelName): Promise<void> {
  const sourceDelegate = getDelegate(source, model);
  const targetDelegate = getDelegate(target, model);

  const rows = await sourceDelegate.findMany();
  if (!rows.length) {
    console.log(`[migrate] ${model}: source empty, skipped`);
    return;
  }

  const result = await targetDelegate.createMany({
    data: rows,
    skipDuplicates: true,
  });

  console.log(`[migrate] ${model}: inserted ${result.count}/${rows.length}`);
}

async function resetSequences(target: PrismaClient): Promise<void> {
  console.log('[migrate] Resetting serial sequences...');

  for (const table of SERIAL_TABLES) {
    await target.$executeRawUnsafe(`
      SELECT setval(
        pg_get_serial_sequence('"${table}"', 'id'),
        COALESCE(MAX(id), 1),
        MAX(id) IS NOT NULL
      )
      FROM "${table}";
    `);
  }
}

async function main() {
  const sourceUrl = process.env.SOURCE_DATABASE_URL || DEFAULT_SOURCE_URL;
  const targetUrl = process.env.TARGET_DATABASE_URL || process.env.DATABASE_URL;

  if (!targetUrl) {
    throw new Error('Missing TARGET_DATABASE_URL or DATABASE_URL');
  }

  const source = new PrismaClient({
    datasources: { db: { url: sourceUrl } },
  });
  const target = new PrismaClient({
    datasources: { db: { url: targetUrl } },
  });

  try {
    console.log('[migrate] Starting local -> Neon copy...');
    await wipeTargetIfRequested(target);

    for (const model of COPY_ORDER) {
      await copyTable(source, target, model);
    }

    await resetSequences(target);
    console.log('[migrate] Done.');
  } finally {
    await source.$disconnect();
    await target.$disconnect();
  }
}

main().catch((error) => {
  console.error('[migrate] Failed:', error);
  process.exit(1);
});
