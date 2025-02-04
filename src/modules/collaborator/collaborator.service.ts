import { errorMessage } from '@/errors';
import {
  CollaboratorDto,
  CollaboratorStatus,
  CreateCollaboratorApi,
  UpdateCollaboratorApi,
} from '@/types';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { Collaborator } from './Collaborator.entity';

@Injectable()
export class CollaboratorService {
  constructor(
    @InjectRepository(Collaborator)
    private collabRepository: Repository<Collaborator>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @InjectRepository(User) // Injection du repository User
    private readonly userRepository: Repository<User>,
  ) {}

  formatCollaborators(collaborator: Collaborator): CollaboratorDto {
    if (!collaborator) return null;
    return {
      id: collaborator.id,
      status: collaborator.status,
      type: collaborator.type,
      collaborator: this.userService.formatUser(collaborator.receveid),
      sender: this.userService.formatUser(collaborator.sender),
      updatedAt: collaborator.updatedAt,
      createdAt: collaborator.createdAt,
    };
  }

  async getCollaborators(user: User): Promise<Collaborator[]> {
    return this.collabRepository.find({
      where: {
        receveid: { id: user.id },
        sender: {
          id: user.id,
        },
      },
    });
  }

  async sendAsk(
    user: User,
    body: CreateCollaboratorApi,
  ): Promise<Collaborator> {
    const { userName, type } = body;
    const receiver = await this.userRepository.findOne({ where: { userName } });

    if (!receiver) {
      throw new BadRequestException({
        message: errorMessage.api('collaborator').NOT_FOUND,
      });
    }

    if (receiver.id === user.id) {
      throw new BadRequestException({
        message: errorMessage.api('collaborator').CANNOT_CHANGE_OWN_STATUS,
      });
    }

    // Vérifier si une collaboration existe déjà
    const existingCollab = await this.collabRepository.findOne({
      where: {
        receveid: { id: receiver.id },
        sender: { id: user.id },
      },
    });

    if (existingCollab) {
      throw new BadRequestException({
        message: errorMessage.api('collaborator').ALREADY_PENDING,
      });
    }

    // Créer une nouvelle demande
    const newCollab = this.collabRepository.create({
      receveid: receiver,
      sender: user,
      type,
      status: CollaboratorStatus.IS_PENDING,
    });

    await this.collabRepository.save(newCollab);
    return newCollab;
  }

  async accept(collabId: string): Promise<void> {
    const collab = await this.collabRepository.findOne({
      where: { id: collabId },
      relations: ['receveid', 'sender'],
    });

    if (!collab) {
      throw new BadRequestException({
        message: errorMessage.api('collaborator').NOT_FOUND,
      });
    }

    // Mettre à jour le statut
    collab.status = CollaboratorStatus.IS_ACCEPTED;
    collab.updatedAt = new Date();
    await this.collabRepository.save(collab);
  }

  async delete(collabId: string): Promise<void> {
    const collab = await this.collabRepository.findOne({
      where: { id: collabId },
    });

    if (!collab) {
      throw new BadRequestException({
        message: errorMessage.api('collaborator').NOT_FOUND,
      });
    }

    await this.collabRepository.delete(collab.id);
  }

  async updateType(
    _id: string,
    body: UpdateCollaboratorApi,
  ): Promise<Collaborator> {
    const { type } = body;

    const collab = await this.collabRepository.findOne({
      where: { id: _id },
    });

    if (!collab) {
      throw new BadRequestException({
        message: errorMessage.api('collaborator').NOT_FOUND,
      });
    }

    const updatedCollab = await this.collabRepository.save({
      ...collab,
      type,
      updatedAt: new Date(),
    });

    return await this.collabRepository.findOne({
      where: { id: updatedCollab.id },
      relations: ['receveid', 'sender'],
    });
  }
}
