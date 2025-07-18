export interface TipoPop {
  id?: number;
  nome: string;
  ativo?: boolean; // Default é 1 (true) no banco, então opcional no frontend
}