import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  getHealth() {
    return { status: 'ok' };
  }

  @Get('db')
  async getDbHealth() {
    try {
      // Effectue une requête minimale pour valider la connexion DB
      await this.dataSource.query('SELECT 1');
      return { status: 'ok', db: 'up' };
    } catch (error) {
      return { status: 'error', db: 'down', message: (error as Error).message };
    }
  }
}
