"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { ArrowLeft, BrainCircuit, Lock } from "lucide-react";
import { authService } from "@/services/auth.service";
import { toast } from "@/hooks/use-toast";

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ResetPasswordValues) {
    setLoading(true);
    try {
      await authService.resetPassword(params.token, values.password);
      toast({
        title: "Password Reset Successful",
        description: "You can now log in with your new password.",
      });
      router.push("/login");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Invalid or expired token.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 flex">
      <div className="w-full lg:w-1/2 flex flex-col p-8 sm:p-12 md:p-16 lg:p-24 relative z-10">
        <Link 
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors w-fit mb-12"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <div className="max-w-md w-full mx-auto flex-1 flex flex-col justify-center">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <BrainCircuit className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold tracking-tighter">RESET PASSWORD</h2>
            </div>
            <p className="text-neutral-400 text-lg leading-relaxed font-light">
              Enter your new password below.
            </p>
          </div>

          <div className="glass p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 relative z-10">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-neutral-300">New Password</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 group-focus-within:text-blue-400 transition-colors" />
                          <Input 
                            type="password"
                            placeholder="••••••••" 
                            className="bg-white/5 border-white/10 text-white rounded-xl h-14 pl-12 focus:ring-1 ring-blue-500/50" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-neutral-300">Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 group-focus-within:text-blue-400 transition-colors" />
                          <Input 
                            type="password"
                            placeholder="••••••••" 
                            className="bg-white/5 border-white/10 text-white rounded-xl h-14 pl-12 focus:ring-1 ring-blue-500/50" 
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full rounded-xl h-14 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 text-lg font-medium transition-all"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative bg-black overflow-hidden border-l border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-black z-10 pointer-events-none" />
        <SplineScene 
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
