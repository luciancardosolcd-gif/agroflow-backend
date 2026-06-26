export class CreateTalhaoDto {
  nome: string;
  propriedade_id?: string;
  usuario_id?: string;
  coordenadas: { lat: number; lng: number }[];
  area_hectares?: number;
  observacoes?: string;
  cor?: string;
}
