import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';

const SECRET = '1b188fff14990a2190da34907dc8d3d1e555debe7995260fb47cfcca73d63d16';

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
