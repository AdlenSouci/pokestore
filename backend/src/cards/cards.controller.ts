import { Controller, Get, Query } from '@nestjs/common';
import { CardsService } from './cards.service';
import type { CardListQuery } from './card-filters.dto';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  /**
   * Synchronise les cartes depuis l'API Pokémon TCG.
   * Exemple : GET /api/cards/import?sets=sv1,swsh12&limit=100
   */
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

  /** Catalogue avec filtres optionnels */
  @Get()
  async getCards(@Query() query: CardListQuery) {
    return this.cardsService.findCards(query);
  }
}
