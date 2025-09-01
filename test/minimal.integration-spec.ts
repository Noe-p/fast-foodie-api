import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entité simple pour les tests
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class TestFood {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  aisle: string;

  @Column()
  icon: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// Contrôleur de test très simple
import { Controller, Get, Post, Body, HttpCode } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('test-foods')
export class TestFoodController {
  constructor(
    @InjectRepository(TestFood) private foodRepository: Repository<TestFood>,
  ) {}

  @Get()
  async findAll(): Promise<any[]> {
    const foods = await this.foodRepository.find();
    return foods.map((food) => ({
      id: food.id,
      name: food.name,
      aisle: food.aisle,
      icon: food.icon,
    }));
  }

  @Post()
  @HttpCode(201)
  async create(@Body() createFoodDto: any): Promise<any> {
    const food = new TestFood();
    food.name = createFoodDto.name;
    food.aisle = createFoodDto.aisle;
    food.icon = createFoodDto.icon;

    const savedFood = await this.foodRepository.save(food);

    return {
      id: savedFood.id,
      name: savedFood.name,
      aisle: savedFood.aisle,
      icon: savedFood.icon,
    };
  }
}

describe("Test d'intégration minimal - Flux complet", () => {
  let app: INestApplication;
  let foodRepository: Repository<TestFood>;

  beforeAll(async () => {
    // Configuration de l'application de test
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        // Base de données SQLite en mémoire pour les tests
        TypeOrmModule.forRoot({
          type: 'sqlite' as const,
          database: ':memory:',
          entities: [TestFood],
          synchronize: true,
          logging: false,
        }),
        TypeOrmModule.forFeature([TestFood]),
      ],
      controllers: [TestFoodController],
    }).compile();

    app = moduleFixture.createNestApplication();
    foodRepository =
      moduleFixture.get<Repository<TestFood>>('TestFoodRepository');

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Nettoyer la base avant chaque test
    await foodRepository.clear();
  });

  describe('Flux complet: Requête HTTP → Contrôleur → Base → Réponse', () => {
    it("devrait créer un aliment via l'API et le vérifier en base", async () => {
      console.log("🧪 Test: Création d'un aliment via l'API");

      // ARRANGE - Préparer les données de test
      const newFoodData = {
        name: 'Pomme',
        aisle: 'Fruits',
        icon: '🍎',
      };

      // ACT 1 - Créer un aliment via l'API HTTP
      const createResponse = await request(app.getHttpServer())
        .post('/test-foods')
        .send(newFoodData)
        .expect(201);

      console.log('✅ Aliment créé via API:', createResponse.body);

      // ASSERT 1 - Vérifier la réponse de l'API
      expect(createResponse.body).toMatchObject({
        name: 'Pomme',
        aisle: 'Fruits',
        icon: '🍎',
      });
      expect(createResponse.body.id).toBeDefined();

      // ACT 2 - Vérifier directement en base de données
      const dbFood = await foodRepository.findOne({
        where: { name: 'Pomme' },
      });

      console.log('✅ Aliment récupéré directement en base:', dbFood);

      // ASSERT 2 - Vérifier que les données sont bien persistées en base
      expect(dbFood).toBeDefined();
      expect(dbFood.name).toBe('Pomme');
      expect(dbFood.aisle).toBe('Fruits');
      expect(dbFood.icon).toBe('🍎');

      // ASSERT 3 - Vérifier la cohérence entre API et base de données
      expect(createResponse.body.id).toBe(dbFood.id);
      expect(createResponse.body.name).toBe(dbFood.name);
      expect(createResponse.body.aisle).toBe(dbFood.aisle);
      expect(createResponse.body.icon).toBe(dbFood.icon);

      console.log('🎯 Test réussi: Flux complet vérifié!');
    });

    it("devrait lister les aliments via l'API", async () => {
      console.log('🧪 Test: Récupération de tous les aliments');

      // ARRANGE - Créer des aliments directement en base
      const testFoods = [
        { name: 'Pomme', aisle: 'Fruits', icon: '🍎' },
        { name: 'Banane', aisle: 'Fruits', icon: '🍌' },
      ];

      for (const foodData of testFoods) {
        const food = new TestFood();
        food.name = foodData.name;
        food.aisle = foodData.aisle;
        food.icon = foodData.icon;
        await foodRepository.save(food);
      }

      // ACT - Récupérer tous les aliments via l'API
      const response = await request(app.getHttpServer())
        .get('/test-foods')
        .expect(200);

      console.log('✅ Aliments récupérés via API:', response.body);

      // ASSERT - Vérifier la réponse
      expect(response.body).toHaveLength(2);

      // Vérifier la structure des données
      response.body.forEach((food: any) => {
        expect(food).toHaveProperty('id');
        expect(food).toHaveProperty('name');
        expect(food).toHaveProperty('aisle');
        expect(food).toHaveProperty('icon');
      });

      // Vérifier que les données correspondent à celles créées
      const expectedNames = testFoods.map((f) => f.name);
      const actualNames = response.body.map((f: any) => f.name);
      expect(actualNames).toEqual(expect.arrayContaining(expectedNames));

      console.log('🎯 Test réussi: Liste des aliments récupérée correctement!');
    });
  });
});
