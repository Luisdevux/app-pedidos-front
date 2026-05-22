"use client";

import { useSession, signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ClipboardList, 
  Settings, 
  LogOut,
  Menu,
  X,
  User,
  ChevronDown,
  Store,
  Moon,
  Sun
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/providers/ThemeProvider";
import { useActiveRestaurante } from "@/hooks/useActiveRestaurante";

import Image from "next/image";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: ClipboardList, label: "Pedidos", href: "/pedidos" },
  { icon: UtensilsCrossed, label: "Cardápio", href: "/cardapio" },
  { icon: Settings, label: "Gerenciamento", href: "/restaurante" },
  { icon: User, label: "Perfil", href: "/perfil" },
];

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { restaurantes, activeRestaurante, selectRestaurante } = useActiveRestaurante();
  const [isStoreMenuOpen, setIsStoreMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-surface-light text-text-primary">
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-border-gray"
      >
        {isOpen ? <X className="text-primary-navy" /> : <Menu className="text-primary-navy" />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-primary-navy text-white transition-transform duration-300 transform lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 overflow-hidden">
              <Image src="/icone-rango.svg" alt="Rango Logo" width={32} height={32} className="shrink-0" />
              <span className="text-lg font-bold tracking-tight text-white truncate">Rango Admin</span>
            </div>
            
            <button 
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-secondary-navy hover:bg-opacity-80 transition-colors text-white shrink-0"
                title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
            >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>

          {/* Restaurante Selector */}
          {restaurantes.length > 0 && (
            <div className="mb-8 px-1 relative">
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Gerenciando</div>
                
                <button 
                    onClick={() => setIsStoreMenuOpen(!isStoreMenuOpen)}
                    className={cn(
                        "w-full flex items-center gap-3 p-3.5 bg-secondary-navy rounded-2xl border transition-all duration-300 group",
                        isStoreMenuOpen ? "border-primary-green ring-4 ring-primary-green/10" : "border-white/5 hover:border-white/20"
                    )}
                >
                    <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary-green/20 to-primary-green/5 flex items-center justify-center text-primary-green group-hover:scale-110 transition-transform">
                        <Store className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                        <p className="text-white text-[13px] font-bold truncate">
                            {activeRestaurante?.nome || "Selecionar Loja"}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">Unidade Ativa</p>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-gray-500 transition-transform duration-300", isStoreMenuOpen && "rotate-180")} />
                </button>

                {isStoreMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsStoreMenuOpen(false)} />
                        <div className="absolute left-1 right-1 top-full mt-2 bg-secondary-navy border border-white/10 rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top">
                            <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase">Minhas Lojas</div>
                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                {restaurantes.map(r => (
                                    <button
                                        key={r._id}
                                        onClick={() => {
                                            selectRestaurante(r._id);
                                            setIsStoreMenuOpen(false);
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-3 hover:bg-white/5 transition-colors text-left",
                                            activeRestaurante?._id === r._id ? "text-primary-green bg-primary-green/5" : "text-gray-300"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            activeRestaurante?._id === r._id ? "bg-primary-green shadow-[0_0_8px_rgba(20,184,34,0.5)]" : "bg-white/10"
                                        )} />
                                        <span className="text-sm font-medium">{r.nome}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
          )}

          <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
            {menuItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                    isActive 
                      ? "bg-primary-green text-white shadow-lg shadow-primary-green/20" 
                      : "text-gray-400 hover:bg-secondary-navy hover:text-white"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-secondary-navy">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="shrink-0 w-10 h-10 rounded-full bg-secondary-navy border border-primary-green flex items-center justify-center font-bold">
                {session?.user?.name?.[0] || "U"}
              </div>
              <div className="flex flex-col overflow-hidden min-w-0">
                <span className="text-sm font-semibold truncate text-white">{session?.user?.name}</span>
                <span className="text-xs text-gray-500 truncate">{session?.user?.email}</span>
              </div>
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-medium"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-4 lg:p-8 pt-16 lg:pt-8 bg-surface-light">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
        />
      )}
    </div>
  );
}
