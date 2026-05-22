// src/hooks/useUserProfile.ts

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { useAuth } from "./useAuth";
import { usuarioService, Usuario } from "@/services/usuarioService";
import { toast } from "sonner";

export function useUserProfile(userId?: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: userId ? [...queryKeys.usuario.perfil, userId] : queryKeys.usuario.perfil,
    queryFn: () => userId ? usuarioService.buscarPorID(userId) : usuarioService.buscarPerfil(),
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

export function useUserMutations(userId?: string) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (dados: Partial<Usuario>) => usuarioService.atualizar(userId!, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.usuario.perfil });
      toast.success("Perfil atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar perfil.");
    }
  });

  const uploadFotoMutation = useMutation({
    mutationFn: (file: File) => usuarioService.uploadFoto(userId!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.usuario.perfil });
      toast.success("Foto de perfil atualizada!");
    },
    onError: () => {
      toast.error("Erro ao fazer upload da foto.");
    }
  });

  const deleteFotoMutation = useMutation({
    mutationFn: () => usuarioService.excluirFoto(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.usuario.perfil });
      toast.success("Foto de perfil removida!");
    },
    onError: () => {
      toast.error("Erro ao remover foto.");
    }
  });

  return {
    updateUser: updateMutation.mutate,
    uploadFoto: uploadFotoMutation.mutate,
    deleteFoto: deleteFotoMutation.mutate,
    isSaving: updateMutation.isPending,
    isUploading: uploadFotoMutation.isPending,
    isDeleting: deleteFotoMutation.isPending
  };
}
