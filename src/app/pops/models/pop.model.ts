// src/app/models/pop.model.ts

/**
 * Interface que define a estrutura de um Procedimento Operacional Padrão (POP).
 * Inclui propriedades de relacionamento para exibição no frontend.
 */
export interface Pop {
  id?: number;              // Opcional, gerado pelo backend
  codigo: string;           // VARCHAR(9)
  idtipo_pop: number;       // FK para TipoPop
  idsetor: number;          // FK para Setor
  tarefa: string;           // VARCHAR(200) - Título/Nome da Tarefa
  executante: string;       // VARCHAR(200) - Quem executa
  data_emissao?: string;    // DATETIME. Gerado pelo backend na criação.
  idusuario_cadastro?: number; // FK para Usuario. Será o usuário que cadastrou o POP.
  ativo: boolean;           // TINYINT. Indica se o POP está ativo.

  // Propriedades virtuais (nomes dos relacionamentos) retornadas pelo backend para exibição:
  nome_tipo_pop?: string;      // nome do TipoPop
  nome_setor?: string;         // nome do Setor
  nome_usuario_cadastro?: string; // nome do Usuario que cadastrou
  // Se você tiver uma revisão vigente no POP:
  numero_revisao_vigente?: number; // Opcional: número da revisão vigente para exibir na lista de POPs
}