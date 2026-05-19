"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { z } from "zod";
import { Shield, Mail, Lock, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

const hodLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
type HodLoginValues = z.infer<typeof hodLoginSchema>;

export default function HodLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "AccessDenied") {
      setError("Access denied. This portal is for HOD personnel only.");
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HodLoginValues>({ resolver: zodResolver(hodLoginSchema) });

  async function onSubmit(values: HodLoginValues) {
    setLoading(true);
    setError(null);
    setRateLimited(false);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        if (result.error.includes("429") || result.error.toLowerCase().includes("too many")) {
          setRateLimited(true);
          setError("Too many login attempts. Please wait 15 minutes before trying again.");
        } else {
          setError("Invalid HOD credentials. Access denied.");
        }
        return;
      }

      // Fetch session to confirm role and check forcePasswordChange
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      if (session?.user?.role !== "hod") {
        setError("Access denied. This portal is restricted to HOD personnel only.");
        // Sign out the non-HOD user immediately
        await fetch("/api/auth/signout", { method: "POST" });
        return;
      }

      if (session?.forcePasswordChange) {
        router.push("/hod/change-password");
      } else {
        router.push("/hod");
      }
    } catch {
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
      </div>

      {/* Corner accents */}
      <div className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-amber-500/30" />
      <div className="absolute bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 border-amber-500/30" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Portal badge */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-amber-500/20 bg-amber-500/5">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-xs font-bold uppercase tracking-[0.2em]">
              Secure HOD Portal
            </span>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
              HOD Access
            </h1>
            <p className="text-gray-500 text-sm">
              This portal is restricted to Head of Department personnel only.
            </p>
          </div>

          {/* Rate limit / error banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 p-4 rounded-xl border mb-6 ${
                rateLimited
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-400"
              }`}
            >
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs text-gray-400 uppercase tracking-widest font-medium">
                HOD Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-amber-500 transition-colors" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="hod@department.edu"
                  disabled={rateLimited}
                  className="w-full bg-white/[0.03] border border-white/10 text-white placeholder:text-gray-700 rounded-xl h-12 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40 transition-all text-sm disabled:opacity-50"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-400 uppercase tracking-widest font-medium">
                  Password
                </label>
                <Link
                  href="/hod/forgot-password"
                  className="text-xs text-amber-500 hover:text-amber-400 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-amber-500 transition-colors" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  disabled={rateLimited}
                  className="w-full bg-white/[0.03] border border-white/10 text-white placeholder:text-gray-700 rounded-xl h-12 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40 transition-all text-sm disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || rateLimited}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-sm uppercase tracking-widest hover:from-amber-500 hover:to-orange-500 transition-all active:scale-[0.98] shadow-lg shadow-amber-900/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                "Authenticate as HOD"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-gray-600">
              Not an HOD?{" "}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                Go to Student/Teacher Login
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-700 mt-6">
          Unauthorized access attempts are logged and monitored.
        </p>
      </motion.div>
    </div>
  );
}
