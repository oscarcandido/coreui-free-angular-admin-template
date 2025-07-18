// src/app/pops/components/pop-list/pop-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { Router } from '@angular/router'; // NOVO: Importa o Router

// CoreUI Modules & Directives (manter apenas o necessário para a listagem e modal de exclusão)
import {
  TableModule,
  CardModule,
  GridModule,
  ButtonModule,
  ModalModule, // Manter para a modal de exclusão
  ModalHeaderComponent,
  ModalBodyComponent,
  ModalFooterComponent,
  TooltipModule // Manter para tooltips
} from '@coreui/angular';
// Ícones: remover cilDescription, cilPlus que serão movidos. Manter cilPencil, cilTrash, cilList.
import { cilPencil, cilTrash, cilList, cilPlus } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';

// Nossos serviços e modelos
import { Pop } from '../../models/pop.model'; // Importa a interface Pop
import { PopService } from '../../services/pop.service';
import { TipoPop } from '../../../tipo-pops/models/tipo-pop.model'; // Importa a interface TipoPop
import { TipoPopService } from '../../../tipo-pops/services/tipo-pop.service';
import { Setor, SetorService } from '../../../setores/services/setor.service';

// REMOVER: PopRevisoesModalComponent não será mais importado aqui
// import { PopRevisoesModalComponent } from '../pop-revisoes-modal/pop-revisoes-modal.component';


@Component({
  selector: 'app-pop-list',
  templateUrl: './pop-list.component.html',
  styleUrls: ['./pop-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    // Remover ReactiveFormsModule
    TableModule,
    CardModule,
    GridModule,
    ButtonModule,
    IconDirective,
    ModalModule,
    ModalHeaderComponent,
    ModalBodyComponent,
    ModalFooterComponent,
    // Remover diretivas de formulário: FormControlDirective, FormDirective, FormFloatingDirective,
    // InputGroupComponent, InputGroupTextDirective, FormCheckComponent, FormLabelDirective, FormSelectDirective
    TooltipModule,
    // REMOVER: PopRevisoesModalComponent
  ]
})
export class PopListComponent implements OnInit, OnDestroy {
  // Ícones: cilDescription e cilPlus foram removidos do uso aqui
  icons = { cilPencil, cilTrash, cilList, cilPlus };

  pops: Pop[] = [];
  tiposPop: TipoPop[] = [];
  setores: Setor[] = [];

  loading: boolean = true;
  errorMessage: string | null = null;
  private subscription: Subscription = new Subscription();

  // REMOVER: showCrudModal, isEditing, currentPopId, popForm (e métodos relacionados)

  showDeleteConfirmModal: boolean = false;
  popToDelete: Pop | null = null;

  // REMOVER: showRevisoesModal, selectedPopForRevisoes (e métodos relatedos)

  constructor(
    private popService: PopService,
    private tipoPopService: TipoPopService,
    private setorService: SetorService,
    private router: Router // NOVO: Injeção do Router
  ) { }

  ngOnInit(): void {
    // REMOVER: this.initForm();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // REMOVER: initForm()
  // REMOVER: get f()

  loadInitialData(): void {
    this.loading = true;
    this.errorMessage = null;

    forkJoin({
      pops: this.popService.getPops(),
      tiposPop: this.tipoPopService.getTiposPopAtivos(),
      setores: this.setorService.getSetores()
    }).subscribe({
      next: (data) => {
        this.pops = data.pops;
        this.tiposPop = data.tiposPop;
        this.setores = data.setores.filter(s => s.ativo);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar dados iniciais:', err);
        this.errorMessage = 'Erro ao carregar POPs, tipos de POP ou setores.';
        this.loading = false;
      }
    });
  }

  getTipoPopNome(idTipoPop: number | undefined): string {
    if (idTipoPop === undefined || idTipoPop === null) {
      return 'N/A';
    }
    const tipo = this.tiposPop.find(t => t.id === idTipoPop);
    return tipo ? tipo.nome : 'N/A';
  }

  getSetorNome(idSetor: number | undefined): string {
    if (idSetor === undefined || idSetor === null) {
      return 'N/A';
    }
    const setor = this.setores.find(s => s.id === idSetor);
    return setor ? setor.nome : 'N/A';
  }

  // NOVO: Método para redirecionar para a tela de criação de POP
  onCreateNewPop(): void {
    this.router.navigate(['/pops/new']); // Redireciona para a nova rota de criação/gerenciamento
  }

  // NOVO: Método para redirecionar para a tela de edição de POP
  onEditPop(pop: Pop): void {
    if (pop.id) {
      this.router.navigate(['/pops/edit', pop.id]); // Redireciona para /pops/edit/{id}
    }
  }

  // NOVO: Método para redirecionar para a tela de gerenciamento de revisões (que será no PopManageComponent)
  onManageRevisoes(pop: Pop): void {
    if (pop.id) {
      this.router.navigate(['/pops/revisoes', pop.id]); // Redireciona para /pops/revisoes/{id}
      // Ou, se a edição e revisão forem na mesma tela, você pode ter uma rota única:
      // this.router.navigate(['/pops/manage', pop.id], { queryParams: { tab: 'revisoes' } });
    }
  }

  onDeleteConfirm(pop: Pop): void {
    this.popToDelete = pop;
    this.showDeleteConfirmModal = true;
  }

  onDeleteCancel(): void {
    this.showDeleteConfirmModal = false;
    this.popToDelete = null;
  }

  onDelete(): void {
    if (this.popToDelete && this.popToDelete.id) {
      this.loading = true;
      this.errorMessage = null;
      this.subscription.add(
        this.popService.deletePop(this.popToDelete.id).subscribe({
          next: () => {
            console.log('POP removido com sucesso!');
            this.showDeleteConfirmModal = false;
            this.loading = false;
            this.loadInitialData();
            this.popToDelete = null;
          },
          error: (err) => {
            console.error('Erro ao remover POP:', err);
            this.errorMessage = 'Erro ao remover POP: ' + (err.error?.message || 'Erro desconhecido.');
            this.loading = false;
          }
        })
      );
    }
  }

  onDeleteConfirmModalVisibleChange(isVisible: boolean): void {
    this.showDeleteConfirmModal = isVisible;
    if (!isVisible) {
      this.popToDelete = null;
    }
  }


}