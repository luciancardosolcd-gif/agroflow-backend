import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(email: string, senha: string) {
    const user = await this.usersRepo.findOne({ where: { email: email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(senha, user.senhaHash)))
      throw new UnauthorizedException('E-mail ou senha incorretos');
    if (user.status !== 'ativo')
      throw new UnauthorizedException('Usuário inativo');
    await this.usersRepo.update(user.id, { ultimoAcesso: new Date() });
    const secret = this.configService.get<string>('JWT_SECRET');
    const payload = { sub: user.id, email: user.
