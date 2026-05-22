// src/hooks/useSignup.ts

"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/services/api";
import { SignupData } from "@/lib/validations/auth";

export function useSignup() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: SignupData) => {
      const response = await api.post('/signup', {
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        role: "restaurante",
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Conta criada com sucesso! Faça login para continuar.");
      router.push("/login");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao criar conta.");
    },
  });
}
