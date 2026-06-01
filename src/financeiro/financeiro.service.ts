import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Financeiro } from './financeiro.entity';

const ACESSO_TOTAL = ['luciancardoso@agroflow.com', 'admin01@agroflow.com'];

@Injectable()
export class FinanceiroService {
  constructor(
    @InjectRepository(Financeiro)
    private repo: Repository<Financeiro>,
  ) {}

  findAll(fazendaId?: string, userEmail?: string) {
    // Super admin COM fazendaId → filtra pela fazenda enviada
    if (userEmail && ACESSO_TOTAL.includes(userEmail) && fazendaId) {
      return this.repo.find({
        where: { fazendaId },
        order: { data: 'DESC' },
      });
    }

    // Super admin SEM fazendaId → retorna vazio (segurança)
    // O controller já faz return [] antes de chegar aqui,
    // mas mantemos aqui como segunda barreira
    if (userEmail && ACESSO_TOTAL.includes(userEmail) && !fazendaId) {
      return [];
    }

    // Usuário comum COM fazendaId → filtra pela fazenda do tenant
    if (fazendaId) {
      return this.repo.find({
        where: { fazendaId },
        order: { data: 'DESC' },
      });
    }

    // Sem fazendaId e sem email reconhecido → retorna vazio por segurança
    return [];
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
