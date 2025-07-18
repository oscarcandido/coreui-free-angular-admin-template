// src/app/revisoes/services/revisao.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Revisao } from '../models/revisao.model'; // Importa a interface Revisao
import { environment } from '../../../environments/environment'; // Importa o ambiente

@Injectable({
  providedIn: 'root'
})
export class RevisaoService {
  private apiUrl = `${environment.apiUrl}/revisoes`; // **AJUSTE SUA URL BASE DA API AQUI**

  constructor(private http: HttpClient) { }

  /**
   * Obtém todas as revisões, opcionalmente filtradas por ID do POP.
   * Se idPop for fornecido, usa a rota GET /api/revisoes?idpop=X.
   * @param idPop Opcional. ID do POP para filtrar as revisões.
   * @returns Um Observable de um array de Revisao.
   */
  getRevisoes(idPop?: number): Observable<Revisao[]> {
    let url = this.apiUrl;
    if (idPop) {
      url += `?idpop=${idPop}`;
    }
    return this.http.get<Revisao[]>(url);
  }

  /**
   * Obtém uma revisão específica por ID.
   * @param id O ID da revisão.
   * @returns Um Observable da Revisao.
   */
  getRevisaoById(id: number): Observable<Revisao> {
    return this.http.get<Revisao>(`${this.apiUrl}/${id}`);
  }

  /**
   * Cria uma nova revisão para um POP.
   * O número da revisão é gerado pelo backend.
   * @param revisao Os dados da revisão a serem criados (idpop, data_revisao, idusuario_cadastro, descricao, vigente, ativo).
   * @returns Um Observable da Revisao criada.
   */
  createRevisao(revisao: Revisao): Observable<Revisao> {
    // O backend gera o 'numero' e 'id'.
    // Omitimos as propriedades virtuais que o backend retorna.
    const { id, numero, titulo_pop, codigo_pop, nome_usuario_cadastro, ...revisaoData } = revisao;
    return this.http.post<Revisao>(this.apiUrl, revisaoData);
  }

  /**
   * Atualiza uma revisão existente.
   * @param id O ID da revisão a ser atualizada.
   * @param revisao Os dados atualizados da Revisao.
   * @returns Um Observable da Revisao atualizada.
   */
  updateRevisao(id: number, revisao: Revisao): Observable<Revisao> {
    // Omitimos o ID e as propriedades virtuais do payload.
    const { id: revisaoId, numero, titulo_pop, codigo_pop, nome_usuario_cadastro, ...revisaoData } = revisao;
    return this.http.put<Revisao>(`${this.apiUrl}/${id}`, revisaoData);
  }

  /**
   * Remove (inativa) uma revisão pelo ID.
   * @param id O ID da revisão a ser removida.
   * @returns Um Observable vazio após a remoção.
   */
  deleteRevisao(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}