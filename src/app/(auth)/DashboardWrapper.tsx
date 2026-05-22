"use client";

import { useMeusRestaurantes } from "@/hooks/useRestaurantes";
import Onboarding from "@/components/Onboarding";

export default function DashboardWrapper({ children }: { children: React.ReactNode }) {
  const { data: restauranteData, isLoading } = useMeusRestaurantes();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light">
        <div className="w-12 h-12 border-4 border-primary-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Se o usuário não tem restaurante cadastrado, mostra o Onboarding
  if (!restauranteData?.docs || restauranteData.docs.length === 0) {
    return <Onboarding />;
  }

  return <>{children}</>;
}
