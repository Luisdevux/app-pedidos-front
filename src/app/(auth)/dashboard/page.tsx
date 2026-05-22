"use client";

import { useActiveRestaurante } from "@/hooks/useActiveRestaurante";
import { usePedidosRestaurante } from "@/hooks/usePedidos";
import { 
  ShoppingBag, 
  Users, 
  DollarSign,
  AlertCircle
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { cn } from "@/lib/utils";
import Link from "next/link";
import { BlockedOverlay } from "@/components/BlockedOverlay";
import { format, subDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DashboardPage() {
  const { activeRestaurante, isLoading: isLoadingRest, isComplete } = useActiveRestaurante();
  const restauranteAtivo = activeRestaurante;

  const { data: pedidosData } = usePedidosRestaurante(restauranteAtivo?._id, { limite: 100 });
  const pedidos = pedidosData?.docs || [];

  // Cálculos Reais de Totais
  const totalVendas = pedidos
    .filter(p => p.status === 'entregue')
    .reduce((acc, p) => acc + (p.total_pedido || p.totais?.total || 0), 0);

  const pedidosPendentes = pedidos.filter(p => p.status === 'criado').length;
  const totalPedidosGeral = pedidos.length;

  // Clientes únicos (verificando ambos os campos de ID de usuário possíveis)
  const uniqueClients = new Set(
    pedidos.map(p => p.cliente_id?.email || p.usuario_id?.email).filter(Boolean)
  ).size;

  // Lógica para os Gráficos (Últimos 7 dias)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayLabel = format(date, "EEE", { locale: ptBR });
    
    const dayPedidos = pedidos.filter(p => {
        if (!p.createdAt) return false;
        const pDate = new Date(p.createdAt);
        return isSameDay(pDate, date);
    });

    const dayVendas = dayPedidos
        .filter(p => p.status === 'entregue')
        .reduce((acc, p) => acc + (p.total_pedido || p.totais?.total || 0), 0);

    return {
        name: dayLabel,
        vendas: dayVendas,
        pedidos: dayPedidos.length
    };
  });

  if (isLoadingRest) return <div className="text-center py-20">Carregando dashboard...</div>;

  return (
    <div className="space-y-8 animate-fade-in relative min-h-[60vh]">
      {!isComplete && (
        <BlockedOverlay 
            title="Dashboard Bloqueado" 
            description="Complete o cadastro da sua loja para liberar as estatísticas de venda e o resumo de atividades."
        />
      )}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-secondary">Acompanhe o desempenho do {restauranteAtivo?.nome || "seu restaurante"}</p>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2 bg-surface-white rounded-xl shadow-sm border border-border-gray">
          <div className={`w-3 h-3 rounded-full ${restauranteAtivo?.status === 'aberto' ? 'bg-primary-green' : 'bg-error-button'}`} />
          <span className="text-sm font-medium text-text-primary">
            {restauranteAtivo?.status === 'aberto' ? 'Restaurante Aberto' : 'Restaurante Fechado'}
          </span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={DollarSign} 
          label="Vendas (Entregues)" 
          value={`R$ ${(totalVendas || 0).toFixed(2).replace('.', ',')}`} 
          trend="Total acumulado"
          color="bg-primary-green"
        />
        <StatCard 
          icon={ShoppingBag} 
          label="Total de Pedidos" 
          value={totalPedidosGeral} 
          trend="Incluindo cancelados"
          color="bg-card-blue"
        />
        <StatCard 
          icon={Users} 
          label="Clientes" 
          value={uniqueClients} 
          trend="Clientes únicos"
          color="bg-card-orange"
        />
        <StatCard 
          icon={AlertCircle} 
          label="Pedidos Pendentes" 
          value={pedidosPendentes} 
          trend="Aguardando preparo"
          color={pedidosPendentes > 0 ? "bg-error-button" : "bg-gray-400"}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface-white p-6 rounded-2xl shadow-sm border border-border-gray">
          <h3 className="text-lg font-bold text-text-primary mb-6">Faturamento Real (7 dias)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Line 
                  type="monotone" 
                  dataKey="vendas" 
                  stroke="#14b822" 
                  strokeWidth={3} 
                  dot={{r: 6, fill: '#14b822', strokeWidth: 0}}
                  activeDot={{r: 8, strokeWidth: 0}}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-white p-6 rounded-2xl shadow-sm border border-border-gray">
          <h3 className="text-lg font-bold text-text-primary mb-6">Volume de Pedidos (7 dias)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="pedidos" fill="#7c6af6" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-surface-white rounded-2xl shadow-sm border border-border-gray overflow-hidden">
        <div className="p-6 border-b border-border-gray flex items-center justify-between">
          <h3 className="text-lg font-bold text-text-primary">Últimas Atividades</h3>
          <Link href="/pedidos" className="text-xs font-bold text-primary-green hover:underline">Ver todos</Link>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead className="bg-surface-light/50 border-b border-border-gray">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-black text-text-tertiary uppercase">Pedido</th>
                  <th className="px-6 py-3 text-[10px] font-black text-text-tertiary uppercase">Cliente</th>
                  <th className="px-6 py-3 text-[10px] font-black text-text-tertiary uppercase">Total</th>
                  <th className="px-6 py-3 text-[10px] font-black text-text-tertiary uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-gray">
                {pedidos.slice(0, 5).map((pedido) => {
                  const cliente = pedido.cliente_id || pedido.usuario_id;
                  return (
                    <tr key={pedido._id} className="hover:bg-surface-light/30 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-text-primary">#{pedido._id.slice(-6).toUpperCase()}</td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-text-primary">{cliente?.nome || "Cliente não identificado"}</div>
                        <div className="text-[10px] text-text-tertiary">{cliente?.email || "-"}</div>
                      </td>
                      <td className="px-6 py-4 text-xs font-black text-primary-green">R$ {(pedido.total_pedido || pedido.totais?.total || 0).toFixed(2).replace('.', ',')}</td>
                      <td className="px-6 py-4">
                         <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase border border-border-gray bg-surface-light">
                            {pedido.status}
                         </div>
                      </td>
                    </tr>
                  );
                })}
                {pedidos.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-text-secondary text-sm">Nenhum pedido recente.</td>
                  </tr>
                )}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend: string;
  color: string;
}

function StatCard({ icon: Icon, label, value, trend, color }: StatCardProps) {
  return (
    <div className="bg-surface-white p-6 rounded-2xl shadow-sm border border-border-gray hover:shadow-xl hover:border-primary-green/20 transition-all cursor-default group">
      <div className="flex items-center gap-4 mb-4">
        <div className={cn("p-3 rounded-xl text-white transition-transform group-hover:scale-110", color)}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-text-secondary">{label}</p>
          <h4 className="text-2xl font-bold text-text-primary">{value}</h4>
        </div>
      </div>
      <p className="text-xs text-text-tertiary font-medium">{trend}</p>
    </div>
  );
}
