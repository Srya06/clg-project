import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import axios from "axios";

export const authOptions: NextAuthOptions = {
  providers: [
    // ── Email / Password ─────────────────────────────────────────────────────
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/auth/login`,
            credentials
          );
          const responseData = res.data;

          if (responseData.success && responseData.data) {
            return {
              ...responseData.data.user,
              accessToken: responseData.data.accessToken,
            };
          }
          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),

    // ── GitHub OAuth ─────────────────────────────────────────────────────────
    // Used for signing IN via GitHub (separate from the "Connect GitHub" integration).
    // Requires GITHUB_ID and GITHUB_SECRET in .env.local
    ...(process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? [
          GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
          }),
        ]
      : []),
  ],

  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user, account, trigger, session }: { token: any; user: any; account: any; trigger?: string; session?: any }) {
      // ── Handle Client-Side Session Updates ─────────────────────────────────
      if (trigger === "update" && session) {
        if (session.forcePasswordChange !== undefined) {
          token.forcePasswordChange = session.forcePasswordChange;
        }
      }

      if (user) {
        // Credentials login — backend provides the JWT
        if (account?.provider === "credentials") {
          token.accessToken = user.accessToken;
          token.user = user;
          // Forward forcePasswordChange flag for HOD first-login enforcement
          token.forcePasswordChange = user.forcePasswordChange ?? false;
        }

        // GitHub OAuth login — we register/login via backend
        if (account?.provider === "github") {
          try {
            const res = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/auth/github-oauth`,
              {
                githubId: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
              }
            );
            if (res.data?.success && res.data?.data) {
              token.accessToken = res.data.data.accessToken;
              token.user = res.data.data.user;
              token.forcePasswordChange = false;
            }
          } catch (err) {
            console.error("[NextAuth] GitHub backend sync failed:", err);
            token.user = { ...user, role: "student" };
            token.forcePasswordChange = false;
          }
        }
      }
      return token;
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      session.accessToken = token.accessToken;
      session.user = token.user ?? session.user;
      // Expose forcePasswordChange so frontend route guard can enforce redirect
      session.forcePasswordChange = token.forcePasswordChange ?? false;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  // Debug in dev only
  debug: process.env.NODE_ENV === "development",
};
