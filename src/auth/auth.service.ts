import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';

const JWT_SECRET = '1b188fff14990a2190da34907dc8d3d1e555debe7995260fb47cfcca73d63d16';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(email: string, senha: string) {
    const user = await this.usersRepo.findOne({ where: { email: email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(senha, user.senhaHash)))
      throw new UnauthorizedException('E-mail ou senha incorretos');
    if (user.status !== 'ativo')
      throw new UnauthorizedException('Usuário inativo');
    await this.usersRepo.update(user.id, { ultimoAcesso: new Date() });
    const payload = { sub: user.id, email: user.email, perfil: user.perfil };
    return {
      accessToken: this.jwtService.sign(payload, { secret: JWT_SECRET, expiresIn: '8h' }),
      refreshToken: this.jwtService.sign(payload, { secret: JWT_SECRET, expiresIn: '7d' }),
      user: { id: user.id, nome: user.nome, email: user.email, perfil: user.perfil },
    };
  }

  async refresh(token: string) {
    try {
      const payload = this.jwtService.verify(token, { secret: JWT_SECRET });
      return {
        accessToken: this.jwtService.sign(
          { sub: payload.sub, email: payload.email, perfil: payload.perfil },
          { secret: JWT_SECRET, expiresIn: '8h' },
        ),
      };
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
