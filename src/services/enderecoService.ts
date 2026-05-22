import { secureFetch } from '@/lib/secureFetch';

export interface Endereco {
  _id: string;
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  complemento?: string;
  cidade: string;
  estado: string;
  principal: boolean;
  restaurante_id?: string;
}

export const enderecoService = {
  buscarPorRestaurante: async (restauranteId: string) => {
    const response = await secureFetch<{ data: Endereco }>({
      endpoint: `/restaurantes/${restauranteId}/enderecos`,
    });
    return response.data;
  },

  criarParaRestaurante: async (restauranteId: string, dados: Partial<Endereco>) => {
    const response = await secureFetch<{ data: Endereco }>({
      endpoint: `/restaurantes/${restauranteId}/enderecos`,
      method: 'POST',
      body: dados,
    });
    return response.data;
  },

  atualizarDeRestaurante: async (restauranteId: string, enderecoId: string, dados: Partial<Endereco>) => {
    const response = await secureFetch<{ data: Endereco }>({
      endpoint: `/restaurantes/${restauranteId}/enderecos/${enderecoId}`,
      method: 'PATCH',
      body: dados,
    });
    return response.data;
  },

  listarPorUsuario: async (usuarioId: string) => {
    const response = await secureFetch<{ data: Endereco[] }>({
      endpoint: `/usuarios/${usuarioId}/enderecos`,
    });
    return response.data;
  }
};
