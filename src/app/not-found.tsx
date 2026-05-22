'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-white flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-green/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-navy/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-2xl w-full text-center relative z-10">
        <div className="relative mb-12">
          <h1 className="text-[120px] md:text-[220px] font-black text-text-primary/5 leading-none select-none tracking-tighter">
            404
          </h1>
        </div>

        <div className="space-y-4 mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-text-primary tracking-tight">
            Página não encontrada!
          </h2>
          <p className="text-base md:text-lg text-text-secondary max-w-md mx-auto font-medium leading-relaxed">
            O conteúdo que você está procurando não existe ou foi movido para outro endereço no cardápio.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-14 px-10 rounded-2xl font-black gap-3 shadow-xl shadow-primary-green/20 hover:scale-[1.02] active:scale-95 transition-all text-base">
                <Home className="w-5 h-5" />
                DASHBOARD
            </Button>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 h-14 px-10 bg-surface-light text-text-primary font-black rounded-2xl border border-border-gray hover:bg-border-gray/20 transition-all duration-300 hover:scale-[1.02] active:scale-95 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            VOLTAR
          </button>
        </div>

        <div className="mt-20 pt-8 border-t border-border-gray/30">
            <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-[0.3em] opacity-40">
                RanGo • Partner Portal System
            </p>
        </div>
      </div>
    </div>
  );
}
