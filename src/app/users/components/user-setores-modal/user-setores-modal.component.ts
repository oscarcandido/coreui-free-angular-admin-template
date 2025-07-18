import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormControl, ReactiveFormsModule, FormArray, FormBuilder } from '@angular/forms'; // Importe FormControl

import {
  ModalModule,
  ModalHeaderComponent,
  ModalBodyComponent,
  ModalFooterComponent,
  ButtonModule,
  FormCheckComponent,
  FormLabelDirective
} from '@coreui/angular';
import { cilCheck, cilX } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';

import { SetorService } from '../../../setores/services/setor.service';
import { Setor } from '../../../setores/services/setor.service';
import { UsuarioSetor, UsuarioSetorService } from '../../services/usuario-setor.service';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-user-setores-modal',
  templateUrl: './user-setores-modal.component.html',
  styleUrls: ['./user-setores-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    ModalModule,
    ModalHeaderComponent,
    ModalBodyComponent,
    ModalFooterComponent,
    ButtonModule,
    FormCheckComponent
    ]
})
export class UserSetoresModalComponent implements OnInit, OnChanges, OnDestroy {
  @Input() visible: boolean = false;
  @Input() userId: number | null | undefined = undefined; // Corrigido para aceitar undefined
  @Input() userName: string | null | undefined  = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onClose = new EventEmitter<void>();

  icons = { cilCheck, cilX };

  setoresDisponiveis: Setor[] = [];
  setoresAtuaisIds: number[] = [];
  setoresFormArray!: FormArray;
  loading: boolean = false;
  errorMessage: string | null = null;
  private subscription: Subscription = new Subscription();

  constructor(
    private setorService: SetorService,
    private usuarioSetorService: UsuarioSetorService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.setoresFormArray = this.fb.array([]);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && changes['visible'].currentValue === true && this.userId !== null) {
      this.loadSetoresData();
    } else if (changes['visible'] && changes['visible'].currentValue === false) {
      this.resetModal();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // NOVO GETTER ADICIONADO AQUI
  getFormControl(index: number): FormControl {
    return this.setoresFormArray.controls[index] as FormControl;
  }

  private loadSetoresData(): void {
    this.loading = true;
    this.errorMessage = null;

    if (this.userId === null) {
      this.errorMessage = 'ID do usuário não fornecido.';
      this.loading = false;
      return;
    }

    while (this.setoresFormArray.length !== 0) {
      this.setoresFormArray.removeAt(0);
    }

    this.subscription.add(
      forkJoin([
        this.setorService.getSetores(),
        this.usuarioSetorService.getAssociacoesPorUsuario(this.userId? this.userId : 0 ) // Corrigido para lidar com undefined
      ]).subscribe({
        next: ([allSetores, userAssociations]) => {
          this.setoresDisponiveis = allSetores.filter(s => s.ativo);
          this.setoresAtuaisIds = userAssociations.map(assoc => assoc.idsetor);

          this.setoresDisponiveis.forEach(setor => {
            const isSelected = this.setoresAtuaisIds.includes(setor.id!);
            this.setoresFormArray.push(new FormControl(isSelected));
          });
          this.loading = false;
        },
        error: (err) => {
          console.error('Erro ao carregar dados de setores:', err);
          this.errorMessage = 'Erro ao carregar setores ou vínculos do usuário.';
          this.loading = false;
        }
      })
    );
  }

  onCheckboxChange(event: Event, setorId: number): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      if (!this.setoresAtuaisIds.includes(setorId)) {
        this.setoresAtuaisIds.push(setorId);
      }
    } else {
      this.setoresAtuaisIds = this.setoresAtuaisIds.filter(id => id !== setorId);
    }
  }

  async onSave(): Promise<void> {
    if (this.userId === null) {
      this.errorMessage = 'Erro: Usuário não identificado para salvar setores.';
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const currentAssociations = await this.usuarioSetorService.getAssociacoesPorUsuario(this.userId?this.userId:0).toPromise();
    const currentSetorIds = currentAssociations?.map(assoc => assoc.idsetor) || [];

    const associationsToAdd = this.setoresAtuaisIds.filter(id => !currentSetorIds.includes(id));
    const associationsToRemove = currentAssociations?.filter(assoc => !this.setoresAtuaisIds.includes(assoc.idsetor)) || [];

    const operations: Observable<any>[] = [];

    associationsToAdd.forEach(idsetor => {
      operations.push(this.usuarioSetorService.criarAssociacao({ idusuario: this.userId!, idsetor }));
    });

    associationsToRemove.forEach(assoc => {
      operations.push(this.usuarioSetorService.removerAssociacao(assoc.id!));
    });

    if (operations.length > 0) {
      this.subscription.add(
        forkJoin(operations).subscribe({
          next: () => {
            console.log('Setores do usuário sincronizados com sucesso!');
            this.closeModal(true);
          },
          error: (err) => {
            console.error('Erro ao sincronizar setores do usuário:', err);
            this.errorMessage = 'Erro ao sincronizar setores: ' + (err.error?.message || 'Erro desconhecido.');
            this.loading = false;
          }
        })
      );
    } else {
      console.log('Nenhuma alteração nos setores para salvar.');
      this.closeModal(true);
    }
  }

  closeModal(reloaded: boolean = false): void {
    this.visible = false;
    this.visibleChange.emit(this.visible);
    this.onClose.emit();
    this.resetModal();
  }

  private resetModal(): void {
    this.setoresDisponiveis = [];
    this.setoresAtuaisIds = [];
    while (this.setoresFormArray && this.setoresFormArray.length !== 0) {
      this.setoresFormArray.removeAt(0);
    }
    this.loading = false;
    this.errorMessage = null;
  }
}