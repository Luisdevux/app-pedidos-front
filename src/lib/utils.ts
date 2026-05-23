import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeFormatDate(date: string | Date | null | undefined, formatStr: string = "dd/MM/yyyy HH:mm"): string {
  if (!date) return "--/--/---- --:--";
  
  try {
    let d: Date;
    if (typeof date === 'string') {
      // Tenta converter formato brasileiro DD/MM/YYYY para Date se necessário
      if (date.includes('/') && !date.includes('T')) {
        const [day, month, year] = date.split('/').map(Number);
        d = new Date(year, month - 1, day);
      } else {
        d = new Date(date);
      }
    } else {
      d = date;
    }

    if (isNaN(d.getTime())) return "--/--/---- --:--";
    return format(d, formatStr, { locale: ptBR });
  } catch {
    return "--/--/---- --:--";
  }
}
