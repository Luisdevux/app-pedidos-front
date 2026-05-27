import { secureFetch } from '@/lib/secureFetch';

export interface Pedido {
  _id: string;
  cliente_id?: {
    _id: string;
    nome: string;
    email: string;
    telefone?: string;
    cpf?: string;
  };
  usuario_id?: {
    _id: string;
    nome: string;
    email: string;
    telefone?: string;
    cpf?: string;
  };
  restaurante_id: string;
  itens: Array<{
    prato_id: {
      nome: string;
      preco: number;
    } | null;
    prato_nome?: string;
    quantidade: number;
    preco_unitario: number;
    total_item: number;
    adicionais?: Array<{
        opcao_id: string;
        opcao_nome: string;
        preco_unitario: number;
        quantidade: number;
    }>;
  }>;
  status: 'criado' | 'em_preparo' | 'a_caminho' | 'entregue' | 'cancelado';
  total_pedido?: number;
  totais?: {
    subtotal: number;
    taxa_entrega: number;
    total: number;
  };
  forma_pagamento: string;
  createdAt: string;
}

export const pedidoService = {
  listarPorRestaurante: async (restauranteId: string, params?: Record<string, string | number>) => {
    const response = await secureFetch<{ data: { docs: Pedido[] } }>({
      endpoint: `/pedidos/restaurante/${restauranteId}`,
      params: params as Record<string, string>,
    });
    return response.data;
  },

  atualizarStatus: async (id: string, status: Pedido['status']) => {
    const response = await secureFetch<{ data: Pedido }>({
      endpoint: `/pedidos/${id}/status`,
      method: 'PATCH',
      body: { status },
    });
    return response.data;
  }
};
