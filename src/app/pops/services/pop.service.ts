// src/app/pops/services/pop.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pop } from '../models/pop.model'; // Importa a interface Pop
import { environment } from '../../../environments/environment'; // Importa o ambiente para a URL da API

@Injectable({
  providedIn: 'root'
})
export class PopService {
  private apiUrl = `${environment.apiUrl}/pops`; // **AJUSTE SUA URL BASE DA API AQUI**

  constructor(private http: HttpClient) { }

  /**
   * Obtém todos os POPs.
   * @returns Um Observable de um array de Pop.
   */
  getPops(): Observable<Pop[]> {
    return this.http.get<Pop[]>(this.apiUrl);
  }

  /**
   * Obtém um POP específico por ID.
   * @param id O ID do POP.
   * @returns Um Observable do Pop.
   */
  getPopById(id: number): Observable<Pop> {
    return this.http.get<Pop>(`${this.apiUrl}/${id}`);
  }

  /**
   * Cria um novo POP.
   * @param pop Os dados do POP a serem criados.
   * @returns Um Observable do Pop criado.
   */
  createPop(pop: Pop): Observable<Pop> {
    // Omitimos o ID e as propriedades virtuais que o backend retorna.
    const { id, nome_tipo_pop, nome_setor, nome_usuario_cadastro, numero_revisao_vigente, ...popData } = pop;
    return this.http.post<Pop>(this.apiUrl, popData);
  }

  /**
   * Atualiza um POP existente.
   * @param id O ID do POP a ser atualizado.
   * @param pop Os dados atualizados do Pop.
   * @returns Um Observable do Pop atualizado.
   */
  updatePop(id: number, pop: Pop): Observable<Pop> {
    // Omitimos o ID e as propriedades virtuais do payload.
    const { id: popId, nome_tipo_pop, nome_setor, nome_usuario_cadastro, numero_revisao_vigente, ...popData } = pop;
    return this.http.put<Pop>(`${this.apiUrl}/${id}`, popData);
  }

  /**
   * Remove (inativa) um POP pelo ID.
   * @param id O ID do POP a ser removido.
   * @returns Um Observable vazio após a remoção.
   */
  deletePop(id: number): Observable<void> {
    // Se o seu backend faz uma remoção lógica (seta 'ativo' para false),
    // você pode mudar para um PUT que atualiza apenas o status 'ativo'.
    // Por enquanto, assumimos um DELETE que remove o registro.
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}