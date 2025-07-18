// src/app/pops/components/pop-revisoes-modal/pop-revisoes-modal.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// CoreUI Modules & Directives
import {
  ModalModule,
  ModalHeaderComponent,
  ModalBodyComponent,
  ModalFooterComponent,
  ModalComponent,
  ButtonModule,
  TableModule,
  CardModule,
  CardHeaderComponent,
  CardBodyComponent,
  FormModule,
  FormControlDirective,
  FormLabelDirective,
  FormTextDirective,
  TooltipModule,
  GridModule
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { cilDescription, cilPlus, cilWarning, cilCheckCircle, cilPencil } from '@coreui/icons'; // Ícones para o formulário de revisão e status

// Nossos serviços e modelos
import {Revisao} from '../../../revisoes/models/revisao.model'; // Ajuste o caminho conforme sua estrutura
import { FormControl } from '@angular/forms';
import {  RevisaoService } from '../../../revisoes/services/revisao.service'; // Ajuste o caminho conforme sua estrutura
import { User } from '../../../users/models/user.model'; // Ajuste o caminho conforme sua estrutura
import { UserService } from '../../../users/services/user.service'; // Ajuste o caminho conforme sua estrutura

@Component({
  selector: 'app-pop-revisoes-modal',
  templateUrl: './pop-revisoes-modal.component.html',
  styleUrls: ['./pop-revisoes-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalModule,
    ModalHeaderComponent,
    ModalBodyComponent,
    ModalFooterComponent,
    ModalComponent,
    ButtonModule,
    TableModule,
    CardModule,
    CardHeaderComponent,
    CardBodyComponent,
    FormModule,
    FormControlDirective,
    FormLabelDirective,
    FormTextDirective,
    TooltipModule,
    GridModule,
    IconDirective
  ]
})
export class PopRevisoesModalComponent implements OnInit, OnChanges, OnDestroy {
  // Ícones a serem usados no template
  icons = { cilDescription, cilPlus, cilWarning, cilCheckCircle, cilPencil };

  // --- Inputs e Outputs para comunicação com o componente pai (PopListComponent) ---
  @Input() visible: boolean = false; // Controla a visibilidade da modal
  @Input() popId: number | null | undefined= undefined; // ID do POP cujas revisões serão exibidas
  @Input() popCodigo: string | undefined= undefined; // Código do POP (para exibição no título)
  @Input() popTarefa: string | undefined= undefined;  // Tarefa/Título do POP (para exibição no título)

  @Output() visibleChange = new EventEmitter<boolean>(); // Emite o estado de visibilidade de volta ao pai
  @Output() onClose = new EventEmitter<void>(); // Emite quando a modal deve ser fechada e o pai precisa recarregar dados

  // --- Propriedades de estado do componente ---
  revisoes: Revisao[] = []; // Lista de revisões do POP
  Users: User[] = []; // Lista de usuários para o campo "cadastrado por"
  revisaoForm!: FormGroup; // Formulário para criar nova revisão
  loading: boolean = false; // Indica se está carregando dados
  errorMessage: string |null| undefined= undefined; // Mensagens de erro

  private subscription: Subscription = new Subscription(); // Gerenciamento de subscriptions

  constructor(
    private fb: FormBuilder,
    private revisaoService: RevisaoService,
    private userService: UserService // Para obter a lista de usuários para o select
  ) { }

  ngOnInit(): void {
    this.initForm(); // Inicializa o formulário
    this.loadUsers(); // Carrega os usuários uma vez
  }

  // Monitora mudanças nos inputs (especialmente 'visible' e 'popId')
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      // Se a modal ficou visível e temos um popId, carregamos as revisões
      if (this.popId) {
        this.loadRevisoes(this.popId);
      }
      this.resetForm(); // Reseta o formulário toda vez que a modal abre
    } else if (changes['popId'] && this.popId && this.visible) {
      // Se o popId mudou e a modal já está visível, recarrega as revisões
      this.loadRevisoes(this.popId);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe(); // Desinscreve de todas as subscriptions
  }

  /**
   * Inicializa o formulário reativo para a nova revisão.
   */
  initForm(): void {
    this.revisaoForm = this.fb.group({
      descricao: ['', [Validators.maxLength(500)]], // Descrição da revisão
      idUser_cadastro: [null, Validators.required], // Usuário que cadastrou
      // A data_revisao e o 'numero' e 'vigente' são gerenciados pelo backend
      // Mas a data pode ser enviada como a data atual do frontend.
      // E a flag 'vigente' será true para a nova revisão, e o backend setará a anterior como false.
    });
  }

  /**
   * Getter para facilitar o acesso aos controles do formulário.
   */
  get f() { return this.revisaoForm.controls; }

  /**
   * Carrega a lista de usuários (para o dropdown de "Cadastrado por").
   */
  loadUsers(): void {
    this.subscription.add(
      this.userService.getUsers().subscribe({
        next: (data) => {
          this.Users = data.filter(u => u.ativo); // Filtra apenas usuários ativos
        },
        error: (err) => {
          console.error('Erro ao carregar usuários:', err);
          // Opcional: setar mensagem de erro específica para o dropdown de usuários
        }
      })
    );
  }

  /**
   * Carrega as revisões para o POP atualmente selecionado.
   * @param popId O ID do POP.
   */
  loadRevisoes(popId: number): void {
    this.loading = true;
    this.errorMessage = null;
    this.revisoes = []; // Limpa a lista antes de carregar

    this.subscription.add(
      this.revisaoService.getRevisoes(popId).subscribe({
        next: (data) => {
          this.revisoes = data.sort((a, b) => (b.numero ?? 0) - (a.numero ?? 0)); // Ordena por número de revisão decrescente
          this.loading = false;
        },
        error: (err) => {
          console.error('Erro ao carregar revisões:', err);
          this.errorMessage = 'Erro ao carregar revisões.';
          this.loading = false;
        }
      })
    );
  }

  /**
   * Retorna o nome do usuário dado seu ID.
   * @param idUser O ID do usuário.
   * @returns O nome do usuário ou 'N/A' se não encontrado.
   */
  getNomeUser(idUser: number | undefined): string {
    if (idUser === undefined || idUser === null) {
      return 'N/A';
    }
    const User = this.Users.find(u => u.id === idUser);
    return User ? User.nome : 'N/A';
  }

  /**
   * Lida com a submissão do formulário para criar uma nova revisão.
   */
  onSubmitRevisao(): void {
    if (this.revisaoForm.invalid || !this.popId) {
      this.revisaoForm.markAllAsTouched();
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios e selecione um POP válido.';
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const newRevisao: Revisao = {
      idpop: this.popId,
      data_revisao: new Date().toISOString(), // Data atual para a revisão
      idusuario_cadastro: this.revisaoForm.value.idUser_cadastro,
      descricao: this.revisaoForm.value.descricao,
      vigente: true, // A nova revisão sempre será vigente
      ativo: true // A nova revisão sempre será ativa
    };

    this.subscription.add(
      this.revisaoService.createRevisao(newRevisao).subscribe({
        next: (revisaoCriada) => {
          console.log('Revisão criada com sucesso:', revisaoCriada);
          this.resetForm(); // Limpa o formulário
          this.loadRevisoes(this.popId!); // Recarrega a lista de revisões
          this.onClose.emit(); // Emite para o pai recarregar a lista de POPs (se exibir revisão vigente)
        },
        error: (err) => {
          console.error('Erro ao criar revisão:', err);
          this.errorMessage = 'Erro ao criar a revisão: ' + (err.error?.message || 'Erro desconhecido.');
          this.loading = false;
        }
      })
    );
  }

  /**
   * Reseta o formulário da revisão.
   */
  resetForm(): void {
    this.revisaoForm.reset();
    this.revisaoForm.get('idUser_cadastro')?.setValue(null); // Garante que o select volte ao "Selecione"
    this.revisaoForm.markAsPristine();
    this.revisaoForm.markAsUntouched();
    this.loading = false;
    this.errorMessage = null;
  }

  /**
   * Fecha a modal e notifica o componente pai.
   */
  onCloseModal(): void {
    this.visible = false;
    this.visibleChange.emit(this.visible); // Notifica o pai sobre a mudança de visibilidade
    this.onClose.emit(); // Notifica o pai para recarregar os dados (caso haja atualização de revisão vigente)
    this.resetForm(); // Limpa o formulário ao fechar
  }
}