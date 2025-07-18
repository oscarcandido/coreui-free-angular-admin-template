import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
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
} from '@coreui/angular';
import { cilPlus, cilPencil, cilTrash } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';

// Nosso serviço e modelo
import {  TipoPopService } from '../../services/tipo-pop.service';
import { TipoPop } from '../../models/tipo-pop.model';

@Component({
  selector: 'app-tipo-pop-list',
  templateUrl: './tipo-pop-list.component.html',
  styleUrls: ['./tipo-pop-list.component.scss'],
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
  ]
})
export class TipoPopListComponent implements OnInit, OnDestroy {
  icons = { cilPlus, cilPencil, cilTrash };
  tiposPop: TipoPop[] = [];

  loading: boolean = true;
  errorMessage: string | null = null;
  private subscription: Subscription = new Subscription();

  showCrudModal: boolean = false;
  isEditing: boolean = false;
  currentTipoPopId: number | null = null;
  tipoPopForm!: FormGroup;

  // Para a modal de confirmação de exclusão
  showDeleteConfirmModal: boolean = false;
  tipoPopToDelete: TipoPop | null = null;

  constructor(
    private tipoPopService: TipoPopService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadTiposPop();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  initForm(): void {
    this.tipoPopForm = this.fb.group({
      id: [null],
      nome: ['', [Validators.required, Validators.maxLength(45)]],
      ativo: [true],
    });
  }

  get f() { return this.tipoPopForm.controls; }

  loadTiposPop(): void {
    this.loading = true;
    this.errorMessage = null;

    this.subscription.add(
      this.tipoPopService.getTiposPop().subscribe({
        next: (data) => {
          this.tiposPop = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Erro ao carregar tipos de POP:', err);
          this.errorMessage = 'Erro ao carregar tipos de POP.';
          this.loading = false;
        }
      })
    );
  }

  onCreateNew(): void {
    this.isEditing = false;
    this.currentTipoPopId = null;
    this.initForm(); // Reseta o formulário
    this.tipoPopForm.get('ativo')?.setValue(true); // Garante que "ativo" comece como true
    this.showCrudModal = true;
  }

  onEdit(tipoPop: TipoPop): void {
    this.isEditing = true;
    this.currentTipoPopId = tipoPop.id || null;
    this.tipoPopForm.patchValue({
      id: tipoPop.id,
      nome: tipoPop.nome,
      ativo: tipoPop.ativo ?? true // Garante que o checkbox seja marcado se ativo for null/undefined
    });
    this.showCrudModal = true;
  }

  onSubmit(): void {
    if (this.tipoPopForm.invalid) {
      this.tipoPopForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const tipoPopData: TipoPop = this.tipoPopForm.value;
    let operation$: Observable<TipoPop | void>;

    if (this.isEditing && this.currentTipoPopId) {
      operation$ = this.tipoPopService.updateTipoPop(this.currentTipoPopId, tipoPopData);
    } else {
      operation$ = this.tipoPopService.createTipoPop(tipoPopData);
    }

    this.subscription.add(
      operation$.subscribe({
        next: () => {
          console.log(`Tipo de POP ${this.isEditing ? 'atualizado' : 'criado'} com sucesso!`);
          this.handleSubmissionSuccess();
        },
        error: (err) => {
          console.error(`Erro ao ${this.isEditing ? 'atualizar' : 'criar'} tipo de POP:`, err);
          this.errorMessage = `Erro ao ${this.isEditing ? 'atualizar' : 'criar'} o tipo de POP: ` + (err.error?.message || 'Erro desconhecido.');
          this.loading = false;
        }
      })
    );
  }

  private handleSubmissionSuccess(): void {
    this.showCrudModal = false;
    this.loading = false;
    this.loadTiposPop(); // Recarrega todos os dados para refletir as mudanças
    this.resetModalState();
  }

  onCrudModalVisibleChange(isVisible: boolean): void {
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
    this.currentTipoPopId = null;
    this.tipoPopForm.reset();
    this.tipoPopForm.get('ativo')?.setValue(true); // Garante que esteja true após reset
    this.tipoPopForm.markAsPristine();
    this.tipoPopForm.markAsUntouched();
  }

  onDeleteConfirm(tipoPop: TipoPop): void {
    this.tipoPopToDelete = tipoPop;
    this.showDeleteConfirmModal = true;
  }

  onDeleteCancel(): void {
    this.showDeleteConfirmModal = false;
    this.tipoPopToDelete = null;
  }

  onDelete(): void {
    if (this.tipoPopToDelete && this.tipoPopToDelete.id) {
      this.loading = true;
      this.errorMessage = null;
      this.subscription.add(
        this.tipoPopService.deleteTipoPop(this.tipoPopToDelete.id).subscribe({
          next: () => {
            console.log('Tipo de POP removido com sucesso!');
            this.showDeleteConfirmModal = false;
            this.loading = false;
            this.loadTiposPop(); // Recarrega a lista
            this.tipoPopToDelete = null;
          },
          error: (err) => {
            console.error('Erro ao remover tipo de POP:', err);
            this.errorMessage = 'Erro ao remover tipo de POP: ' + (err.error?.message || 'Erro desconhecido.');
            this.loading = false;
          }
        })
      );
    }
  }

  onDeleteConfirmModalVisibleChange(isVisible: boolean): void {
    this.showDeleteConfirmModal = isVisible;
    if (!isVisible) {
      this.tipoPopToDelete = null;
    }
  }
}