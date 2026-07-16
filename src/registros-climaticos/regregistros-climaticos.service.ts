import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Between } from 'typeorm'
import { RegistroClimatico } from './registro-climatico.entity'

@Injectable()
export class RegistrosClimaticosService {
  constructor(
    @InjectRepository(RegistroClimatico)
    private repo: Repository<RegistroClimatico>,
  ) {}

  findAll(propriedadeId?: string, startDate?: string, endDate?: string) {
    const where: any = {}
    if (propriedadeId) where.propriedade_id = propriedadeId
    if (startDate && endDate) where.data = Between(startDate, endDate)
    return this.repo.find({ where, order: { data: 'ASC' } })
  }

  create(data: Partial<RegistroClimatico>) {
    return this.repo.save(this.repo.create(data))
  }

  remove(id: string) {
    return this.repo.delete(id)
  }
}
