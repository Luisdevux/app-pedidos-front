"use client";

import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginData } from "@/lib/validations/auth";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import useLogin from "@/hooks/useLogin";

export default function LoginForm() {
  const { login, isLoading: isLoginLoading } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginData) => {
    login({ email: data.email, senha: data.password });
  };

  const isSubmitting = isLoginLoading;

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-surface-white rounded-xl shadow-lg border border-border-gray">
      <div className="flex flex-col items-center text-center space-y-4">
        <Image src="/icone-rango.svg" alt="Rango Logo" width={80} height={80} className="mb-2" />
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Bem-vindo ao Rango</h1>
        <p className="text-text-secondary text-sm">Acesse o painel do seu restaurante</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="cursor-pointer">Email</Label>
          <Input
            id="email"
            {...register("email")}
            type="email"
            placeholder="contato@restaurante.com"
          />
          {errors.email && <p className="text-error-text text-xs">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" title="Senha" className="cursor-pointer">Senha</Label>
          <div className="relative">
            <Input
              id="password"
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-primary-green transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-error-text text-xs">{errors.password.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 text-base font-bold mt-2 cursor-pointer active:scale-95 transition-all"
        >
          {isSubmitting ? "Entrando..." : "Entrar na Conta"}
        </Button>
      </form>

      <div className="relative flex items-center justify-center py-2">
        <div className="border-t border-border-gray w-full"></div>
        <span className="absolute bg-surface-white px-3 text-xs font-semibold text-text-tertiary">OU</span>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="w-full h-11 text-base flex items-center justify-center gap-3 font-medium border-border-gray hover:bg-surface-light transition-all cursor-pointer active:scale-95"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.83c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335"/>
        </svg>
        Continuar com Google
      </Button>

      <p className="text-center text-sm text-text-secondary mt-8">
        Ainda não é parceiro? <Link href="/cadastro" className="text-primary-green font-bold hover:underline cursor-pointer">Cadastre-se</Link>
      </p>
    </div>
  );
}
