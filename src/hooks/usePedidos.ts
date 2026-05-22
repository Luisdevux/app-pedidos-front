// src/hooks/usePedidos.ts

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { pedidoService, Pedido } from "@/services/pedidoService";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

export function usePedidosRestaurante(restauranteId?: string, params?: Record<string, string | number>) {
  const query = useQuery({
    queryKey: queryKeys.pedidos.porRestaurante(restauranteId || "", params),
    queryFn: () => pedidoService.listarPorRestaurante(restauranteId!, params),
    enabled: !!restauranteId,
    refetchInterval: 15000, // Refresh automático a cada 15 segundos
  });

  const prevCriadosCount = useRef<number | null>(null);

  useEffect(() => {
    if (query.data?.docs) {
      const currentCriados = query.data.docs.filter(p => p.status === 'criado').length;
      
      if (prevCriadosCount.current !== null && currentCriados > prevCriadosCount.current) {
        toast.info("Novo pedido recebido!", {
          description: "Um novo pedido acaba de chegar para o seu restaurante.",
          duration: 10000,
        });
        // Opcional: tocar um som aqui
      }
      
      prevCriadosCount.current = currentCriados;
    }
  }, [query.data]);

  return query;
}

export function usePedidoMutations(restauranteId: string) {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Pedido['status'] }) => 
      pedidoService.atualizarStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pedidos.porRestaurante(restauranteId) });
      toast.success("Status do pedido atualizado!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar status.");
    },
  });

  return {
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
  };
}
