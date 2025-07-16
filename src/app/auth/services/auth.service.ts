import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment'; // Importe a URL da API

interface AuthResponse {
  token: string;
  user: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'jwt_token'; // Chave para armazenar o token no localStorage

  // BehaviorSubject para notificar sobre o status de autenticação (útil para o AuthGuard e componentes)
  private _isAuthenticated = new BehaviorSubject<boolean>(this.hasToken());
  isAuthenticated$ = this._isAuthenticated.asObservable(); // Observable público

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  /**
   * Verifica se existe um token JWT armazenado.
   * @returns {boolean} True se o token existe, false caso contrário.
   */
  private hasToken(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    // Poderíamos adicionar validação extra aqui, como verificar a expiração do token
    return !!token;
  }

  /**
   * Realiza o login do usuário.
   * @param {Object} credentials Objeto com email e senha.
   * @returns {Observable<AuthResponse>} Um observable com a resposta da autenticação.
   */
  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          this._isAuthenticated.next(true); // Notifica que o usuário está autenticado
          this.router.navigate(['/dashboard']); // Redireciona para o dashboard após o login
        }
      })
    );
  }

  /**
   * Realiza o logout do usuário.
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this._isAuthenticated.next(false); // Notifica que o usuário não está mais autenticado
    this.router.navigate(['/login']); // Redireciona para a página de login
  }

  /**
   * Obtém o token JWT armazenado.
   * @returns {string | null} O token JWT ou null se não houver.
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Verifica se o usuário está autenticado.
   * Pode ser usado diretamente ou via o observable `isAuthenticated$`.
   * @returns {boolean} True se o usuário está autenticado, false caso contrário.
   */
  isLoggedIn(): boolean {
    return this.hasToken();
  }

  /**
   * (Opcional) Decodifica um JWT para extrair seu payload.
   * Útil para obter informações do usuário armazenadas no token.
   * Lembre-se: Este método apenas decodifica, não valida a assinatura do token.
   * A validação da assinatura deve ser feita no backend.
   * @param {string} token O token JWT a ser decodificado.
   * @returns {any | null} O payload decodificado do token ou null se inválido.
   */
  decodeToken(token: string): any | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Erro ao decodificar token:', e);
      return null;
    }
  }

  /**
   * (Opcional) Obtém o ID do usuário do token JWT.
   * @returns {number | null} O ID do usuário ou null.
   */
  getUserIdFromToken(): number | null {
    const token = this.getToken();
    if (token) {
      const decoded = this.decodeToken(token);
      // Assumindo que o ID do usuário está no campo 'id' ou 'userId' do payload JWT
      return decoded ? (decoded.id || decoded.userId) : null;
    }
    return null;
  }
}