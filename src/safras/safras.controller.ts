import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { SafrasService } from './safras.service';

@ApiTags('Safras')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('safras')
export class SafrasController {
  constructor(private service: SafrasService) {}

  @Get()
  findAll(@Query('propriedadeId') propriedadeId?: string) {
    return this.service.findAll(propriedadeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('admin', 'gestor')
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Put(':id')
  @Roles('admin', 'gestor')
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
