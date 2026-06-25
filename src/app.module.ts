import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FinanceiroModule } from './financeiro/financeiro.module';
import { ContratosModule } from './contratos/contratos.module';
import { EstoqueModule } from './estoque/estoque.module';
import { ClientesModule } from './clientes/clientes.module';
import { FornecedoresModule } from './fornecedores/fornecedores.module';
import { MaquinariosModule } from './maquinarios/maquinarios.module';
import { DocumentosModule } from './documentos/documentos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { PropriedadesModule } from './propriedades/propriedades.module';
import { SafrasModule } from './safras/safras.module';
import { LogsModule } from './logs/logs.module';
import { CotacoesInsumosModule } from './cotacoes-insumos/cotacoes-insumos.module';

@Module({
  imports: [ 
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const dbUrl = new URL(config.get('DATABASE_URL'));
        return {
          type: 'postgres',
          host: dbUrl.hostname,
          port: parseInt(dbUrl.port),
          username: decodeURIComponent(dbUrl.username),
          password: decodeURIComponent(dbUrl.password),
          database: dbUrl.pathname.replace('/', ''),
          ssl: { rejectUnauthorized: false },
          synchronize: true,
          logging: false,
          schema: 'public',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          retryAttempts: 30,
          retryDelay: 5000,
        };
      },
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    AuthModule,
    UsersModule,
    FinanceiroModule,
    ContratosModule,
    EstoqueModule,
    ClientesModule,
    FornecedoresModule,
    MaquinariosModule,
    DocumentosModule,
    CategoriasModule,
    PropriedadesModule,
    SafrasModule,
    LogsModule,
    CotacoesInsumosModule,
  ],
})
export class AppModule {}
