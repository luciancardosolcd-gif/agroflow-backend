import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { LogsService } from '../logs/logs.service';

const SECRET = process.env.JWT_SECRET || '1b188fff14990a2190da34907dc8d3d1e555debe7995260fb47cfcca73d63d16';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private jwtService: JwtService,
    private logsService: LogsService,
  ) {}

  async login(email: string, senha: string, ip?: string) {
    const user = await this.usersRepo.findOne({ where: { email: email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(senha, user.senhaHash))) {
      await this.logsService.registrar({
        userEmail: email,
        acao: 'LOGIN_FALHOU',
        modulo: 'Auth',
        detalhes: 'Email ou senha incorretos',
        ip,
      }).catch(() => {});
      throw new UnauthorizedException('E-mail ou senha incorretos');
    }
    if (user.status !== 'ativo')
      throw new UnauthorizedException('Usuário inativo');

    await this.logsService.registrar({
      userId: user.id,
      userEmail: user.email,
      userName: user.nome,
      tenantId: user.tenantId,
      acao: 'LOGIN',
      modulo: 'Auth',
      detalhes: 'Login realizado com sucesso',
      ip,
    }).catch(() => {});

    const payload = { sub: user.id, email: user.email, perfil: user.perfil };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '8h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d', secret: SECRET });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil,
        permissoes: user.permissoes || null,
      },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: SECRET });
      const user = await this.usersRepo.findOne({ where: { id: payload.sub } });
      if (!user || user.status !== 'ativo')
        throw new UnauthorizedException('Token inválido');
      const newPayload = { sub: user.id, email: user.email, perfil: user.perfil };
      const accessToken = this.jwtService.sign(newPayload, { expiresIn: '8h' });
      return { accessToken };
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  async validateUser(userId: string) {
    return this.usersRepo.findOne({ where: { id: userId } });
  }
}
