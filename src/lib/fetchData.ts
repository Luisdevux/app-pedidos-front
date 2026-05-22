// src/lib/fetchData.ts

type FetchMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface FetchError {
  status: number;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

function getApiUrl(): string {
  if (typeof window === "undefined") {
    // No servidor, usamos o endpoint interno ou o URL real
    const serverUrl = process.env.API_URL_SERVER_SIDED || process.env.NEXT_PUBLIC_API_URL;
    if (!serverUrl) throw new Error("NEXT_PUBLIC_API_URL não está definido");
    return serverUrl;
  }

  const clientUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!clientUrl) throw new Error("NEXT_PUBLIC_API_URL não está definido");
  return clientUrl;
}

export async function fetchData<T>(
  url: string,
  method: FetchMethod = "GET",
  token?: string | null,
  body?: unknown,
  options?: RequestInit
): Promise<T> {
  const API_URL = getApiUrl();
  const headers: HeadersInit = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(body ? { "Content-Type": "application/json" } : {}),
    ...options?.headers,
  };

  const fetchOptions: RequestInit = {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
    ...options,
    cache: options?.cache || "no-store",
  };

  let response: Response;
  try {
    response = await fetch(`${API_URL}${url}`, fetchOptions);
  } catch (err) {
    throw {
      status: 0,
      message: "Erro de conexão com a API",
      error: err
    } as FetchError;
  }

  let data: T | FetchError;
  try {
    data = (await response.json()) as T;
  } catch {
    data = {
      status: response.status,
      message: "Resposta da API não é JSON válido"
    };
  }

  if (!response.ok) {
    // Token expirado - força logout se estiver no cliente
    if (response.status === 401 && typeof window !== "undefined" && !url.includes('/login')) {
      // Opcional: Redirecionar para login ou refresh
    }

    throw {
      status: response.status,
      message: (data as { message?: string })?.message || (data as { error?: string })?.error || "Erro na requisição",
      ...data,
    } as FetchError;
  }

  return data as T;
}
