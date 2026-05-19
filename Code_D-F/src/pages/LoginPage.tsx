import React from 'react';
import { Mail, Lock, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#06090F] overflow-hidden">
      {/* Background Glows */}
      <div className="absolute -left-1/4 -top-1/4 h-[800px] w-[800px] rounded-full bg-indigo-600/10 blur-[120px]"></div>
      <div className="absolute -right-1/4 -bottom-1/4 h-[800px] w-[800px] rounded-full bg-cyan-600/10 blur-[120px]"></div>

      <div className="relative z-10 w-full max-w-md p-6">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-600 font-bold text-2xl text-white shadow-2xl shadow-cyan-500/20">
            C
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white">CodeDB</h1>
          <p className="mt-2 text-gray-400">Your AI-powered career growth platform.</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl shadow-2xl">
          <form className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                <input 
                  type="email" 
                  className="w-full rounded-xl border border-white/5 bg-white/5 py-4 pl-12 pr-4 text-white outline-none ring-2 ring-transparent transition-all focus:border-cyan-500/30 focus:ring-cyan-500/10"
                  placeholder="name@university.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                <input 
                  type="password" 
                  className="w-full rounded-xl border border-white/5 bg-white/5 py-4 pl-12 pr-4 text-white outline-none ring-2 ring-transparent transition-all focus:border-cyan-500/30 focus:ring-cyan-500/10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button className="relative group w-full overflow-hidden rounded-xl bg-cyan-500 py-4 font-bold text-black transition-all hover:bg-cyan-400 active:scale-[0.98]">
               <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-shimmer"></div>
               <span className="flex items-center justify-center gap-2">
                  Sign In <ArrowRight size={18} />
               </span>
            </button>
          </form>

          <div className="mt-8 flex items-center justify-between text-sm text-gray-500">
             <button className="hover:text-white transition-colors">Forgot Password?</button>
             <button className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors">Create Account</button>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-600">
           By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
