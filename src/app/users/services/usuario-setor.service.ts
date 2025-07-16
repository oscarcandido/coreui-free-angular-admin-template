import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
// Interface para a associação usuario_setor
export interface UsuarioSetor {
  id?: number; // O ID da tabela de junção (primária)
  idusuario: number;
  idsetor: number;
  nome_setor?: string; // Adicionado para facilitar no backend, mas pode vir do frontend também
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioSetorService {
  private apiUrl = `${environment.apiUrl}/usuario-setor`;  

  constructor(private http: HttpClient) { }

  /**
   * Obtém todas as associações de setores para um usuário específico.
   * Utiliza o endpoint GET /api/usuario-setor?idusuario=X
   * @param idUsuario O ID do usuário para buscar as associações.
   * @returns Um Observable de um array de UsuarioSetor.
   */
  getAssociacoesPorUsuario(idUsuario: number): Observable<UsuarioSetor[]> {
    return this.http.get<UsuarioSetor[]>(`${this.apiUrl}?idusuario=${idUsuario}`);
  }

  /**
   * Cria uma nova associação entre um usuário e um setor.
   * @param associacao Objeto contendo idusuario e idsetor.
   * @returns Um Observable da nova associação criada.
   */
  criarAssociacao(associacao: { idusuario: number, idsetor: number }): Observable<UsuarioSetor> {
    return this.http.post<UsuarioSetor>(this.apiUrl, associacao);
  }

  /**
   * Remove uma associação específica pelo seu ID na tabela usuario_setor.
   * @param idAssociacao O ID da associação na tabela usuario_setor.
   * @returns Um Observable vazio após a remoção.
   */
  removerAssociacao(idAssociacao: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idAssociacao}`);
  }
}