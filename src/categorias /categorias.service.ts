import { Injectable, OnModuleInit, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, IsNull } from 'typeorm';
import { FinancialCategory } from './financial-category.entity';
import { CriarCategoriaDto, AtualizarCategoriaDto } from './dto/categorias.dto';

@Injectable()
export class CategoriasService implements OnModuleInit {
  constructor(
    @InjectRepository(FinancialCategory)
    private readonly repo: Repository<FinancialCategory>,
  ) {}

  // ─── Seeds automáticos na inicialização ──────────────────────────────────────
  async onModuleInit() {
    const count = await this.repo.count();
    if (count === 0) {
      await this.seedCategorias();
    }
  }

  private async seedCategorias() {
    const seeds = [
      // ── RECEITAS (nível 1) ────────────────────────────────────────────────
      { code: '3', name: 'Receitas', type: 'sintetica', nature: 'receita', level: 1, allowEntries: false, color: '#22c55e', sortOrder: 1 },
      { code: '3.1', name: 'Receita Bruta de Vendas', type: 'sintetica', nature: 'receita', level: 2, allowEntries: false, color: '#16a34a', sortOrder: 1 },
      { code: '3.1.1', name: 'Venda Agrícola', type: 'analitica', nature: 'receita', level: 3, allowEntries: true, color: '#15803d', sortOrder: 1 },
      { code: '3.1.2', name: 'Venda Pecuária', type: 'analitica', nature: 'receita', level: 3, allowEntries: true, color: '#15803d', sortOrder: 2 },
      { code: '3.1.3', name: 'Venda de Outros Produtos', type: 'analitica', nature: 'receita', level: 3, allowEntries: true, color: '#15803d', sortOrder: 3 },
      { code: '3.2', name: 'Deduções da Receita Bruta', type: 'sintetica', nature: 'receita', level: 2, allowEntries: false, color: '#16a34a', sortOrder: 2 },
      { code: '3.2.1', name: 'Dedução da Receita de Venda', type: 'analitica', nature: 'receita', level: 3, allowEntries: true, sortOrder: 1 },
      { code: '3.2.2', name: 'Devolução/Cancelamento de Venda', type: 'analitica', nature: 'receita', level: 3, allowEntries: true, sortOrder: 2 },
      { code: '3.3', name: 'Outras Receitas', type: 'sintetica', nature: 'receita', level: 2, allowEntries: false, color: '#16a34a', sortOrder: 3 },
      { code: '3.3.1', name: 'Receita Financeira', type: 'analitica', nature: 'receita', level: 3, allowEntries: true, sortOrder: 1 },
      { code: '3.3.2', name: 'Subvenções e Incentivos', type: 'analitica', nature: 'receita', level: 3, allowEntries: true, sortOrder: 2 },

      // ── DESPESAS (nível 1) ────────────────────────────────────────────────
      { code: '4', name: 'Despesas', type: 'sintetica', nature: 'despesa', level: 1, allowEntries: false, color: '#ef4444', sortOrder: 2 },

      // 4.1 Custos Relacionados à Produção
      { code: '4.1', name: 'Custos Relacionados à Produção', type: 'sintetica', nature: 'despesa', level: 2, allowEntries: false, color: '#dc2626', sortOrder: 1 },
      { code: '4.1.1', name: 'Insumos Agrícolas', type: 'sintetica', nature: 'despesa', level: 3, allowEntries: false, sortOrder: 1 },
      { code: '4.1.1.1', name: 'Sementes e Mudas', type: 'analitica', nature: 'despesa', level: 4, allowEntries: true, sortOrder: 1 },
      { code: '4.1.1.2', name: 'Fertilizantes', type: 'analitica', nature: 'despesa', level: 4, allowEntries: true, sortOrder: 2 },
      { code: '4.1.1.3', name: 'Defensivos', type: 'sintetica', nature: 'despesa', level: 4, allowEntries: false, sortOrder: 3 },
      { code: '4.1.1.3.1', name: 'Acaricida', type: 'analitica', nature: 'despesa', level: 5, allowEntries: true, sortOrder: 1 },
      { code: '4.1.1.3.2', name: 'Adjuvante', type: 'analitica', nature: 'despesa', level: 5, allowEntries: true, sortOrder: 2 },
      { code: '4.1.1.3.3', name: 'Fungicida', type: 'analitica', nature: 'despesa', level: 5, allowEntries: true, sortOrder: 3 },
      { code: '4.1.1.3.4', name: 'Herbicida', type: 'analitica', nature: 'despesa', level: 5, allowEntries: true, sortOrder: 4 },
      { code: '4.1.1.3.5', name: 'Inseticida', type: 'analitica', nature: 'despesa', level: 5, allowEntries: true, sortOrder: 5 },
      { code: '4.1.1.4', name: 'Inoculante', type: 'analitica', nature: 'despesa', level: 4, allowEntries: true, sortOrder: 4 },
      { code: '4.1.2', name: 'Mão de Obra', type: 'sintetica', nature: 'despesa', level: 3, allowEntries: false, sortOrder: 2 },
      { code: '4.1.2.1', name: 'Mão de Obra Própria', type: 'analitica', nature: 'despesa', level: 4, allowEntries: true, sortOrder: 1 },
      { code: '4.1.2.2', name: 'Mão de Obra Terceirizada', type: 'analitica', nature: 'despesa', level: 4, allowEntries: true, sortOrder: 2 },
      { code: '4.1.3', name: 'Operações Agrícolas', type: 'sintetica', nature: 'despesa', level: 3, allowEntries: false, sortOrder: 3 },
      { code: '4.1.3.1', name: 'Preparo de Solo', type: 'analitica', nature: 'despesa', level: 4, allowEntries: true, sortOrder: 1 },
      { code: '4.1.3.2', name: 'Plantio', type: 'analitica', nature: 'despesa', level: 4, allowEntries: true, sortOrder: 2 },
      { code: '4.1.3.3', name: 'Colheita', type: 'analitica', nature: 'despesa', level: 4, allowEntries: true, sortOrder: 3 },
      { code: '4.1.4', name: 'Combustível e Lubrificantes', type: 'sintetica', nature: 'despesa', level: 3, allowEntries: false, sortOrder: 4 },
      { code: '4.1.4.1', name: 'Combustível', type: 'analitica', nature: 'despesa', level: 4, allowEntries: true, sortOrder: 1 },
      { code: '4.1.4.2', name: 'Lubrificantes', type: 'analitica', nature: 'despesa', level: 4, allowEntries: true, sortOrder: 2 },
      { code: '4.1.5', name: 'Arrendamento', type: 'analitica', nature: 'despesa', level: 3, allowEntries: true, sortOrder: 5 },

      // 4.2 Despesas Gerais
      { code: '4.2', name: 'Despesas Gerais', type: 'sintetica', nature: 'despesa', level: 2, allowEntries: false, color: '#f97316', sortOrder: 2 },
      { code: '4.2.1', name: 'Energia Elétrica', type: 'analitica', nature: 'despesa', level: 3, allowEntries: true, sortOrder: 1 },
      { code: '4.2.2', name: 'Telefone e Internet', type: 'analitica', nature: 'despesa', level: 3, allowEntries: true, sortOrder: 2 },
      { code: '4.2.3', name: 'Manutenção de Máquinas', type: 'analitica', nature: 'despesa', level: 3, allowEntries: true, sortOrder: 3 },
      { code: '4.2.4', name: 'Seguro Agrícola', type: 'analitica', nature: 'despesa', level: 3, allowEntries: true, sortOrder: 4 },
      { code: '4.2.5', name: 'Frete e Transporte', type: 'analitica', nature: 'despesa', level: 3, allowEntries: true, sortOrder: 5 },
      { code: '4.2.6', name: 'Despesas Administrativas', type: 'analitica', nature: 'despesa', level: 3, allowEntries: true, sortOrder: 6 },

      // 4.3 Despesas Não Operacionais
      { code: '4.3', name: 'Despesas Não Operacionais', type: 'sintetica', nature: 'despesa', level: 2, allowEntries: false, color: '#3b82f6', sortOrder: 3 },
      { code: '4.3.1', name: 'Juros e Encargos Financeiros', type: 'analitica', nature: 'despesa', level: 3, allowEntries: true, sortOrder: 1 },
      { code: '4.3.2', name: 'Impostos e Taxas', type: 'analitica', nature: 'despesa', level: 3, allowEntries: true, sortOrder: 2 },
      { code: '4.3.3', name: 'Depreciação', type: 'analitica', nature: 'despesa', level: 3, allowEntries: true, sortOrder: 3 },

      // 4.4 Investimentos
      { code: '4.4', name: 'Investimentos', type: 'sintetica', nature: 'despesa', level: 2, allowEntries: false, color: '#a855f7', sortOrder: 4 },
      { code: '4.4.1', name: 'Aquisição de Máquinas', type: 'analitica', nature: 'despesa', level: 3, allowEntries: true, sortOrder: 1 },
      { code: '4.4.2', name: 'Benfeitorias', type: 'analitica', nature: 'despesa', level: 3, allowEntries: true, sortOrder: 2 },
      { code: '4.4.3', name: 'Irrigação', type: 'analitica', nature: 'despesa', level: 3, allowEntries: true, sortOrder: 3 },
    ];

    // Salva primeiro passagem (sem parentId)
    const saved: Record<string, FinancialCategory> = {};
    for (const seed of seeds) {
      const entity = this.repo.create({ ...seed } as any);
      saved[seed.code] = await this.repo.save(entity);
    }

    // Segunda passagem: preenche parentId e mainCategoryId
    for (const seed of seeds) {
      const parts = seed.code.split('.');
      const parentCode = parts.slice(0, -1).join('.');
      const mainCode = parts[0];

      const entity = saved[seed.code];
      if (parentCode && saved[parentCode]) entity.parentId = saved[parentCode].id;
      if (mainCode && saved[mainCode] && seed.code !== mainCode) entity.mainCategoryId = saved[mainCode].id;
      await this.repo.save(entity);
    }
  }

  // ─── Listar árvore completa ───────────────────────────────────────────────
  async listarArvore() {
    const todas = await this.repo.find({ order: { sortOrder: 'ASC', code: 'ASC' } });
    return this.construirArvore(todas, null);
  }

  private construirArvore(cats: FinancialCategory[], parentId: string | null): any[] {
    return cats
      .filter((c) => c.parentId === parentId)
      .map((c) => ({
        ...c,
        children: this.construirArvore(cats, c.id),
      }));
  }

  // ─── Listar apenas analíticas (para select de lançamento) ─────────────────
  async listarAnaliticas() {
    return this.repo.find({
      where: { type: 'analitica', active: true },
      order: { code: 'ASC' },
    });
  }

  // ─── Busca por nome ou código ─────────────────────────────────────────────
  async buscar(termo: string) {
    return this.repo.find({
      where: [
        { name: Like(`%${termo}%`), active: true },
        { code: Like(`%${termo}%`), active: true },
      ],
      order: { code: 'ASC' },
    });
  }

  // ─── Buscar por ID com breadcrumb ─────────────────────────────────────────
  async buscarPorId(id: string) {
    const cat = await this.repo.findOne({ where: { id }, relations: ['parent', 'mainCategory'] });
    if (!cat) throw new NotFoundException('Categoria não encontrada');
    return cat;
  }

  // ─── Buscar por código ────────────────────────────────────────────────────
  async buscarPorCodigo(code: string) {
    return this.repo.findOne({ where: { code } });
  }

  // ─── Criar categoria ──────────────────────────────────────────────────────
  async criar(dto: CriarCategoriaDto) {
    const parts = dto.code.split('.');
    let parentId: string | null = null;
    let mainCategoryId: string | null = null;
    let level = parts.length;

    if (parts.length > 1) {
      const parentCode = parts.slice(0, -1).join('.');
      const parent = await this.buscarPorCodigo(parentCode);
      if (!parent) throw new BadRequestException(`Categoria pai ${parentCode} não encontrada`);
      parentId = parent.id;

      const main = await this.buscarPorCodigo(parts[0]);
      if (main) mainCategoryId = main.id;
    }

    const allowEntries = dto.type === 'analitica';
    const entity = this.repo.create({ ...dto, parentId, mainCategoryId, level, allowEntries });
    return this.repo.save(entity);
  }

  // ─── Atualizar categoria ──────────────────────────────────────────────────
  async atualizar(id: string, dto: AtualizarCategoriaDto) {
    const cat = await this.buscarPorId(id);
    Object.assign(cat, dto);
    return this.repo.save(cat);
  }

  // ─── Ativar/desativar ─────────────────────────────────────────────────────
  async toggleAtivo(id: string) {
    const cat = await this.buscarPorId(id);
    cat.active = !cat.active;
    return this.repo.save(cat);
  }

  // ─── Consolidados por categoria principal (para dashboard) ────────────────
  async consolidadosPorCategoriaPrincipal(lancamentos: { categoryId: string; valor: number }[]) {
    if (lancamentos.length === 0) return [];

    const ids = [...new Set(lancamentos.map((l) => l.categoryId).filter(Boolean))];
    if (ids.length === 0) return [];

    const categorias = await this.repo
      .createQueryBuilder('c')
      .where('c.id IN (:...ids)', { ids })
      .getMany();

    // Agrupa pelo mainCategoryId
    const consolidado: Record<string, { nome: string; codigo: string; total: number; cor: string }> = {};

    for (const lanc of lancamentos) {
      const cat = categorias.find((c) => c.id === lanc.categoryId);
      if (!cat) continue;

      const mainId = cat.mainCategoryId ?? cat.id;
      if (!consolidado[mainId]) {
        const main = cat.mainCategoryId
          ? await this.repo.findOne({ where: { id: mainId } })
          : cat;
        consolidado[mainId] = {
          nome: main?.name ?? cat.name,
          codigo: main?.code ?? cat.code,
          total: 0,
          cor: main?.color ?? '#6b7280',
        };
      }
      consolidado[mainId].total += Number(lanc.valor);
    }

    return Object.values(consolidado).sort((a, b) => b.total - a.total);
  }
}
