"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, Mail, Lock, Eye, EyeOff, CheckCircle, ArrowLeft, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

type Step = "email" | "otp" | "reset" | "done";

function getStrength(pwd: string) {
  const checks = [
    { label: "At least 8 characters", pass: pwd.length >= 8 },
    { label: "One uppercase letter", pass: /[A-Z]/.test(pwd) },
    { label: "One number", pass: /\d/.test(pwd) },
    { label: "One special character", pass: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) },
  ];
  return { checks, score: checks.filter((c) => c.pass).length };
}

const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500"];
const strengthLabels = ["Weak", "Fair", "Good", "Strong"];

export default function HodForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const { checks, score } = getStrength(newPassword);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API}/hod/auth/forgot-password`, { email });
      setStep("otp");
      // Countdown for resend (60s)
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) { clearInterval(timer); return 0; }
          return c - 1;
        });
      }, 1000);
    } catch (err: any) {
      // Anti-enumeration: always show generic success message
      setStep("otp");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyAndReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (score < 4) {
      setError("Please choose a stronger password meeting all requirements.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/hod/auth/verify-reset-otp`, {
        email,
        otp,
        newPassword,
        confirmPassword,
      });
      setStep("done");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-amber-500/20 bg-amber-500/5">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-xs font-bold uppercase tracking-[0.2em]">
              HOD Password Recovery
            </span>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">

          {/* Step: Email */}
          <AnimatePresence mode="wait">
            {step === "email" && (
              <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-white mb-2">Forgot Password?</h1>
                  <p className="text-gray-500 text-sm">Enter your HOD email address and we'll send you a 6-digit OTP to reset your password.</p>
                </div>
                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase tracking-widest">HOD Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-amber-500 transition-colors" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="hod@department.edu"
                        required
                        className="w-full bg-white/[0.03] border border-white/10 text-white placeholder:text-gray-700 rounded-xl h-12 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40 transition-all text-sm"
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-sm uppercase tracking-widest hover:from-amber-500 hover:to-orange-500 transition-all active:scale-[0.98] disabled:opacity-50">
                    {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</span> : "Send OTP"}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Step: OTP + New Password */}
            {step === "otp" && (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-white mb-2">Check Your Email</h1>
                  <p className="text-gray-500 text-sm">We sent a 6-digit OTP to <strong className="text-amber-400">{email}</strong>. Enter it below with your new password.</p>
                </div>

                {error && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 mb-5">
                    <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleVerifyAndReset} className="space-y-4">
                  {/* OTP Input */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase tracking-widest">6-Digit OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="000000"
                      required
                      className="w-full bg-white/[0.03] border border-white/10 text-white placeholder:text-gray-700 rounded-xl h-12 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40 transition-all text-sm text-center tracking-[0.4em] font-bold text-lg"
                    />
                    <div className="text-right">
                      <button type="button" disabled={countdown > 0}
                        onClick={() => { setStep("email"); setError(null); }}
                        className="text-xs text-amber-500 hover:text-amber-400 disabled:text-gray-600 transition-colors">
                        {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase tracking-widest">New Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-amber-500 transition-colors" />
                      <input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" required
                        className="w-full bg-white/[0.03] border border-white/10 text-white placeholder:text-gray-700 rounded-xl h-12 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40 transition-all text-sm" />
                      <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors">
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {newPassword && (
                      <div className="mt-2 space-y-2">
                        <div className="flex gap-1.5">
                          {[0,1,2,3].map((i) => <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < score ? strengthColors[score-1] : "bg-white/10"}`} />)}
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {checks.map((c, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              {c.pass ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-gray-600" />}
                              <span className={`text-[10px] ${c.pass ? "text-emerald-400" : "text-gray-600"}`}>{c.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-400 uppercase tracking-widest">Confirm Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-amber-500 transition-colors" />
                      <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required
                        className="w-full bg-white/[0.03] border border-white/10 text-white placeholder:text-gray-700 rounded-xl h-12 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40 transition-all text-sm" />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading || score < 4 || otp.length < 6 || newPassword !== confirmPassword}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-sm uppercase tracking-widest hover:from-amber-500 hover:to-orange-500 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed">
                    {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Resetting...</span> : "Reset Password"}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Step: Done */}
            {step === "done" && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
                <p className="text-gray-400 text-sm mb-6">Your HOD password has been reset successfully.</p>
                <Link href="/hod/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm uppercase tracking-widest transition-all">
                  Go to HOD Login
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {step !== "done" && (
            <div className="mt-6 pt-5 border-t border-white/5">
              <Link href="/hod/login" className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-400 transition-colors">
                <ArrowLeft className="w-3 h-3" /> Back to HOD Login
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
