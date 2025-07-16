// src/app/users/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

/**
 * Serviço responsável pela comunicação com a API para operações relacionadas a usuários.
 * Fornece métodos para obter, criar, atualizar e (opcionalmente) remover usuários.
 * Assume que um interceptor de HTTP já está configurado para adicionar tokens de autenticação.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/usuarios`; // Base da URL da API para usuários

  constructor(private http: HttpClient) { }

  /**
   * Obtém a lista de todos os usuários registrados no sistema.
   *
   * @returns {Observable<User[]>} Um Observable que emite um array de objetos User.
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  /**
   * Cria um novo usuário no sistema.
   *
   * A senha é obrigatória durante a criação. O ID e o status 'ativo' são gerados
   * ou definidos pelo backend.
   *
   * @param {User} user - O objeto User a ser criado (sem ID, com senha).
   * @returns {Observable<User>} Um Observable que emite o objeto User recém-criado.
   */
  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  /**
   * Atualiza um usuário existente.
   *
   * A senha pode ser omitida se não houver alteração.
   *
   * @param {number} id - O ID do usuário a ser atualizado.
   * @param {User} user - O objeto User com os dados atualizados.
   * @returns {Observable<User>} Um Observable que emite o objeto User atualizado.
   */
  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  /**
   * Obtém um usuário específico por ID.
   *
   * @param {number} id - O ID do usuário a ser buscado.
   * @returns {Observable<User>} Um Observable que emite o objeto User encontrado.
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }
}