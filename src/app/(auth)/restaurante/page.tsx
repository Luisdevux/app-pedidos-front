"use client";

import { useQuery } from "@tanstack/react-query";
import { Restaurante } from "@/services/restauranteService";
import { categoriaService, type Categoria } from "@/services/categoriaService";
import { useEnderecoRestaurante, useRestauranteMutations } from "@/hooks/useRestaurantes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Store, 
  Save,
  Camera,
  MapPin,
  Loader2,
  Bike,
  Tags,
  Calendar,
  X,
  Trash2,
  AlertCircle,
  Clock,
  ChevronDown
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { maskPhone, maskCNPJ, unmask } from "@/lib/masks";
import { useActiveRestaurante } from "@/hooks/useActiveRestaurante";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

const enderecoSchema = z.object({
  cep: z.string().min(8, "CEP inválido"),
  rua: z.string().min(3, "Rua obrigatória"),
  numero: z.string().min(1, "Número obrigatório"),
  bairro: z.string().min(3, "Bairro obrigatório"),
  complemento: z.string().optional(),
  cidade: z.string().min(3, "Cidade obrigatória"),
  estado: z.string().length(2, "UF deve ter 2 caracteres"),
});

type EnderecoFormData = z.infer<typeof enderecoSchema>;

const DIAS_SEMANA = [
  { id: 'segunda', label: 'Segunda' },
  { id: 'terca', label: 'Terça' },
  { id: 'quarta', label: 'Quarta' },
  { id: 'quinta', label: 'Quinta' },
  { id: 'sexta', label: 'Sexta' },
  { id: 'sabado', label: 'Sábado' },
  { id: 'domingo', label: 'Domingo' },
] as const;

export default function RestaurantePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const [isDeleteLogoOpen, setIsDeleteLogoOpen] = useState(false);
  const [isHorariosOpen, setIsHorariosOpen] = useState(false);

  const { activeRestaurante, isLoading, isComplete, hasAddress } = useActiveRestaurante();

  const { data: categoriasData } = useQuery({
    queryKey: ['categorias'],
    queryFn: categoriaService.listar,
  });
  const categorias = categoriasData?.docs || [];

  const restauranteAtivo = activeRestaurante;
  const { data: enderecoData } = useEnderecoRestaurante(restauranteAtivo?._id);
  
  const { 
    saveRestaurante, 
    isSaving, 
    saveStatus, 
    isSavingStatus,
    uploadFoto, 
    isUploading, 
    deleteFoto,
    isDeleting,
    saveEndereco, 
    isSavingEndereco 
  } = useRestauranteMutations(restauranteAtivo?._id);

  const { register, handleSubmit, reset, watch, setValue } = useForm<Partial<Restaurante>>({
    defaultValues: {
        nome: "",
        descricao: "",
        telefone: "",
        cnpj: "",
        taxa_entrega: 0,
        estimativa_entrega_min: 0,
        estimativa_entrega_max: 0,
        categoria_ids: [],
        horario_funcionamento: DIAS_SEMANA.map(d => ({ dia: d.id, abertura: "08:00", fechamento: "22:00", fechado: false }))
    }
  });
  const { register: regEnd, handleSubmit: handleEndSubmit, reset: resetEnd, setValue: setEndValue, watch: watchEnd } = useForm<EnderecoFormData>({
    resolver: zodResolver(enderecoSchema)
  });

  const cepValue = watchEnd("cep");
  const phoneValue = watch("telefone") || "";
  const cnpjValue = watch("cnpj") || "";
  const horarios = watch("horario_funcionamento") || [];
  const selectedCategories = watch("categoria_ids") || [];

  // Busca de CEP Automática
  useEffect(() => {
    const fetchCep = async () => {
      const cleanCep = cepValue?.replace(/\D/g, '');
      if (cleanCep?.length === 8) {
        setIsFetchingCep(true);
        try {
          const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
          const data = await res.json();
          if (!data.erro) {
            setEndValue("rua", data.logradouro);
            setEndValue("bairro", data.bairro);
            setEndValue("cidade", data.localidade);
            setEndValue("estado", data.uf);
          }
        } catch (error) {
          console.error("Erro ao buscar CEP", error);
        } finally {
          setIsFetchingCep(false);
        }
      }
    };
    
    const timeoutId = setTimeout(() => {
      fetchCep();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [cepValue, setEndValue]);

  useEffect(() => {
    if (restauranteAtivo) {
      reset({
        nome: restauranteAtivo.nome,
        descricao: restauranteAtivo.descricao || "",
        telefone: maskPhone(restauranteAtivo.telefone || ""),
        cnpj: maskCNPJ(restauranteAtivo.cnpj || ""),
        status: restauranteAtivo.status,
        taxa_entrega: restauranteAtivo.taxa_entrega || 0,
        estimativa_entrega_min: restauranteAtivo.estimativa_entrega_min || 0,
        estimativa_entrega_max: restauranteAtivo.estimativa_entrega_max || 0,
        categoria_ids: (restauranteAtivo.categoria_ids || []).map((cat: string | Categoria) => 
            typeof cat === 'object' ? cat._id : cat
        ),
        horario_funcionamento: (restauranteAtivo.horario_funcionamento && restauranteAtivo.horario_funcionamento.length > 0)
            ? restauranteAtivo.horario_funcionamento 
            : DIAS_SEMANA.map(d => ({ dia: d.id, abertura: "08:00", fechamento: "22:00", fechado: false })),
      });
    }
    if (enderecoData) {
      resetEnd({
        cep: enderecoData.cep,
        rua: enderecoData.rua,
        numero: enderecoData.numero,
        bairro: enderecoData.bairro,
        complemento: enderecoData.complemento || "",
        cidade: enderecoData.cidade,
        estado: enderecoData.estado,
      });
    }
  }, [restauranteAtivo, enderecoData, reset, resetEnd]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFoto(file);
  };

  const toggleCategory = (id: string) => {
    const current = [...selectedCategories];
    if (current.includes(id)) {
      setValue("categoria_ids", current.filter(c => c !== id), { shouldDirty: true });
    } else {
      setValue("categoria_ids", [...current, id], { shouldDirty: true });
    }
  };

  const handleHorarioChange = (index: number, field: "abertura" | "fechamento" | "fechado", value: string | boolean) => {
    const novosHorarios = [...horarios];
    novosHorarios[index] = { ...novosHorarios[index], [field]: value } as NonNullable<Restaurante['horario_funcionamento']>[number];
    setValue("horario_funcionamento", novosHorarios, { shouldDirty: true });
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-green" /></div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20 animate-fade-in text-text-primary">
      <header>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Gerenciamento da Loja</h1>
        <p className="text-text-secondary font-medium">Configurações de perfil, logística e funcionamento.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-text-primary">
        
        {/* Lado Esquerdo: Identidade Visual e Status Rápido */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface-white rounded-[2.5rem] shadow-sm border border-border-gray overflow-hidden sticky top-6">
            <div className="p-10 text-center">
              <div className="relative w-32 h-32 mx-auto mb-8">
                <div className="relative w-full h-full rounded-[2rem] bg-surface-light border-2 border-dashed border-border-gray flex items-center justify-center overflow-hidden shadow-inner group">
                  {restauranteAtivo?.foto_restaurante ? (
                    <Image 
                      src={restauranteAtivo.foto_restaurante} 
                      alt="Logo" 
                      fill 
                      unoptimized
                      className="object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  ) : (
                    <Store className="w-12 h-12 text-text-tertiary opacity-20" />
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-surface-white/80 backdrop-blur-sm flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary-green" />
                    </div>
                  )}
                </div>
                
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 p-3 bg-primary-navy text-white rounded-2xl shadow-2xl hover:scale-110 transition-all z-10 border-4 border-surface-white cursor-pointer active:scale-95"
                  title="Alterar Logo"
                >
                  <Camera className="w-4 h-4" />
                </button>
                {restauranteAtivo?.foto_restaurante && (
                  <button 
                      type="button"
                      onClick={() => setIsDeleteLogoOpen(true)}
                      disabled={isDeleting}
                      className="absolute -top-2 -right-2 p-1.5 bg-error-button text-white rounded-full shadow-lg hover:scale-110 transition-all z-10 border-2 border-surface-white cursor-pointer"
                      title="Remover Logo"
                  >
                      <X className="w-3 h-3" />
                  </button>
                )}
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
                </div>
              <h3 className="font-black text-text-primary text-xl tracking-tight leading-tight">{restauranteAtivo?.nome}</h3>
              <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mt-1 mb-6">Logo do Estabelecimento</p>
              
              <div className="flex items-center justify-center gap-2 px-4 py-2 bg-surface-light rounded-full border border-border-gray w-fit mx-auto shadow-sm">
                <div className={cn("w-2 h-2 rounded-full", restauranteAtivo?.status === 'aberto' ? "bg-primary-green shadow-[0_0_8px_rgba(20,184,34,0.5)]" : "bg-error-button")} />
                <span className="text-[10px] font-black uppercase tracking-widest text-text-primary">
                  {restauranteAtivo?.status === 'aberto' ? 'Loja Aberta' : 'Loja Fechada'}
                </span>
              </div>
            </div>

            <div className="p-8 border-t border-border-gray bg-surface-light/30">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-black text-text-primary uppercase tracking-tighter">Funcionamento</p>
                        <p className={cn(
                          "text-[10px] font-medium mt-0.5",
                          !isComplete ? "text-error-text" : "text-text-secondary"
                        )}>
                          {!isComplete ? "Dados obrigatórios pendentes" : "Gerenciamento manual da loja"}
                        </p>
                    </div>
                    {isSavingStatus ? (
                        <Loader2 className="w-5 h-5 animate-spin text-primary-green" />
                    ) : (
                        <Switch 
                            type="button"
                            disabled={!isComplete}
                            checked={restauranteAtivo?.status === 'aberto'}
                            onCheckedChange={(checked) => saveStatus(checked ? 'aberto' : 'fechado')}
                            className="cursor-pointer"
                        />
                    )}
                </div>
            </div>
          </div>
        </div>

        {/* Lado Direito: Dados, Logística e Horários */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Informações Básicas */}
          <section className="bg-surface-white p-8 rounded-[2.5rem] shadow-sm border border-border-gray space-y-8 text-text-primary">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-green/10 flex items-center justify-center text-primary-green shadow-sm"><Store className="w-5 h-5" /></div>
              <h2 className="text-xl font-black tracking-tight">Informações Comerciais</h2>
            </div>

            <form onSubmit={handleSubmit((d) => {
              const payload = {
                ...d,
                telefone: unmask(d.telefone || ""),
                cnpj: unmask(d.cnpj || ""),
                taxa_entrega: d.taxa_entrega ? Number(d.taxa_entrega) : 0,
                estimativa_entrega_min: d.estimativa_entrega_min ? Number(d.estimativa_entrega_min) : 0,
                estimativa_entrega_max: d.estimativa_entrega_max ? Number(d.estimativa_entrega_max) : 0,
                horario_funcionamento: horarios // Garante o envio dos horários
              };
              saveRestaurante(payload);
            })} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Nome Comercial</Label>
                  <Input 
                    {...register("nome")} 
                    placeholder="Ex: Rango do Ricardo" 
                    className="bg-surface-light border-border-gray/50 h-14 text-text-primary font-bold rounded-2xl focus:ring-4 focus:ring-primary-green/5 shadow-inner" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">WhatsApp de Contato</Label>
                  <Input 
                    {...register("telefone")} 
                    value={phoneValue}
                    onChange={(e) => setValue("telefone", maskPhone(e.target.value))}
                    placeholder="(00) 00000-0000" 
                    className="bg-surface-light border-border-gray/50 h-14 text-text-primary font-bold rounded-2xl focus:ring-4 focus:ring-primary-green/5 shadow-inner" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">CNPJ (Obrigatório)</Label>
                  <Input 
                    {...register("cnpj")} 
                    value={cnpjValue}
                    onChange={(e) => setValue("cnpj", maskCNPJ(e.target.value))}
                    placeholder="00.000.000/0000-00" 
                    className="bg-surface-light border-border-gray/50 h-14 text-text-primary font-bold rounded-2xl focus:ring-4 focus:ring-primary-green/5 shadow-inner" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Descrição / Especialidades</Label>
                <textarea 
                  {...register("descricao")}
                  rows={3}
                  className="w-full rounded-[1.5rem] bg-surface-light border border-border-gray/50 p-5 text-sm focus:ring-4 focus:ring-primary-green/5 outline-none transition-all resize-none text-text-primary font-medium shadow-inner"
                  placeholder="Conte um pouco sobre suas especialidades..."
                />
              </div>

              {/* Logística */}
              <div className="p-8 bg-surface-light/50 rounded-[2rem] border border-border-gray/40 space-y-6">
                <h3 className="text-sm font-black text-text-primary flex items-center gap-2 uppercase tracking-widest">
                  <Bike className="w-4 h-4 text-primary-green" /> Logística de Entrega
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Taxa (R$)</Label>
                    <Input 
                      {...register("taxa_entrega")} 
                      type="number" 
                      step="0.01" 
                      min="0"
                      className="bg-surface-white border-border-gray/40 h-12 text-text-primary font-bold rounded-xl shadow-inner" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Tempo Mín. (min)</Label>
                    <Input 
                      {...register("estimativa_entrega_min")} 
                      type="number" 
                      className="bg-surface-white border-border-gray/40 h-12 text-text-primary font-bold rounded-xl shadow-inner" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Tempo Máx. (min)</Label>
                    <Input 
                      {...register("estimativa_entrega_max")} 
                      type="number" 
                      className="bg-surface-white border-border-gray/40 h-12 text-text-primary font-bold rounded-xl shadow-inner" 
                    />
                  </div>
                </div>
              </div>

              {/* Categorias */}
              <div className="space-y-4">
                <Label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Tags className="w-4 h-4 text-primary-green" /> Categorias da Loja
                </Label>
                <div className="flex flex-wrap gap-2.5">
                  {categorias.map(cat => {
                    const isSelected = selectedCategories.includes(cat._id);
                    if (cat.nome.toLowerCase() === 'tudo') return null;
                    return (
                      <button
                        key={cat._id}
                        type="button"
                        onClick={() => toggleCategory(cat._id)}
                        className={cn(
                          "px-5 py-2.5 rounded-2xl text-xs font-black border transition-all cursor-pointer",
                          isSelected 
                            ? "bg-primary-navy text-white border-primary-navy shadow-lg shadow-primary-navy/20 scale-105" 
                            : "bg-surface-light text-text-tertiary border-border-gray hover:border-primary-green hover:text-primary-green active:scale-95"
                        )}
                      >
                        {cat.nome.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Horários de Funcionamento */}
              <div className="space-y-6 pt-4">
                <div 
                    className="flex items-center justify-between cursor-pointer group/header"
                    onClick={() => setIsHorariosOpen(!isHorariosOpen)}
                >
                    <Label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1 flex items-center gap-2 cursor-pointer">
                        <Calendar className="w-4 h-4 text-primary-green" /> Escala de Funcionamento
                    </Label>
                    <div className={cn(
                        "p-1.5 rounded-lg bg-surface-light border border-border-gray/50 text-text-tertiary transition-all group-hover/header:text-primary-green",
                        isHorariosOpen && "rotate-180 bg-primary-green/5 border-primary-green/20 text-primary-green"
                    )}>
                        <ChevronDown className="w-4 h-4" />
                    </div>
                </div>
                
                {isHorariosOpen && (
                    <div className="grid grid-cols-1 gap-3 animate-in slide-in-from-top-4 duration-300">
                    {DIAS_SEMANA.map((dia) => {
                        const hIndex = horarios.findIndex(it => it.dia === dia.id);
                        const h = hIndex !== -1 ? horarios[hIndex] : null;
                        if (!h) return null;

                        return (
                        <div key={dia.id} className="flex items-center justify-between p-4 bg-surface-light/40 rounded-2xl border border-border-gray/30 group hover:border-primary-green/20 transition-colors">
                            <span className="text-sm font-black text-text-primary w-24 capitalize">{dia.label}</span>
                            
                            {!h.fechado ? (
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-primary-green rounded-lg flex items-center justify-center shadow-sm">
                                        <Clock className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <input 
                                        type="time" 
                                        value={h.abertura} 
                                        onChange={(e) => handleHorarioChange(hIndex, "abertura", e.target.value)}
                                        className="bg-surface-white border border-border-gray/50 rounded-xl pl-11 pr-4 h-11 text-xs font-bold text-text-primary outline-none focus:ring-2 focus:ring-primary-green/20 transition-all shadow-sm cursor-pointer"
                                    />
                                </div>
                                <span className="text-[10px] font-black text-text-tertiary uppercase px-1">Até</span>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-primary-green rounded-lg flex items-center justify-center shadow-sm">
                                        <Clock className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <input 
                                        type="time" 
                                        value={h.fechamento} 
                                        onChange={(e) => handleHorarioChange(hIndex, "fechamento", e.target.value)}
                                        className="bg-surface-white border border-border-gray/50 rounded-xl pl-11 pr-4 h-11 text-xs font-bold text-text-primary outline-none focus:ring-2 focus:ring-primary-green/20 transition-all shadow-sm cursor-pointer"
                                    />
                                </div>
                            </div>
                            ) : (
                            <div className="h-11 flex items-center px-6 bg-error-bg/20 text-error-text rounded-xl border border-error-text/10 shadow-inner">
                                <span className="text-[10px] font-black uppercase tracking-widest">FECHADO</span>
                            </div>
                            )}

                            <div className="flex items-center gap-3 ml-4">
                            <Label className="text-[9px] font-black text-text-tertiary uppercase cursor-pointer" htmlFor={`switch-${dia.id}`}>Folga</Label>
                            <Switch 
                                id={`switch-${dia.id}`}
                                type="button"
                                checked={h.fechado} 
                                onCheckedChange={(checked) => handleHorarioChange(hIndex, "fechado", checked)}
                                className="scale-90 cursor-pointer"
                            />
                            </div>
                        </div>
                        );
                    })}
                    </div>
                )}
              </div>

              <div className="pt-6">
                <Button type="submit" disabled={isSaving} className="w-full md:w-fit px-12 h-14 rounded-2xl font-black text-lg shadow-2xl shadow-primary-green/20 bg-primary-green text-white hover:bg-primary-green/90 transition-all border-none cursor-pointer active:scale-95">
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Save className="w-5 h-5 mr-3" />}
                    SALVAR TODAS AS ALTERAÇÕES
                </Button>
              </div>
            </form>
          </section>

          {/* Endereço */}
          <section className={cn(
              "p-10 rounded-[3rem] shadow-sm border space-y-8 transition-all duration-500",
              !hasAddress ? "bg-amber-500/5 border-amber-200 ring-4 ring-amber-100/50" : "bg-surface-white border-border-gray"
          )}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4 text-text-primary">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-md", !hasAddress ? "bg-amber-500 text-white" : "bg-primary-green/10 text-primary-green")}>
                    <MapPin className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                    <h2 className="text-2xl font-black tracking-tight">Endereço da Loja</h2>
                    <p className="text-text-secondary font-medium text-xs">Onde as coletas de pedidos serão feitas.</p>
                </div>
              </div>
              {!hasAddress && (
                  <div className="px-4 py-1.5 bg-amber-500 text-white rounded-full flex items-center gap-2 shadow-lg shadow-amber-500/20">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">OBRIGATÓRIO</span>
                  </div>
              )}
            </div>

            <form onSubmit={handleEndSubmit((d) => saveEndereco({ restauranteId: restauranteAtivo!._id, enderecoId: enderecoData?._id, dados: d }))} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2 relative">
                  <Label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">CEP</Label>
                  <Input 
                    {...regEnd("cep")} 
                    maxLength={9} 
                    placeholder="00000-000" 
                    className="bg-surface-light border-border-gray/50 h-14 text-text-primary font-bold rounded-2xl shadow-inner focus:ring-4 focus:ring-primary-green/5" 
                  />
                  {isFetchingCep && <Loader2 className="w-5 h-5 animate-spin text-primary-green absolute right-4 top-11" />}
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Logradouro (Rua/Av)</Label>
                  <Input 
                    {...regEnd("rua")} 
                    placeholder="Ex: Avenida Principal" 
                    className="bg-surface-light border-border-gray/50 h-14 text-text-primary font-bold rounded-2xl shadow-inner focus:ring-4 focus:ring-primary-green/5" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Número</Label>
                  <Input {...regEnd("numero")} placeholder="S/N" className="bg-surface-light border-border-gray/50 h-14 text-text-primary font-bold rounded-2xl shadow-inner focus:ring-4 focus:ring-primary-green/5" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Bairro</Label>
                  <Input {...regEnd("bairro")} placeholder="Sua vizinhança" className="bg-surface-light border-border-gray/50 h-14 text-text-primary font-bold rounded-2xl shadow-inner focus:ring-4 focus:ring-primary-green/5" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Cidade</Label>
                  <Input {...regEnd("cidade")} className="bg-surface-light border-border-gray/50 h-14 text-text-primary font-bold rounded-2xl shadow-inner focus:ring-4 focus:ring-primary-green/5" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">UF</Label>
                  <Input {...regEnd("estado")} maxLength={2} className="bg-surface-light border-border-gray/50 h-14 text-text-primary font-bold rounded-2xl uppercase text-center shadow-inner focus:ring-4 focus:ring-primary-green/5" />
                </div>
              </div>

              <div className="space-y-2">
                  <Label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Complemento (Opcional)</Label>
                  <Input {...regEnd("complemento")} placeholder="Apt, Sala, Bloco..." className="bg-surface-light border-border-gray/50 h-14 text-text-primary font-bold rounded-2xl shadow-inner focus:ring-4 focus:ring-primary-green/5" />
              </div>

              <Button type="submit" variant="secondary" disabled={isSavingEndereco} className="w-full md:w-fit px-12 h-14 rounded-2xl font-black text-lg shadow-xl bg-primary-navy text-white hover:bg-primary-navy/90 border-none cursor-pointer active:scale-95 transition-all">
                {isSavingEndereco ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Save className="w-5 h-5 mr-3" />}
                ATUALIZAR ENDEREÇO
              </Button>
            </form>
          </section>

        </div>
      </div>

      <Dialog open={isDeleteLogoOpen} onOpenChange={setIsDeleteLogoOpen}>
        <DialogContent className="sm:max-w-[420px] bg-surface-white border-border-gray shadow-2xl rounded-[3rem] p-10 text-text-primary">
          <DialogHeader className="space-y-4">
            <div className="w-20 h-20 bg-error-bg rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-error-text/5">
                <Trash2 className="w-10 h-10 text-error-text" />
            </div>
            <DialogTitle className="text-text-primary font-black text-2xl text-center">Remover Logotipo?</DialogTitle>
            <DialogDescription className="text-center font-medium text-text-secondary">
              Sua marca não será mais exibida para os clientes no App. Deseja prosseguir?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-10">
            <Button variant="ghost" className="h-14 rounded-2xl font-bold text-text-tertiary border-none shadow-none cursor-pointer transition-all" onClick={() => setIsDeleteLogoOpen(false)}>MANTER</Button>
            <Button 
                variant="destructive" 
                className="h-14 rounded-2xl font-black shadow-lg cursor-pointer active:scale-95 transition-all" 
                disabled={isDeleting}
                onClick={() => {
                    deleteFoto();
                    setIsDeleteLogoOpen(false);
                }}
            >
                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "REMOVER"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
