import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CardsService } from './cards.service';
import type { CardListQuery } from './card-filters.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('cards')
@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  /**
   * Synchronise les cartes depuis l'API Pokémon TCG.
   * Réservé aux administrateurs (JWT + rôle ADMIN).
   */
  @SkipThrottle()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('import')
  async importCards(
    @Query('sets') sets?: string,
    @Query('limit') limit?: string,
  ) {
    return this.cardsService.importCards(sets, limit);
  }

  /** Listes pour filtres (séries, années, sets, min/max prix) */
  @Get('meta')
  async shopMeta() {
    return this.cardsService.getShopMeta();
  }

  /** Recalcule les prix selon la rareté — administrateurs uniquement. */
  @SkipThrottle()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('reprice')
  async repriceCards() {
    return this.cardsService.repriceAllCards();
  }

  /** Catalogue avec filtres optionnels */
  @Get()
  async getCards(@Query() query: CardListQuery) {
    return this.cardsService.findCards(query);
  }
}
