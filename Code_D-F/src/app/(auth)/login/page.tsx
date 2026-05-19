"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { loginSchema, LoginValues } from "@/validations/auth.schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SplineScene } from "@/components/ui/splite";
import { ArrowLeft, BrainCircuit, Lock, Mail, AlertTriangle } from "lucide-react";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "SessionExpired") {
      toast({
        title: "Session Expired",
        description: "Your secure session has timed out. Please log in again to continue.",
        variant: "destructive",
      });
    }
  }, [searchParams, toast]);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginValues) {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        console.error(result.error);
      } else {
        // Fetch session to get the user's role for proper redirect
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        
        if (session?.user?.role === "hod") {
          router.push("/hod");
        } else if (session?.user?.role === "teacher") {
          router.push("/teacher");
        } else {
          router.push("/student");
        }

      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full h-full">
      {/* LEFT PANEL: 3D Immersive Hero */}
      <div className="hidden lg:flex flex-1 relative bg-neutral-950 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
        
        {/* Overlay Branding */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent z-10 p-12 flex flex-col justify-between">
          <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium tracking-widest uppercase">System Back</span>
          </Link>
          
          <div className="space-y-4 max-w-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                <BrainCircuit className="text-white w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">VIRTUAL ACCESS</h2>
            </div>
            <p className="text-neutral-400 text-lg leading-relaxed font-light">
              Enter the command center to resume your AI-optimized academic roadmap.
            </p>
          </div>

          <div className="text-[10px] uppercase tracking-[0.4em] text-neutral-600">
            Secure Neural Link Established
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black/40 backdrop-blur-3xl lg:max-w-[550px] border-l border-white/5 relative">
        <div className="w-full max-w-sm space-y-10">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500">
              Welcome Back
            </h1>
            <p className="text-neutral-500">Initialize your secure learning session.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-neutral-400 text-xs uppercase tracking-widest">Email Identity</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-blue-500 transition-colors" />
                          <Input 
                            placeholder="neural-link@example.com" 
                            {...field} 
                            className="bg-white/[0.03] border-white/10 text-white placeholder:text-neutral-700 rounded-xl h-12 pl-12 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-neutral-400 text-xs uppercase tracking-widest">Access Key</FormLabel>
                        <Link href="/forgot-password" title="forgot password" className="text-xs text-blue-500 hover:text-blue-400 transition-colors">
                          Recover Key?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 group-focus-within:text-blue-500 transition-colors" />
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            {...field} 
                            className="bg-white/[0.03] border-white/10 text-white placeholder:text-neutral-700 rounded-xl h-12 pl-12 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 rounded-full bg-white text-black font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)]" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <span className="animate-spin text-lg">◌</span> INITIALIZING...
                  </span>
                ) : "AUTHENTICATE"}
              </Button>
            </form>
          </Form>

          <footer className="pt-10 text-center border-t border-white/5">
            <p className="text-sm text-neutral-500">
              New to the system?{" "}
              <Link href="/register" className="text-white hover:text-blue-400 font-medium transition-colors underline underline-offset-4 decoration-white/20">
                Register Identity
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex w-full h-full items-center justify-center bg-black text-white">Loading...</div>}>
      <LoginPageInner />
    </Suspense>
  );
}
