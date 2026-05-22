"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useMeusRestaurantes, useEnderecoRestaurante } from "@/hooks/useRestaurantes";
import { Restaurante } from "@/services/restauranteService";

interface ActiveRestauranteContextType {
  activeRestaurante: Restaurante | undefined;
  activeRestauranteId: string | undefined;
  restaurantes: Restaurante[];
  isLoading: boolean;
  isComplete: boolean;
  hasAddress: boolean;
  selectRestaurante: (id: string) => void;
}

const ActiveRestauranteContext = createContext<ActiveRestauranteContextType | undefined>(undefined);

export function ActiveRestauranteProvider({ children }: { children: React.ReactNode }) {
  const { data: restauranteData, isLoading } = useMeusRestaurantes();
  const [activeId, setActiveId] = useState<string | null>(null);

  const restaurantes = useMemo(() => restauranteData?.docs || [], [restauranteData]);

  useEffect(() => {
    if (restaurantes.length > 0 && !activeId) {
      const savedId = localStorage.getItem("rango-active-restaurante");
      const exists = restaurantes.some(r => r._id === savedId);
      
      if (savedId && exists) {
        setActiveId(savedId);
      } else {
        setActiveId(restaurantes[0]._id);
      }
    }
  }, [restaurantes, activeId]);

  const activeRestaurante = useMemo(() => {
    return restaurantes.find(r => r._id === activeId) || restaurantes[0];
  }, [restaurantes, activeId]);
  
  // Verificação de endereço
  const { data: endereco, isLoading: isLoadingEnd } = useEnderecoRestaurante(activeRestaurante?._id);

  const selectRestaurante = (id: string) => {
    setActiveId(id);
    localStorage.setItem("rango-active-restaurante", id);
  };

  const isComplete = !!(activeRestaurante?.cnpj && endereco);
  const hasAddress = !!endereco;

  return (
    <ActiveRestauranteContext.Provider 
      value={{ 
        activeRestaurante, 
        activeRestauranteId: activeRestaurante?._id, 
        restaurantes, 
        isLoading: isLoading || (restaurantes.length > 0 && isLoadingEnd), 
        isComplete,
        hasAddress,
        selectRestaurante 
      }}
    >
      {children}
    </ActiveRestauranteContext.Provider>
  );
}

export function useActiveRestaurante() {
  const context = useContext(ActiveRestauranteContext);
  if (context === undefined) {
    throw new Error("useActiveRestaurante must be used within an ActiveRestauranteProvider");
  }
  return context;
}
