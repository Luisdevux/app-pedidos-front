"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRestauranteMutations } from "@/hooks/useRestaurantes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Store, ArrowRight, LogOut, FileText, Phone, Loader2 } from "lucide-react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { maskPhone, maskCNPJ, unmask } from "@/lib/masks";
import { cn } from "@/lib/utils";

const onboardingSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  descricao: z.string().min(10, "Conte um pouco mais sobre o restaurante"),
  telefone: z.string().min(14, "Telefone inválido"),
  cnpj: z.string().optional(),
  preencher_cnpj_depois: z.boolean(),
}).refine((data) => {
  if (!data.preencher_cnpj_depois && (!data.cnpj || data.cnpj.length < 18)) {
    return false;
  }
  return true;
}, {
  message: "CNPJ obrigatório ou marque para preencher depois",
  path: ["cnpj"],
});

type OnboardingData = z.infer<typeof onboardingSchema>;

export default function Onboarding() {
  const { user } = useAuth();
  const { saveRestaurante, isSaving } = useRestauranteMutations();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      telefone: "",
      cnpj: "",
      preencher_cnpj_depois: false
    }
  });

  const phoneValue = watch("telefone") || "";
  const cnpjValue = watch("cnpj") || "";
  const skipCnpj = watch("preencher_cnpj_depois");

  const onSubmit = (data: OnboardingData) => {
    const payload = {
      nome: data.nome,
      descricao: data.descricao,
      telefone: unmask(data.telefone),
      cnpj: data.preencher_cnpj_depois ? undefined : unmask(data.cnpj || ""),
      ativo: true,
      status: 'fechado' as const
    };
    saveRestaurante(payload);
  };

  return (
    <div className="min-h-screen bg-surface-light flex items-center justify-center p-4 md:p-6 text-text-primary font-sans">
      <div className="max-w-3xl w-full bg-surface-white rounded-[2.5rem] shadow-2xl border border-border-gray overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-500">
        
        {/* Lado Esquerdo - Info */}
        <div className="md:w-5/12 bg-primary-navy p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-green/10 rounded-full -mr-16 -mt-16 blur-3xl" />
          
          <div className="relative z-10">
             <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-10 shadow-inner">
                <Image src="/icone-rango.svg" alt="Rango Logo" width={40} height={40} />
             </div>
             <h1 className="text-3xl font-black mb-4 leading-tight">Boas-vindas, {user?.name?.split(' ')[0]}!</h1>
             <p className="text-sm text-gray-400 leading-relaxed font-medium">
               Para começar a vender no <span className="text-primary-green font-bold">Rango</span>, precisamos de algumas informações básicas da sua loja.
             </p>
          </div>

          <div className="relative z-10 pt-10">
             <button 
               onClick={() => signOut()}
               className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white transition-colors group"
             >
               <div className="p-2.5 rounded-xl bg-white/5 group-hover:bg-error-button/20 transition-all">
                  <LogOut className="w-4 h-4" />
               </div>
               Sair da conta
             </button>
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="md:w-7/12 p-8 md:p-12 bg-surface-white">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-[1.25rem] bg-success-bg text-primary-green flex items-center justify-center shadow-lg shadow-primary-green/10 border border-primary-green/20">
              <Store className="w-6 h-6" />
            </div>
            <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary block">Passo Único</span>
                <span className="text-xl font-black text-text-primary">Configurar Loja</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="nome" className="text-[10px] font-black uppercase text-text-tertiary ml-1">Nome do Restaurante</Label>
              <Input 
                id="nome" 
                {...register("nome")} 
                placeholder="Ex: Cantina do Rango" 
                className="h-12 rounded-xl bg-surface-light border border-border-gray shadow-inner font-bold text-text-primary focus-visible:ring-primary-green transition-all"
              />
              {errors.nome && <p className="text-error-text text-[10px] font-bold ml-1">{errors.nome.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                    <Label htmlFor="telefone" className="text-[10px] font-black uppercase text-text-tertiary ml-1">Telefone Comercial</Label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                        <Input 
                            id="telefone" 
                            {...register("telefone")}
                            value={phoneValue}
                            onChange={(e) => setValue("telefone", maskPhone(e.target.value))}
                            placeholder="(00) 00000-0000" 
                            className="h-12 pl-11 rounded-xl bg-surface-light border border-border-gray shadow-inner font-bold text-text-primary focus-visible:ring-primary-green transition-all"
                        />
                    </div>
                    {errors.telefone && <p className="text-error-text text-[10px] font-bold ml-1">{errors.telefone.message}</p>}
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="cnpj" className={cn(
                        "text-[10px] font-black uppercase ml-1 transition-colors",
                        skipCnpj ? "text-text-tertiary/40" : "text-text-tertiary"
                    )}>CNPJ</Label>
                    <div className="relative">
                        <FileText className={cn(
                            "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                            skipCnpj ? "text-text-tertiary/20" : "text-text-tertiary"
                        )} />
                        <Input 
                            id="cnpj" 
                            {...register("cnpj")}
                            value={cnpjValue}
                            onChange={(e) => setValue("cnpj", maskCNPJ(e.target.value))}
                            disabled={skipCnpj}
                            placeholder="00.000.000/0000-00" 
                            className={cn(
                                "h-12 pl-11 rounded-xl bg-surface-light border border-border-gray shadow-inner font-bold transition-all text-text-primary focus-visible:ring-primary-green",
                                skipCnpj && "opacity-40 grayscale"
                            )}
                        />
                    </div>
                    {errors.cnpj && <p className="text-error-text text-[10px] font-bold ml-1">{errors.cnpj.message}</p>}
                </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-surface-light rounded-xl border border-border-gray/50 shadow-sm">
                <div className="space-y-0.5">
                    <Label className="text-text-primary font-bold text-xs cursor-pointer" htmlFor="skip-cnpj">Preencher CNPJ depois</Label>
                    <p className="text-[9px] text-text-secondary uppercase font-bold tracking-tighter">Você poderá editar nas configurações</p>
                </div>
                <Switch 
                    id="skip-cnpj"
                    checked={skipCnpj}
                    onCheckedChange={(checked) => setValue("preencher_cnpj_depois", checked)}
                />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="descricao" className="text-[10px] font-black uppercase text-text-tertiary ml-1">Breve Descrição</Label>
              <textarea 
                id="descricao" 
                {...register("descricao")}
                className="w-full rounded-xl bg-surface-light border border-border-gray shadow-inner px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-green outline-none min-h-[100px] transition-all font-medium resize-none"
                placeholder="Ex: A melhor comida caseira da região, feita com amor..."
              />
              {errors.descricao && <p className="text-error-text text-[10px] font-bold ml-1">{errors.descricao.message}</p>}
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl text-base font-black shadow-xl shadow-primary-green/20 mt-4 group transition-all active:scale-95"
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : "COMEÇAR AGORA"}
              {!isSaving && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
}
