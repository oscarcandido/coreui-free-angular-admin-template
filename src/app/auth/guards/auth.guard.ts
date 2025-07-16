import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Ajuste o caminho se necessário
import { map, take } from 'rxjs/operators'; // Importe operadores para trabalhar com Observables

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1), // Garante que pegamos apenas o valor atual e completamos o Observable
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true; // Permite o acesso à rota
      } else {
        // Redireciona para a página de login e retorna false para bloquear o acesso
        router.navigate(['/login']);
        return false;
      }
    })
  );
};