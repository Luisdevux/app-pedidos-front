// src/app/api/auth/secure-fetch/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// No servidor, preferimos a URL interna para evitar latência e problemas de rede
const API_URL = process.env.API_URL_SERVER_SIDED || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5020';

export async function POST(request: NextRequest) {
  try {
    // Pega o token JWT diretamente do cookie (seguro)
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    const accessToken = token?.accessToken || (token as { accesstoken?: string })?.accesstoken;

    if (!token || !accessToken) {
      console.warn('[SecureFetch] Tentativa de acesso sem token válido');
      return NextResponse.json(
        { error: 'Unauthorized - No active session' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { endpoint, method = 'GET', body: requestBody, params, bodyType, formData } = body;

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
    }

    // Montar URL com query params
    let fullUrl = `${API_URL}${endpoint}`;
    if (params && Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      fullUrl += `?${queryParams.toString()}`;
    }

    const headers: HeadersInit = {
      'Authorization': `Bearer ${accessToken}`,
    };

    let fetchBody: BodyInit | undefined = undefined;

    if (bodyType === 'formData' && formData) {
      const form = new FormData();

      if (formData.file && typeof formData.file === 'string') {
        // Assume base64
        const [meta, base64Data] = formData.file.split(',');
        const mime = meta.match(/:(.*?);/)?.[1] || 'image/png';

        // Converter base64 para Uint8Array (mais compatível com Blob nativo)
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([bytes], { type: mime });
        const fileName = formData.fileName || 'upload.png';

        // Envia nos dois campos para garantir que o backend receba independente do controller
        form.append('file', blob, fileName);
        form.append('imagem', blob, fileName);
      }

      fetchBody = form;
    } else {
      headers['Content-Type'] = 'application/json';
      fetchBody = requestBody ? JSON.stringify(requestBody) : undefined;
    }

    const response = await fetch(fullUrl, {
      method,
      headers,
      body: fetchBody,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error(`[SecureFetch] Erro na API (${response.status}):`, data);
      return NextResponse.json(data || { error: 'Request failed' }, { status: response.status });
    }

    return NextResponse.json(data);

  } catch (error: unknown) {
    console.error('[SecureFetch] Erro Crítico:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
