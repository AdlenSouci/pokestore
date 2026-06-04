import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { fetchCardsBySetId, type PokemonTcgApiCard } from './pokemon-tcg.client';
import { buildCardWhere, type CardListQuery } from './card-filters.dto';

@Injectable()
export class CardsService {
  private readonly logger = new Logger(CardsService.name);

  constructor(
    @Inject(PrismaService) private prisma: PrismaService,
    @Inject(ConfigService) private config: ConfigService,
  ) {}

  /**
   * Synchronise les cartes depuis l'API Pokémon TCG (https://api.pokemontcg.io/v2).
   * Sets : query `?sets=sv1,sv2` ou variable d'environnement `POKEMON_TCG_SET_IDS` (défaut: `sv1`).
   * Clé optionnelle : `POKEMON_TCG_API_KEY` (header X-Api-Key, meilleur débit).
   * Limite : `?limit=100` ou `POKEMON_TCG_IMPORT_MAX` (défaut 100).
   * La limite est répartie équitablement entre les sets pour un mélange (ex: 3 sets × ~33 cartes).
   */
  async importCards(setsQuery?: string, limitQuery?: string) {
    const apiKey = this.config.get<string>('POKEMON_TCG_API_KEY');
    const setIds = this.resolveSetIds(setsQuery);
    const maxTotal = this.resolveImportLimit(limitQuery);

    if (setIds.length === 0) {
      return {
        imported: 0,
        sets: [] as string[],
        limit: maxTotal,
        message:
          'Aucun set défini. Utilise ?sets=sv1,sv2 ou définis POKEMON_TCG_SET_IDS dans .env',
      };
    }

    const quotas = this.distributeLimitAcrossSets(maxTotal, setIds.length);
    let total = 0;

    for (let i = 0; i < setIds.length; i++) {
      const setId = setIds[i];
      let quota = quotas[i];
      if (quota <= 0) {
        continue;
      }

      this.logger.log(`Import API Pokémon TCG — set ${setId} (${quota} carte(s))…`);
      const cards = await fetchCardsBySetId(setId, apiKey, quota);

      for (const card of cards) {
        const imageUrl = card.images?.large ?? card.images?.small;
        if (!imageUrl) {
          continue;
        }

        const meta = this.metaFromApiCard(card);

        await this.prisma.pokemonCard.upsert({
          where: { pokemonId: card.id },
          update: {
            name: card.name,
            type: card.types?.[0] ?? 'Unknown',
            rarity: card.rarity ?? 'Common',
            imageUrl,
            price: this.fakePrice(card.rarity),
            ...meta,
          },
          create: {
            pokemonId: card.id,
            name: card.name,
            type: card.types?.[0] ?? 'Unknown',
            rarity: card.rarity ?? 'Common',
            imageUrl,
            price: this.fakePrice(card.rarity),
            ...meta,
          },
        });

        total++;
      }
    }

    return { imported: total, sets: setIds, limit: maxTotal };
  }

  async findCards(query: CardListQuery) {
    const where = buildCardWhere(query);
    const page = Math.max(1, parseInt(query.page ?? '1', 10) || 1);
    const rawSize = parseInt(query.pageSize ?? '24', 10) || 24;
    const pageSize = Math.min(100, Math.max(1, rawSize));
    const [total, items] = await Promise.all([
      this.prisma.pokemonCard.count({ where }),
      this.prisma.pokemonCard.findMany({
        where,
        orderBy: [{ releaseYear: 'desc' }, { name: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /** Valeurs distinctes pour les filtres boutique */
  async getShopMeta() {
    const [seriesRows, yearRows, setRows, priceAgg] = await Promise.all([
      this.prisma.pokemonCard.findMany({
        where: { series: { not: null } },
        select: { series: true },
        distinct: ['series'],
        orderBy: { series: 'asc' },
      }),
      this.prisma.pokemonCard.findMany({
        where: { releaseYear: { not: null } },
        select: { releaseYear: true },
        distinct: ['releaseYear'],
        orderBy: { releaseYear: 'desc' },
      }),
      this.prisma.pokemonCard.findMany({
        where: { tcgSetId: { not: null } },
        select: { tcgSetId: true, tcgSetName: true },
        distinct: ['tcgSetId'],
        orderBy: { tcgSetId: 'asc' },
      }),
      this.prisma.pokemonCard.aggregate({
        _min: { price: true },
        _max: { price: true },
      }),
    ]);

    return {
      series: seriesRows.map((r) => r.series).filter(Boolean) as string[],
      years: yearRows
        .map((r) => r.releaseYear)
        .filter((y): y is number => y != null),
      sets: setRows
        .filter((s) => s.tcgSetId != null)
        .map((s) => ({
          id: s.tcgSetId as string,
          name: s.tcgSetName ?? (s.tcgSetId as string),
        })),
      priceMin: priceAgg._min.price ?? 0,
      priceMax: priceAgg._max.price ?? 0,
    };
  }

  private metaFromApiCard(card: PokemonTcgApiCard) {
    const s = card.set;
    if (!s) {
      return {
        tcgSetId: null,
        tcgSetName: null,
        series: null,
        releaseYear: null,
      };
    }
    return {
      tcgSetId: s.id,
      tcgSetName: s.name,
      series: s.series,
      releaseYear: this.parseReleaseYear(s.releaseDate),
    };
  }

  private parseReleaseYear(releaseDate?: string): number | null {
    if (!releaseDate || releaseDate.length < 4) {
      return null;
    }
    const y = parseInt(releaseDate.slice(0, 4), 10);
    return Number.isNaN(y) ? null : y;
  }

  /** Répartition équitable : ex. 100 cartes sur 4 sets → 25+25+25+25 */
  private distributeLimitAcrossSets(total: number, setCount: number): number[] {
    if (setCount <= 0) {
      return [];
    }
    const base = Math.floor(total / setCount);
    const rem = total % setCount;
    return Array.from({ length: setCount }, (_, i) => base + (i < rem ? 1 : 0));
  }

  private resolveSetIds(setsQuery?: string): string[] {
    const raw =
      setsQuery?.trim() ||
      this.config.get<string>('POKEMON_TCG_SET_IDS') ||
      'sv1';

    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  /** Nombre max de cartes à importer au total (défaut 100). */
  private resolveImportLimit(limitQuery?: string): number {
    const fromQuery = limitQuery?.trim();
    if (fromQuery) {
      const n = parseInt(fromQuery, 10);
      if (!Number.isNaN(n) && n > 0) {
        return Math.min(n, 50_000);
      }
    }

    const fromEnv = this.config.get<string>('POKEMON_TCG_IMPORT_MAX');
    if (fromEnv) {
      const n = parseInt(fromEnv, 10);
      if (!Number.isNaN(n) && n > 0) {
        return Math.min(n, 50_000);
      }
    }

    return 100;
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
