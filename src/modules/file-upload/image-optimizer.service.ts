import { errorMessage } from '@/errors';
import { Injectable, Logger } from '@nestjs/common';
import * as sharp from 'sharp';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

@Injectable()
export class ImageOptimizerService {
  private readonly logger = new Logger(ImageOptimizerService.name);

  /**
   * Détecte si le fichier est HEIC basé sur le nom de fichier
   */
  private isHeicByFilename(filename: string): boolean {
    const heicExtensions = ['.heic', '.heif', '.HEIC', '.HEIF'];
    return heicExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
  }

  /**
   * Optimise une image avec Sharp (support HEIC natif)
   */
  async optimizeImage(
    buffer: Buffer,
    options: ImageOptimizationOptions = {},
    filename?: string,
  ): Promise<Buffer> {
    const {
      width = 800,
      height = 800,
      quality = 80,
      format = 'webp',
    } = options;

    this.logger.log(
      `Optimisation de l'image: ${filename || 'unknown'} (${
        buffer.length
      } bytes)`,
    );

    // Si c'est un HEIC, on le garde tel quel sans conversion
    if (filename && this.isHeicByFilename(filename)) {
      this.logger.log(
        `Fichier HEIC détecté - conservation du format original: ${filename}`,
      );
      return buffer; // Retourner le buffer original sans modification
    }

    try {
      this.logger.log(
        `Application de Sharp avec options: ${width}x${height}, qualité: ${quality}, format: ${format}`,
      );
      const sharpInstance = sharp(buffer, {
        failOnError: false,
        limitInputPixels: 268402689,
        pages: -1,
      });

      let pipeline = sharpInstance.rotate().resize({
        width,
        height,
        fit: 'inside',
        withoutEnlargement: true,
        kernel: sharp.kernel.lanczos3,
      });

      switch (format) {
        case 'webp':
          pipeline = pipeline.webp({
            quality,
            effort: 4,
            nearLossless: false,
            smartSubsample: true,
          });
          break;
        case 'jpeg':
          pipeline = pipeline.jpeg({
            quality,
            progressive: true,
            mozjpeg: true,
          });
          break;
        case 'png':
          pipeline = pipeline.png({
            quality,
            progressive: true,
            compressionLevel: 6,
          });
          break;
      }

      const result = await pipeline.toBuffer();
      this.logger.log(
        `Optimisation terminée: ${filename || 'unknown'} (${
          result.length
        } bytes -> ${buffer.length} bytes)`,
      );
      return result;
    } catch (error) {
      this.logger.error(`Erreur lors de l'optimisation: ${error.message}`);
      throw new Error(errorMessage.api('media').INVALID_FORMAT);
    }
  }

  /**
   * Génère une vignette pour les aperçus
   */
  async generateThumbnail(
    buffer: Buffer,
    size: number = 200,
    filename?: string,
  ): Promise<Buffer> {
    // Si c'est un HEIC, on le garde tel quel
    if (filename && this.isHeicByFilename(filename)) {
      return buffer; // Retourner le buffer original
    }

    try {
      return await sharp(buffer, {
        failOnError: false,
        limitInputPixels: 268402689,
      })
        .rotate()
        .resize({
          width: size,
          height: size,
          fit: 'cover',
          position: 'center',
        })
        .webp({
          quality: 70,
          effort: 2,
        })
        .toBuffer();
    } catch (error) {
      throw new Error(errorMessage.api('media').INVALID_FORMAT);
    }
  }

  /**
   * Vérifie si le buffer contient une image valide
   */
  async validateImage(buffer: Buffer, filename?: string): Promise<boolean> {
    try {
      // Si c'est un HEIC, on considère qu'il est valide
      if (filename && this.isHeicByFilename(filename)) {
        return true;
      }

      const metadata = await sharp(buffer).metadata();
      return !!metadata.width && !!metadata.height;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtient les métadonnées de l'image
   */
  async getImageMetadata(buffer: Buffer, filename?: string) {
    try {
      // Si c'est un HEIC, on ne peut pas lire les métadonnées avec Sharp
      if (filename && this.isHeicByFilename(filename)) {
        return {
          format: 'heic',
          width: null,
          height: null,
          channels: null,
          depth: null,
          density: null,
          hasProfile: false,
          hasAlpha: false,
          orientation: null,
          isOpaque: true,
        };
      }

      return await sharp(buffer).metadata();
    } catch (error) {
      throw new Error(errorMessage.api('media').INVALID_FORMAT);
    }
  }
}
