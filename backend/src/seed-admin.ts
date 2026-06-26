import 'reflect-metadata';
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Crée ou met à jour le compte administrateur (rôle ADMIN).
 * Variables : ADMIN_EMAIL, ADMIN_PASSWORD (voir backend/.env.example)
 */
async function main() {
  const email = (process.env.ADMIN_EMAIL ?? 'admin@pokemon.local').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? 'admin123';
  const name = (process.env.ADMIN_NAME ?? 'Admin PokéStore').trim();

  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD doit contenir au moins 8 caractères.');
  }

  const prisma = new PrismaClient();
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        name,
        password: hashedPassword,
        role: UserRole.ADMIN,
      },
      update: {
        name,
        password: hashedPassword,
        role: UserRole.ADMIN,
      },
    });

    console.log(`[seed-admin] Compte admin prêt : ${user.email} (id=${user.id}, role=${user.role})`);
    console.log('[seed-admin] Utilise ces identifiants dans pokemon-electron uniquement.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('[seed-admin] Erreur :', err);
  process.exit(1);
});
