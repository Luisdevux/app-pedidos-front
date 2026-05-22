"use client";

import { useRestauranteMutations } from "@/hooks/useRestaurantes";
import { BlockedOverlay } from "@/components/BlockedOverlay";
import { useActiveRestaurante } from "@/hooks/useActiveRestaurante";
import { usePratosRestaurante, usePratoMutations, useGruposAdicionais, useAdicionalMutations } from "@/hooks/useCardapio";
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Image as ImageIcon,
  Filter,
  Settings2,
  Layers,
  UtensilsCrossed,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Camera,
  X,
  Utensils,
  ChevronDown
} from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PratoModal, type PratoFormData } from "@/components/PratoModal";
import { Prato, AdicionalGrupo, AdicionalOpcao, cardapioService } from "@/services/cardapioService";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function CardapioPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSecao, setSelectedSecao] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSecaoModalOpen, setIsSecaoModalOpen] = useState(false);
  const [selectedPrato, setSelectedPrato] = useState<Prato | null>(null);
  const [newSecao, setNewSecao] = useState("");

  const { activeRestaurante, isLoading: isLoadingRestauranteProvider, isComplete } = useActiveRestaurante();
  const restauranteAtivo = activeRestaurante;

  const { saveRestaurante, isSaving: isSavingRest } = useRestauranteMutations(restauranteAtivo?._id);

  const { data: pratos, isLoading: isLoadingPratos } = usePratosRestaurante(restauranteAtivo?._id);
  const { data: gruposAdicionais } = useGruposAdicionais(restauranteAtivo?._id);
  const { createPrato, updatePrato, deletePrato, uploadFotoPrato, isProcessing } = usePratoMutations(restauranteAtivo?._id || "");

  const isLoading = isLoadingRestauranteProvider || isLoadingPratos;

  const secoes = restauranteAtivo?.secoes_cardapio || [];

  const filteredPratos = useMemo(() => {
    return (pratos || []).filter(p => {
        const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSecao = !selectedSecao || p.secao === selectedSecao;
        return matchesSearch && matchesSecao;
    });
  }, [pratos, searchTerm, selectedSecao]);

  const handleOpenCreate = () => {
    if (secoes.length === 0) {
        toast.error("Crie pelo menos uma seção antes de adicionar pratos.");
        setIsSecaoModalOpen(true);
        return;
    }
    setSelectedPrato(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: PratoFormData, file?: File | null) => {
    if (selectedPrato) {
      updatePrato({ id: selectedPrato._id, dados: data });
      if (file) uploadFotoPrato({ id: selectedPrato._id, file });
    } else {
      createPrato(data);
    }
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (selectedPrato) {
      deletePrato(selectedPrato._id);
      setIsDeleteOpen(false);
    }
  };

  const handleAddSecao = () => {
    if (!newSecao.trim()) return;
    if (secoes.includes(newSecao.trim())) {
        toast.error("Esta seção já existe.");
        return;
    }
    const updatedSecoes = [...secoes, newSecao.trim()];
    saveRestaurante({ secoes_cardapio: updatedSecoes });
    setNewSecao("");
  };

  const handleRemoveSecao = (secaoToRemove: string) => {
    const updatedSecoes = secoes.filter(s => s !== secaoToRemove);
    saveRestaurante({ secoes_cardapio: updatedSecoes });
  };

  return (
    <div className="space-y-8 animate-fade-in text-text-primary pb-20 relative min-h-[60vh]">
      {!isComplete && (
        <BlockedOverlay 
            title="Cardápio Bloqueado" 
            description="Você precisa completar o cadastro da sua loja (CNPJ e Endereço) para cadastrar e gerenciar seus produtos e adicionais."
        />
      )}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-text-primary tracking-tight">Cardápio</h1>
          <p className="text-text-secondary font-medium">Organize seus produtos, preços e seções de forma simples.</p>
        </div>
        
        <div className="flex items-center gap-3">
            <Button variant="outline" className="h-12 px-6 rounded-2xl font-bold gap-2 border-border-gray bg-surface-white hover:bg-surface-light shadow-sm text-text-primary cursor-pointer transition-all active:scale-95" onClick={() => setIsSecaoModalOpen(true)}>
                <Settings2 className="w-4 h-4 text-text-tertiary" />
                Gerenciar Seções
            </Button>
            <Button className="h-12 px-8 rounded-2xl font-black gap-2 shadow-lg shadow-primary-green/5 bg-primary-green text-white hover:bg-primary-green/90 cursor-pointer transition-all active:scale-95 border-none" onClick={handleOpenCreate}>
                <Plus className="w-5 h-5" />
                ADICIONAR PRATO
            </Button>
        </div>
      </header>

      <Tabs defaultValue="pratos" className="w-full">
        <TabsList className="bg-surface-light p-1.5 rounded-2xl h-auto mb-8 border border-border-gray/50">
            <TabsTrigger value="pratos" className="rounded-xl px-8 py-3 data-[state=active]:bg-surface-white data-[state=active]:shadow-md data-[state=active]:text-primary-green text-text-secondary font-bold gap-2 transition-all border-none cursor-pointer">
                <UtensilsCrossed className="w-4 h-4" />
                Produtos
            </TabsTrigger>
            <TabsTrigger value="adicionais" className="rounded-xl px-8 py-3 data-[state=active]:bg-surface-white data-[state=active]:shadow-md data-[state=active]:text-primary-green text-text-secondary font-bold gap-2 transition-all border-none cursor-pointer">
                <Layers className="w-4 h-4" />
                Grupos de Adicionais
            </TabsTrigger>
        </TabsList>

        <TabsContent value="pratos" className="space-y-8 outline-none">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary group-focus-within:text-primary-green transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Pesquisar no cardápio..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 h-14 bg-surface-white rounded-2xl border border-border-gray focus:border-primary-green focus:ring-4 focus:ring-primary-green/5 outline-none text-text-primary font-semibold shadow-sm transition-all"
                    />
                </div>
                
                <div className="flex items-center gap-2 bg-surface-white h-14 px-4 rounded-2xl border border-border-gray shadow-sm">
                    <Filter className="w-4 h-4 text-text-tertiary" />
                    <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mr-1">Seção:</span>
                    <select 
                        value={selectedSecao || ""} 
                        onChange={(e) => setSelectedSecao(e.target.value || null)}
                        className="bg-transparent text-sm font-bold text-text-primary outline-none cursor-pointer pr-4"
                    >
                        <option value="">Todas</option>
                        {secoes.map(sec => (
                        <option key={sec} value={sec}>{sec}</option>
                        ))}
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-80 bg-surface-white rounded-3xl animate-pulse border border-border-gray" />)}
                </div>
            ) : filteredPratos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-surface-white rounded-3xl border-2 border-dashed border-border-gray shadow-sm">
                <div className="w-20 h-20 bg-surface-light rounded-full flex items-center justify-center mb-6 ring-8 ring-surface-light/50">
                    <UtensilsCrossed className="w-10 h-10 text-text-tertiary opacity-30" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">Nenhum item encontrado</h3>
                <p className="text-text-secondary font-medium max-w-sm text-center">Comece criando pratos para sua loja.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredPratos.map((prato) => (
                    <div key={prato._id} className="group bg-surface-white rounded-[2.5rem] shadow-sm border border-border-gray overflow-hidden hover:shadow-2xl transition-all duration-300">
                    <div className="relative h-44 bg-surface-light overflow-hidden">
                        {prato.foto_prato ? (
                        <Image 
                            src={prato.foto_prato} 
                            alt={prato.nome} 
                            fill 
                            unoptimized
                            className="object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                        ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-tertiary/20">
                            <ImageIcon className="w-10 h-10 opacity-20" />
                        </div>
                        )}
                        
                        <div className="absolute top-4 left-4">
                            <div className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border shadow-sm",
                                prato.status === 'ativo' ? "bg-primary-green/90 text-white border-primary-green/20" : "bg-surface-white/90 text-text-tertiary border-border-gray/50"
                            )}>
                                <div className={cn("w-1.5 h-1.5 rounded-full", prato.status === 'ativo' ? "bg-white animate-pulse" : "bg-text-tertiary")} />
                                {prato.status === 'ativo' ? 'Ativo' : 'Inativo'}
                            </div>
                        </div>

                        <div className="absolute top-4 right-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-xl bg-surface-white/90 hover:bg-surface-white border-none shadow-lg cursor-pointer transition-all active:scale-90">
                                        <MoreVertical className="w-4 h-4 text-primary-navy dark:text-primary-green" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-2xl border-border-gray bg-surface-white shadow-xl p-2 min-w-[140px] z-50">
                                    <DropdownMenuItem className="rounded-xl font-bold gap-2 py-2.5 cursor-pointer hover:bg-surface-light text-text-primary transition-colors" onClick={() => { setSelectedPrato(prato); setIsModalOpen(true); }}>
                                        <Pencil className="w-4 h-4 text-blue-500" /> Editar Prato
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-xl font-bold gap-2 py-2.5 text-error-text cursor-pointer hover:bg-error-bg transition-colors" onClick={() => { setSelectedPrato(prato); setIsDeleteOpen(true); }}>
                                        <Trash2 className="w-4 h-4" /> Remover
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-text-primary leading-tight line-clamp-1">{prato.nome}</h3>
                        <span className="text-sm font-black text-primary-green whitespace-nowrap">
                            R$ {prato.preco.toFixed(2).replace('.', ',')}
                        </span>
                        </div>
                        <p className="text-xs text-text-secondary line-clamp-2 h-8 mb-4">
                        {prato.descricao || "Sem descrição disponível."}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-border-gray">
                        <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest bg-surface-light px-2 py-1 rounded">
                            {prato.secao || 'Geral'}
                        </span>
                        <button 
                            onClick={() => { setSelectedPrato(prato); setIsModalOpen(true); }}
                            className="text-[10px] font-black text-primary-green hover:underline uppercase tracking-tighter cursor-pointer transition-colors active:scale-95"
                        >
                            Gerenciar →
                        </button>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            )}
        </TabsContent>

        <TabsContent value="adicionais" className="outline-none">
             <AdicionaisRefactored restauranteId={restauranteAtivo?._id} />
        </TabsContent>
      </Tabs>

      <PratoModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleFormSubmit}
        initialData={selectedPrato}
        secoes={secoes}
        gruposAdicionais={gruposAdicionais || []}
        isLoading={isProcessing}
      />

      <Dialog open={isSecaoModalOpen} onOpenChange={setIsSecaoModalOpen}>
        <DialogContent className="sm:max-w-[480px] bg-surface-white border-border-gray shadow-2xl rounded-[3rem] p-0 overflow-hidden text-text-primary">
          <DialogHeader className="p-8 pb-4 bg-surface-light/30 border-b border-border-gray">
            <div className="w-14 h-14 bg-surface-white rounded-2xl shadow-sm border border-border-gray flex items-center justify-center mb-4">
                <Settings2 className="w-7 h-7 text-primary-green" />
            </div>
            <DialogTitle className="text-text-primary font-black text-2xl tracking-tight">
                Seções do Cardápio
            </DialogTitle>
            <DialogDescription className="text-text-secondary font-medium text-sm">Organize seus produtos em grupos.</DialogDescription>
          </DialogHeader>
          <div className="p-8 space-y-6">
             <div className="flex gap-3">
                <Input 
                    placeholder="Nova seção..." 
                    value={newSecao} 
                    onChange={(e) => setNewSecao(e.target.value)}
                    className="h-14 bg-surface-light border border-border-gray rounded-2xl text-text-primary font-bold focus:ring-4 focus:ring-primary-green/5 shadow-inner"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSecao()}
                />
                <Button onClick={handleAddSecao} disabled={isSavingRest || !newSecao} className="h-14 w-14 rounded-2xl shadow-lg shadow-primary-green/5 bg-primary-green text-white cursor-pointer active:scale-95 transition-all">
                    <Plus className="w-6 h-6" />
                </Button>
             </div>
             <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {secoes.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-border-gray rounded-[2rem] bg-surface-light/20">
                        <p className="text-sm text-text-tertiary font-bold italic">Nenhuma seção cadastrada.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-2.5">
                        {secoes.map((sec, idx) => (
                            <div key={idx} className="flex items-center justify-between p-5 bg-surface-light/50 rounded-2xl border border-border-gray/40 group hover:border-primary-green/30 hover:bg-surface-white transition-all shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary-green" />
                                    <span className="font-bold text-text-primary">{sec}</span>
                                </div>
                                <button onClick={() => handleRemoveSecao(sec)} className="p-2 text-text-tertiary hover:text-error-text transition-all opacity-0 group-hover:opacity-100 bg-surface-white rounded-xl shadow-sm border border-border-gray/30 cursor-pointer active:scale-90"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        ))}
                    </div>
                )}
             </div>
          </div>
          <div className="p-8 pt-0">
             <Button className="w-full h-14 rounded-2xl font-black shadow-lg shadow-primary-green/5 bg-primary-green text-white cursor-pointer active:scale-[0.98] transition-all border-none" onClick={() => setIsSecaoModalOpen(false)}>CONCLUIR E SALVAR</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px] bg-surface-white border-border-gray shadow-2xl rounded-[2.5rem] p-8 text-text-primary">
          <DialogHeader className="space-y-4">
            <DialogTitle className="text-text-primary font-black text-2xl text-center">Remover Prato?</DialogTitle>
            <DialogDescription className="text-center font-medium text-text-secondary text-sm">Tem certeza que deseja excluir este prato?</DialogDescription>
            <div className="w-16 h-16 bg-error-bg rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-error-text/5"><Trash2 className="w-8 h-8 text-error-text" /></div>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-8">
            <Button variant="ghost" className="h-14 rounded-2xl font-bold text-text-tertiary hover:bg-surface-light border-none shadow-none cursor-pointer transition-all" onClick={() => setIsDeleteOpen(false)}>CANCELAR</Button>
            <Button variant="destructive" className="h-14 rounded-2xl font-black shadow-lg cursor-pointer active:scale-95 transition-all border-none" onClick={confirmDelete} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : "SIM, EXCLUIR"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdicionaisRefactored({ restauranteId }: { restauranteId?: string }) {
    const { data: grupos, isLoading } = useQuery({
        queryKey: ['adicionais-grupos', restauranteId],
        queryFn: () => cardapioService.listarGruposAdicionais(restauranteId!),
        enabled: !!restauranteId,
    });

    const [selectedGrupo, setSelectedGrupo] = useState<AdicionalGrupo | null>(null);
    const [isGrupoModalOpen, setIsGrupoModalOpen] = useState(false);
    const [isDeleteGrupoOpen, setIsDeleteGrupoOpen] = useState(false);

    const { createGrupo, updateGrupo, deleteGrupo, isProcessingGrupo } = useAdicionalMutations(restauranteId);

    const handleSaveGrupo = (d: Partial<AdicionalGrupo>) => {
        if (selectedGrupo) {
            updateGrupo({ id: selectedGrupo._id, dados: d });
        } else {
            createGrupo(d);
        }
        setIsGrupoModalOpen(false);
    };

    return (
        <div className="space-y-8 animate-fade-in text-text-primary">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-10 bg-surface-white rounded-[3rem] border border-border-gray shadow-sm relative overflow-hidden group">
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-primary-green/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <Layers className="w-8 h-8 text-primary-green" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-text-primary tracking-tight">Personalização de Itens</h2>
                        <p className="text-text-secondary font-medium text-sm">Crie regras de escolha, adicionais e variações para seus pratos.</p>
                    </div>
                </div>
                <Button className="relative z-10 h-14 px-8 rounded-2xl bg-primary-navy hover:bg-primary-navy/90 text-white font-black gap-2 shadow-xl shadow-primary-navy/20 border-none transition-all active:scale-95 cursor-pointer" onClick={() => { setSelectedGrupo(null); setIsGrupoModalOpen(true); }}>
                    <Plus className="w-5 h-5" />
                    CRIAR NOVO GRUPO
                </Button>
                
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-green/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-navy/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
            </div>

            <div className="grid grid-cols-1 gap-6">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1,2,3].map(i => <div key={i} className="h-32 bg-surface-white rounded-3xl animate-pulse border border-border-gray" />)}
                    </div>
                ) : (grupos || []).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-surface-white rounded-3xl border-2 border-dashed border-border-gray shadow-sm">
                        <Layers className="w-12 h-12 text-text-tertiary mb-4 opacity-10" />
                        <h3 className="text-lg font-black text-text-primary">Nenhum grupo de adicionais</h3>
                        <p className="text-text-secondary font-medium text-sm">Ofereça opções extras para seus clientes.</p>
                    </div>
                ) : (
                    grupos?.map((grupo) => (
                        <GrupoCardRefactored 
                            key={grupo._id} 
                            grupo={grupo} 
                            onEdit={() => { setSelectedGrupo(grupo); setIsGrupoModalOpen(true); }}
                            onDelete={() => { setSelectedGrupo(grupo); setIsDeleteGrupoOpen(true); }}
                        />
                    ))
                )}
            </div>

            <AdicionalGrupoModalRefactored 
                open={isGrupoModalOpen} 
                onOpenChange={setIsGrupoModalOpen} 
                grupo={selectedGrupo}
                onSubmit={handleSaveGrupo}
                isLoading={isProcessingGrupo}
            />

            <Dialog open={isDeleteGrupoOpen} onOpenChange={setIsDeleteGrupoOpen}>
                <DialogContent className="sm:max-w-[420px] bg-surface-white border-border-gray shadow-2xl rounded-[2.5rem] p-8 text-text-primary">
                    <DialogHeader className="space-y-4">
                        <div className="w-16 h-16 bg-error-bg rounded-2xl flex items-center justify-center mx-auto"><Trash2 className="w-8 h-8 text-error-text" /></div>
                        <DialogTitle className="text-text-primary font-black text-2xl text-center">Remover Grupo?</DialogTitle>
                        <DialogDescription className="text-center font-medium text-text-secondary text-sm">Isso removerá este grupo e todas as opções contidas nele.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3 mt-8">
                        <Button variant="ghost" className="h-14 rounded-2xl font-bold text-text-tertiary hover:bg-surface-light border-none shadow-none cursor-pointer transition-all" onClick={() => setIsDeleteGrupoOpen(false)}>CANCELAR</Button>
                        <Button variant="destructive" className="h-14 rounded-2xl font-black shadow-lg cursor-pointer active:scale-95 transition-all border-none" onClick={() => deleteGrupo(selectedGrupo!._id)} disabled={isProcessingGrupo}>
                            {isProcessingGrupo ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : "CONFIRMAR"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function GrupoCardRefactored({ grupo, onEdit, onDelete }: { grupo: AdicionalGrupo, onEdit: () => void, onDelete: () => void }) {
    const { deleteFotoAdicional, isUploadingAdicional, isDeletingFotoAdicional } = useAdicionalMutations();
    const queryClient = useQueryClient();
    const { data: opcoes, isLoading } = useQuery({
        queryKey: ['adicionais-opcoes', grupo._id],
        queryFn: () => cardapioService.listarOpcoesAdicionais(grupo._id),
    });

    const [isOpcaoModalOpen, setIsOpcaoModalOpen] = useState(false);
    const [selectedOpcao, setSelectedOpcao] = useState<AdicionalOpcao | null>(null);

    const mutationOpcao = useMutation({
        mutationFn: async ({ dados, file }: { dados: Partial<AdicionalOpcao>, file?: File | null }) => {
            let res;
            if (selectedOpcao) {
                res = await cardapioService.atualizarOpcaoAdicional(selectedOpcao._id, dados);
            } else {
                res = await cardapioService.criarOpcaoAdicional({ ...dados, grupo_id: grupo._id });
            }
            
            if (file) {
                await cardapioService.uploadFotoAdicional(res._id, file);
            }
            return res;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adicionais-opcoes', grupo._id] });
            toast.success("Opção salva!");
            setIsOpcaoModalOpen(false);
        }
    });

    const deleteOpcao = useMutation({
        mutationFn: (id: string) => cardapioService.deletarOpcaoAdicional(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adicionais-opcoes', grupo._id] });
            toast.success("Opção removida.");
        }
    });

    return (
        <div className="bg-surface-white rounded-[2.5rem] border border-border-gray shadow-sm overflow-hidden flex flex-col group/card hover:shadow-xl transition-all duration-500 text-text-primary">
            <div className="p-8 bg-surface-light/30 border-b border-border-gray flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-primary-navy text-white flex items-center justify-center shadow-xl shadow-primary-navy/10 relative overflow-hidden group-hover/card:scale-105 transition-transform duration-500">
                        <Layers className="w-8 h-8 relative z-10" />
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-black tracking-tight">{grupo.nome}</h3>
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "text-[9px] font-black uppercase px-2.5 py-1 rounded-lg shadow-sm text-white",
                                    grupo.tipo === 'variacao' 
                                        ? "bg-primary-navy" 
                                        : "bg-primary-green"
                                )}>{grupo.tipo === 'variacao' ? 'ESCOLHA ÚNICA' : 'MÚLTIPLA'}</span>
                                {grupo.obrigatorio && <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border border-red-500 bg-red-500 text-white animate-pulse shadow-sm shadow-red-500/20">Obrigatório</span>}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-text-tertiary"><CheckCircle2 className="w-3.5 h-3.5 text-primary-green" />Min: <span className="text-text-primary">{grupo.min}</span></div>
                            <div className="w-1 h-1 rounded-full bg-border-gray" />
                            <div className="flex items-center gap-1.5 text-xs font-bold text-text-tertiary"><AlertCircle className="w-3.5 h-3.5 text-blue-500" />Max: <span className="text-text-primary">{grupo.max}</span></div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={onEdit} className="h-11 w-11 rounded-2xl border-border-gray hover:border-primary-green hover:text-primary-green transition-all shadow-sm bg-surface-white cursor-pointer active:scale-90"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="outline" size="icon" onClick={onDelete} className="h-11 w-11 rounded-2xl border-border-gray hover:border-error-text hover:text-error-text transition-all shadow-sm text-text-tertiary bg-surface-white cursor-pointer active:scale-90"><Trash2 className="w-4 h-4" /></Button>
                </div>
            </div>
            <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2"><h4 className="text-[10px] font-black text-text-tertiary uppercase tracking-[0.2em]">Itens Disponíveis</h4><div className="h-px w-24 bg-border-gray/50" /></div>
                    <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl text-xs font-black gap-2 border-primary-green/20 text-primary-green hover:bg-primary-green hover:text-white transition-all shadow-sm bg-surface-white cursor-pointer active:scale-95" onClick={() => { setSelectedOpcao(null); setIsOpcaoModalOpen(true); }}><Plus className="w-3.5 h-3.5" /> NOVO ITEM</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {isLoading ? <div className="col-span-full py-4 flex gap-2">{[1,2,3].map(i => <div key={i} className="h-16 flex-1 bg-surface-light rounded-2xl animate-pulse" />)}</div> :
                     (opcoes || []).length === 0 ? <div className="col-span-full py-10 flex flex-col items-center gap-3 bg-surface-light/20 border border-dashed border-border-gray rounded-3xl"><Plus className="w-6 h-6 text-text-tertiary opacity-20" /><p className="text-xs font-bold text-text-tertiary italic">Nenhum item.</p></div> :
                     opcoes?.map((opcao) => (
                        <div key={opcao._id} className="group/item flex items-center justify-between p-4 bg-surface-light/40 rounded-2xl border border-border-gray/40 hover:bg-surface-white hover:border-primary-green/30 hover:shadow-md transition-all duration-300">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="relative w-12 h-12 rounded-xl bg-surface-light border border-border-gray/50 overflow-hidden flex items-center justify-center shrink-0 shadow-inner group-hover/item:scale-105 transition-transform">
                                    {opcao.foto_adicional ? <Image src={opcao.foto_adicional} alt={opcao.nome} fill unoptimized className="object-cover" /> : <ImageIcon className="w-5 h-5 text-text-tertiary/20" />}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-bold text-text-primary leading-tight truncate">{opcao.nome}</span>
                                    <span className="text-[10px] font-black text-primary-green/80 mt-0.5">+ R$ {opcao.preco.toFixed(2).replace('.', ',')}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-all scale-90 group-hover/item:scale-100 shrink-0">
                                <button onClick={() => { setSelectedOpcao(opcao); setIsOpcaoModalOpen(true); }} className="p-1.5 text-text-tertiary hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer active:scale-90"><Pencil className="w-3.5 h-3.5" /></button>
                                <button onClick={() => confirm(`Deseja remover "${opcao.nome}"?`) && deleteOpcao.mutate(opcao._id)} className="p-1.5 text-text-tertiary hover:text-error-text hover:bg-error-bg rounded-lg transition-colors cursor-pointer active:scale-90"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                        </div>
                     ))}
                </div>
            </div>
            <AdicionalOpcaoModalRefactored 
                open={isOpcaoModalOpen} 
                onOpenChange={setIsOpcaoModalOpen} 
                opcao={selectedOpcao} 
                onSubmit={(d, f) => mutationOpcao.mutate({ dados: d, file: f })} 
                onDeletePhoto={() => selectedOpcao && deleteFotoAdicional(selectedOpcao._id)}
                isLoading={mutationOpcao.isPending || isUploadingAdicional || isDeletingFotoAdicional} 
            />
        </div>
    );
}

interface AdicionalModalProps<T> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: Partial<T>, file?: File | null) => void;
    onDeletePhoto?: () => void;
    isLoading: boolean;
    grupo?: AdicionalGrupo | null;
    opcao?: AdicionalOpcao | null;
}

function AdicionalGrupoModalRefactored({ open, onOpenChange, grupo, onSubmit, isLoading }: AdicionalModalProps<AdicionalGrupo>) {
    const [nome, setNome] = useState("");
    const [tipo, setTipo] = useState<'adicional' | 'variacao'>('adicional');
    const [obrigatorio, setObrigatorio] = useState(false);
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(1);

    useEffect(() => {
        if (grupo && open) { setNome(grupo.nome); setTipo(grupo.tipo); setObrigatorio(grupo.obrigatorio); setMin(grupo.min); setMax(grupo.max); }
        else if (open) { setNome(""); setTipo('adicional'); setObrigatorio(false); setMin(0); setMax(1); }
    }, [grupo, open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-surface-white border-border-gray shadow-2xl rounded-[3rem] p-0 overflow-hidden text-text-primary">
                <DialogHeader className="p-10 pb-6 bg-surface-light/30 border-b border-border-gray">
                    <DialogTitle className="text-text-primary font-black text-2xl tracking-tight">{grupo ? "Editar Grupo" : "Novo Grupo"}</DialogTitle>
                    <DialogDescription className="font-medium text-text-secondary text-sm">Defina as regras de escolha.</DialogDescription>
                </DialogHeader>
                <div className="p-10 space-y-6">
                    <div className="space-y-2"><Label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Nome do Grupo</Label><Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Escolha o Ponto da Carne..." className="h-14 bg-surface-light border border-border-gray rounded-2xl text-text-primary font-bold shadow-inner focus:ring-4 focus:ring-primary-green/5" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Tipo</Label><div className="relative"><select value={tipo} onChange={(e) => setTipo(e.target.value as 'adicional' | 'variacao')} className="w-full h-14 rounded-2xl bg-surface-light border border-border-gray px-4 text-sm text-text-primary font-bold outline-none cursor-pointer transition-all focus:ring-4 focus:ring-primary-green/5 text-text-primary shadow-inner appearance-none"><option value="adicional">Múltipla</option><option value="variacao">Única</option></select><ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" /></div></div>
                        <div className="flex items-center justify-between p-4 bg-surface-light/50 border border-border-gray rounded-2xl mt-6 h-14 text-text-primary shadow-inner"><Label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Obrigatório</Label><Switch checked={obrigatorio} onCheckedChange={setObrigatorio} className="cursor-pointer" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Mínimo</Label><Input type="number" value={min} min={0} onChange={(e) => setMin(Number(e.target.value))} className="h-14 bg-surface-light border border-border-gray rounded-2xl font-bold text-text-primary shadow-inner focus:ring-4 focus:ring-primary-green/5" /></div>
                        <div className="space-y-2"><Label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Máximo</Label><Input type="number" value={max} min={1} onChange={(e) => setMax(Number(e.target.value))} className="h-14 bg-surface-light border border-border-gray rounded-2xl font-bold text-text-primary shadow-inner focus:ring-4 focus:ring-primary-green/5" /></div>
                    </div>
                </div>
                <div className="p-10 pt-0 grid grid-cols-2 gap-4"><Button variant="ghost" className="h-14 rounded-2xl font-bold text-text-tertiary hover:bg-surface-light border-none shadow-none cursor-pointer transition-all active:scale-95" onClick={() => onOpenChange(false)}>CANCELAR</Button><Button onClick={() => onSubmit({ nome, tipo, obrigatorio, min, max })} disabled={isLoading} className="h-14 rounded-2xl font-black bg-primary-green text-white shadow-lg shadow-primary-green/5 cursor-pointer active:scale-95 transition-all border-none">{isLoading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : "SALVAR GRUPO"}</Button></div>
            </DialogContent>
        </Dialog>
    );
}

function AdicionalOpcaoModalRefactored({ open, onOpenChange, opcao, onSubmit, onDeletePhoto, isLoading }: AdicionalModalProps<AdicionalOpcao>) {
    const [nome, setNome] = useState("");
    const [preco, setPreco] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (opcao && open) { 
            setNome(opcao.nome); 
            setPreco(opcao.preco); 
            setSelectedFile(null);
            setPreviewUrl(null);
        }
        else if (open) { 
            setNome(""); 
            setPreco(0); 
            setSelectedFile(null);
            setPreviewUrl(null);
        }
    }, [opcao, open]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleRemovePreview = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-surface-white border-border-gray shadow-2xl rounded-[3rem] p-0 overflow-hidden text-text-primary">
                <DialogHeader className="p-10 pb-6 bg-surface-light/30 border-b border-border-gray text-text-primary">
                    <DialogTitle className="text-text-primary font-black text-2xl tracking-tight">{opcao ? "Editar Item" : "Novo Item"}</DialogTitle>
                    <DialogDescription className="font-medium text-text-secondary text-sm">Adicione fotos e preços aos seus extras.</DialogDescription>
                </DialogHeader>

                <div className="p-10 space-y-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
                    {/* Seção da Foto */}
                    <div className="flex flex-col items-center gap-4">
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="relative w-40 h-40 group cursor-pointer"
                        >
                            <div className={cn(
                                "w-full h-full rounded-[2.5rem] bg-surface-light border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-300 shadow-inner",
                                previewUrl || opcao?.foto_adicional ? "border-primary-green/30" : "border-border-gray hover:border-primary-green/50"
                            )}>
                                {previewUrl ? (
                                    <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                                ) : opcao?.foto_adicional ? (
                                    <Image src={opcao.foto_adicional} alt="Adicional" fill unoptimized className="object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 opacity-30">
                                        <Utensils className="w-10 h-10 text-text-tertiary" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Sem Foto</span>
                                    </div>
                                )}
                                
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            
                            <div className="absolute -bottom-2 -right-2 p-2.5 bg-primary-green text-white rounded-2xl shadow-lg hover:scale-105 transition-all z-10 border-4 border-surface-white">
                                <Camera className="w-4 h-4" />
                            </div>

                            {previewUrl && (
                                <button 
                                    type="button"
                                    onClick={handleRemovePreview}
                                    className="absolute -top-2 -right-2 p-1.5 bg-error-button text-white rounded-full shadow-md hover:scale-110 transition-all z-20 border-2 border-surface-white cursor-pointer active:scale-90"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}

                            {!previewUrl && opcao?.foto_adicional && onDeletePhoto && (
                                <button 
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); onDeletePhoto(); }}
                                    className="absolute -top-2 -right-2 p-1.5 bg-error-button text-white rounded-full shadow-md hover:scale-110 transition-all z-20 border-2 border-surface-white cursor-pointer active:scale-90"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                        <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-tight">Clique para {opcao?.foto_adicional ? 'trocar' : 'adicionar'} imagem</p>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Nome do Item</Label>
                            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Bacon, Queijo Extra..." className="h-14 bg-surface-light border border-border-gray rounded-2xl text-text-primary font-bold focus:ring-4 focus:ring-primary-green/5 shadow-inner" />
                        </div>
                        
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest ml-1">Preço Adicional (R$)</Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-primary-green text-sm">R$</span>
                                <Input type="number" step="0.01" min={0} value={preco} onChange={(e) => setPreco(Number(e.target.value))} className="h-14 bg-surface-light border border-border-gray rounded-2xl font-black text-text-primary pl-10 focus:ring-4 focus:ring-primary-green/5 shadow-inner" />
                            </div>
                            <p className="text-[9px] text-text-tertiary font-bold px-1 italic">Use R$ 0,00 para itens grátis.</p>
                        </div>
                    </div>
                </div>

                <div className="p-10 pt-0 grid grid-cols-2 gap-4">
                    <Button variant="ghost" className="h-14 rounded-2xl font-bold text-text-tertiary hover:bg-surface-light border-none shadow-none cursor-pointer transition-all active:scale-95" onClick={() => onOpenChange(false)}>CANCELAR</Button>
                    <Button onClick={() => onSubmit({ nome, preco }, selectedFile)} disabled={isLoading} className="h-14 rounded-2xl font-black bg-primary-green text-white shadow-lg shadow-primary-green/5 cursor-pointer active:scale-95 transition-all border-none">
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : "SALVAR ITEM"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
