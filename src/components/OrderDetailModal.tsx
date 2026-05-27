"use client";

import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Pedido } from "@/services/pedidoService";
import { 
    User, 
    MapPin, 
    CreditCard, 
    Receipt, 
    Package,
    AlertCircle,
    Phone,
    Loader2,
    FileText,
    Clock,
    ChefHat,
    Truck,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEnderecoUsuario } from "@/hooks/useEnderecos";
import { cn } from "@/lib/utils";
import { maskPhone, maskCPF } from "@/lib/masks";

interface OrderDetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pedido: Pedido | null;
}

const statusConfig = {
  criado: { label: "Pendente", icon: Clock, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50" },
  em_preparo: { label: "Em Preparo", icon: ChefHat, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50" },
  a_caminho: { label: "A Caminho", icon: Truck, color: "text-purple-600 bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/50" },
  entregue: { label: "Entregue", icon: CheckCircle2, color: "text-primary-green bg-success-bg border-success-text/10" },
  cancelado: { label: "Cancelado", icon: XCircle, color: "text-error-text bg-error-bg border-error-text/10" },
};

export function OrderDetailModal({ open, onOpenChange, pedido }: OrderDetailModalProps) {
    const cliente = pedido?.cliente_id || pedido?.usuario_id;
    const { data: enderecos, isLoading: isLoadingAddr } = useEnderecoUsuario(cliente?._id);
    
    if (!pedido) return null;

    const enderecoEntrega = enderecos?.find(e => e.principal) || enderecos?.[0];
    const status = statusConfig[pedido.status] || statusConfig.criado;
    const StatusIcon = status.icon;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] w-[95vw] bg-surface-white border-border-gray shadow-2xl rounded-[2rem] p-0 text-text-primary">
                <DialogHeader className="p-6 pb-4 border-b border-border-gray bg-surface-light/30">
                    <DialogTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-primary-navy text-white flex items-center justify-center shadow-lg">
                                <Receipt className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Pedido</span>
                                <span className="text-text-primary font-black">#{pedido._id.slice(-6).toUpperCase()}</span>
                            </div>
                        </div>
                        <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest", status.color)}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {status.label}
                        </div>
                    </DialogTitle>
                    <DialogDescription className="hidden">Detalhes do pedido</DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Cliente */}
                    <section className="space-y-3">
                        <h3 className="text-xs font-black text-text-tertiary uppercase tracking-wider flex items-center gap-2">
                            <User className="w-3 h-3" /> Cliente
                        </h3>
                        <div className="bg-surface-light/50 p-4 rounded-2xl border border-border-gray/50 space-y-3">
                            <div>
                                <p className="font-bold text-text-primary">{cliente?.nome || "Cliente não identificado"}</p>
                                <p className="text-sm text-text-secondary">{cliente?.email || "-"}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border-gray/30">
                                {cliente?.telefone && (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-text-tertiary uppercase">WhatsApp</span>
                                        <div className="flex items-center gap-1.5 text-primary-green text-xs font-black">
                                            <Phone className="w-3 h-3" />
                                            {maskPhone(cliente.telefone)}
                                        </div>
                                    </div>
                                )}
                                {cliente?.cpf && (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[9px] font-black text-text-tertiary uppercase">Documento</span>
                                        <div className="flex items-center gap-1.5 text-text-primary text-xs font-bold">
                                            <FileText className="w-3 h-3 text-text-tertiary" />
                                            {maskCPF(cliente.cpf)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Endereço */}
                    <section className="space-y-3">
                        <h3 className="text-xs font-black text-text-tertiary uppercase tracking-wider flex items-center gap-2">
                            <MapPin className="w-3 h-3" /> Entrega
                        </h3>
                        <div className="bg-surface-light/50 p-4 rounded-2xl border border-border-gray/50">
                            {isLoadingAddr ? (
                                <div className="flex items-center gap-2 text-text-tertiary py-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-xs font-medium">Buscando endereço...</span>
                                </div>
                            ) : enderecoEntrega ? (
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-text-primary leading-tight">
                                        {enderecoEntrega.rua}, {enderecoEntrega.numero}
                                    </p>
                                    <p className="text-xs text-text-secondary">
                                        {enderecoEntrega.bairro} - {enderecoEntrega.cidade}/{enderecoEntrega.estado}
                                    </p>
                                    {enderecoEntrega.complemento && (
                                        <p className="text-[11px] text-text-tertiary italic">
                                            Obs: {enderecoEntrega.complemento}
                                        </p>
                                    )}
                                    <div className="inline-flex items-center px-2 py-0.5 bg-primary-green/10 text-primary-green rounded text-[9px] font-black uppercase mt-2">
                                        Endereço Principal
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                                        <AlertCircle className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-text-primary">Endereço não cadastrado</p>
                                        <p className="text-[10px] text-text-secondary leading-tight mt-1">
                                            O cliente ainda não cadastrou um endereço principal para entregas.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Itens */}
                    <section className="space-y-3">
                        <h3 className="text-xs font-black text-text-tertiary uppercase tracking-wider flex items-center gap-2">
                            <Package className="w-3 h-3" /> Itens do Pedido
                        </h3>
                        <div className="space-y-2">
                            {pedido.itens.map((item, idx) => {
                                // Cálculo correto do item incluindo adicionais
                                const totalAdicionais = (item.adicionais || []).reduce((acc, ad) => acc + (ad.preco_unitario * ad.quantidade), 0);
                                const totalLinhaItem = (item.preco_unitario + totalAdicionais) * item.quantidade;
                                
                                return (
                                    <div key={idx} className="bg-surface-white p-4 rounded-2xl border border-border-gray flex flex-col gap-2 shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-3">
                                                <span className="font-black text-primary-green">{item.quantidade}x</span>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-text-primary leading-tight">{item.prato_id?.nome || item.prato_nome || "Prato removido"}</span>
                                                    <span className="text-[10px] text-text-tertiary">Unitário: R$ {item.preco_unitario.toFixed(2).replace('.', ',')}</span>
                                                </div>
                                            </div>
                                            <span className="font-bold text-text-primary text-sm whitespace-nowrap">
                                                R$ {totalLinhaItem.toFixed(2).replace('.', ',')}
                                            </span>
                                        </div>

                                        {/* Listagem de Adicionais se houver */}
                                        {(item.adicionais || []).length > 0 && (
                                            <div className="mt-2 pl-7 space-y-1 border-l-2 border-primary-green/20">
                                                {item.adicionais?.map((ad, adIdx) => (
                                                    <div key={adIdx} className="flex justify-between text-[10px] text-text-secondary">
                                                        <span>+ {ad.quantidade}x {ad.opcao_nome}</span>
                                                        <span className="font-bold">R$ {(ad.preco_unitario * ad.quantidade).toFixed(2).replace('.', ',')}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Totais */}
                    <section className="pt-4 border-t border-dashed border-border-gray space-y-2">
                        <div className="flex justify-between text-sm text-text-secondary">
                            <span>Subtotal</span>
                            <span className="font-bold text-text-primary">R$ {(pedido.totais?.subtotal || 0).toFixed(2).replace('.', ',')}</span>
                        </div>
                        <div className="flex justify-between text-sm text-text-secondary">
                            <span>Taxa de Entrega</span>
                            <span className="font-bold text-text-primary">R$ {(pedido.totais?.taxa_entrega || 0).toFixed(2).replace('.', ',')}</span>
                        </div>
                        <div className="flex justify-between text-lg font-black text-text-primary pt-3 border-t border-border-gray/30 mt-2">
                            <span>Total Geral</span>
                            <span className="text-primary-green text-xl">R$ {(pedido.totais?.total || 0).toFixed(2).replace('.', ',')}</span>
                        </div>
                    </section>

                    {/* Pagamento */}
                    <section className="space-y-3">
                        <h3 className="text-xs font-black text-text-tertiary uppercase tracking-wider flex items-center gap-2">
                            <CreditCard className="w-3 h-3" /> Pagamento
                        </h3>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-light rounded-xl border border-border-gray text-xs font-bold text-text-primary uppercase shadow-sm">
                            {pedido.forma_pagamento || "Não informado"}
                        </div>
                    </section>
                </div>

                <div className="p-6 bg-surface-light/30 border-t border-border-gray text-center flex flex-col gap-1">
                    <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-tighter">
                        ID do Pedido: {pedido._id}
                    </p>
                    <p className="text-[9px] text-text-tertiary font-medium">
                        Registro: {pedido.createdAt ? format(new Date(pedido.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: ptBR }) : "--/--/----"}
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
