import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CollaboratorModule } from './modules/collaborator/collaborator.module';
import { DishModule } from './modules/dish/dish.module';
import { FileUploadModule } from './modules/file-upload/file-upload.module';
import { FoodModule } from './modules/food/food.module';
import { IngredientModule } from './modules/ingredient/ingredient.module';
import { MediaModule } from './modules/media/media.module';
import { UserModule } from './modules/user/user.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.TYPEORM_HOST,
      port: Number(process.env.TYPEORM_PORT),
      username: process.env.TYPEORM_USERNAME,
      password: process.env.TYPEORM_PASSWORD,
      database: process.env.TYPEORM_DATABASE,
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
    }),
    MulterModule.register({
      dest: './public/files',
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB
        files: 1,
        fieldSize: 50 * 1024 * 1024, // 50MB
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '../public'),
    }),

    UserModule,
    AuthModule,
    FileUploadModule,
    MediaModule,
    FoodModule,
    IngredientModule,
    DishModule,
    CollaboratorModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
