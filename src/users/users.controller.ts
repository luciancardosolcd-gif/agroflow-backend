import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { RolesGuard, Roles } from '../auth/roles.guard';
import * as bcrypt from 'bcryptjs';

@ApiTags('Usuarios')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('admin')
  async create(@Body() body: any) {
    const senha = body.senha || 'Agroflow@2026';
    const hash = await bcrypt.hash(senha, 10);
    const obj = {
      nome: body.nome,
      email: body.email,
      senhaHash: hash,
      perfil: body.perfil || 'operador',
      status: body.status || 'ativo',
    };
    return this.service.create(obj);
  }

  @Put(':id')
  @Roles('admin')
  async update(@Param('id') id: string, @Body() data: any) {
    if (data.senha) {
      data.senhaHash = await bcrypt.hash(data.senha, 10);
      delete data.senha;
    }
    if (data.novaSenha) {
      data.senhaHash = await bcrypt.hash(data.novaSenha, 10);
      delete data.novaSenha;
    }
    if (!data.dataExpiracao) {
      delete data.dataExpiracao;
    }
    return this.service.update(id, data);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
