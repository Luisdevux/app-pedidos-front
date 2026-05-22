// src/lib/secureFetch.ts

type FetchMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface SecureFetchOptions<TBody = unknown> {
  endpoint: string;
  method?: FetchMethod;
  body?: TBody;
  params?: Record<string, string | number>;
  bodyType?: 'json' | 'formData';
  formData?: {
    file: string | File;
    fileName?: string;
  };
}

/**
 * Faz uma requisição autenticada através da API interna do Next.js
 * Isso mantém os tokens de acesso (JWT) apenas no servidor.
 */
export async function secureFetch<T, TBody = unknown>(options: SecureFetchOptions<TBody>): Promise<T> {
  const { endpoint, method = 'GET', body, params, bodyType, formData } = options;

  const response = await fetch('/api/auth/secure-fetch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint,
      method,
      body,
      params,
      bodyType,
      formData
    })
  });

  const data = await response.json().catch(() => ({ message: 'Request failed' }));

  if (!response.ok) {
    const error = new Error(data.message || data.error || 'Request failed') as Error & { status: number; data: unknown };
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as T;
}
