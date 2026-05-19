"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  ShieldCheck,
  Zap,
  BarChart,
  AlertCircle,
  Brain,
  ChevronRight,
  FileText,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ResumeAnalysis {
  score: number;
  skills: string[];
  gaps: string[];
  match: string;
}

export default function ResumeAnalysisPage() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("Software Developer");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── File selection handler ─────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }

    // Validate size (5 MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Maximum file size is 5 MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setResult(null);
    setError(null);
  };

  // ── Analysis submit ────────────────────────────────────────────────────────
  const startAnalysis = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a PDF resume first.",
        variant: "destructive",
      });
      fileInputRef.current?.click();
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);
      formData.append("targetRole", targetRole || "Software Developer");

      const res = await api.post("/ai/analyze-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const analysis = res.data?.data?.analysis;
      if (!analysis) throw new Error("No analysis returned from server.");

      setResult(analysis);
      toast({ title: "✅ Analysis Complete", description: "Your resume has been audited by AI." });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Analysis failed. Please try again.";
      setError(msg);
      toast({ title: "Analysis Failed", description: msg, variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const resetAudit = () => {
    setResult(null);
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <section className="text-center space-y-4 py-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex p-4 rounded-3xl bg-blue-600/10 text-blue-400 border border-blue-500/20 mb-4"
        >
          <Brain className="h-10 w-10 animate-pulse" />
        </motion.div>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          AI Resume Auditor
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Upload your resume and let our AI-Architect analyze your skill gaps and
          career alignment in seconds.
        </p>
      </section>

      {/* Hidden real file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Upload area — only show when no result */}
      {!result && !analyzing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Target role input */}
          <div className="glass rounded-3xl p-6 border border-white/5 space-y-3">
            <label className="text-sm font-medium text-gray-400 uppercase tracking-widest">
              Target Role
            </label>
            <Input
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Full Stack Developer, ML Engineer, DevOps..."
              className="bg-white/5 border-white/10 text-white rounded-xl h-12 placeholder:text-gray-600"
            />
          </div>

          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="glass rounded-[40px] p-12 border-2 border-dashed border-white/10 hover:border-blue-500/40 transition-all cursor-pointer group flex flex-col items-center"
          >
            {selectedFile ? (
              <>
                <div className="h-20 w-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="h-10 w-10 text-blue-400" />
                </div>
                <p className="text-white font-semibold text-lg">{selectedFile.name}</p>
                <p className="text-gray-500 text-sm mt-1">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Click to change
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); resetAudit(); }}
                  className="mt-3 text-red-400 hover:text-red-300 flex items-center gap-1 text-sm"
                >
                  <X className="h-4 w-4" /> Remove
                </button>
              </>
            ) : (
              <>
                <div className="h-24 w-24 bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="h-10 w-10 text-gray-500 group-hover:text-blue-500 transition-colors" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Drop your resume here
                </h2>
                <p className="text-gray-500 mb-8">PDF supported • Max 5 MB</p>
              </>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Analyze button */}
          <Button
            onClick={startAnalysis}
            disabled={analyzing}
            className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg shadow-xl shadow-blue-500/20 disabled:opacity-50"
          >
            {selectedFile ? "🧠 Analyze My Resume" : "Select PDF & Analyze"}
          </Button>
        </motion.div>
      )}

      {/* Analyzing loader */}
      {analyzing && (
        <div className="glass rounded-[40px] p-20 flex flex-col items-center justify-center space-y-8 text-center border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-mesh opacity-20" />
          <div className="relative">
            <div className="h-32 w-32 rounded-full border-4 border-white/5 border-t-blue-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="h-10 w-10 text-blue-500 animate-pulse" />
            </div>
          </div>
          <div className="space-y-2 relative">
            <h2 className="text-2xl font-bold text-white">AI is auditing your resume...</h2>
            <p className="text-gray-500 italic">Scanning skill parameters and career alignment...</p>
          </div>
          <div className="max-w-md w-full relative">
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-600 to-purple-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "85%" }}
                transition={{ duration: 4, ease: "easeInOut" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Score panel */}
          <div className="glass rounded-[40px] p-8 border-white/5 space-y-8">
            <div className="text-center space-y-4">
              <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                Career Score
              </h3>
              <div className="relative inline-flex items-center justify-center">
                <svg className="h-36 w-36 transform -rotate-90">
                  <circle
                    className="text-white/5"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="64"
                    cx="72"
                    cy="72"
                  />
                  <circle
                    className="text-blue-500"
                    strokeWidth="10"
                    strokeDasharray={400}
                    strokeDashoffset={400 - (400 * result.score) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="64"
                    cx="72"
                    cy="72"
                  />
                </svg>
                <span className="absolute text-4xl font-black text-white">
                  {result.score}
                </span>
              </div>
              <p className="text-emerald-400 font-bold">{result.match}</p>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5 text-sm">
              <div className="flex items-center gap-3 text-gray-300">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                Professional formatting
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                Clear impact statements
              </div>
              {result.gaps.length > 0 && (
                <div className="flex items-center gap-3 text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  {result.gaps.length} skill gap{result.gaps.length > 1 ? "s" : ""} found
                </div>
              )}
            </div>
          </div>

          {/* Skills + Gaps */}
          <div className="md:col-span-2 space-y-8">
            <div className="glass rounded-[40px] p-8 border-white/5">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Zap className="h-6 w-6 text-amber-400" /> Detected Skills
              </h3>
              <div className="flex flex-wrap gap-3">
                {result.skills.map((skill) => (
                  <Badge
                    key={skill}
                    className="px-4 py-2 rounded-2xl bg-blue-500/10 text-blue-400 border-none text-sm font-medium"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="glass rounded-[40px] p-8 border-white/5 bg-gradient-to-br from-red-900/10 to-transparent">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <BarChart className="h-6 w-6 text-red-400" /> Skill Gaps Identified
              </h3>
              {result.gaps.length === 0 ? (
                <p className="text-emerald-400 text-sm">
                  🎉 No major skill gaps found for this role!
                </p>
              ) : (
                <div className="space-y-4">
                  {result.gaps.map((gap) => (
                    <div
                      key={gap}
                      className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="text-white font-medium">{gap}</span>
                      </div>
                      <Button
                        variant="ghost"
                        className="text-blue-400 hover:text-white hover:bg-blue-600/20 rounded-xl text-xs"
                      >
                        Find Course <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={resetAudit}
              variant="outline"
              className="w-full h-16 rounded-[40px] border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              Start New Audit
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
