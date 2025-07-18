import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TipoPop } from '../models/tipo-pop.model'; // Certifique-se de que o modelo TipoPop está definido corretamente
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class TipoPopService {
    // URL base da API para Tipos de POP
  private apiUrl = `${environment.apiUrl}/tipos-pop`;  
  constructor(private http: HttpClient) { }

  /**
   * Obtém todos os Tipos de POP.
   * @returns Um Observable de um array de TipoPop.
   */
  getTiposPop(): Observable<TipoPop[]> {
    return this.http.get<TipoPop[]>(this.apiUrl);
  }

  /**
   * Obtém apenas os Tipos de POP ativos.
   * @returns Um Observable de um array de TipoPop.
   */
  getTiposPopAtivos(): Observable<TipoPop[]> {
    return this.http.get<TipoPop[]>(`${this.apiUrl}/ativos`);
  }

  /**
   * Obtém um Tipo de POP por ID.
   * @param id O ID do Tipo de POP.
   * @returns Um Observable do TipoPop.
   */
  getTipoPopById(id: number): Observable<TipoPop> {
    return this.http.get<TipoPop>(`${this.apiUrl}/${id}`);
  }

  /**
   * Cria um novo Tipo de POP.
   * @param tipoPop O objeto TipoPop a ser criado.
   * @returns Um Observable do TipoPop criado.
   */
  createTipoPop(tipoPop: TipoPop): Observable<TipoPop> {
    return this.http.post<TipoPop>(this.apiUrl, tipoPop);
  }

  /**
   * Atualiza um Tipo de POP existente.
   * @param id O ID do Tipo de POP a ser atualizado.
   * @param tipoPop Os dados atualizados do TipoPop.
   * @returns Um Observable do TipoPop atualizado.
   */
  updateTipoPop(id: number, tipoPop: TipoPop): Observable<TipoPop> {
    return this.http.put<TipoPop>(`${this.apiUrl}/${id}`, tipoPop);
  }

  /**
   * Remove um Tipo de POP.
   * @param id O ID do Tipo de POP a ser removido.
   * @returns Um Observable vazio após a remoção.
   */
  deleteTipoPop(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}