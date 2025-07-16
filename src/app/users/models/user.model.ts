import { GrupoUsuario } from '../../grupo-usuarios/services/grupo-usuario.service'; // Certifique-se do caminho correto
// Removido import de Setor aqui, pois User não carregará setores diretamente

export interface User {
  id?: number;
  nome: string;
  email: string;
  senha?: string;
  idgrupo_usuarios: number;
  grupoUsuario?: GrupoUsuario;
  ativo?: boolean;

}

