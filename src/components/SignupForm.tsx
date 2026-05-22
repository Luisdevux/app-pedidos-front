"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupData } from "@/lib/validations/auth";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import Image from "next/image";
import { useSignup } from "@/hooks/useSignup";
import Link from "next/link";

export default function SignupForm() {
  const { mutate: signup, isPending } = useSignup();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = (data: SignupData) => {
    signup(data);
  };

  const isSubmitting = isPending;

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-surface-white rounded-xl shadow-lg border border-border-gray">
      <div className="flex flex-col items-center text-center space-y-4">
        <Image src="/icone-rango.svg" alt="Rango Logo" width={80} height={80} className="mb-2" />
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Crie sua Conta</h1>
        <p className="text-text-secondary text-sm">Junte-se ao Rango e expanda seu negócio</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="nome" className="cursor-pointer">Nome Completo</Label>
          <Input
            id="nome"
            {...register("nome")}
            type="text"
            placeholder="João Silva"
          />
          {errors.nome && <p className="text-error-text text-xs">{errors.nome.message}</p>}
        </div>

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
          <Label htmlFor="senha" title="Senha" className="cursor-pointer">Senha</Label>
          <div className="relative">
            <Input
              id="senha"
              {...register("senha")}
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
          {errors.senha && <p className="text-error-text text-xs">{errors.senha.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmarSenha" title="Confirmar Senha" className="cursor-pointer">Confirmar Senha</Label>
          <div className="relative">
            <Input
              id="confirmarSenha"
              {...register("confirmarSenha")}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-primary-green transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmarSenha && <p className="text-error-text text-xs">{errors.confirmarSenha.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-11 text-base font-bold mt-4 cursor-pointer active:scale-95 transition-all"
        >
          {isSubmitting ? "Criando conta..." : "Cadastrar"}
        </Button>
      </form>

      <p className="text-center text-sm text-text-secondary mt-8">
        Já tem uma conta? <Link href="/login" className="text-primary-green font-bold hover:underline cursor-pointer">Faça login</Link>
      </p>
    </div>
  );
}
