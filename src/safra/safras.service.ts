import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Safra } from './safra.entity';

@Injectable()
export class SafrasService {
  constructor(
    @InjectRepository(Safra)
    private readonly repo: Repository<Safra>,
  ) {}

  findAll(propriedadeId?: string) {
    const where: any = {};
    if (propriedadeId) where.propriedadeId = propriedadeId;
    return this.repo.find({
      where,
      relations: ['propriedade'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const safra = await this.repo.findOne({
      where: { id },
      relations: ['propriedade'],
    });
    if (!safra) throw new NotFoundException('Safra não encontrada');
    return safra;
  }

  create(data: Partial<Safra>) {
    const safra = this.repo.create(data);
    return this.repo.save(safra);
  }

  async update(id: string, data: Partial<Safra>) {
    const safra = await this.findOne(id);
    const updated = this.repo.merge(safra, data);
    return this.repo.save(updated);
  }

  async remove(id: string) {
    const safra = await this.findOne(id);
    return this.repo.remove(safra);
  }
}
