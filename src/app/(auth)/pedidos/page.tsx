"use client";

import { useMeusRestaurantes } from "@/hooks/useRestaurantes";
import { usePedidosRestaurante, usePedidoMutations } from "@/hooks/usePedidos";
import { Pedido } from "@/services/pedidoService";
import { 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  ChefHat,
  Eye,
  Search
} from "lucide-react";
import { cn, safeFormatDate } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OrderDetailModal } from "@/components/OrderDetailModal";
import { useActiveRestaurante } from "@/hooks/useActiveRestaurante";
import { BlockedOverlay } from "@/components/BlockedOverlay";

import { maskPhone } from "@/lib/masks";

const statusConfig = {
  criado: { label: "Pendente", icon: Clock, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/50" },
  em_preparo: { label: "Em Preparo", icon: ChefHat, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50" },
  a_caminho: { label: "A Caminho", icon: Truck, color: "text-purple-600 bg-purple-50 dark:bg-purple-950/30 border-purple-100 dark:border-purple-900/50" },
  entregue: { label: "Entregue", icon: CheckCircle2, color: "text-primary-green bg-success-bg border-success-text/10" },
  cancelado: { label: "Cancelado", icon: XCircle, color: "text-error-text bg-error-bg border-error-text/10" },
};

export default function PedidosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { activeRestaurante, isComplete } = useActiveRestaurante();
  const { data: restauranteData } = useMeusRestaurantes();
  const restauranteId = activeRestaurante?._id || restauranteData?.docs?.[0]?._id;

  const { data: pedidosData, isLoading } = usePedidosRestaurante(restauranteId);
  const { updateStatus, isUpdating } = usePedidoMutations(restauranteId || "");

  const pedidos = pedidosData?.docs || [];
  
  const filteredPedidos = pedidos.filter(p => {
    const nomeCliente = p.cliente_id?.nome || p.usuario_id?.nome || "";
    return nomeCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p._id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleOpenDetail = (pedido: Pedido) => {
    setSelectedPedido(pedido);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6 relative min-h-[60vh]">
      {!isComplete && (
        <BlockedOverlay 
            title="Pedidos Bloqueados" 
            description="Você precisa completar o cadastro da sua loja (CNPJ e Endereço) para visualizar e gerenciar os pedidos recebidos."
        />
      )}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Gestão de Pedidos</h1>
          <p className="text-text-secondary">Gerencie os pedidos em tempo real</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input 
            type="text"
            placeholder="Buscar por cliente ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-white border border-border-gray rounded-xl focus:ring-2 focus:ring-primary-green outline-none transition-all text-sm text-text-primary"
          />
        </div>
      </header>

      <div className="bg-surface-white rounded-2xl shadow-sm border border-border-gray overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-light border-b border-border-gray">
                <th className="px-6 py-4 text-xs font-bold text-text-tertiary uppercase tracking-wider">Pedido / Data</th>
                <th className="px-6 py-4 text-xs font-bold text-text-tertiary uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-bold text-text-tertiary uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-bold text-text-tertiary uppercase tracking-wider">Pagamento</th>
                <th className="px-6 py-4 text-xs font-bold text-text-tertiary uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-text-tertiary uppercase tracking-wider text-right">Ação Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-gray">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-text-secondary">Carregando pedidos...</td></tr>
              ) : filteredPedidos.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-text-secondary font-medium">Nenhum pedido encontrado.</td></tr>
              ) : (
                filteredPedidos.map((pedido) => {
                  const cliente = pedido.cliente_id || pedido.usuario_id;
                  const clienteNome = (typeof cliente === 'object' ? cliente?.nome : null) || "Cliente não identificado";
                  const clienteEmail = (typeof cliente === 'object' ? cliente?.email : null) || "-";
                  const clienteTelefone = (typeof cliente === 'object' ? cliente?.telefone : null);

                  return (
                    <tr key={pedido._id} className="hover:bg-surface-light/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-text-primary">#{pedido._id.slice(-6).toUpperCase()}</span>
                          <span className="text-[10px] font-bold text-text-primary mt-1">
                            {safeFormatDate(pedido.createdAt, "dd MMM, HH:mm")}
                          </span>
                          <span className="text-[9px] text-text-tertiary uppercase font-medium">
                            {pedido.createdAt ? (
                              (() => {
                                try {
                                  return formatDistanceToNow(new Date(pedido.createdAt), { addSuffix: true, locale: ptBR });
                                } catch {
                                  return "";
                                }
                              })()
                            ) : ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-text-primary">{clienteNome}</span>
                          <span className="text-xs text-text-tertiary">{clienteEmail}</span>
                          {clienteTelefone && (
                            <span className="text-[10px] text-primary-green font-bold mt-0.5">{maskPhone(clienteTelefone)}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-text-primary">
                        R$ {(pedido.total_pedido || pedido.totais?.total || 0).toFixed(2).replace('.', ',')}
                      </td>

                      <td className="px-6 py-4 text-xs font-medium text-text-tertiary uppercase">
                        {pedido.forma_pagamento}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={pedido.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {pedido.status === 'criado' && (
                            <Button 
                              size="sm"
                              onClick={() => updateStatus({ id: pedido._id, status: 'em_preparo' })}
                              disabled={isUpdating}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <ChefHat className="w-4 h-4 mr-1.5" />
                              Preparar
                            </Button>
                          )}
                          {pedido.status === 'em_preparo' && (
                            <Button 
                              size="sm"
                              onClick={() => updateStatus({ id: pedido._id, status: 'a_caminho' })}
                              disabled={isUpdating}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <Truck className="w-4 h-4 mr-1.5" />
                              Enviar
                            </Button>
                          )}
                          {pedido.status === 'a_caminho' && (
                            <Button 
                              size="sm"
                              onClick={() => updateStatus({ id: pedido._id, status: 'entregue' })}
                              disabled={isUpdating}
                              className="bg-primary-green"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1.5" />
                              Concluir
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-text-tertiary"
                            onClick={() => handleOpenDetail(pedido)}
                          >
                            <Eye className="w-5 h-5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderDetailModal 
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        pedido={selectedPedido}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: Pedido['status'] }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider", config.color)}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </div>
  );
}
