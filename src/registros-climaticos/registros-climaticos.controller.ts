import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { RegistrosClimaticosService } from './registros-climaticos.service'

@ApiTags('Registros Climáticos')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('registros-climaticos')
export class RegistrosClimaticosController {
  constructor(private service: RegistrosClimaticosService) {}

  @Get()
  findAll(
    @Query('propriedadeId') propriedadeId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.findAll(propriedadeId, startDate, endDate)
  }

  @Post()
  create(@Body() body: any) {
    return this.service.create(body)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}
