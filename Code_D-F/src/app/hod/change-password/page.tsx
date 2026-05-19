"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Shield, Lock, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// Password strength checker
function getStrength(pwd: string) {
  const checks = [
    { label: "At least 8 characters", pass: pwd.length >= 8 },
    { label: "One uppercase letter", pass: /[A-Z]/.test(pwd) },
    { label: "One number", pass: /\d/.test(pwd) },
    { label: "One special character", pass: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd) },
  ];
  const score = checks.filter((c) => c.pass).length;
  return { checks, score };
}

const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500"];
const strengthLabels = ["Weak", "Fair", "Good", "Strong"];

export default function HodChangePasswordPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { checks, score } = getStrength(newPassword);
  const isForced = (session as any)?.forcePasswordChange === true;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (score < 4) {
      setError("Please choose a stronger password meeting all requirements below.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API}/hod/auth/change-password`,
        { currentPassword, newPassword, confirmPassword },
        { headers: { Authorization: `Bearer ${(session as any)?.accessToken}` } }
      );

      setSuccess(true);
      // Refresh session to clear forcePasswordChange flag
      await update({ forcePasswordChange: false });

      setTimeout(() => router.push("/hod"), 2000);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        "Failed to change password. Please check your current password and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl" />
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
              {isForced ? "Action Required" : "Change Password"}
            </span>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Password Updated!</h2>
              <p className="text-gray-400 text-sm">Redirecting to your dashboard...</p>
            </motion.div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">
                  {isForced ? "Set Your New Password" : "Change Password"}
                </h1>
                <p className="text-gray-500 text-sm">
                  {isForced
                    ? "Your account requires a password change before you can access the dashboard."
                    : "Update your HOD account password. Choose a strong, unique password."}
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 mb-6">
                  <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Current Password */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 uppercase tracking-widest">
                    Current Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-amber-500 transition-colors" />
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-white/[0.03] border border-white/10 text-white placeholder:text-gray-700 rounded-xl h-12 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40 transition-all text-sm"
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors">
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 uppercase tracking-widest">
                    New Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-amber-500 transition-colors" />
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-white/[0.03] border border-white/10 text-white placeholder:text-gray-700 rounded-xl h-12 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40 transition-all text-sm"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Strength meter */}
                  {newPassword && (
                    <div className="mt-3 space-y-3">
                      <div className="flex gap-1.5">
                        {[0, 1, 2, 3].map((i) => (
                          <div key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i < score ? strengthColors[score - 1] : "bg-white/10"
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs font-medium ${score === 4 ? "text-emerald-400" : score >= 2 ? "text-amber-400" : "text-red-400"}`}>
                        {strengthLabels[score - 1] || "Very Weak"}
                      </p>
                      <div className="space-y-1.5">
                        {checks.map((c, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${c.pass ? "bg-emerald-500/20" : "bg-white/5"}`}>
                              {c.pass
                                ? <CheckCircle className="w-3 h-3 text-emerald-400" />
                                : <XCircle className="w-3 h-3 text-gray-600" />}
                            </div>
                            <span className={`text-xs ${c.pass ? "text-emerald-400" : "text-gray-600"}`}>{c.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 uppercase tracking-widest">
                    Confirm New Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-amber-500 transition-colors" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={`w-full bg-white/[0.03] border text-white placeholder:text-gray-700 rounded-xl h-12 pl-12 pr-12 focus:outline-none focus:ring-2 transition-all text-sm ${
                        confirmPassword && confirmPassword !== newPassword
                          ? "border-red-500/40 focus:ring-red-500/20"
                          : confirmPassword && confirmPassword === newPassword
                          ? "border-emerald-500/40 focus:ring-emerald-500/20"
                          : "border-white/10 focus:ring-amber-500/30 focus:border-amber-500/40"
                      }`}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-xs text-red-400">Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || score < 4 || newPassword !== confirmPassword}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-sm uppercase tracking-widest hover:from-amber-500 hover:to-orange-500 transition-all active:scale-[0.98] shadow-lg shadow-amber-900/20 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </span>
                  ) : "Update Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
