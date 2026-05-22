import { secureFetch } from '@/lib/secureFetch';

export interface Usuario {
  _id: string;
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  foto_perfil?: string;
}

export const usuarioService = {
  buscarPerfil: async () => {
    const response = await secureFetch<{ data: Usuario }>({
      endpoint: '/usuario/perfil',
    });
    return response.data;
  },

  buscarPorID: async (id: string) => {
    const response = await secureFetch<{ data: Usuario }>({
      endpoint: `/usuarios/${id}`,
    });
    return response.data;
  },

  atualizar: async (id: string, dados: Partial<Usuario>) => {
    const response = await secureFetch<{ data: Usuario }>({
      endpoint: `/usuarios/${id}`,
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
            endpoint: `/usuarios/${id}/foto`,
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
      endpoint: `/usuarios/${id}/foto`,
      method: 'DELETE',
    });
  }
};
