import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Interface que define a estrutura de um objeto Setor.
 * Inclui propriedades para identificador, nome e status de atividade.
 */
export interface Setor {
  id?: number;      // Opcional, pois não estará presente ao criar um novo setor
  nome: string;
   codigo: string;
  ativo?: boolean;  // Opcional, padrão para true em novos cadastros no backend, pode ser editado
}

/**
 * Serviço responsável pela comunicação com a API para operações relacionadas a setores.
 *
 * Fornece métodos para obter, criar e atualizar setores.
 * As requisições HTTP são automaticamente interceptadas para adicionar tokens de autenticação,
 * portanto, não há necessidade de incluir HttpHeaders manualmente aqui.
 */
@Injectable({
  providedIn: 'root'
})
export class SetorService {
  private apiUrl = `${environment.apiUrl}/setores`; // URL base da API para o recurso de setores

  constructor(private http: HttpClient) { }

  /**
   * Obtém uma lista de todos os setores registrados no sistema.
   *
   * @returns {Observable<Setor[]>} Um Observable que emite um array de objetos Setor.
   * Inclui setores ativos e inativos.
   */
  getSetores(): Observable<Setor[]> {
    return this.http.get<Setor[]>(this.apiUrl);
  }

  /**
   * Cria um novo setor.
   *
   * Ao criar um setor, o ID é gerado automaticamente pelo backend e o status 'ativo'
   * é geralmente definido como 'true' por padrão.
   *
   * @param {Object} setor - Um objeto contendo os dados do novo setor.
   * @param {string} setor.nome - O nome do setor a ser criado.
   * @returns {Observable<Setor>} Um Observable que emite o objeto Setor recém-criado,
   * incluindo seu ID e status.
   */
  createSetor(setor: Setor): Observable<Setor> {
    return this.http.post<Setor>(this.apiUrl, setor);
  }

  /**
   * Atualiza um setor existente.
   *
   * Este método pode ser usado para modificar o nome do setor ou seu status de atividade (ativo/inativo).
   *
   * @param {number} id - O ID do setor a ser atualizado.
   * @param {Setor} setor - O objeto Setor contendo os dados atualizados.
   * Deve incluir o nome e o status 'ativo'.
   * @returns {Observable<Setor>} Um Observable que emite o objeto Setor atualizado.
   */
  updateSetor(id: number, setor: Setor): Observable<Setor> {
    return this.http.put<Setor>(`${this.apiUrl}/${id}`, setor);
  }
}