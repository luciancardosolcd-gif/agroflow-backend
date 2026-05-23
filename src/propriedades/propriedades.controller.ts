import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { PropriedadesService } from './propriedades.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

@ApiTags('Propriedades')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('propriedades')
export class PropriedadesController {
  constructor(
    private service: PropriedadesService,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

 @Get()
async findAll(@Request() req: any) {
  const userId = req.user.sub || req.user.userId;
  const user = await this.usersRepo.findOne({ where: { id: userId } });
  return this.service.findAll(user?.tenantId, user?.email);
}
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('admin', 'gestor')
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Put(':id')
  @Roles('admin', 'gestor')
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
