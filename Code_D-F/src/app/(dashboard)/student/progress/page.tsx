"use client";

import { 
  Clock, BarChart3, Award, TrendingUp, BookOpen, 
  AlertCircle, Loader2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { studentService } from "@/services/student.service";
import { useState, useEffect } from "react";
import Link from "next/link";

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/5 ${className}`} />;
}

export default function StudentProgressPage() {
  const [progressStats, setProgressStats] = useState<any[]>([]);
  const [scoreData, setScoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      try {
        const [progRes, scoreRes] = await Promise.all([
          studentService.getProgress(),
          studentService.getScore(),
        ]);

        setScoreData(scoreRes.data?.data || null);

        // Only use real data — no fallbacks
        const realProgress = progRes.data?.progress;
        setProgressStats(Array.isArray(realProgress) ? realProgress : []);
      } catch (error) {
        console.error("Failed to fetch progress", error);
        setProgressStats([]);
        setScoreData(null);
      } finally {
        setLoading(false);
      }
    }
    loadProgress();
  }, []);

  const statCards = [
    {
      label: "Learning Time",
      value: `${scoreData?.learningTime || 0}h`,
      icon: Clock,
      color: "bg-blue-500/10 text-blue-400",
    },
    {
      label: "Avg. Quiz Score",
      value: `${scoreData?.quizScore || 0}%`,
      icon: BarChart3,
      color: "bg-purple-500/10 text-purple-400",
    },
    {
      label: "Achievements",
      value: `${Math.floor((scoreData?.totalScore || 0) / 20)} Unlocked`,
      icon: Award,
      color: "bg-amber-500/10 text-amber-400",
    },
  ];

  const skillGrowth = [
    { label: "GitHub Activity", value: scoreData?.breakdown?.codingActivity?.score || 0 },
    { label: "LeetCode Progress", value: scoreData?.breakdown?.problemSolving?.score || 0 },
    { label: "Project Mastery", value: scoreData?.breakdown?.projects?.score || 0 },
    { label: "Consistency", value: scoreData?.breakdown?.consistency?.score || 0 },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <section>
        <h1 className="text-4xl font-bold tracking-tight text-white">My Progress</h1>
        <p className="text-gray-400 mt-1">Detailed breakdown of your academic journey and milestones.</p>
      </section>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass rounded-3xl p-6">
                <Skeleton className="h-12 w-12 rounded-2xl mb-4" />
                <Skeleton className="h-3 w-24 mb-2" />
                <Skeleton className="h-7 w-20" />
              </div>
            ))
          : statCards.map((card, i) => (
              <div key={i} className="glass rounded-3xl p-6 flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${card.color}`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{card.label}</p>
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                </div>
              </div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Module Progress */}
        <div className="glass rounded-3xl p-8 space-y-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-400" /> Module Progress
          </h2>

          {loading ? (
            <div className="space-y-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : progressStats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <div className="p-4 rounded-2xl bg-white/5">
                <AlertCircle className="h-8 w-8 text-gray-600" />
              </div>
              <p className="text-gray-500 text-sm">No modules assigned yet.</p>
              <p className="text-gray-600 text-xs">
                Your HOD will assign modules to track here.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {progressStats.map((item, i) => (
                <div key={i} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white">{item.module}</h4>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        item.status === "Completed"
                          ? "bg-emerald-500/10 text-emerald-400 border-none"
                          : item.status === "In Progress"
                          ? "bg-blue-500/10 text-blue-400 border-none"
                          : "bg-white/5 text-gray-500 border-none"
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                      <span>Progression</span>
                      <span>{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} className="h-2 bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Skill Growth */}
          <div className="glass rounded-3xl p-8 bg-gradient-to-br from-emerald-900/10 to-transparent">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" /> Skill Growth
              </h2>
              <Link href="/student/roadmap" className="text-xs text-blue-400 hover:text-blue-300">
                Detailed Stats
              </Link>
            </div>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {skillGrowth.map((skill, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-sm text-gray-300">{skill.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-20 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${skill.value}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 w-7 text-right">{skill.value}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Badges */}
          <div className="glass rounded-3xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">Recent Badges</h2>
            {loading ? (
              <div className="flex gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-16 rounded-2xl" />
                ))}
              </div>
            ) : scoreData?.badges?.length > 0 ? (
              <div className="flex gap-4 flex-wrap">
                {scoreData.badges.map((badge: any, i: number) => (
                  <div
                    key={i}
                    title={badge.name || "Badge"}
                    className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center border border-white/5 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Award className="h-8 w-8 text-blue-400" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                <Award className="h-10 w-10 text-gray-700" />
                <p className="text-gray-500 text-sm">No badges earned yet.</p>
                <p className="text-gray-600 text-xs">Complete modules and tasks to earn badges.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
