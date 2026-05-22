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

export function useRestauranteMutations(id?: string) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (dados: Partial<Restaurante>) => {
      if (id) {
        return restauranteService.atualizar(id, dados);
      }
      return restauranteService.criar(dados);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurantes.meus });
      toast.success("Dados do restaurante salvos!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao salvar restaurante.");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: 'aberto' | 'fechado') => {
      return restauranteService.atualizar(id!, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurantes.meus });
      toast.success("Status atualizado!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar status.");
    },
  });

  const uploadFotoMutation = useMutation({
    mutationFn: (file: File) => restauranteService.uploadFoto(id!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurantes.meus });
      toast.success("Foto atualizada!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao fazer upload.");
    },
  });

  const deleteFotoMutation = useMutation({
    mutationFn: () => restauranteService.excluirFoto(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.restaurantes.meus });
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
  };
}
