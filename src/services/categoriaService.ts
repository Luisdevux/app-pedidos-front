import { secureFetch } from '@/lib/secureFetch';

export interface Categoria {
  _id: string;
  nome: string;
  icone_categoria?: string;
}

export const categoriaService = {
  listar: async () => {
    const response = await secureFetch<{ data: { docs: Categoria[] } }>({
      endpoint: '/categorias?limit=100',
    });
    return response.data;
  }
};
