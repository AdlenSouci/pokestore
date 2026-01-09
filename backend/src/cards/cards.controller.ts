import { Controller, Get } from '@nestjs/common';
import { CardsService } from './cards.service';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get('import')
  async importCards() {
    return this.cardsService.importCards();
  }

  @Get()
  async getAllCards() {
    return this.cardsService.getAllCards();
  }
}
