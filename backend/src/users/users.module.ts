import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
// 👇 Vérifie bien cette ligne. Si 'prisma' est un dossier dans 'src', alors '../' est bon.
import { PrismaService } from '../database/prisma.service'; 

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
})
export class UsersModule {}