import { secureFetch } from '@/lib/secureFetch';

export interface Restaurante {
  _id: string;
  nome: string;
  descricao?: string;
  telefone?: string;
  foto_restaurante?: string;
  link_banner?: string;
  dono_id: string;
  categoria_ids: string[];
  secoes_cardapio?: string[];
  cnpj?: string;
  status: 'aberto' | 'fechado' | 'inativo';
  ativo: boolean;
  taxa_entrega?: number;
  estimativa_entrega_min?: number;
  estimativa_entrega_max?: number;
  horario_funcionamento?: {
    dia: 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo';
    abertura: string;
    fechamento: string;
    fechado: boolean;
  }[];
}

export const restauranteService = {
  listarMeus: async () => {
    const response = await secureFetch<{ data: { docs: Restaurante[] } }>({
      endpoint: '/restaurantes/meus',
    });
    return response.data;
  },
  
  buscarPorId: async (id: string) => {
    const response = await secureFetch<{ data: Restaurante }>({
      endpoint: `/restaurantes/${id}`,
    });
    return response.data;
  },

  criar: async (dados: Partial<Restaurante>) => {
    const response = await secureFetch<{ data: Restaurante }>({
      endpoint: '/restaurantes',
      method: 'POST',
      body: dados,
    });
    return response.data;
  },

  atualizar: async (id: string, dados: Partial<Restaurante>) => {
    const response = await secureFetch<{ data: Restaurante }>({
      endpoint: `/restaurantes/${id}`,
      method: 'PATCH',
      body: dados,
    });
    return response.data;
  },

  uploadFoto: async (id: string, file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const response = await secureFetch({
            endpoint: `/restaurantes/${id}/foto`,
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

  excluirFoto: async (id: string) => {
    await secureFetch({
      endpoint: `/restaurantes/${id}/foto`,
      method: 'DELETE',
    });
  }
};
