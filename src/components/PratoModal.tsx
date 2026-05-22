"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Prato, AdicionalGrupo } from "@/services/cardapioService";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2, Camera, Utensils, X } from "lucide-react";
import Image from "next/image";

const pratoSchema = z.object({
  nome: z.string().min(3, "Nome muito curto"),
  descricao: z.string().min(10, "Descrição muito curta"),
  preco: z.any().transform((val) => Number(val)).refine((val) => val > 0, "Preço deve ser maior que zero"),
  secao: z.string().min(1, "Selecione uma seção"),
  status: z.enum(["ativo", "inativo"]),
  adicionais_grupo_ids: z.array(z.string()),
});

export type PratoFormData = {
  nome: string;
  descricao: string;
  preco: number;
  secao: string;
  status: 'ativo' | 'inativo';
  adicionais_grupo_ids: string[];
};

interface PratoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PratoFormData, file?: File | null) => void;
  initialData?: Prato | null;
  secoes: string[];
  gruposAdicionais: AdicionalGrupo[];
  isLoading?: boolean;
}

export function PratoModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  initialData, 
  secoes,
  gruposAdicionais,
  isLoading 
}: PratoModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { 
    register, 
    handleSubmit, 
    reset, 
    setValue, 
    watch,
    formState: { errors } 
  } = useForm<PratoFormData>({
    resolver: zodResolver(pratoSchema),
    defaultValues: {
      status: 'ativo',
      preco: 0,
      adicionais_grupo_ids: []
    }
  });

  const statusValue = watch("status");
  const selectedGrupos = watch("adicionais_grupo_ids") || [];

  useEffect(() => {
    if (open) {
      setSelectedFile(null);
      setPreviewUrl(null);
      if (initialData) {
        reset({
          nome: initialData.nome,
          descricao: initialData.descricao,
          preco: initialData.preco,
          secao: initialData.secao,
          status: initialData.status,
          adicionais_grupo_ids: initialData.adicionais_grupo_ids || [],
        });
      } else {
        reset({
          nome: "",
          descricao: "",
          preco: 0,
          secao: secoes[0] || "",
          status: 'ativo',
          adicionais_grupo_ids: [],
        });
      }
    }
  }, [open, initialData, reset, secoes]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleGrupo = (id: string) => {
    const current = [...selectedGrupos];
    const index = current.indexOf(id);
    if (index > -1) {
        current.splice(index, 1);
    } else {
        current.push(id);
    }
    setValue("adicionais_grupo_ids", current);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] bg-surface-white border-border-gray shadow-2xl rounded-[2rem] max-h-[95vh] overflow-hidden flex flex-col p-0 text-text-primary">
        <DialogHeader className="p-8 pb-4 bg-surface-light/30 border-b border-border-gray">
          <DialogTitle className="text-text-primary font-black text-2xl tracking-tight">
            {initialData ? "Editar Prato" : "Novo Produto"}
          </DialogTitle>
          <DialogDescription className="font-medium text-text-secondary">
            {initialData ? "Atualize as informações do seu produto." : "Preencha os dados para o novo item."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <form id="prato-form" onSubmit={handleSubmit((data) => onSubmit(data as PratoFormData, selectedFile))} className="p-8 space-y-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Seção da Foto */}
                    <div className="flex flex-col items-center gap-4 shrink-0">
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="relative w-44 h-44 group cursor-pointer"
                        >
                            <div className={cn(
                                "w-full h-full rounded-[2.5rem] bg-surface-light border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-300 shadow-inner",
                                previewUrl || initialData?.foto_prato ? "border-primary-green/30" : "border-border-gray hover:border-primary-green/50"
                            )}>
                                {previewUrl ? (
                                    <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                                ) : initialData?.foto_prato ? (
                                    <Image src={initialData.foto_prato} alt="Prato" fill unoptimized className="object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 opacity-30">
                                        <Utensils className="w-12 h-12 text-text-tertiary" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Sem Foto</span>
                                    </div>
                                )}
                                
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            
                            <div className="absolute -bottom-2 -right-2 p-2.5 bg-primary-green text-white rounded-2xl shadow-lg hover:scale-105 transition-all z-10">
                                <Camera className="w-4 h-4" />
                            </div>

                            {(previewUrl || initialData?.foto_prato) && (
                                <button 
                                    type="button"
                                    onClick={removePhoto}
                                    className="absolute -top-2 -right-2 p-1.5 bg-error-button text-white rounded-full shadow-md hover:scale-110 transition-all z-20 border-2 border-surface-white"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
                    </div>

                    <div className="flex-1 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="nome" className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Nome do Prato</Label>
                            <Input id="nome" {...register("nome")} placeholder="Ex: Pizza de Calabresa" className="h-14 bg-surface-light border-border-gray/50 rounded-2xl text-text-primary font-bold focus:ring-4 focus:ring-primary-green/5" />
                            {errors.nome && <p className="text-error-text text-xs ml-1 font-bold">{errors.nome.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="preco" className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Preço Sugerido</Label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-primary-green text-sm">R$</span>
                                    <Input id="preco" type="number" step="0.01" {...register("preco")} className="h-14 bg-surface-light border-border-gray/50 rounded-2xl text-text-primary font-black pl-10 focus:ring-4 focus:ring-primary-green/5" />
                                </div>
                                {errors.preco && <p className="text-error-text text-xs ml-1 font-bold">{errors.preco.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="secao" className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Seção do Cardápio</Label>
                                <select 
                                    id="secao"
                                    {...register("secao")}
                                    className="flex h-14 w-full rounded-2xl bg-surface-light border border-border-gray/50 px-4 text-sm text-text-primary font-bold focus:ring-4 focus:ring-primary-green/5 outline-none cursor-pointer appearance-none"
                                >
                                    <option value="">Selecione...</option>
                                    {secoes.map(sec => (
                                    <option key={sec} value={sec}>{sec}</option>
                                    ))}
                                </select>
                                {errors.secao && <p className="text-error-text text-xs ml-1 font-bold">{errors.secao.message}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="descricao" className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Descrição Detalhada</Label>
                    <textarea 
                    id="descricao" 
                    {...register("descricao")}
                    className="flex w-full rounded-[1.5rem] bg-surface-light border border-border-gray/50 px-4 py-3 text-sm text-text-primary font-medium focus:ring-4 focus:ring-primary-green/5 outline-none min-h-[100px] transition-all resize-none"
                    placeholder="Descreva os ingredientes..."
                    />
                    {errors.descricao && <p className="text-error-text text-xs ml-1 font-bold">{errors.descricao.message}</p>}
                </div>

                <div className="space-y-4">
                    <Label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Grupos de Adicionais Relacionados</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar p-1">
                        {gruposAdicionais.length === 0 ? (
                            <p className="col-span-full text-[10px] text-text-tertiary italic p-8 border-2 border-dashed border-border-gray rounded-[2rem] text-center">Nenhum grupo cadastrado.</p>
                        ) : (
                            gruposAdicionais.map(grupo => (
                                <div 
                                    key={grupo._id} 
                                    onClick={() => toggleGrupo(grupo._id)}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-[1.5rem] border-2 transition-all cursor-pointer group/item",
                                        selectedGrupos.includes(grupo._id) 
                                            ? "bg-primary-green/5 border-primary-green text-primary-green shadow-sm" 
                                            : "bg-surface-light/50 border-border-gray/40 text-text-primary hover:border-primary-green/30"
                                    )}
                                >
                                    <span className="text-xs font-bold">{grupo.nome}</span>
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                                        selectedGrupos.includes(grupo._id) ? "bg-primary-green border-primary-green scale-110 shadow-lg shadow-primary-green/20" : "border-border-gray group-hover/item:border-primary-green/50"
                                    )}>
                                        {selectedGrupos.includes(grupo._id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between p-5 bg-surface-light/50 border border-border-gray/40 rounded-[1.5rem] shadow-inner">
                    <div className="space-y-0.5">
                    <Label className="text-sm font-black text-text-primary">Disponibilidade do Produto</Label>
                    <p className="text-[10px] text-text-tertiary uppercase font-bold tracking-tight">Ative para que o item apareça no App</p>
                    </div>
                    <Switch 
                        checked={statusValue === 'ativo'}
                        onCheckedChange={(checked) => setValue("status", checked ? 'ativo' : 'inativo')}
                    />
                </div>
            </form>
        </div>

        <div className="p-8 border-t border-border-gray bg-surface-light/20 flex gap-4">
            <Button type="button" variant="ghost" className="h-14 flex-1 rounded-2xl font-bold text-text-tertiary hover:bg-surface-light" onClick={() => onOpenChange(false)}>CANCELAR</Button>
            <Button form="prato-form" type="submit" disabled={isLoading} className="h-14 flex-[2] rounded-2xl font-black shadow-xl shadow-primary-green/20 bg-primary-green text-white hover:bg-primary-green/90">
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "SALVAR PRODUTO"}
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
