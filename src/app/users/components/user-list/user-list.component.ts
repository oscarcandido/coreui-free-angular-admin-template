import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription, forkJoin } from 'rxjs';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms'; // Removido FormArray e FormControl

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
import {  UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { GrupoUsuario, GrupoUsuarioService } from '../../../grupo-usuarios/services/grupo-usuario.service';
// import { SetorService } from '../../../setores/services/setor.service'; // NÃO PRECISA MAIS AQUI
// import { Setor } from '../../../models/setor.model'; // NÃO PRECISA MAIS AQUI
// import { UsuarioSetorService, UsuarioSetor } from '../../services/usuario-setor.service'; // NÃO PRECISA MAIS AQUI

// NOVO: Importa o componente da modal de setores
import { UserSetoresModalComponent } from '../user-setores-modal/user-setores-modal.component';


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
    FormCheckComponent,
    FormSelectDirective,
    UserSetoresModalComponent // Adicione o novo componente aqui
  ]
})
export class UserListComponent implements OnInit, OnDestroy {
  icons = { cilUser, cilPlus, cilSettings, cilPencil };
  users: User[] = [];
  grupos: GrupoUsuario[] = [];
  // setoresDisponiveis: Setor[] = []; // Removido
  // setoresSelecionadosIds: number[] = []; // Removido

  loading: boolean = true;
  errorMessage: string | null = null;
  private subscription: Subscription = new Subscription();

  showCrudModal: boolean = false; // Modal de CRUD de usuário
  showSetoresModal: boolean = false; // NOVA: Modal de vínculos de setores
  selectedUserForSetores: User | null = null; // Usuário selecionado para vincular setores

  isEditing: boolean = false;
  currentUserId: number | null = null;
  userForm!: FormGroup;

  constructor(
    private userService: UserService,
    private grupoUsuarioService: GrupoUsuarioService,
    // private setorService: SetorService, // Removido
    // private usuarioSetorService: UsuarioSetorService, // Removido
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
      idGrupoUsuario: [null, Validators.required],
      ativo: [true],
      // setores: this.fb.array([]) // Removido
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
  // get setoresFormArray() { // Removido
  //   return this.userForm.controls['setores'] as FormArray;
  // }

  loadInitialData(): void {
    this.loading = true;
    this.errorMessage = null;

    forkJoin({
      users: this.userService.getUsers(),
      grupos: this.grupoUsuarioService.getGrupos(),
      // setores: this.setorService.getSetores() // Removido
    }).subscribe({
      next: (data) => {
        this.users = (data as any).users;
        this.grupos = (data as any).grupos.filter((g: any) => g.ativo);
        // this.setoresDisponiveis = (data as any).setores.filter((s: any) => s.ativo); // Removido
        this.loading = false;

        // AQUI: Se você quiser exibir os setores de um usuário na tabela principal,
        // o ideal é que a API de usuários já retorne isso.
        // Caso contrário, você precisaria fazer uma chamada assíncrona por usuário AQUI
        // ou criar um pipe para buscar e formatar os nomes dos setores.
        // Por simplicidade, vamos remover `getSetoresNomes` da exibição da lista por enquanto,
        // ou assumir que sua API de user já traz uma propriedade `setoresAssociados`.
        // Se a API do usuário não traz os setores, essa coluna será vazia ou um placeholder.
      },
      error: (err) => {
        console.error('Erro ao carregar dados iniciais:', err);
        this.errorMessage = 'Erro ao carregar usuários ou grupos.';
        this.loading = false;
      }
    });
  }

  getGrupoNome(idGrupo: number | undefined): string {
    if (idGrupo === undefined || idGrupo === null) {
      return 'N/A';
    }
    const grupo = this.grupos.find(g => g.id === idGrupo);
    return grupo ? grupo.nome : 'N/A';
  }

  // getSetoresNomes(setores: Setor[] | undefined): string { // Removido
  //   if (!setores || setores.length === 0) {
  //     return 'Nenhum';
  //   }
  //   return setores.map(s => s.nome).join(', ');
  // }

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
    // this.setoresSelecionadosIds = []; // Removido
    // this.clearSetoresFormArray(); // Removido
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
      idGrupoUsuario: user.idgrupo_usuarios, 
      ativo: user.ativo ?? true
    });

    // NOVO: Carregar os setores associados ao usuário para preencher o FormArray
    // this.setoresSelecionadosIds = []; // Removido
    // this.clearSetoresFormArray(); // Removido

    this.showCrudModal = true;
  }

  // onSetorChange(event: Event, setorId: number): void { // Removido
  //   const isChecked = (event.target as HTMLInputElement).checked;
  //   if (isChecked) {
  //     this.setoresSelecionadosIds.push(setorId);
  //   } else {
  //     this.setoresSelecionadosIds = this.setoresSelecionadosIds.filter(id => id !== setorId);
  //   }
  // }

  // private clearSetoresFormArray(): void { // Removido
  //   while (this.setoresFormArray.length !== 0) {
  //     this.setoresFormArray.removeAt(0);
  //   }
  // }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const userData: User = this.userForm.value;
    // const selectedSetorIds = this.setoresSelecionadosIds; // Removido

    let operation$: Observable<User | any>;

    if (this.isEditing && this.currentUserId) {
      const { id, senha, /*setores,*/ ...dataToUpdate } = userData; // Remova 'setores' daqui
      if (senha) {
        operation$ = this.userService.updateUser(this.currentUserId, { ...dataToUpdate, senha });
      } else {
        operation$ = this.userService.updateUser(this.currentUserId, dataToUpdate);
      }
    } else {
      const { /*setores,*/ ...dataToCreate } = userData; // Remova 'setores' daqui
      operation$ = this.userService.createUser(dataToCreate);
    }

    this.subscription.add(
      operation$.subscribe({
        next: (response) => {
          // const userId = this.isEditing ? this.currentUserId : response.id; // Não precisa mais sincronizar setores aqui
          console.log(`Usuário ${this.isEditing ? 'atualizado' : 'criado'} com sucesso!`, response);
          this.handleSubmissionSuccess();
        },
        error: (err) => {
          console.error(`Erro ao ${this.isEditing ? 'atualizar' : 'criar'} usuário:`, err);
          this.errorMessage = `Erro ao ${this.isEditing ? 'atualizar' : 'criar'} o usuário: ` + (err.error?.message || 'Erro desconhecido.');
          this.loading = false;
        }
      })
    );
  }

  // private syncUserSetores(userId: number, newSetorIds: number[]): void { // Removido
  //   // Lógica de sincronização movida para o UserSetoresModalComponent
  // }

  private handleSubmissionSuccess(): void {
    this.showCrudModal = false;
    this.loading = false;
    this.loadInitialData(); // Recarrega todos os dados para refletir as mudanças
    this.resetModalState();
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
    // this.setoresSelecionadosIds = []; // Removido
    // this.clearSetoresFormArray(); // Removido
  }

  /**
   * NOVO MÉTODO: Abre a modal de setores para um usuário específico.
   * @param user O usuário para o qual os setores serão vinculados.
   */
  openSetoresModal(user: User): void {
    this.selectedUserForSetores = user;
    this.showSetoresModal = true;
  }

  /**
   * NOVO MÉTODO: Lida com o fechamento da modal de setores.
   */
  onCloseSetoresModal(): void {
    this.showSetoresModal = false;
    this.selectedUserForSetores = null;
    this.loadInitialData(); // Recarrega a lista para mostrar os setores atualizados
  }
}