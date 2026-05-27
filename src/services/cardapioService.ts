import { secureFetch } from '@/lib/secureFetch';

export interface AdicionalOpcao {
  _id: string;
  grupo_id: string;
  nome: string;
  preco: number;
  ativo: boolean;
  foto_adicional?: string;
}

export interface AdicionalGrupo {
  _id: string;
  restaurante_id: string;
  nome: string;
  tipo: 'adicional' | 'variacao';
  obrigatorio: boolean;
  min: number;
  max: number;
  ativo: boolean;
  opcoes?: AdicionalOpcao[];
}

export interface Prato {
  _id: string;
  restaurante_id: string;
  nome: string;
  descricao: string;
  preco: number;
  foto_prato?: string;
  secao: string;
  status: 'ativo' | 'inativo';
  adicionais_grupo_ids: (string | AdicionalGrupo)[];
}

export const cardapioService = {
  /**
   * Lista todos os pratos de um restaurante de forma plana (Array)
   */
  listarPratosPorRestaurante: async (restauranteId: string) => {
    const response = await secureFetch<{ data: { docs: Prato[] } }>({
      endpoint: `/pratos?restaurante_id=${restauranteId}`,
    });
    return response.data.docs;
  },

  criarPrato: async (dados: Partial<Prato>) => {
    const response = await secureFetch<{ data: Prato }>({
      endpoint: '/pratos',
      method: 'POST',
      body: dados,
    });
    return response.data;
  },

  atualizarPrato: async (id: string, dados: Partial<Prato>) => {
    const response = await secureFetch<{ data: Prato }>({
      endpoint: `/pratos/${id}`,
      method: 'PATCH',
      body: dados,
    });
    return response.data;
  },

  deletarPrato: async (id: string) => {
    await secureFetch({
      endpoint: `/pratos/${id}`,
      method: 'DELETE',
    });
  },

  uploadFotoPrato: async (id: string, file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const response = await secureFetch({
            endpoint: `/pratos/${id}/foto`,
            method: 'POST',
            bodyType: 'formData',
            formData: {
              file: base64,
              fileName: file.name
            }
          });
          resolve(response);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = error => reject(error);
    });
  },

  // --- Adicionais ---

  listarGruposAdicionais: async (restauranteId: string) => {
    const response = await secureFetch<{ data: AdicionalGrupo[] }>({
      endpoint: `/adicionais/grupos?restaurante_id=${restauranteId}`,
    });
    return response.data;
  },

  buscarGrupoAdicional: async (id: string) => {
    const response = await secureFetch<{ data: AdicionalGrupo }>({
      endpoint: `/adicionais/grupos/${id}`,
    });
    return response.data;
  },

  criarGrupoAdicional: async (dados: Partial<AdicionalGrupo>) => {
    const response = await secureFetch<{ data: AdicionalGrupo }>({
      endpoint: '/adicionais/grupos',
      method: 'POST',
      body: dados,
    });
    return response.data;
  },

  atualizarGrupoAdicional: async (id: string, dados: Partial<AdicionalGrupo>) => {
    const response = await secureFetch<{ data: AdicionalGrupo }>({
      endpoint: `/adicionais/grupos/${id}`,
      method: 'PATCH',
      body: dados,
    });
    return response.data;
  },

  deletarGrupoAdicional: async (id: string) => {
    await secureFetch({
      endpoint: `/adicionais/grupos/${id}`,
      method: 'DELETE',
    });
  },

  // --- Opções de Adicionais ---

  listarOpcoesAdicionais: async (grupoId: string) => {
    const response = await secureFetch<{ data: AdicionalOpcao[] }>({
      endpoint: `/adicionais/grupos/${grupoId}/opcoes`,
    });
    return response.data;
  },

  criarOpcaoAdicional: async (dados: Partial<AdicionalOpcao>) => {
    const response = await secureFetch<{ data: AdicionalOpcao }>({
      endpoint: '/adicionais/opcoes',
      method: 'POST',
      body: dados,
    });
    return response.data;
  },

  atualizarOpcaoAdicional: async (id: string, dados: Partial<AdicionalOpcao>) => {
    const response = await secureFetch<{ data: AdicionalOpcao }>({
      endpoint: `/adicionais/opcoes/${id}`,
      method: 'PATCH',
      body: dados,
    });
    return response.data;
  },

  deletarOpcaoAdicional: async (id: string) => {
    await secureFetch({
      endpoint: `/adicionais/opcoes/${id}`,
      method: 'DELETE',
    });
  },

  uploadFotoAdicional: async (id: string, file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const response = await secureFetch({
            endpoint: `/adicionais/opcoes/${id}/foto`,
            method: 'POST',
            bodyType: 'formData',
            formData: {
              file: base64,
              fileName: file.name
            }
          });
          resolve(response);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = error => reject(error);
    });
  },

  excluirFotoOpcaoAdicional: async (id: string) => {
    await secureFetch({
      endpoint: `/adicionais/opcoes/${id}/foto`,
      method: 'DELETE',
    });
  }
};
