// src/hooks/useEnderecos.ts

"use client";

import { useQuery } from "@tanstack/react-query";
import { enderecoService } from "@/services/enderecoService";

export function useEnderecoUsuario(usuarioId?: string) {
  return useQuery({
    queryKey: ['endereco-usuario', usuarioId],
    queryFn: () => enderecoService.listarPorUsuario(usuarioId!),
    enabled: !!usuarioId,
  });
}
