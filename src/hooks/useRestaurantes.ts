// src/hooks/useRestaurantes.ts

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { restauranteService, Restaurante } from "@/services/restauranteService";
import { enderecoService, Endereco } from "@/services/enderecoService";
import { toast } from "sonner";

export function useMeusRestaurantes() {
  return useQuery({
    queryKey: queryKeys.restaurantes.meus,
    queryFn: restauranteService.listarMeus,
  });
}

export function useEnderecoRestaurante(restauranteId?: string) {
  return useQuery({
    queryKey: ['endereco', restauranteId],
    queryFn: () => enderecoService.buscarPorRestaurante(restauranteId!),
    enabled: !!restauranteId,
  });
}

export function useRestauranteMutations(restauranteId?: string) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (dados: Partial<Restaurante>) => {
      if (restauranteId) {
        return restauranteService.atualizar(restauranteId, dados);
      }
      return restauranteService.criar(dados);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurantes.meus });
      if (restauranteId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.restaurantes.detalhes(restauranteId) });
      }
      toast.success("Dados do restaurante salvos!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao salvar restaurante.");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: 'aberto' | 'fechado') => {
      if (!restauranteId) throw new Error("ID do restaurante não fornecido");
      return restauranteService.atualizar(restauranteId, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurantes.meus });
      if (restauranteId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.restaurantes.detalhes(restauranteId) });
      }
      toast.success("Status atualizado!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar status.");
    },
  });

  const uploadFotoMutation = useMutation({
    mutationFn: (file: File) => {
      if (!restauranteId) throw new Error("ID do restaurante não fornecido");
      return restauranteService.uploadFoto(restauranteId, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurantes.meus });
      if (restauranteId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.restaurantes.detalhes(restauranteId) });
      }
      toast.success("Foto atualizada!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao fazer upload.");
    },
  });

  const deleteFotoMutation = useMutation({
    mutationFn: () => {
      if (!restauranteId) throw new Error("ID do restaurante não fornecido");
      return restauranteService.excluirFoto(restauranteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurantes.meus });
      if (restauranteId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.restaurantes.detalhes(restauranteId) });
      }
      toast.success("Foto removida!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao remover foto.");
    },
  });

  const saveEnderecoMutation = useMutation({
    mutationFn: ({ restauranteId, enderecoId, dados }: { restauranteId: string; enderecoId?: string; dados: Partial<Endereco> }) => {
      if (enderecoId) {
        return enderecoService.atualizarDeRestaurante(restauranteId, enderecoId, dados);
      }
      return enderecoService.criarParaRestaurante(restauranteId, dados);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['endereco', variables.restauranteId] });
      toast.success("Endereço salvo com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao salvar endereço.");
    },
  });

  const deleteRestauranteMutation = useMutation({
    mutationFn: () => {
      if (!restauranteId) throw new Error("ID do restaurante não fornecido");
      return restauranteService.deletar(restauranteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurantes.meus });
      toast.success("Restaurante excluído com sucesso.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao excluir restaurante.");
    },
  });

  return {
    saveRestaurante: updateMutation.mutate,
    isSaving: updateMutation.isPending,
    saveStatus: updateStatusMutation.mutate,
    isSavingStatus: updateStatusMutation.isPending,
    uploadFoto: uploadFotoMutation.mutate,
    isUploading: uploadFotoMutation.isPending,
    deleteFoto: deleteFotoMutation.mutate,
    isDeleting: deleteFotoMutation.isPending,
    saveEndereco: saveEnderecoMutation.mutate,
    isSavingEndereco: saveEnderecoMutation.isPending,
    deleteRestaurante: deleteRestauranteMutation.mutate,
    isDeletingRestaurante: deleteRestauranteMutation.isPending,
  };
}
