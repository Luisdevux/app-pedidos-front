// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

import { JWT } from "next-auth/jwt";

// No servidor, preferimos a URL interna se disponível
const API_URL = process.env.API_URL_SERVER_SIDED || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5020";

/**
 * Helper para renovar o token de acesso usando o refresh token
 */
async function refreshAccessToken(token: JWT) {
  try {
    if (!token.refreshToken) {
      throw new Error("No refresh token available");
    }

    console.log("[NextAuth] Tentando renovar access token...");
    
    const response = await axios.post(`${API_URL}/refresh`, {
      refresh_token: token.refreshToken,
    });

    const data = response.data?.data;
    const apiUser = data?.user;

    if (!apiUser) {
      throw new Error("Falha ao renovar token: Resposta inválida");
    }

    console.log("[NextAuth] Token renovado com sucesso!");

    return {
      ...token,
      accessToken: apiUser.accesstoken || apiUser.accessToken,
      refreshToken: apiUser.refreshtoken || apiUser.refreshToken || token.refreshToken,
      accessTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
    };
  } catch (_error) {
    console.error("[NextAuth] Erro ao renovar access token:", _error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Rango Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        try {
          const response = await axios.post(`${API_URL}/login`, {
            email: credentials?.email,
            senha: credentials?.password,
          });

          const data = response.data?.data;
          const apiUser = data?.user;

          if (apiUser) {
            return {
              id: apiUser._id,
              name: apiUser.nome,
              email: apiUser.email,
              role: apiUser.role,
              accessToken: apiUser.accessToken || apiUser.accesstoken,
              refreshToken: apiUser.refreshtoken || apiUser.refreshToken,
            };
          }
          return null;
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const response = await axios.post(`${API_URL}/google`, {
            idToken: account.id_token,
          });
          
          const data = response.data?.data;
          const apiUser = data?.user;

          if (apiUser) {
            user.id = apiUser._id;
            (user as { role?: string }).role = apiUser.role;
            (user as { accessToken?: string }).accessToken = apiUser.accessToken || apiUser.accesstoken;
            (user as { refreshToken?: string }).refreshToken = apiUser.refreshtoken || apiUser.refreshToken;
            user.name = apiUser.nome;
            user.email = apiUser.email;
            return true;
          }
        } catch {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Login inicial
      if (user && account) {
        return {
          ...token,
          id: user.id,
          name: user.name,
          email: user.email,
          role: (user as { role?: string }).role,
          accessToken: (user as { accessToken?: string }).accessToken,
          refreshToken: (user as { refreshToken?: string }).refreshToken,
          accessTokenExpires: Date.now() + 24 * 60 * 60 * 1000,
        };
      }

      // Se o token ainda é válido, retorna ele
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Se expirou, tenta renovar
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
        session.error = token.error as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
