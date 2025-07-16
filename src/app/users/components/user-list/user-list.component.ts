// src/app/users/components/user-list/user-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

// CoreUI Modules & Directives
import {
  TableModule,
  CardModule,
  GridModule,
  ButtonModule,
  ModalModule,
  ModalHeaderComponent,
  ModalBodyComponent,
  ModalFooterComponent,
  FormControlDirective,
  FormDirective,
  FormFloatingDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  FormCheckComponent,
  FormLabelDirective,
  FormSelectDirective
} from '@coreui/angular';
import { cilSettings, cilPlus, cilPencil, cilUser } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';

// Nossos serviços e modelos
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { GrupoUsuario, GrupoUsuarioService } from '../../../grupo-usuarios/services/grupo-usuario.service';


@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    CardModule,
    GridModule,
    ButtonModule,
    IconDirective,
    ModalModule,
    ModalHeaderComponent,
    ModalBodyComponent,
    ModalFooterComponent,
    FormControlDirective,
    FormDirective,
    FormFloatingDirective,
    InputGroupComponent,
    InputGroupTextDirective,
    FormCheckComponent,
    FormLabelDirective,
    FormSelectDirective
  ]
})
export class UserListComponent implements OnInit, OnDestroy {
  icons = { cilUser, cilPlus, cilSettings, cilPencil };
  users: User[] = [];
  grupos: GrupoUsuario[] = [];

  loading: boolean = true;
  errorMessage: string | null = null;
  private subscription: Subscription = new Subscription();

  showCrudModal: boolean = false;
  isEditing: boolean = false;
  currentUserId: number | null = null;
  userForm!: FormGroup;

  constructor(
    private userService: UserService,
    private grupoUsuarioService: GrupoUsuarioService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  initForm(): void {
    this.userForm = this.fb.group({
      id: [null],
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      senha: ['', [
        Validators.minLength(6),
        Validators.maxLength(50)
      ]],
      idgrupo_usuarios: [null, Validators.required],
      ativo: [true]
    });

    this.userForm.get('senha')?.valueChanges.subscribe(value => {
      if (this.isEditing) {
        if (!value) {
          this.userForm.get('senha')?.clearValidators();
        } else {
          this.userForm.get('senha')?.setValidators([
            Validators.minLength(6),
            Validators.maxLength(50)
          ]);
        }
        this.userForm.get('senha')?.updateValueAndValidity();
      }
    });
  }

  get f() { return this.userForm.controls; }

  loadInitialData(): void {
    this.loading = true;
    this.errorMessage = null;

    forkJoin({
      users: this.userService.getUsers(),
      grupos: this.grupoUsuarioService.getGrupos(),
    }).subscribe({
      next: (data) => {
        this.users = (data as any).users;
        this.grupos = (data as any).grupos.filter((g: any) => g.ativo);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar dados iniciais:', err);
        this.errorMessage = 'Erro ao carregar usuários ou grupos.';
        this.loading = false;
      }
    });
  }

  /**
   * Método auxiliar para obter o nome do grupo dado seu ID.
   * Usado no template para exibir o nome do grupo em vez do ID.
   * @param idGrupo - O ID do grupo.
   * @returns O nome do grupo ou 'N/A' se não encontrado.
   */
  getGrupoNome(idGrupo: number | undefined): string { // Adicionado 'undefined' para segurança
    if (idGrupo === undefined || idGrupo === null) {
      return 'N/A';
    }
    const grupo = this.grupos.find(g => g.id === idGrupo);
    return grupo ? grupo.nome : 'N/A';
  }


  onCreateNew(): void {
    this.isEditing = false;
    this.currentUserId = null;
    this.initForm();
    this.userForm.get('senha')?.setValidators([
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(50)
    ]);
    this.userForm.get('senha')?.updateValueAndValidity();
    this.showCrudModal = true;
  }

  onEdit(user: User): void {
    this.isEditing = true;
    this.currentUserId = user.id || null;
    this.initForm();
    this.userForm.get('senha')?.clearValidators();
    this.userForm.get('senha')?.updateValueAndValidity();

    this.userForm.patchValue({
      id: user.id,
      nome: user.nome,
      email: user.email,
      idgrupo_usuarios: user.idgrupo_usuarios,
      ativo: user.ativo ?? true
    });
    this.showCrudModal = true;
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const userData: User = this.userForm.value;

    let operation$: Observable<User | any>;

    if (this.isEditing && this.currentUserId) {
      const { id, senha, ...dataToUpdate } = userData;
      if (senha) {
        operation$ = this.userService.updateUser(this.currentUserId, { ...dataToUpdate, senha });
      } else {
        operation$ = this.userService.updateUser(this.currentUserId, dataToUpdate);
      }
    } else {
      operation$ = this.userService.createUser(userData);
    }

    this.subscription.add(
      operation$.subscribe({
        next: (response) => {
          console.log(`Usuário ${this.isEditing ? 'atualizado' : 'criado'} com sucesso!`, response);
          this.showCrudModal = false;
          this.loading = false;
          this.loadInitialData();
          this.resetModalState();
        },
        error: (err) => {
          console.error(`Erro ao ${this.isEditing ? 'atualizar' : 'criar'} usuário:`, err);
          this.errorMessage = `Erro ao ${this.isEditing ? 'atualizar' : 'criar'} o usuário: ` + (err.error?.message || 'Erro desconhecido.');
          this.loading = false;
        }
      })
    );
  }

  onVisibleChange(isVisible: boolean): void {
    this.showCrudModal = isVisible;
    if (!isVisible) {
      this.resetModalState();
    }
  }

  onCloseCrudModal(): void {
    this.showCrudModal = false;
  }

  private resetModalState(): void {
    this.isEditing = false;
    this.currentUserId = null;
    this.userForm.reset();
    this.userForm.get('ativo')?.setValue(true);
    this.userForm.markAsPristine();
    this.userForm.markAsUntouched();
  }
}