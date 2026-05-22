import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { PropriedadesService } from './propriedades.service';

@ApiTags('Propriedades')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), Roles
