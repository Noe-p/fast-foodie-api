import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodService } from './food.service';
import { Food } from './Food.entity';

// Mock du module utils pour contrôler areSimilar et getFoodIcon
jest.mock('../../utils', () => ({
  __esModule: true,
  areSimilar: jest.fn(),
  getFoodIcon: jest.fn().mockReturnValue('icon-mock'),
}));

import { areSimilar } from '../../utils';

describe('FoodService (unit)', () => {
  let service: FoodService;
  let repo: jest.Mocked<Repository<Food>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FoodService,
        {
          provide: getRepositoryToken(Food),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getOne: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<FoodService>(FoodService);
    repo = module.get(getRepositoryToken(Food));
  });

  it('devrait être défini', () => {
    expect(service).toBeDefined();
  });

  describe('formatFood', () => {
    it('retourne un DTO simplifié', () => {
      const now = new Date();
      const food = {
        id: 'id-1',
        name: 'Pomme',
        aisle: 'Fruits',
        icon: 'apple',
        createdAt: now,
        updatedAt: now,
      } as Food;

      const dto = service.formatFood(food);
      expect(dto).toEqual({
        id: 'id-1',
        name: 'Pomme',
        aisle: 'Fruits',
        icon: 'apple',
        createdAt: now,
        updatedAt: now,
      });
    });

    it('retourne undefined si food est falsy', () => {
      expect(service.formatFood(undefined as any)).toBeUndefined();
    });
  });

  describe('createFood', () => {
    const user: any = { id: 'user-1', collaborators: [], collabSend: [] };

    it('crée un aliment quand il nest pas similaire', async () => {
      (areSimilar as jest.Mock).mockReturnValue(false);
      jest.spyOn(service, 'getFood').mockResolvedValue([] as Food[]);
      repo.save.mockResolvedValue({ id: 'f1' } as any);

      const result = await service.createFood(
        { name: 'Tomate', aisle: 'Fruits' } as any,
        user,
      );

      expect(service.getFood).toHaveBeenCalledWith(user);
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Tomate', user }),
      );
      expect(result).toEqual({ id: 'f1' });
    });

    it('rejette si un aliment similaire existe', async () => {
      (areSimilar as jest.Mock).mockReturnValue(true);
      jest
        .spyOn(service, 'getFood')
        .mockResolvedValue([{ id: 'f-existing', name: 'Tomate' } as any]);

      await expect(
        service.createFood({ name: 'Tomate', aisle: 'Fruits' } as any, user),
      ).rejects.toHaveProperty('response.title');
    });
  });

  describe('getFood', () => {
    it('renvoie les aliments de lutilisateur et des collaborateurs FULL_ACCESS', async () => {
      const user: any = {
        id: 'u1',
        collaborators: [
          { type: 'FULL_ACCESS', sender: { id: 'u2' } },
          { type: 'READ_ONLY', sender: { id: 'u3' } },
        ],
        collabSend: [{ type: 'FULL_ACCESS', receveid: { id: 'u4' } }],
      };

      repo.find.mockImplementation(async ({ where }: any) => {
        if (where?.user?.id === 'u1') return [{ id: 'f-u1' }] as any;
        if (where?.user?.id === 'u2') return [{ id: 'f-u2' }] as any;
        if (where?.user?.id === 'u4') return [{ id: 'f-u4' }] as any;
        return [] as any;
      });

      const foods = await service.getFood(user);
      expect(foods).toEqual([
        { id: 'f-u1' },
        { id: 'f-u2' },
        { id: 'f-u4' },
      ] as any);
    });
  });
});
