// src/lib/queryKeys.ts

export const queryKeys = {
  restaurantes: {
    all: ['restaurantes'] as const,
    meus: ['restaurantes', 'meus'] as const,
    detalhes: (id: string) => ['restaurantes', id] as const,
  },
  pedidos: {
    all: ['pedidos'] as const,
    porRestaurante: (id: string, params?: Record<string, unknown>) => ['pedidos', 'restaurante', id, params].filter(Boolean),
  },
  cardapio: {
    all: ['cardapio'] as const,
    porRestaurante: (id: string) => ['cardapio', id] as const,
  },
  categorias: {
    all: ['categorias'] as const,
  },
  usuario: {
    perfil: ['usuario', 'perfil'] as const,
  }
};
