import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

const ACESSO_TOTAL = ['luciancardoso@agroflow.com', 'admin01@agroflow.com'];

export const PERMISSION_KEY = 'permission';

import { SetMetadata } from '@nestjs/common';
export const RequirePermission = (modulo: string, acao: string) =>
  SetMetadata(PERMISSION_KEY, { modulo, acao });

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.get<{ modulo: string; acao: string }>(
      PERMISSION_KEY,
      context.getHandler(),
    );

    // Se não tem decorator de permissão, deixa passar
    if (!permission) return true;

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub || request.user?.userId;
    if (!userId) throw new ForbiddenException('Não autorizado');

    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new ForbiddenException('Usuário não encontrado');

    // Super admins têm acesso total
    if (ACESSO_TOTAL.includes(user.email)) return true;

    // Admins principais de propriedade têm acesso total
    if (user.perfil === 'admin' && !user.permissoes) return true;

    // Verifica permissão específica
    const permissoes = user.permissoes || {};
    const temPermissao = permissoes[permission.modulo]?.[permission.acao];

    if (!temPermissao) {
      throw new ForbiddenException(`Sem permissão para ${permission.acao} em ${permission.modulo}`);
    }

    return true;
  }
}
