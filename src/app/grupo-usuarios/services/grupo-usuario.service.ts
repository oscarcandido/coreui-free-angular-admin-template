// src/app/grupo-usuarios/services/grupo-usuario.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // Importe o environment

export interface GrupoUsuario {
  id?: number; // Opcional, pois não estará presente na criação
  nome: string;
  ativo?: boolean; // Booleano para o frontend, no backend é tinyint
}

@Injectable({
  providedIn: 'root' // Garante que o serviço é um singleton e está disponível em toda a aplicação
})
export class GrupoUsuarioService {
  private apiUrl = `${environment.apiUrl}/grupo-usuarios`; // Base URL para a API de grupos de usuários

  constructor(private http: HttpClient) { }

  /**
   * Obtém todos os grupos de usuários.
   * @returns Observable de um array de GrupoUsuario.
   */
  getGrupos(): Observable<GrupoUsuario[]> {
    return this.http.get<GrupoUsuario[]>(this.apiUrl);
  }

  /**
   * Obtém um grupo de usuário pelo ID.
   * @param id O ID do grupo.
   * @returns Observable de um GrupoUsuario.
   */
  getGrupoById(id: number): Observable<GrupoUsuario> {
    return this.http.get<GrupoUsuario>(`${this.apiUrl}/${id}`);
  }

  /**
   * Cria um novo grupo de usuário.
   * @param grupo O objeto GrupoUsuario a ser criado (apenas o nome é necessário no body).
   * @returns Observable do GrupoUsuario criado.
   */
  createGrupo(grupo: { nome: string }): Observable<GrupoUsuario> {
    return this.http.post<GrupoUsuario>(this.apiUrl, grupo);
  }

  /**
   * Atualiza um grupo de usuário existente.
   * @param id O ID do grupo a ser atualizado.
   * @param grupo O objeto GrupoUsuario com os dados atualizados (nome e ativo).
   * @returns Observable do GrupoUsuario atualizado.
   */
  updateGrupo(id: number, grupo: GrupoUsuario): Observable<GrupoUsuario> {
    return this.http.put<GrupoUsuario>(`${this.apiUrl}/${id}`, grupo);
  }

  /**
   * Remove (inativa) um grupo de usuário pelo ID.
   * @param id O ID do grupo a ser removido.
   * @returns Observable de qualquer resposta da API (geralmente vazio ou uma mensagem).
   */
  deleteGrupo(id: number): Observable<any> {
    // Note: No seu backend, o DELETE na verdade inativa (ativo = 0).
    // Opcional: Se você quiser um método mais explícito para inativar, pode criar.
    // Por enquanto, o endpoint DELETE da API está sendo chamado para "remover" no sentido de inativar.
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}