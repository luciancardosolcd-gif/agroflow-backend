import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessLog } from './access-log.entity';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AccessLog, User])],
  controllers: [LogsController],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}
