// src/hooks/useCardapio.ts

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { cardapioService, Prato, AdicionalGrupo } from "@/services/cardapioService";
import { toast } from "sonner";

export function usePratosRestaurante(restauranteId?: string) {
  return useQuery({
    queryKey: queryKeys.cardapio.porRestaurante(restauranteId || ""),
    queryFn: () => cardapioService.listarPratosPorRestaurante(restauranteId!),
    enabled: !!restauranteId,
  });
}

export function useGruposAdicionais(restauranteId?: string) {
  return useQuery({
    queryKey: ['adicionais-grupos', restauranteId],
    queryFn: () => cardapioService.listarGruposAdicionais(restauranteId!),
    enabled: !!restauranteId,
  });
}

export function usePratoMutations(restauranteId: string) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (dados: Partial<Prato>) => cardapioService.criarPrato({ ...dados, restaurante_id: restauranteId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cardapio.porRestaurante(restauranteId) });
      toast.success("Prato adicionado ao cardápio!");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dados }: { id: string; dados: Partial<Prato> }) => cardapioService.atualizarPrato(id, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cardapio.porRestaurante(restauranteId) });
      toast.success("Prato atualizado com sucesso!");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cardapioService.deletarPrato(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cardapio.porRestaurante(restauranteId) });
      toast.success("Prato removido do cardápio!");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const uploadFotoPratoMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => cardapioService.uploadFotoPrato(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cardapio.porRestaurante(restauranteId) });
      toast.success("Foto do prato atualizada!");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return {
    createPrato: createMutation.mutate,
    updatePrato: updateMutation.mutate,
    deletePrato: deleteMutation.mutate,
    uploadFotoPrato: uploadFotoPratoMutation.mutate,
    isProcessing: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || uploadFotoPratoMutation.isPending,
  };
}

export function useAdicionalMutations(restauranteId?: string) {
    const queryClient = useQueryClient();

    const createGrupo = useMutation({
        mutationFn: (dados: Partial<AdicionalGrupo>) => cardapioService.criarGrupoAdicional({ ...dados, restaurante_id: restauranteId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adicionais-grupos', restauranteId] });
            toast.success("Grupo de adicionais criado!");
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const updateGrupo = useMutation({
        mutationFn: ({ id, dados }: { id: string; dados: Partial<AdicionalGrupo> }) => cardapioService.atualizarGrupoAdicional(id, dados),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adicionais-grupos', restauranteId] });
            toast.success("Grupo atualizado!");
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const deleteGrupo = useMutation({
        mutationFn: (id: string) => cardapioService.deletarGrupoAdicional(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adicionais-grupos', restauranteId] });
            toast.success("Grupo removido!");
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const uploadFotoAdicionalMutation = useMutation({
        mutationFn: ({ id, file }: { id: string; file: File }) => cardapioService.uploadFotoAdicional(id, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adicionais-opcoes'] });
            toast.success("Foto do adicional atualizada!");
        },
        onError: (error: Error) => toast.error(error.message),
    });

    const deleteFotoAdicionalMutation = useMutation({
        mutationFn: (id: string) => cardapioService.excluirFotoOpcaoAdicional(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adicionais-opcoes'] });
            toast.success("Foto removida!");
        },
        onError: (error: Error) => toast.error(error.message),
    });

    return {
        createGrupo: createGrupo.mutate,
        updateGrupo: updateGrupo.mutate,
        deleteGrupo: deleteGrupo.mutate,
        uploadFotoAdicional: uploadFotoAdicionalMutation.mutate,
        deleteFotoAdicional: deleteFotoAdicionalMutation.mutate,
        isUploadingAdicional: uploadFotoAdicionalMutation.isPending,
        isDeletingFotoAdicional: deleteFotoAdicionalMutation.isPending,
        isProcessingGrupo: createGrupo.isPending || updateGrupo.isPending || deleteGrupo.isPending,
    };
}
