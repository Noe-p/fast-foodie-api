/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-empty-function */
import { ApiKeyGuard } from '@/decorators/api-key.decorator';
import { errorMessage } from '@/errors';
import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Logger,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';
import * as fs from 'fs/promises';
import { memoryStorage } from 'multer';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { MediaService } from '../media/media.service';
import { ImageOptimizerService } from './image-optimizer.service';

export function replaceAll(str: string, find: string, replace: string) {
  return str.replace(new RegExp(find, 'g'), replace);
}

@Controller('upload')
export class FileUploadController {
  private readonly logger = new Logger(FileUploadController.name);

  constructor(
    @Inject(MediaService)
    private mediaService: MediaService,
    @Inject(ImageOptimizerService)
    private imageOptimizer: ImageOptimizerService,
  ) {}

  @Post('/')
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 50 * 1024 * 1024,
        files: 1,
        fieldSize: 50 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
        if (!file) {
          return callback(
            new BadRequestException({
              message: errorMessage.api('media').INVALID_FORMAT,
            }),
            false,
          );
        }

        const allowedExtensions =
          /\.(jpg|jpeg|png|pdf|webp|heic|heif|gif|bmp|tiff|tif|svg)$/i;
        const extension = allowedExtensions.exec(file.originalname || '');
        if (!extension) {
          return callback(
            new BadRequestException({
              message: errorMessage.api('media').INVALID_FORMAT,
            }),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  @HttpCode(201)
  async upload(@UploadedFile() file: Express.Multer.File) {
    this.logger.log(`Début du traitement de l'upload: ${file.originalname}`);

    const isImage =
      file.mimetype.startsWith('image') ||
      file.originalname.toLowerCase().match(/\.(heic|heif)$/);

    if (!isImage) {
      this.logger.error(
        `Fichier non reconnu comme image: ${file.originalname}`,
      );
      throw new BadRequestException({
        message: errorMessage.api('media').INVALID_FORMAT,
      });
    }

    try {
      this.logger.log(`Optimisation de l'image: ${file.originalname}`);
      const compressedImageBuffer = await this.imageOptimizer.optimizeImage(
        file.buffer,
        {
          width: 800,
          height: 800,
          quality: 80,
          format: 'webp',
        },
        file.originalname,
      );

      const fileNameWithoutExtension = uuid();
      const isHeic =
        file.originalname.toLowerCase().includes('.heic') ||
        file.originalname.toLowerCase().includes('.heif');
      const fileExtension = isHeic ? '.heic' : '.webp';
      const finalFileName = `${fileNameWithoutExtension}${fileExtension}`;
      const filesDir = './public/files';
      const finalFilePath = path.join(filesDir, finalFileName);

      this.logger.log(`Sauvegarde du fichier: ${finalFileName}`);

      // Créer le dossier s'il n'existe pas
      try {
        await fs.mkdir(filesDir, { recursive: true });
        this.logger.log(`Dossier créé/vérifié: ${filesDir}`);
      } catch (error) {
        this.logger.error(`Erreur création dossier: ${error.message}`);
        throw new BadRequestException({
          message: errorMessage.api('media').NOT_CREATED,
        });
      }

      await fs.writeFile(finalFilePath, compressedImageBuffer);
      this.logger.log(`Fichier sauvegardé: ${finalFilePath}`);

      const media = await this.mediaService.createMedia({
        ...file,
        buffer: compressedImageBuffer,
        filename: finalFileName,
        path: finalFilePath,
        size: compressedImageBuffer.length,
      });

      this.logger.log(
        `Upload terminé avec succès: ${finalFileName} (ID: ${media.id})`,
      );
      return media;
    } catch (error) {
      this.logger.error(`Erreur lors de l'upload: ${error.message}`);
      throw new BadRequestException({
        message: errorMessage.api('media').INVALID_FORMAT,
      });
    }
  }

  @Get('populate')
  @HttpCode(200)
  async test() {
    return await this.mediaService.populateMedias();
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(ApiKeyGuard)
  @ApiBearerAuth()
  delete(@Param('id') id: string) {
    return this.mediaService.deleteMedia(id);
  }
}
