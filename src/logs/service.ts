import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessLog } from './access-log.entity';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(AccessLog)
    private readonly repo: Repository<AccessLog>,
  ) {}

  async registrar(data: Partial<AccessLog>) {
    const log = this.repo.create(data);
    return this.repo.save(log);
  }

  findAll(tenantId?: string) {
    if (tenantId) {
      return this.repo.find({
        where: { tenantId },
        order: { createdAt: 'DESC' },
        take: 200,
      });
    }
    return this.repo.find({
      order: { createdAt: 'DESC' },
      take: 500,
    });
  }
}
