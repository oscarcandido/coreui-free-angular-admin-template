import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

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
  FormLabelDirective
} from '@coreui/angular';
import {cilGroup, cilPlus, cilPencil} from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';

import { GrupoUsuario, GrupoUsuarioService } from '../../services/grupo-usuario.service';

@Component({
  selector: 'app-grupo-usuario-list',
  templateUrl: './grupo-usuario-list.component.html',
  styleUrls: ['./grupo-usuario-list.component.scss'],
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
    FormCheckComponent,
  ]
})
export class GrupoUsuarioListComponent implements OnInit, OnDestroy {
  icons = {cilPlus, cilGroup, cilPencil}
  grupos: GrupoUsuario[] = [];
  loading: boolean = true;
  errorMessage: string | null = null;
  private subscription: Subscription = new Subscription();

  showCrudModal: boolean = false;
  isEditing: boolean = false;
  currentGrupoId: number | null = null;
  grupoForm!: FormGroup;

  constructor(
    private grupoUsuarioService: GrupoUsuarioService,
    private router: Router,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadGrupos();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  initForm(): void {
    this.grupoForm = this.fb.group({
      id: [null],
      nome: ['', [Validators.required, Validators.maxLength(45)]],
      ativo: [true]
    });
  }

  get f() { return this.grupoForm.controls; }

  loadGrupos(): void {
    this.loading = true;
    this.errorMessage = null;
    this.subscription.add(
      this.grupoUsuarioService.getGrupos().subscribe({
        next: (data) => {
          this.grupos = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Erro ao carregar grupos:', err);
          this.errorMessage = 'Erro ao carregar os grupos de usuários.';
          this.loading = false;
        }
      })
    );
  }

  onCreateNew(): void {
    this.isEditing = false;
    this.currentGrupoId = null;
    this.initForm();
    this.showCrudModal = true;
  }

  onEdit(grupo: GrupoUsuario): void {
    this.isEditing = true;
    this.currentGrupoId = grupo.id || null;
    this.initForm();
    this.grupoForm.patchValue({
      id: grupo.id,
      nome: grupo.nome,
      ativo: grupo.ativo ?? true
    });
    this.showCrudModal = true;
  }

  onSubmit(): void {
    if (this.grupoForm.invalid) {
      this.grupoForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const grupoData: GrupoUsuario = this.grupoForm.value;

    let operation$: Observable<GrupoUsuario | any>;

    if (this.isEditing && this.currentGrupoId) {
      const { id, ...dataToUpdate } = grupoData;
      operation$ = this.grupoUsuarioService.updateGrupo(this.currentGrupoId, dataToUpdate);
    } else {
      operation$ = this.grupoUsuarioService.createGrupo({ nome: grupoData.nome });
    }

    this.subscription.add(
      operation$.subscribe({
        next: (response) => {
          console.log(`Grupo ${this.isEditing ? 'atualizado' : 'criado'} com sucesso!`, response);
          this.showCrudModal = false; // Fecha o modal após sucesso
          this.loading = false;
          this.loadGrupos();
          this.resetModalState(); // Chama para resetar o estado após fechar com sucesso
        },
        error: (err) => {
          console.error(`Erro ao ${this.isEditing ? 'atualizar' : 'criar'} grupo:`, err);
          this.errorMessage = `Erro ao ${this.isEditing ? 'atualizar' : 'criar'} o grupo: ` + (err.error?.message || 'Erro desconhecido.');
          this.loading = false;
          // Opcional: Manter modal aberta com erro, ou fechar e resetar.
          // this.showCrudModal = false;
          // this.resetModalState();
        }
      })
    );
  }

  // Novo método para sincronizar showCrudModal com o estado interno do CoreUI
  onVisibleChange(isVisible: boolean): void {
    this.showCrudModal = isVisible;
    if (!isVisible) {
      // Se a modal está sendo fechada (seja por Esc, backdrop, etc.)
      this.resetModalState();
    }
  }

  // Método para ser chamado pelos botões 'Cancelar' e 'cButtonClose'
  onCloseCrudModal(): void {
    this.showCrudModal = false; // Define como false para fechar o modal
    // A função onVisibleChange será chamada em seguida pelo CoreUI
    // e executará o resetModalState se a modal realmente fechar.
  }

  // Método para centralizar o reset do estado do modal
  private resetModalState(): void {
    this.isEditing = false;
    this.currentGrupoId = null;
    this.grupoForm.reset();
    // Garante que o checkbox 'ativo' volte ao estado inicial (true) para novos cadastros
    this.grupoForm.get('ativo')?.setValue(true);
  }
}