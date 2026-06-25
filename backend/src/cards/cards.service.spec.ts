import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CardsService } from './cards.service';
import { PrismaService } from '../database/prisma.service';

describe('CardsService', () => {
  let service: CardsService;

  const prismaMock = {
    pokemonCard: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      findUnique: jest.fn().mockResolvedValue(null),
      upsert: jest.fn().mockResolvedValue(null),
    },
  };

  const configMock = {
    get: jest.fn((key: string) => {
      if (key === 'POKEMON_TCG_SET_IDS') return 'sv1';
      return undefined;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ConfigService, useValue: configMock },
      ],
    }).compile();

    service = module.get<CardsService>(CardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns an empty list when no cards exist', async () => {
    const result = await service.findCards({});
    expect(result).toBeDefined();
    expect(prismaMock.pokemonCard.findMany).toHaveBeenCalled();
  });

  it('exposes shop meta endpoint', () => {
    expect(typeof service.getShopMeta).toBe('function');
  });
});
