import { CollaboratorDto } from '@/types';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { Collaborator } from './Collaborator.entity';

@Injectable()
export class CollaboratorService {
  constructor(
    @InjectRepository(Collaborator)
    private userRepository: Repository<Collaborator>,
    private userService: UserService,
  ) {}

  formatUser(collaborator: Collaborator): CollaboratorDto {
    if (!collaborator) return;
    return {
      id: collaborator.id,

      updatedAt: collaborator.updatedAt,
      createdAt: collaborator.createdAt,
    };
  }
}
