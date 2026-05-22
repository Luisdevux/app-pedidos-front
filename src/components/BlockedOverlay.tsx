"use client";

import { AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

interface BlockedOverlayProps {
    title: string;
    description: string;
}

export function BlockedOverlay({ title, description }: BlockedOverlayProps) {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-primary-navy/20 dark:bg-black/60 backdrop-blur-[4px] rounded-[2.5rem]">
            <div className="max-w-md w-full bg-surface-white p-10 rounded-[2.5rem] shadow-2xl border border-border-gray text-center animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <AlertCircle className="w-12 h-12" />
                </div>
                
                <h2 className="text-2xl font-black text-text-primary mb-4 leading-tight">
                    {title}
                </h2>
                
                <p className="text-sm text-text-secondary mb-10 leading-relaxed font-medium">
                    {description}
                </p>
                
                <Link href="/restaurante" className="block w-full">
                    <Button className="w-full h-14 rounded-2xl font-black gap-3 shadow-lg shadow-primary-green/20 hover:scale-[1.02] active:scale-95 transition-all text-base">
                        COMPLETAR MEU PERFIL
                        <ArrowRight className="w-5 h-5" />
                    </Button>
                </Link>
                
                <p className="mt-6 text-[10px] text-text-tertiary font-bold uppercase tracking-widest opacity-50">
                    RanGo • Gestão de Parceiros
                </p>
            </div>
        </div>
    );
}
