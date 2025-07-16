// src/app/setores/components/setor-list/setor-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
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
import {cilSettings, cilPlus, cilPencil} from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';

import { Setor, SetorService } from '../../services/setor.service'; // Importa Setor e SetorService

@Component({
  selector: 'app-setor-list',
  templateUrl: './setor-list.component.html',
  styleUrls: ['./setor-list.component.scss'],
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
export class SetorListComponent implements OnInit, OnDestroy {
  icons = {cilPlus, cilSettings, cilPencil}
  setores: Setor[] = [];
  loading: boolean = true;
  errorMessage: string | null = null;
  private subscription: Subscription = new Subscription();

  showCrudModal: boolean = false;
  isEditing: boolean = false;
  currentSetorId: number | null = null;
  setorForm!: FormGroup;

  constructor(
    private setorService: SetorService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadSetores();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Inicializa ou reseta o formulário reativo para cadastro/edição de setores.
   * Inclui validações para nome e código.
   */
  initForm(): void {
    this.setorForm = this.fb.group({
      id: [null],
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      // Adicionado: Campo 'codigo' com validações para ser obrigatório e ter 2 caracteres
      codigo: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
      ativo: [true]
    });
  }

  get f() { return this.setorForm.controls; }

  loadSetores(): void {
    this.loading = true;
    this.errorMessage = null;
    this.subscription.add(
      this.setorService.getSetores().subscribe({
        next: (data) => {
          this.setores = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Erro ao carregar setores:', err);
          this.errorMessage = 'Erro ao carregar os setores.';
          this.loading = false;
        }
      })
    );
  }

  onCreateNew(): void {
    this.isEditing = false;
    this.currentSetorId = null;
    this.initForm(); // Limpa e reseta o formulário
    this.showCrudModal = true;
  }

  onEdit(setor: Setor): void {
    this.isEditing = true;
    this.currentSetorId = setor.id || null;
    this.initForm(); // Reseta o formulário antes de preencher
    this.setorForm.patchValue({
      id: setor.id,
      nome: setor.nome,
      codigo: setor.codigo, // Adicionado: Preenche o campo 'codigo'
      ativo: setor.ativo ?? true
    });
    this.showCrudModal = true;
  }

  onSubmit(): void {
    if (this.setorForm.invalid) {
      this.setorForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const setorData: Setor = this.setorForm.value;

    let operation$: Observable<Setor | any>;

    if (this.isEditing && this.currentSetorId) {
      // Para edição, envia todos os campos necessários para o PUT
      const { id, ...dataToUpdate } = setorData;
      operation$ = this.setorService.updateSetor(this.currentSetorId, dataToUpdate);
    } else {
      // Para criação, envia nome e codigo. O 'ativo' é padrão no backend.
      operation$ = this.setorService.createSetor({ nome: setorData.nome, codigo: setorData.codigo });
    }

    this.subscription.add(
      operation$.subscribe({
        next: (response) => {
          console.log(`Setor ${this.isEditing ? 'atualizado' : 'criado'} com sucesso!`, response);
          this.showCrudModal = false;
          this.loading = false;
          this.loadSetores();
          this.resetModalState();
        },
        error: (err) => {
          console.error(`Erro ao ${this.isEditing ? 'atualizar' : 'criar'} setor:`, err);
          // O backend agora retorna statusCode e mensagem em caso de erro, como conflitos.
          this.errorMessage = `Erro ao ${this.isEditing ? 'atualizar' : 'criar'} o setor: ` + (err.error?.message || 'Erro desconhecido.');
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
    this.currentSetorId = null;
    this.setorForm.reset();
    this.setorForm.get('ativo')?.setValue(true);
    // Limpar validações após reset, importante para garantir que o formulário esteja limpo para o próximo uso.
    this.setorForm.markAsPristine();
    this.setorForm.markAsUntouched();
  }
}