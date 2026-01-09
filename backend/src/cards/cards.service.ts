import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CardsService {
  constructor(private prisma: PrismaService) {}

  async importCards() {
   
    
    const dataDir = path.join(__dirname, '../data/pokemon-tcg-data/cards/en');


    
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

    let total = 0;

    for (const file of files) {
      const filePath = path.join(dataDir, file);
      const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      for (const card of jsonData.data) {
        if (!card.images?.large) continue;

        await this.prisma.pokemonCard.upsert({
          where: { pokemonId: card.id },
          update: {},
          create: {
            pokemonId: card.id,
            name: card.name,
            type: card.types?.[0] ?? 'Unknown',
            rarity: card.rarity ?? 'Common',
            imageUrl: card.images.large,
            price: this.fakePrice(card.rarity),
          },
        });

        total++;
      }
    }

    return { imported: total };
  }

  async getAllCards() {
    return this.prisma.pokemonCard.findMany();
  }

  private fakePrice(rarity?: string): number {
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
}
