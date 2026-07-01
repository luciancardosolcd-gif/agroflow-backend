import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Talhao } from './talhao.entity';

@Injectable()
export class TalhoesService {
  constructor(@InjectRepository(Talhao) private repo: Repository<Talhao>) {}

  findAll(propriedadeId?: string) {
    if (propriedadeId) {
      return this.repo.find({ where: { propriedade_id: propriedadeId } });
    }
    return this.repo.find();
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Partial<Talhao>) {
    return this.repo.save(data);
  }

  async update(id: string, data: Partial<Talhao>) {
    await this.repo.update(id, data);
    return this.repo.findOne({ where: { id } });
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
}
