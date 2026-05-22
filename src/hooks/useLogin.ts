// src/hooks/useLogin.ts

"use client";

import { useMutation } from "@tanstack/react-query";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface LoginParams {
  email: string;
  senha: string;
  callbackUrl?: string;
}

export default function useLogin() {
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: async ({ email, senha }: LoginParams) => {
      // Faz requisição direta à API primeiro para capturar erro específico
      try {
        const apiLoginResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, senha }),
        });

        if (!apiLoginResponse.ok) {
          const errorData = await apiLoginResponse.json();
          throw new Error(errorData.message || 'Credenciais inválidas');
        }
      } catch (error) {
        throw error;
      }

      // Autenticação via NextAuth
      const res = await signIn("credentials", {
        email,
        password: senha,
        redirect: false,
      });

      if (res?.ok) {
        return { ok: true };
      }

      throw new Error(res?.error || "Erro ao autenticar");
    },
    onSuccess: async () => {
      toast.success("Login realizado com sucesso!");
      
      // Dá um pequeno tempo para o NextAuth processar o cookie se necessário
      // mas já tenta o redirecionamento
      setTimeout(() => {
        router.push('/dashboard');
        // Fallback hard redirect se o soft falhar
        setTimeout(() => {
          if (window.location.pathname === '/login') {
            window.location.href = '/dashboard';
          }
        }, 1000);
      }, 100);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao realizar login");
    },
  });

  return {
    login: loginMutation.mutate,
    isLoading: loginMutation.isPending,
    isError: loginMutation.isError,
    error: loginMutation.error,
  };
}
