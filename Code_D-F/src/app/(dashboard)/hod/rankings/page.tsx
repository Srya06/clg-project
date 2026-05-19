"use client";

import { motion } from "framer-motion";
import { 
  Trophy, 
  Crown, 
  ChevronUp,
  ChevronDown,
  TrendingUp,
  Filter,
  Search,
  Code2,
  Terminal,
  Star
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { hodService } from "@/services/hod.service";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function HODRankingsPage() {
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ branch: "", year: "" });

  useEffect(() => {
    async function loadRankings() {
      setLoading(true);
      try {
        const res = await (hodService as any).getRankings(filter);
        setRankings(res.data?.data?.rankings || []);
      } catch (error) {
        console.error("Failed to load rankings", error);
      } finally {
        setLoading(false);
      }
    }
    loadRankings();
  }, [filter]);

  if (loading && rankings.length === 0) return (
    <div className="p-8 text-white flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 animate-pulse">Calculating departmental credits...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Filters */}
      <section className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1">
            Department of CSE-AI
          </Badge>
          <h1 className="text-5xl font-black tracking-tight text-white flex items-center gap-4">
            Leaderboard <Trophy className="h-10 w-10 text-amber-400" />
          </h1>
          <p className="text-gray-400 max-w-xl text-lg">
            Real-time ranking based on GitHub activity, LeetCode performance, academic excellence, and roadmap milestones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select 
              value={filter.branch} 
              onChange={(e) => setFilter({ ...filter, branch: e.target.value })}
              className="bg-transparent text-sm text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="">All Branches</option>
              <option value="CSE-AI">CSE-AI</option>
              <option value="CSE">CSE</option>
              <option value="ISE">ISE</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <select 
              value={filter.year} 
              onChange={(e) => setFilter({ ...filter, year: e.target.value })}
              className="bg-transparent text-sm text-gray-300 focus:outline-none cursor-pointer"
            >
              <option value="">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>
          </div>
        </div>
      </section>

      {/* Podium Section */}
      {rankings.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 items-end">
          {/* Silver - Rank 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="order-2 md:order-1 glass rounded-3xl p-8 flex flex-col items-center text-center border-zinc-400/20 bg-gradient-to-t from-zinc-400/5 to-transparent relative"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-2xl bg-zinc-400 flex items-center justify-center text-black font-black text-xl shadow-lg">2</div>
            <div className="h-24 w-24 rounded-3xl mb-4 overflow-hidden border-2 border-zinc-400 p-1">
              {rankings[1].avatar ? (
                <img src={rankings[1].avatar} alt={rankings[1].name} className="h-full w-full object-cover rounded-2xl" />
              ) : (
                <div className="h-full w-full bg-zinc-800 flex items-center justify-center text-2xl font-bold">{rankings[1].initials}</div>
              )}
            </div>
            <h3 className="text-xl font-bold text-white">{rankings[1].name}</h3>
            <p className="text-blue-400/80 text-sm font-medium">{rankings[1].branch} • Year {rankings[1].year}</p>
            <div className="mt-6 pt-6 border-t border-white/5 w-full flex justify-center gap-8">
               <div className="text-center">
                 <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Credits</p>
                 <p className="text-xl font-black text-white">{rankings[1].score}</p>
               </div>
               <div className="text-center">
                 <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">CGPA</p>
                 <p className="text-xl font-black text-white">{rankings[1].cgpa}</p>
               </div>
            </div>
          </motion.div>

          {/* Gold - Rank 1 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="order-1 md:order-2 glass rounded-[2.5rem] p-10 flex flex-col items-center text-center border-amber-500/30 bg-gradient-to-t from-amber-500/10 to-transparent relative md:-translate-y-10 shadow-[0_20px_50px_rgba(251,191,36,0.15)]"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Crown className="h-16 w-16 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
            </div>
            <div className="h-32 w-32 rounded-[2rem] mb-6 overflow-hidden border-4 border-amber-400 p-1.5 shadow-2xl">
              {rankings[0].avatar ? (
                <img src={rankings[0].avatar} alt={rankings[0].name} className="h-full w-full object-cover rounded-[1.5rem]" />
              ) : (
                <div className="h-full w-full bg-amber-400/10 flex items-center justify-center text-4xl font-bold text-amber-400">{rankings[0].initials}</div>
              )}
            </div>
            <h3 className="text-3xl font-black text-white leading-tight">{rankings[0].name}</h3>
            <p className="text-amber-400 text-lg font-bold">{rankings[0].branch} • Year {rankings[0].year}</p>
            
            <div className="mt-8 pt-8 border-t border-white/10 w-full grid grid-cols-2 gap-4">
               <div className="text-center p-3 rounded-2xl bg-amber-400/5">
                 <p className="text-[10px] text-amber-400/60 uppercase font-black tracking-widest">Total Credits</p>
                 <p className="text-3xl font-black text-white">{rankings[0].score}</p>
               </div>
               <div className="text-center p-3 rounded-2xl bg-white/5">
                 <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">CGPA</p>
                 <p className="text-3xl font-black text-white">{rankings[0].cgpa}</p>
               </div>
            </div>
          </motion.div>

          {/* Bronze - Rank 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="order-3 glass rounded-3xl p-8 flex flex-col items-center text-center border-orange-500/20 bg-gradient-to-t from-orange-500/5 to-transparent relative"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-2xl bg-orange-500 flex items-center justify-center text-black font-black text-xl shadow-lg">3</div>
            <div className="h-24 w-24 rounded-3xl mb-4 overflow-hidden border-2 border-orange-400 p-1">
              {rankings[2].avatar ? (
                <img src={rankings[2].avatar} alt={rankings[2].name} className="h-full w-full object-cover rounded-2xl" />
              ) : (
                <div className="h-full w-full bg-orange-900/20 flex items-center justify-center text-2xl font-bold text-orange-400">{rankings[2].initials}</div>
              )}
            </div>
            <h3 className="text-xl font-bold text-white">{rankings[2].name}</h3>
            <p className="text-blue-400/80 text-sm font-medium">{rankings[2].branch} • Year {rankings[2].year}</p>
            <div className="mt-6 pt-6 border-t border-white/5 w-full flex justify-center gap-8">
               <div className="text-center">
                 <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Credits</p>
                 <p className="text-xl font-black text-white">{rankings[2].score}</p>
               </div>
               <div className="text-center">
                 <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">CGPA</p>
                 <p className="text-xl font-black text-white">{rankings[2].cgpa}</p>
               </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* List Section */}
      <div className="glass rounded-[2rem] border-white/5 p-8 overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Department Honor Roll</h2>
            <p className="text-sm text-gray-500">Showing top performers based on filtered criteria</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Updated Live
          </div>
        </div>
        
        <div className="space-y-3">
          {rankings.map((student, i) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-blue-500/30 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-6">
                 <div className={`text-xl font-black w-8 text-center ${
                   student.rank <= 3 ? "text-amber-400" : "text-gray-700"
                 }`}>
                   {student.rank}
                 </div>
                 
                 <div className="flex items-center gap-4">
                   <div className="h-12 w-12 rounded-xl overflow-hidden bg-white/5 ring-2 ring-white/5 group-hover:ring-blue-500/50 transition-all">
                     {student.avatar ? (
                        <img src={student.avatar} alt="" className="h-full w-full object-cover" />
                     ) : (
                        <div className="h-full w-full flex items-center justify-center font-bold text-xs text-gray-500">{student.initials}</div>
                     )}
                   </div>
                   <div>
                     <p className="font-bold text-white group-hover:text-blue-400 transition-colors">{student.name}</p>
                     <div className="flex items-center gap-2 mt-0.5">
                       <span className="text-[10px] text-blue-400/60 font-bold uppercase tracking-widest">{student.branch}</span>
                       <span className="h-1 w-1 rounded-full bg-gray-800" />
                       <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Year {student.year}</span>
                     </div>
                   </div>
                 </div>
              </div>
              
              <div className="flex items-center gap-12">
                <div className="hidden xl:flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-600 uppercase font-bold tracking-tighter mb-1">Repos</p>
                    <div className="flex items-center gap-1.5 text-white/80 font-bold text-sm">
                      <Code2 className="h-3 w-3 text-blue-500" /> {student.stats.repos}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-600 uppercase font-bold tracking-tighter mb-1">LeetCode</p>
                    <div className="flex items-center gap-1.5 text-white/80 font-bold text-sm">
                      <Terminal className="h-3 w-3 text-emerald-500" /> {student.stats.leetcode}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-gray-600 uppercase font-bold tracking-tighter mb-1">CGPA</p>
                    <div className="flex items-center gap-1.5 text-white/80 font-bold text-sm">
                      <Star className="h-3 w-3 text-amber-500" /> {student.cgpa}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Credits</p>
                    <span className="font-mono text-2xl font-black text-white group-hover:text-blue-400 transition-colors">
                      {student.score}
                    </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
