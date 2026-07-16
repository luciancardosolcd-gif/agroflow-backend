import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RegistroClimatico } from './registro-climatico.entity'
import { RegistrosClimaticosService } from './registros-climaticos.service'
import { RegistrosClimaticosController } from './registros-climaticos.controller'

@Module({
  imports: [TypeOrmModule.forFeature([RegistroClimatico])],
  controllers: [RegistrosClimaticosController],
  providers: [RegistrosClimaticosService],
})
export class RegistrosClimaticosModule {}
