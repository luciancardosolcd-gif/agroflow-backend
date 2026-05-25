import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Propriedade } from './propriedade.entity';

const ACESSO_TOTAL = ['luciancardoso@agroflow.com', 'admin01@agroflow.com'];

@Injectable()
export class PropriedadesService {
  constructor(
    @InjectRepository(Propriedade)
    private readonly repo: Repository<Propriedade>,
  ) {}

  findAll(tenantId?: string, userEmail?: string) {
    if (userEmail && ACESSO_TOTAL.includes(userEmail)) {
      return this.repo.find({ order: { nome: 'ASC' } });
    }
    if (tenantId) {
      return this.repo.find({
        where: { tenantId },
        order: { nome: 'ASC' },
      });
    }
    return this.repo.find({ order: { nome: 'ASC' } });
  }

  async findOne(id: string) {
    const prop = await this.repo.findOne({ where: { id } });
    if (!prop) throw new NotFoundException('Propriedade não encontrada');
    return prop;
  }

  create(data: Partial<Propriedade>) {
    const prop = this.repo.create(data);
    return this.repo.save(prop);
  }

  async update(id: string, data: Partial<Propriedade>) {
    const prop = await this.findOne(id);
    const updated = this.repo.merge(prop, data);
    return this.repo.save(updated);
  }

  async remove(id: string) {
    const prop = await this.findOne(id);
    return this.repo.remove(prop);
  }
}
