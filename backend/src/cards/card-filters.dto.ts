import { Prisma } from '@prisma/client';

export interface CardListQuery {
  minPrice?: string;
  maxPrice?: string;
  year?: string;
  minYear?: string;
  maxYear?: string;
  series?: string;
  setId?: string;
  q?: string;
  /** 1-based */
  page?: string;
  pageSize?: string;
}

export function buildCardWhere(q: CardListQuery): Prisma.PokemonCardWhereInput {
  const where: Prisma.PokemonCardWhereInput = {};

  const minP = q.minPrice != null && q.minPrice !== '' ? parseInt(q.minPrice, 10) : NaN;
  const maxP = q.maxPrice != null && q.maxPrice !== '' ? parseInt(q.maxPrice, 10) : NaN;
  if (!Number.isNaN(minP) || !Number.isNaN(maxP)) {
    where.price = {};
    if (!Number.isNaN(minP)) {
      where.price.gte = minP;
    }
    if (!Number.isNaN(maxP)) {
      where.price.lte = maxP;
    }
  }

  const y = q.year != null && q.year !== '' ? parseInt(q.year, 10) : NaN;
  if (!Number.isNaN(y)) {
    where.releaseYear = y;
  } else {
    const minY = q.minYear != null && q.minYear !== '' ? parseInt(q.minYear, 10) : NaN;
    const maxY = q.maxYear != null && q.maxYear !== '' ? parseInt(q.maxYear, 10) : NaN;
    if (!Number.isNaN(minY) || !Number.isNaN(maxY)) {
      where.releaseYear = {};
      if (!Number.isNaN(minY)) {
        where.releaseYear.gte = minY;
      }
      if (!Number.isNaN(maxY)) {
        where.releaseYear.lte = maxY;
      }
    }
  }

  if (q.series != null && q.series.trim() !== '') {
    where.series = q.series.trim();
  }

  if (q.setId != null && q.setId.trim() !== '') {
    where.tcgSetId = q.setId.trim();
  }

  if (q.q != null && q.q.trim() !== '') {
    where.name = { contains: q.q.trim(), mode: 'insensitive' };
  }

  return where;
}
