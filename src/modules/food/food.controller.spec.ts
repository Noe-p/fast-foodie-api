import { Test, TestingModule } from '@nestjs/testing';
import { FoodController } from './food.controller';
import { FoodService } from './food.service';

// On mocke la validation pour ne pas dépendre de yup
jest.mock('../../validations/Food', () => ({
  __esModule: true,
  foodValidation: {
    create: { validate: jest.fn().mockResolvedValue(undefined) },
    update: { validate: jest.fn().mockResolvedValue(undefined) },
  },
}));

describe('FoodController (unit)', () => {
  let controller: FoodController;
  let service: jest.Mocked<FoodService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoodController],
      providers: [
        {
          provide: FoodService,
          useValue: {
            getFood: jest.fn(),
            getOneById: jest.fn(),
            createFood: jest.fn(),
            updateFood: jest.fn(),
            deleteFood: jest.fn(),
            formatFood: jest.fn((f) => f as any),
          },
        },
      ],
    }).compile();

    controller = module.get<FoodController>(FoodController);
    service = module.get(FoodService);
  });

  it('devrait être défini', () => {
    expect(controller).toBeDefined();
  });

  describe('get', () => {
    it('renvoie une liste formatée', async () => {
      const user: any = { id: 'u1' };
      (service.getFood as jest.Mock).mockResolvedValue([
        { id: 'f1' },
        { id: 'f2' },
      ] as any);
      (service.formatFood as jest.Mock).mockImplementation((f) => ({
        ...f,
        formatted: true,
      }));

      const result = await controller.get(user);

      expect(service.getFood).toHaveBeenCalledWith(user);
      expect(result).toEqual([
        { id: 'f1', formatted: true },
        { id: 'f2', formatted: true },
      ]);
    });
  });

  describe('getOne', () => {
    it('renvoie un aliment formaté', async () => {
      (service.getOneById as jest.Mock).mockResolvedValue({ id: 'f1' } as any);
      (service.formatFood as jest.Mock).mockReturnValue({
        id: 'f1',
        formatted: true,
      } as any);

      const result = await controller.getOne('f1');

      expect(service.getOneById).toHaveBeenCalledWith('f1');
      expect(result).toEqual({ id: 'f1', formatted: true });
    });
  });

  describe('create', () => {
    it('valide le body et appelle le service', async () => {
      const user: any = { id: 'u1' };
      (service.createFood as jest.Mock).mockResolvedValue({ id: 'f1' } as any);
      (service.formatFood as jest.Mock).mockReturnValue({ id: 'f1' } as any);

      const res = await controller.create(
        { name: 'Tomate', aisle: 'Fruits' } as any,
        user,
      );

      expect(service.createFood).toHaveBeenCalledWith(
        { name: 'Tomate', aisle: 'Fruits' },
        user,
      );
      expect(res).toEqual({ id: 'f1' });
    });
  });

  describe('update', () => {
    it('valide le body et appelle le service', async () => {
      const user: any = { id: 'u1' };
      (service.updateFood as jest.Mock).mockResolvedValue({ id: 'f1' } as any);
      (service.formatFood as jest.Mock).mockReturnValue({ id: 'f1' } as any);

      const res = await controller.update({ name: 'New' } as any, user, 'f1');

      expect(service.updateFood).toHaveBeenCalledWith(
        { name: 'New' },
        user,
        'f1',
      );
      expect(res).toEqual({ id: 'f1' });
    });
  });

  describe('delete', () => {
    it('appelle le service pour supprimer', async () => {
      (service.deleteFood as jest.Mock).mockResolvedValue(undefined);
      await controller.delete('f1');
      expect(service.deleteFood).toHaveBeenCalledWith('f1');
    });
  });
});
