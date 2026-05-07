import { Controller, Post, Body, HttpCode } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/user.entity";
import * as bcrypt from "bcryptjs";

export class LoginDto {
  email: string;
  senha: string;
}

@ApiTags("Autenticação")
@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    @InjectRepository(User) private usersRepo: Repository<User>
  ) {}

  @Post("login")
  @HttpCode(200)
  @ApiOperation({ summary: "Login" })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.senha);
  }

  @Post("refresh")
  @HttpCode(200)
  async refresh(@Body("refreshToken") token: string) {
    return this.authService.refresh(token);
  }

  @Post("register")
  @HttpCode(201)
  async register(@Body() dto: any) {
    const hash = await bcrypt.hash(dto.senha, 10);
    const user = this.usersRepo.create({
      nome: dto.nome,
      email: dto.email.toLowerCase(),
      senhaHash: hash,
      perfil: dto.perfil || "operador",
      status: "ativo",
    });
    return this.usersRepo.save(user);
  }
}
