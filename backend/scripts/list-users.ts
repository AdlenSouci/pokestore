import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
      select: {
      id: true,
      email: true,
      name: true,
      password: true,
      googleId: true,
      role: true,
      createdAt: true,
    },
    orderBy: { id: 'asc' },
  });

  for (const u of users) {
    console.log(
      JSON.stringify({
        id: u.id,
        email: u.email,
        name: u.name,
        canLoginElectron: !!u.password && u.role === 'ADMIN',
        role: u.role,
        googleOnly: !!u.googleId && !u.password,
        createdAt: u.createdAt.toISOString().slice(0, 10),
      }),
    );
  }

  if (users.length === 0) {
    console.log('AUCUN_UTILISATEUR');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
