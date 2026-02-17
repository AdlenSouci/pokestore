import { Injectable } from '@nestjs/common';
// 👇 Le chemin est clair : on sort de users, on va dans database
import { PrismaService } from '../database/prisma.service'; 

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async syncUser(data: { email: string; name: string }) {
    // Upsert est la méthode pro pour "Créer si existe pas, sinon mettre à jour"
    return this.prisma.user.upsert({
      where: { email: data.email },
      update: { name: data.name },
      create: {
        email: data.email,
        name: data.name,
      },
    });
  }
}