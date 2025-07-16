import { inject } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptorFn,
  HttpHandlerFn,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service'; // Ajuste o caminho se necessário
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken(); // Obtém o token do AuthService

  // Clona a requisição e adiciona o cabeçalho de autorização se um token existir
  let clonedReq = req;
  if (token) {
    clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  // Envia a requisição clonada e lida com erros
  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Se for um erro 401 (Unauthorized) ou 403 (Forbidden)
      if (error.status === 401 || error.status === 403) {
        console.error('Erro de autenticação/autorização:', error);
        // Desloga o usuário e redireciona para a página de login
        authService.logout();
        router.navigate(['/login']);
      }
      // Re-lança o erro para que outros observadores possam lidar com ele
      return throwError(() => error);
    })
  );
};