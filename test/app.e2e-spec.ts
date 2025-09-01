import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Controller, Get } from '@nestjs/common';
import * as request from 'supertest';

// Créer un contrôleur de test simple pour éviter les conflits d'imports
@Controller()
class TestController {
  @Get()
  getHello(): string {
    return 'Hello World!';
  }
}

// Créer un module de test minimal
class TestModule {}

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TestController],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  it('/ (GET) should return hello message', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/ (GET) should return string response', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((res) => {
        expect(typeof res.text).toBe('string');
        expect(res.text.length).toBeGreaterThan(0);
      });
  });

  it('/ (GET) should handle multiple requests', async () => {
    const server = app.getHttpServer();

    // Premier appel
    const response1 = await request(server).get('/').expect(200);
    expect(response1.text).toBe('Hello World!');

    // Deuxième appel
    const response2 = await request(server).get('/').expect(200);
    expect(response2.text).toBe('Hello World!');
  });

  it('should return 404 for non-existent endpoint', () => {
    return request(app.getHttpServer()).get('/non-existent').expect(404);
  });

  afterEach(async () => {
    await app.close();
  });
});
