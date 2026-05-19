"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, Target, Award, BookOpen, Zap, ChevronRight,
  ArrowUpRight, Calendar, BrainCircuit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { studentService } from "@/services/student.service";

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-white/5 ${className}`} />
  );
}

function StatSkeleton() {
  return (
    <div className="glass rounded-3xl p-6 space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-11 w-11 rounded-2xl" />
        <Skeleton className="h-5 w-16 rounded-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-32" />
      </div>
    </div>
  );
}

function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="glass rounded-3xl p-6 space-y-4">
      <Skeleton className="h-6 w-40" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full rounded-2xl" />
      ))}
    </div>
  );
}
// ──────────────────────────────────────────────────────────────────────────────

const FadeCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    className={`glass rounded-3xl p-6 ${className}`}
  >
    {children}
  </motion.div>
);

export default function StudentDashboard() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    if (!session) return;
    const fetchDashboardData = async () => {
      try {
        const [scoreRes, roadmapRes, recsRes, announceRes] = await Promise.all([
          studentService.getScore(),
          studentService.getRoadmap(),
          studentService.getRecommendations(),
          studentService.getAnnouncements(),
        ]);

        const score = scoreRes.data?.data || {};
        setStats([
          { label: "Overall Progress", value: `${score.progress || 0}%`, change: "+2.5%", icon: TrendingUp, color: "text-blue-400" },
          { label: "Course Score", value: `${score.score || 0}/100`, change: score.grade || "N/A", icon: Target, color: "text-purple-400" },
          { label: "Level", value: score.currentLevel || "Beginner", change: "Syncing...", icon: Award, color: "text-amber-400" },
          { label: "Tasks Done", value: `${score.completedTasks || 0}/${score.totalTasks || 0}`, change: "Targeting...", icon: BookOpen, color: "text-emerald-400" },
        ]);
        setRecommendations(recsRes.data?.data || []);
        const roadmapData = roadmapRes.data?.data;
        const weeks = roadmapData?.weeks || (Array.isArray(roadmapData) ? roadmapData : []);
        setActiveRoadmap(weeks);
        setAnnouncements(announceRes.data?.data || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [session]);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header — always visible instantly */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Hello,{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {session?.user?.firstName || "Student"}
            </span>
          </h1>
          <p className="text-gray-400 text-lg">Your AI mentor has optimized your learning path for today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="rounded-xl h-12 px-6 bg-white/5 hover:bg-white/10 border-white/10 text-white" variant="outline" asChild>
            <Link href="/student/profile">Edit Profile</Link>
          </Button>
          <Button className="rounded-xl h-12 px-6 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20" asChild>
            <Link href="/student/roadmap">View Full Roadmap</Link>
          </Button>
        </div>
      </section>

      {/* Stats Grid — skeletons while loading */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : stats.map((stat, i) => (
              <FadeCard key={i} className="hover:bg-white/[0.07] transition-colors cursor-default group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="text-[10px] border-white/10 text-gray-400 uppercase tracking-wider">
                    Real-time
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
                    <span className="text-sm font-medium text-emerald-400 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-0.5" />
                      {stat.change}
                    </span>
                  </div>
                </div>
              </FadeCard>
            ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Roadmap */}
        {loading ? (
          <div className="lg:col-span-2"><CardSkeleton rows={3} /></div>
        ) : (
          <FadeCard className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Zap className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-white">Active Roadmap Preview</h2>
              </div>
              <Link href="/student/roadmap" className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center gap-1">
                View Detailed <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-6">
              {!activeRoadmap || activeRoadmap.length === 0 ? (
                <div className="text-center py-10 space-y-4">
                  <p className="text-gray-500 italic">No active roadmap found. Ready to start your journey?</p>
                  <Button className="bg-blue-600 hover:bg-blue-500 text-white" asChild>
                    <Link href="/student/roadmap">Initialize AI Roadmap</Link>
                  </Button>
                </div>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                activeRoadmap.slice(0, 3).map((week: any, index: number) => (
                  <div key={index} className="relative pl-8 group">
                    <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-white/10 group-last:bottom-auto group-last:h-6">
                      <div className="absolute top-0 left-[-4px] h-2.5 w-2.5 rounded-full border border-blue-500 bg-black group-first:bg-blue-500" />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/[0.08] transition-colors cursor-pointer">
                      <div>
                        <h4 className="font-semibold text-white">Week {week.weekNumber}: {week.tasks?.[0]?.title || "Upcoming Module"}</h4>
                        <p className="text-sm text-gray-500 italic">Module count: {week.tasks?.length || 0} • Status: Pending</p>
                      </div>
                      <Button size="sm" variant="ghost" className="rounded-lg text-blue-400 hover:bg-blue-400/10 h-8">View</Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </FadeCard>
        )}

        {/* Right column */}
        <div className="space-y-8">
          {loading ? (
            <>
              <CardSkeleton rows={2} />
              <CardSkeleton rows={2} />
            </>
          ) : (
            <>
              <FadeCard className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <BrainCircuit className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold text-white">AI Recommendations</h2>
                </div>
                <div className="space-y-4">
                  {recommendations.length === 0 ? (
                    <p className="text-sm text-gray-500 italic py-4">Generating personalized skill gap analysis...</p>
                  ) : (
                    recommendations.map((rec, i) => (
                      <div key={i} className="p-4 rounded-2xl border border-white/5 bg-black/40 hover:border-indigo-500/40 transition-colors">
                        <h4 className="font-medium text-white mb-2">{rec.title}</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-white/5 text-gray-400 border-none text-[10px]">{rec.topic}</Badge>
                          <Badge className="bg-indigo-500/10 text-indigo-400 border-none text-[10px]">{rec.difficulty}</Badge>
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[10px]">+{rec.points || 20} XP</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </FadeCard>

              <FadeCard>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Campus Alerts</h2>
                </div>
                <div className="space-y-4">
                  {announcements.length === 0 ? (
                    <p className="text-xs text-gray-500 italic py-4">No campus alerts today.</p>
                  ) : (
                    announcements.slice(0, 2).map((ann, i) => (
                      <div key={i} className="flex gap-4 p-3 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 font-bold">!</div>
                        <div className="flex-grow">
                          <h4 className="text-sm font-medium text-white">{ann.title}</h4>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ann.body}</p>
                          {!ann.acknowledged && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async () => {
                                try {
                                  await studentService.respondAnnouncement(ann._id, { response: "Acknowledged" });
                                  setAnnouncements(announcements.map(a => a._id === ann._id ? { ...a, acknowledged: true } : a));
                                } catch (e) { console.error(e); }
                              }}
                              className="h-7 px-2 text-[10px] text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 mt-2"
                            >
                              Mark as Read
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </FadeCard>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
