"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { registerSchema, RegisterValues } from "@/validations/auth.schema";
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
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "@/services/auth.service";
import { toast } from "@/hooks/use-toast";
import { SplineScene } from "@/components/ui/splite";
import { ArrowLeft, UserPlus, ShieldCheck, Mail, RotateCcw, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";

// ─── OTP Step ─────────────────────────────────────────────────────────────────
function OtpStep({
  email,
  onSuccess,
}: {
  email: string;
  onSuccess: () => void;
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleOtpChange = (index: number, value: string) => {
    // Accept only digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    // Auto-advance
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...otp];
    pasted.split("").forEach((d, i) => { if (i < 6) next[i] = d; });
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      toast({ title: "Invalid OTP", description: "Please enter all 6 digits.", variant: "destructive" });
      return;
    }
    setVerifying(true);
    try {
      await api.post("/auth/verify-otp", { email, otp: code });
      setVerified(true);
      toast({ title: "✅ Email Verified!", description: "Redirecting to login..." });
      setTimeout(onSuccess, 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Invalid or expired OTP.";
      toast({ title: "Verification Failed", description: msg, variant: "destructive" });
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post("/auth/resend-otp", { email });
      setCountdown(30);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      toast({ title: "New Code Sent", description: "Check your email for the new OTP." });
    } catch (err: any) {
      toast({ title: "Failed", description: err?.response?.data?.message || "Try again.", variant: "destructive" });
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 space-y-4"
      >
        <div className="h-20 w-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Email Verified!</h2>
        <p className="text-neutral-500 text-sm">Redirecting to login...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-2">
          <Mail className="h-8 w-8 text-blue-400" />
        </div>
        <h2 className="text-3xl font-bold text-white">Verify Your Email</h2>
        <p className="text-neutral-500 text-sm leading-relaxed">
          We sent a 6-digit code to{" "}
          <span className="text-blue-400 font-medium">{email}</span>
          <br />Check your inbox (and spam folder).
        </p>
      </div>

      {/* OTP Boxes */}
      <div className="flex gap-3 justify-center" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={`w-12 h-14 text-center text-2xl font-black rounded-2xl bg-white/5 border transition-all outline-none focus:ring-2 focus:ring-blue-500/50 text-white ${
              digit
                ? "border-blue-500/60 bg-blue-500/10"
                : "border-white/10 hover:border-white/20"
            }`}
          />
        ))}
      </div>

      <Button
        onClick={handleVerify}
        disabled={verifying || otp.join("").length !== 6}
        className="w-full h-14 rounded-full bg-white text-black font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-40"
      >
        {verifying ? "VERIFYING..." : "CONFIRM CODE"}
      </Button>

      <div className="text-center">
        <button
          onClick={handleResend}
          disabled={resending || countdown > 0}
          className="text-sm text-neutral-500 hover:text-white transition-colors disabled:opacity-40 flex items-center gap-2 mx-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {countdown > 0 ? `Resend in ${countdown}s` : resending ? "Sending..." : "Resend Code"}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Register Page ────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [otpEmail, setOtpEmail] = useState<string | null>(null);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "student",
      department: "",
      branch: "",
      year: "",
    },
  });

  const selectedRole = form.watch("role");

  async function onSubmit(values: RegisterValues) {
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword: _confirmPassword, ...payload } = values;

      if (payload.role === "student") {
        delete payload.department;
      } else if (payload.role === "hod") {
        delete payload.branch;
        delete payload.year;
      }

      const cleanPayload = Object.fromEntries(
        Object.entries(payload).filter(([, v]) => v !== "" && v !== null)
      );

      await authService.register(cleanPayload);

      // Show OTP step (backend no longer returns JWT — requires verification)
      setOtpEmail(values.email);
      toast({
        title: "🎉 Account Created!",
        description: "Check your email for a 6-digit verification code.",
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const msg = error.response?.data?.message || "An unexpected error occurred";
      // If backend says verification required (unverified user re-registering)
      if (error.response?.data?.data?.status === "verification_required") {
        setOtpEmail(values.email);
        toast({ title: "OTP Sent", description: msg });
        return;
      }
      toast({ title: "Registration Failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const handleOtpSuccess = () => {
    router.push("/login");
  };

  return (
    <div className="flex w-full h-full">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-1 relative bg-neutral-950 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10 p-12 flex flex-col justify-between">
          <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium tracking-widest uppercase">Center Exit</span>
          </Link>

          <div className="space-y-6 max-w-md">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                <UserPlus className="text-white w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold tracking-tighter">NEW ENTITY</h2>
            </div>
            &quot;The best way to predict the future is to orchestrate it.&quot; Initialize your academic profile now.
          </div>

          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-neutral-600">
            <ShieldCheck className="w-4 h-4" />
            Encrypted Enrollment Protocol
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black/60 backdrop-blur-3xl lg:max-w-[650px] border-l border-white/5 relative overflow-y-auto">
        <div className="w-full max-w-md space-y-8 py-10">

          <AnimatePresence mode="wait">
            {otpEmail ? (
              <OtpStep
                key="otp"
                email={otpEmail}
                onSuccess={handleOtpSuccess}
              />
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="space-y-2 text-center lg:text-left">
                  <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500">
                    Identity Creation
                  </h1>
                  <p className="text-neutral-500">Register your credentials with the Academ OS core.</p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-neutral-500 text-xs uppercase tracking-widest">Given Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} className="bg-white/[0.03] border-white/10 text-white rounded-xl h-11 focus:border-white/30" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-neutral-500 text-xs uppercase tracking-widest">Surname</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} className="bg-white/[0.03] border-white/10 text-white rounded-xl h-11 focus:border-white/30" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-neutral-500 text-xs uppercase tracking-widest">Network Identity</FormLabel>
                          <FormControl>
                            <Input placeholder="email@nexus.com" {...field} className="bg-white/[0.03] border-white/10 text-white rounded-xl h-11 focus:border-white/30" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-neutral-500 text-xs uppercase tracking-widest">Key</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} className="bg-white/[0.03] border-white/10 text-white rounded-xl h-11 focus:border-white/30" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem className="space-y-2">
                            <FormLabel className="text-neutral-500 text-xs uppercase tracking-widest">Verify Key</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} className="bg-white/[0.03] border-white/10 text-white rounded-xl h-11 focus:border-white/30" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-neutral-500 text-xs uppercase tracking-widest">System Role</FormLabel>
                          <FormControl>
                            <div className="flex gap-4 p-1 bg-white/5 rounded-2xl border border-white/10">
                              <button
                                type="button"
                                onClick={() => field.onChange("student")}
                                className={`flex-1 h-10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                                  field.value === "student" ? "bg-white text-black shadow-lg" : "text-neutral-500 hover:text-white"
                                }`}
                              >
                                Student
                              </button>
                              <button
                                type="button"
                                onClick={() => field.onChange("hod")}
                                className={`flex-1 h-10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                                  field.value === "hod" ? "bg-white text-black shadow-lg" : "text-neutral-500 hover:text-white"
                                }`}
                              >
                                HOD Control
                              </button>
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {selectedRole === "hod" && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="department"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-neutral-500 text-xs uppercase tracking-widest">Department</FormLabel>
                              <FormControl>
                                <Input placeholder="Computer Science" {...field} className="bg-white/[0.03] border-white/10 text-white rounded-xl h-11 focus:border-white/30" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    )}

                    {selectedRole === "student" && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="branch"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-neutral-500 text-xs uppercase tracking-widest">Branch</FormLabel>
                              <FormControl>
                                <Input placeholder="CSE" {...field} className="bg-white/[0.03] border-white/10 text-white rounded-xl h-11 focus:border-white/30" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="year"
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <FormLabel className="text-neutral-500 text-xs uppercase tracking-widest">Year of Study</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="3"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || "")}
                                  className="bg-white/[0.03] border-white/10 text-white rounded-xl h-11 focus:border-white/30"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </motion.div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-14 rounded-full bg-white text-black font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.05)] mt-4"
                      disabled={loading}
                    >
                      {loading ? "ENROLLING..." : "COMMIT IDENTITY"}
                    </Button>
                  </form>
                </Form>

                <footer className="pt-2 text-center">
                  <p className="text-sm text-neutral-600">
                    Already indexed?{" "}
                    <Link href="/login" className="text-white hover:text-blue-500 font-medium transition-colors">
                      Return to Login
                    </Link>
                  </p>
                </footer>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
