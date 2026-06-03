import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Financeiro } from './financeiro.entity';

@Injectable()
export class FinanceiroService {
  constructor(
    @InjectRepository(Financeiro)
    private repo: Repository<Financeiro>,
  ) {}

  // Filtra por fazenda específica
  findAll(fazendaId?: string) {
    if (fazendaId && fazendaId !== 'none') {
      return this.repo.find({
        where: { fazendaId },
        order: { data: 'DESC' },
      });
    }
    return [];
  }

  // Retorna todos (para admin sem filtro)
  findAllWithoutFilter() {
    return this.repo.find({
      order: { data: 'DESC' },
    });
  }

  findOne(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Partial<Financeiro>) {
    return this.repo.save(data);
  }

  async update(id: string, data: Partial<Financeiro>) {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new Error('Lançamento não encontrado');
    const updated = this.repo.merge(existing, data);
    return this.repo.save(updated);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
}
