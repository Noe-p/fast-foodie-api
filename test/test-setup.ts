// Configuration globale pour les tests d'intégration
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

// Configuration de la base de données de test
export const createTestDatabaseConfig = () => ({
  type: 'sqlite' as const,
  database: ':memory:',
  synchronize: true,
  logging: false,
  dropSchema: true,
});

// Fonction utilitaire pour créer une application de test
export const createTestingApp = async (
  controllers: any[],
  providers: any[],
  entities: any[],
  overrides: any = {},
): Promise<INestApplication> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot(createTestDatabaseConfig()),
      TypeOrmModule.forFeature(entities),
    ],
    controllers,
    providers,
  })
    .overrideProvider('getRepositoryToken')
    .useValue('Repository')
    .compile();

  const app = moduleFixture.createNestApplication();

  // Appliquer les overrides
  Object.keys(overrides).forEach((key) => {
    if (overrides[key]) {
      app.use(key, overrides[key]);
    }
  });

  await app.init();
  return app;
};

// Fonction utilitaire pour nettoyer la base de données
export const clearDatabase = async (app: INestApplication, entities: any[]) => {
  for (const entity of entities) {
    const repository = app.get(`getRepositoryToken(${entity.name})`);
    if (repository && repository.clear) {
      await repository.clear();
    }
  }
};

// Configuration globale Jest
beforeAll(() => {
  // Augmenter le timeout pour les tests d'intégration
  jest.setTimeout(30000);
});

afterAll(() => {
  // Nettoyer après tous les tests
  jest.clearAllTimers();
});
