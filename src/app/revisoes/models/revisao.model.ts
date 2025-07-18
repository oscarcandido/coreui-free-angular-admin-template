// src/app/models/revisao.model.ts

/**
 * Interface que define a estrutura de uma Revisão de POP.
 * Inclui propriedades de relacionamento (virtuais) que podem ser retornadas pelo backend para exibição no frontend.
 */
export interface Revisao {
  id?: number;                  // Opcional, gerado pelo backend (PK da Revisão)
  idpop: number;                // Chave estrangeira para o POP ao qual esta revisão pertence
  data_revisao: string;         // DATETIME. Data em que a revisão foi realizada (ou criada).
                                //  Geralmente preenchida com a data/hora atual no frontend ou backend.
  idusuario_cadastro: number;   // Chave estrangeira para o Usuário que cadastrou/gerou esta revisão.
                                //  Geralmente o ID do usuário logado.
  numero?: number;              // Gerado pelo backend. Número sequencial da revisão para um dado POP (ex: 1, 2, 3...).
                                //  Opcional no frontend, pois é calculado no backend.
  descricao?: string;           // Opcional, VARCHAR(500). Descrição das alterações ou motivo da revisão.
  vigente: boolean;             // TINYINT (booleano). Indica se esta é a revisão **ativa/vigente** do POP.
                                //  Apenas uma revisão por POP deve ser 'true' para este campo.
  ativo: boolean;               // TINYINT (booleano). Status da revisão em si (se ela está ativa/válida no sistema).

  // --- Propriedades Virtuais (para exibição no frontend) ---
  // Essas propriedades não são colunas diretas na tabela de Revisões,
  // mas são frequentemente "joinadas" ou calculadas pelo backend
  // para facilitar a exibição na interface do usuário.
  titulo_pop?: string;          // Tarefa/Título do POP ao qual a revisão pertence (ex: 'Verificação de Equipamentos')
  codigo_pop?: string;          // Código do POP (ex: 'POP001')
  nome_usuario_cadastro?: string; // Nome do Usuário que cadastrou/gerou a revisão
}