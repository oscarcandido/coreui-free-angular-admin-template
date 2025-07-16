import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgStyle } from '@angular/common'; // NgStyle adicionado para consistência com o exemplo CoreUI
import { AuthService } from '../../services/auth.service';

// Importações específicas de componentes e diretivas do CoreUI
import {
  ButtonDirective,
  CardBodyComponent,
  CardComponent,
  CardGroupComponent,
  ColComponent,
  ContainerComponent,
  FormControlDirective,
  FormDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular'; // Para os ícones (cilUser, cilLockLocked)

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true, // Garante que este é um componente standalone
  imports: [
    CommonModule,         // Para *ngIf, *ngFor, etc.
    ReactiveFormsModule,  // Para formulários reativos (FormGroup, FormControl, Validators)
    ContainerComponent,   // <c-container>
    RowComponent,         // <c-row>
    ColComponent,         // <c-col>
    CardGroupComponent,   // <c-card-group>
    CardComponent,        // <c-card>
    CardBodyComponent,    // <c-card-body>
    InputGroupComponent,  // <c-input-group>
    InputGroupTextDirective, // <span cInputGroupText>
    IconDirective,        // <svg cIcon>
    FormControlDirective, // Diretiva para cFormControl
    ButtonDirective       // <button cButton>
  ]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string | null = null;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Getter para facilitar o acesso aos controles do formulário no template
  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.errorMessage = null;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { email, senha } = this.loginForm.value;

    this.authService.login({ email, senha }).subscribe({
      next: (response) => {
        console.log('Login bem-sucedido!', response);
        // O redirecionamento para o dashboard já acontece no AuthService
      },
      error: (error) => {
        this.loading = false;
        console.error('Erro no login:', error);
        if (error.status === 401) {
          this.errorMessage = 'Credenciais inválidas. Verifique seu e-mail e senha.';
        } else {
          this.errorMessage = 'Ocorreu um erro. Tente novamente mais tarde.';
        }
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}