import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Talhao } from './talhao.entity';
import { CreateTalhaoDto } from './dto/create-talhao.dto';

@Injectable()
export class TalhoesService {
  constructor(@InjectRepository(Talhao) private readonly repo: Repository<Talhao>) {}

  findAll(propriedadeId?: string, usuarioId?: string): Promise<Talhao[]> {
    const where: any = {};
    if (propriedadeId) where.propriedade_id = propriedadeId;
    if (usuarioId) where.usuario_id = usuarioId;
    return this.repo.find({ where, order: { created_at: 'DESC' } });
  }

  findOne(id: string): Promise<Talhao> {
    return this.repo.findOne({ where: { id } });
  }

  create(dto: CreateTalhaoDto): Promise<Talhao> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: Partial<CreateTalhaoDto>): Promise<Talhao> {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
