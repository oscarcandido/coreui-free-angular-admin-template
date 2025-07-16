// src/app/views/cadastro/cadastro.routes.ts
import { Routes } from '@angular/router';
import { GrupoUsuarioListComponent } from '../../grupo-usuarios/components/grupo-usuario-list/grupo-usuario-list.component';
import { SetorListComponent } from '../../setores/components/setor-list/setor-list.component';
import { UserListComponent } from '../../users/components/user-list/user-list.component';
// Importe o GrupoUsuarioFormComponent aqui quando ele for criado
// import { GrupoUsuarioFormComponent } from '../../grupo-usuarios/components/grupo-usuario-form/grupo-usuario-form.component';

export const routes: Routes = [
  {
    path: '', // Rota base para cadastros (ex: /cadastro)
    redirectTo: 'grupos', // Redireciona para a listagem de grupos por padrão
    pathMatch: 'full'
  },
  {
    path: 'grupos', // Rota para listagem de grupos: /cadastro/grupos
    component: GrupoUsuarioListComponent,
    data: {
      title: 'Grupos de Usuários'
    }
  },
   { path: 'setores', 
    component: SetorListComponent,
    data: {
      title: 'Setores'
    }    
   },
   { path: 'usuarios', 
    component: UserListComponent ,
    data: {
      title: 'Usuarios'
    }    
   },
  // {
  //   path: 'grupos/novo', // Rota para criar novo grupo: /cadastro/grupos/novo
  //   component: GrupoUsuarioFormComponent,
  //   data: {
  //     title: 'Novo Grupo'
  //   }
  // },
  // {
  //   path: 'grupos/editar/:id', // Rota para editar grupo: /cadastro/grupos/editar/1
  //   component: GrupoUsuarioFormComponent,
  //   data: {
  //     title: 'Editar Grupo'
  //   }
  // }
];