"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Award, 
  Upload, 
  FileCheck, 
  Brain, 
  ShieldCheck, 
  X,
  Plus,
  Loader2,
  ExternalLink,
  Info
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { studentService } from "@/services/student.service";
import { toast } from "@/hooks/use-toast";

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // We would fetch existing certificates here
    // For now, let's just use the upload logic
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: "Invalid File", description: "Please upload an image certificate (JPEG/PNG/WebP).", variant: "destructive" });
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('certificate', selectedFile);

    try {
      // We need to add this to studentService
      const res = await (studentService as any).uploadCertificate(formData);
      const newCert = res.data?.data?.certificate;
      
      setCertificates([newCert, ...certificates]);
      setSelectedFile(null);
      setPreviewUrl(null);
      
      toast({ 
        title: "Certificate Verified!", 
        description: `Your "${newCert.courseName}" certificate was successfully analyzed and credits were awarded.`,
      });
    } catch (error: any) {
      console.error("Upload failed", error);
      toast({ title: "Analysis Failed", description: error.response?.data?.message || "AI could not process this image.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <section className="space-y-2">
        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1">
          Credential Analysis
        </Badge>
        <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-4">
          Certification Hub <Award className="h-10 w-10 text-amber-400" />
        </h1>
        <p className="text-gray-400 max-w-2xl">
          Upload your certificates to have our Vision AI verify their authenticity and evaluate how they align with your career goals.
        </p>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Upload Card */}
        <div className="xl:col-span-1">
          <div className="glass rounded-[2rem] border-white/5 p-8 sticky top-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-400" /> Verify New Certificate
            </h2>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer flex flex-col items-center text-center gap-4 ${
                previewUrl ? "border-blue-500/50 bg-blue-500/5" : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
              }`}
            >
              {previewUrl ? (
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-white/10 shadow-2xl">
                  <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setPreviewUrl(null); }}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center">
                    <Plus className="h-8 w-8 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Click to upload or drag & drop</p>
                    <p className="text-xs text-gray-500 mt-1">Supports PNG, JPG, WebP (Max 5MB)</p>
                  </div>
                </>
              )}
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileSelect}
                accept="image/*"
              />
            </div>

            <button
              disabled={!selectedFile || isUploading}
              onClick={handleUpload}
              className={`w-full mt-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                !selectedFile || isUploading 
                  ? "bg-white/5 text-gray-500 cursor-not-allowed" 
                  : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20 active:scale-95"
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  AI Vision is Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5" />
                  Run AI Verification
                </>
              )}
            </button>

            <div className="mt-8 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
               <Info className="h-5 w-5 text-amber-400 shrink-0" />
               <p className="text-[11px] text-amber-200/60 leading-relaxed">
                 Our Vision AI checks the layout, issuer seals, and course content. Verified certificates automatically award departmental credits to your profile.
               </p>
            </div>
          </div>
        </div>

        {/* List Card */}
        <div className="xl:col-span-2">
          <div className="glass rounded-[2rem] border-white/5 p-8 min-h-[600px]">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                 Your Achievements <ShieldCheck className="h-6 w-6 text-emerald-400" />
               </h2>
               <Badge className="bg-white/5 text-gray-400 border-none">{certificates.length} Total</Badge>
            </div>

            {certificates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <Award className="h-10 w-10 text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-white">No certificates yet</h3>
                <p className="text-gray-500 max-w-xs mt-2">Upload your first certification to start earning departmental credits!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {certificates.map((cert) => (
                    <motion.div
                      key={cert._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-blue-500/20 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                          <FileCheck className="h-6 w-6" />
                        </div>
                        <Badge className={`${
                          cert.status === 'verified' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                        } border-none`}>
                          {cert.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors line-clamp-1">{cert.courseName}</h3>
                      <p className="text-sm text-gray-500 mb-4">{cert.provider}</p>
                      
                      <div className="space-y-3 mb-6">
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">AI Relevance</span>
                            <span className="text-xs font-bold text-blue-400">{cert.relevanceScore}%</span>
                         </div>
                         <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${cert.relevanceScore}%` }}
                              className="h-full bg-blue-500"
                            />
                         </div>
                      </div>

                      <div className="p-3 rounded-xl bg-black/20 text-[11px] text-gray-400 italic leading-relaxed border border-white/5 mb-4 line-clamp-3">
                        "{cert.aiAnalysis}"
                      </div>

                      <div className="flex items-center justify-between">
                         <span className="text-[10px] text-gray-600 font-bold uppercase">{new Date(cert.createdAt).toLocaleDateString()}</span>
                         <button className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                           <ExternalLink className="h-4 w-4 text-gray-400" />
                         </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
