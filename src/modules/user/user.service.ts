import { errorMessage } from '@/errors';
import { RegisterApi, SearchParams, UpdateUserApi, UserDto } from '@/types';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, In, Raw, Repository } from 'typeorm';
import { MediaService } from '../media/media.service';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private mediaService: MediaService,
  ) {}

  formatUser(user: User): UserDto {
    if (!user) return;
    return {
      id: user.id,
      userName: user.userName ?? undefined,
      profilePicture: this.mediaService.formatMedia(user?.profilePicture),
      collaborators: user.collaborators ?? [],
      updatedAt: user.updatedAt,
      createdAt: user.createdAt,
    };
  }

  async getUsers(searchParams: SearchParams): Promise<User[]> {
    try {
      const order = {
        [searchParams.orderBy ?? 'createdAt']: searchParams.orderType ?? 'DESC',
      };
      const conditions: FindManyOptions<User> = {
        where: {
          userName: Raw(
            (alias) =>
              `LOWER(${alias}) Like '%${searchParams.search?.toLowerCase()}%'`,
          ),
        },
        order: {
          ...order,
        },
        skip: searchParams.page * searchParams.pageSize,
        take: searchParams.pageSize,
        relations: ['collaborators'],
      };
      return await this.userRepository.find(conditions);
    } catch (e) {
      throw new BadRequestException({
        ...e,
        title: errorMessage.api('user').NOT_FOUND,
      });
    }
  }

  async getOneById(_id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: _id },
        relations: ['collaborators'],
      });
      return { ...user };
    } catch (error) {
      throw new NotFoundException({
        ...error,
        title: errorMessage.api('user').NOT_FOUND,
        _id,
      });
    }
  }

  async getCollaborators(user: User): Promise<User[]> {
    try {
      if (!user)
        throw new BadRequestException({
          title: errorMessage.api('user').NOT_FOUND,
        });

      // Récupérer les collaborateurs de l'utilisateur
      const collaborators = await this.userRepository.find({
        where: { id: In(user.collaborators.map((c) => c.id)) },
      });

      return collaborators;
    } catch (error) {
      throw new BadRequestException({
        ...error,
        title: errorMessage.api('collaborator').NOT_FOUND,
      });
    }
  }

  async getOneByUsername(userName: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: [{ userName }],
      relations: ['collaborators'],
    });
    return user;
  }

  async createUser(body: RegisterApi): Promise<User> {
    try {
      return await this.userRepository.save({
        ...body,
      });
    } catch (error) {
      throw new BadRequestException({
        ...error,
        title: errorMessage.api('user').NOT_CREATED,
      });
    }
  }

  async updateUser(body: UpdateUserApi, id: string): Promise<User> {
    try {
      const user = await this.getOneById(id);
      if (!user) {
        throw new BadRequestException({
          message: errorMessage.api('user').NOT_FOUND,
        });
      }

      // Initialiser le tableau de collaborateurs s'il n'existe pas
      if (!user.collaborators) {
        user.collaborators = [];
      }

      // Si un collaborateur est spécifié dans le body, le traiter
      if (body.collaboratorName) {
        // Récupérer le collaborateur par nom
        const collaborator = await this.userRepository.findOne({
          where: { userName: body.collaboratorName },
        });

        if (!collaborator) {
          throw new BadRequestException({
            message: errorMessage.api('collaborator').NOT_FOUND,
          });
        }

        if (collaborator.id === user.id) {
          throw new BadRequestException({
            message: errorMessage.api('collaborator').CANNOT_CHANGE_OWN_STATUS,
          });
        }

        // Ajouter le collaborateur à la liste si ce n'est pas déjà fait
        if (!user.collaborators.some((c) => c.id === collaborator.id)) {
          user.collaborators.push({ id: collaborator.id } as any); // Limiter les informations ajoutées
        } else {
          throw new BadRequestException({
            message: errorMessage.api('collaborator').EXIST,
          });
        }

        // Mettre à jour la liste des collaborateurs du collaborateur également pour éviter la structure circulaire
        if (!collaborator.collaborators) {
          collaborator.collaborators = [];
        }
        if (!collaborator.collaborators.some((c) => c.id === user.id)) {
          collaborator.collaborators.push({ id: user.id } as any); // Limiter les informations ajoutées
          await this.userRepository.save(collaborator);
        }
      }

      const profilePictureMedia =
        body.profilePicture &&
        (await this.mediaService.getMediaById(body.profilePicture));

      user.userName = body.userName ?? user.userName;
      user.updatedAt = new Date();
      const userUpdated = await this.userRepository.save({
        ...user,
        profilePicture: profilePictureMedia ?? null,
      });

      if (profilePictureMedia && user.profilePicture) {
        await this.mediaService.deleteMedia(user.profilePicture.id);
      }

      // Retirer les informations circulaires avant de renvoyer la réponse
      return {
        ...userUpdated,
      };
    } catch (error) {
      throw new BadRequestException({
        ...error,
        title: errorMessage.api('user').NOT_UPDATED,
      });
    }
  }

  async removeCollaborator(
    userId: string,
    collaboratorId: string,
  ): Promise<User> {
    try {
      const user = await this.getOneById(userId);
      if (!user)
        throw new BadRequestException({
          message: errorMessage.api('user').NOT_FOUND,
        });

      const collaborator = await this.getOneById(collaboratorId);
      if (!collaborator) {
        throw new BadRequestException({
          message: { message: errorMessage.api('collaborator').NOT_FOUND },
        });
      }

      // Supprimer le collaborateur de la liste des collaborateurs de l'utilisateur
      user.collaborators = user.collaborators.filter(
        (c) => c.id !== collaboratorId,
      );
      const userUpdated = await this.userRepository.save(user);

      // Optionnel : Supprimer l'utilisateur de la liste des collaborateurs du collaborateur
      collaborator.collaborators = collaborator.collaborators.filter(
        (c) => c.id !== userId,
      );
      await this.userRepository.save(collaborator);

      return userUpdated;
    } catch (error) {
      throw new BadRequestException({
        ...error,
        title: errorMessage.api('collaborator').NOT_DELETED,
      });
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.userRepository.delete(id);
    } catch (error) {
      console.log(error);
      throw new BadRequestException({
        ...error,
        title: errorMessage.api('user').NOT_DELETED,
        id,
      });
    }
  }
}
