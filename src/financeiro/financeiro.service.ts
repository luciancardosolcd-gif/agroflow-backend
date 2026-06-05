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

  // Filtra por fazenda específica usando query builder (evita problema de case-sensitivity do TypeORM) 
  findAll(fazendaId?: string) {
    if (fazendaId && fazendaId !== 'none') {
      return this.repo
        .createQueryBuilder('f')
        .where('f."fazendaId" = :fazendaId', { fazendaId })
        .orderBy('f.data', 'DESC')
        .getMany();
    }
    return [];
  }

  // Retorna todos (para admin sem filtro)
  findAllWithoutFilter() {
    return this.repo
      .createQueryBuilder('f')
      .orderBy('f.data', 'DESC')
      .getMany();
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
