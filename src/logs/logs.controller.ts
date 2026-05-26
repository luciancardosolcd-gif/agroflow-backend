import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { LogsService } from './logs.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

const ACESSO_TOTAL = ['luciancardoso@agroflow.com', 'admin01@agroflow.com'];

@ApiTags('Logs')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('logs')
export class LogsController {
  constructor(
    private service: LogsService,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  @Get()
  async findAll(@Request() req: any) {
    const userId = req.user.sub || req.user.userId;
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user || ACESSO_TOTAL.includes(user.email)) {
      return this.service.findAll();
    }
    return this.service.findAll(user.tenantId);
  }
}
