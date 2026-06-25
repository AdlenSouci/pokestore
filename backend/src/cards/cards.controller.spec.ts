import { Test, TestingModule } from '@nestjs/testing';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';

describe('CardsController', () => {
  let controller: CardsController;

  const cardsServiceMock = {
    findCards: jest.fn().mockResolvedValue({ items: [], total: 0, totalPages: 1 }),
    getShopMeta: jest.fn().mockResolvedValue({ series: [], sets: [], years: [] }),
    importCards: jest.fn().mockResolvedValue({ imported: 0 }),
    repriceAllCards: jest.fn().mockResolvedValue({ updated: 0 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardsController],
      providers: [{ provide: CardsService, useValue: cardsServiceMock }],
    }).compile();

    controller = module.get<CardsController>(CardsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('GET /cards returns paginated catalog', async () => {
    const result = await controller.getCards({});
    expect(result).toEqual({ items: [], total: 0, totalPages: 1 });
    expect(cardsServiceMock.findCards).toHaveBeenCalled();
  });

  it('GET /cards/meta exposes filter metadata', async () => {
    const result = await controller.shopMeta();
    expect(result).toHaveProperty('series');
    expect(result).toHaveProperty('sets');
    expect(cardsServiceMock.getShopMeta).toHaveBeenCalled();
  });
});
