/**
 * Configuration NextAuth v5 - US-10
 *
 * Sessions :
 * - Access Token : 5 minutes (JWT maxAge)
 * - Refresh Token : 30 jours (session maxAge)
 */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { SignInUseCase } from "@/module/user/signIn/SignInUseCase";
import { SignInPrismaRepository } from "@/module/user/signIn/SignInPrismaRepository";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const repository = new SignInPrismaRepository();
          const useCase = new SignInUseCase(repository);

          const result = await useCase.execute({
            email: credentials.email as string,
            password: credentials.password as string,
          });

          return {
            id: result.userId,
            email: result.email,
            name: result.name,
          };
        } catch (error) {
          console.error("Erreur lors de la connexion:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours (Refresh Token)
  },
  jwt: {
    maxAge: 5 * 60, // 5 minutes (Access Token)
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
});
