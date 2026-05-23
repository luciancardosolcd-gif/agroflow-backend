import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Partial<User>) {
    return this.repo.save(data);
  }

  async update(id: string, data: Partial<User>) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new Error('Usuário não encontrado');
    const merged = this.repo.merge(user, data);
    return this.repo.save(merged);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
}
