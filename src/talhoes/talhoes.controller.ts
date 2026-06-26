import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TalhoesService } from './talhoes.service';
import { CreateTalhaoDto } from './dto/create-talhao.dto';

@UseGuards(JwtAuthGuard)
@Controller('talhoes')
export class TalhoesController {
  constructor(private readonly service: TalhoesService) {}

  @Get()
  findAll(@Query('propriedadeId') propriedadeId?: string, @Request() req?: any) {
    return this.service.findAll(propriedadeId, req?.user?.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: CreateTalhaoDto, @Request() req: any) {
    dto.usuario_id = req?.user?.id;
    return this.service.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateTalhaoDto>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
