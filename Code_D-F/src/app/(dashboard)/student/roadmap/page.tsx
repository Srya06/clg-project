"use client";

import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  Map as MapIcon,
  BookOpen,
  Star,
  ExternalLink,
  Target,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { studentService } from "@/services/student.service";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function StudentRoadmap() {
  const [roadmapData, setRoadmapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [careerGoal, setCareerGoal] = useState("");
  const [goalInput, setGoalInput] = useState("");
  const [showGoalInput, setShowGoalInput] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch both roadmap and profile in parallel
        const [roadmapRes, profileRes] = await Promise.all([
          studentService.getRoadmap(),
          studentService.getProfile(),
        ]);

        // Set real career goal from profile
        const profile = profileRes.data?.data || {};
        const goal = profile.careerGoal || "";
        setCareerGoal(goal);
        setGoalInput(goal);

        // Set roadmap data from the new structure (roadmap.weeks)
        const roadmap = roadmapRes.data?.data;
        if (roadmap && roadmap.weeks) {
          setRoadmapData(roadmap.weeks);
        } else if (Array.isArray(roadmap)) {
          // Fallback for old structure
          setRoadmapData(roadmap);
        }
      } catch (error) {
        console.error("Failed to load roadmap data", error);
        toast({ title: "Error", description: "Could not load your data.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleGenerate = async () => {
    const goal = goalInput.trim();
    if (!goal) {
      toast({ title: "Goal Required", description: "Please enter your career goal first.", variant: "destructive" });
      setShowGoalInput(true);
      return;
    }

    setGenerating(true);
    try {
      const res = await studentService.generateRoadmap({ goal });
      const roadmap = res.data?.data;
      const weeks = roadmap?.weeks || (Array.isArray(roadmap) ? roadmap : []);
      
      if (weeks.length === 0) {
        throw new Error("Empty roadmap returned");
      }
      
      setRoadmapData(weeks);
      setCareerGoal(goal);
      setShowGoalInput(false);
      toast({ title: "🎯 Roadmap Generated!", description: `Your AI Crew has built a personalized roadmap for "${goal}".` });
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Could not generate roadmap. Check your API key or try again.";
      toast({ title: "Generation Failed", description: msg, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  // All AI-generated resources across all weeks (flat list for Resources tab)
  const allResources = roadmapData.flatMap((week: any) =>
    (week.resources || []).map((r: string) => ({
      title: r,
      week: week.weekNumber,
      focus: week.theme || week.focus || `Week ${week.weekNumber}`,
    }))
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-400">
            <MapIcon className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Learning Path</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            {careerGoal ? `${careerGoal} Roadmap` : "AI Learning Roadmap"}
          </h1>
          {careerGoal ? (
            <p className="text-gray-400">
              Your personalized path toward:{" "}
              <span className="text-blue-400 font-medium">{careerGoal}</span>
            </p>
          ) : (
            <p className="text-gray-400">Enter your career goal to generate a personalized roadmap.</p>
          )}
        </div>

        <div className="flex flex-col gap-3 min-w-[260px]">
          {/* Goal Input */}
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Full Stack Developer, ML Engineer..."
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              className="bg-white/5 border-white/10 text-white rounded-xl h-11 text-sm flex-1 placeholder:text-gray-600"
            />
          </div>
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white h-11 w-full shadow-lg shadow-blue-500/20"
          >
            {generating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating with AI...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> Generate My Roadmap</>
            )}
          </Button>
          {roadmapData.length > 0 && (
            <p className="text-xs text-gray-600 text-center">Change goal & regenerate anytime</p>
          )}
        </div>
      </section>

      <Tabs defaultValue="roadmap" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 rounded-xl p-1 mb-8">
          <TabsTrigger value="roadmap" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Roadmap View
          </TabsTrigger>
          <TabsTrigger value="curriculum" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Detailed Curriculum
          </TabsTrigger>
          <TabsTrigger value="resources" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Resources {allResources.length > 0 && <Badge className="ml-1 bg-blue-500/20 text-blue-300 border-none text-[10px]">{allResources.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* Roadmap Timeline View */}
        <TabsContent value="roadmap" className="mt-0">
          <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-600 before:via-purple-500 before:to-transparent">
            {roadmapData.length === 0 ? (
              <div className="text-center py-24 space-y-6">
                <div className="mx-auto w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center">
                  <Target className="h-10 w-10 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">No roadmap yet</p>
                  <p className="text-gray-500 text-sm mt-1">Enter your career goal above and click <strong className="text-blue-400">Generate My Roadmap</strong></p>
                </div>
              </div>
            ) : (
              roadmapData.map((week: any, i: number) => (
                <motion.div
                  key={week._id || i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group"
                >
                  {/* Timeline dot */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-blue-500/40 bg-zinc-900 text-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110 font-bold text-sm">
                    {week.weekNumber}
                  </div>

                  {/* Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass rounded-3xl p-6 shadow-xl border-white/5 group-hover:border-blue-500/30 transition-all space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Week {week.weekNumber}</span>
                        <Badge className="bg-blue-500/10 text-blue-300 border-none text-[10px]">
                          {week.tasks?.length || 0} tasks
                        </Badge>
                      </div>
                      <h3 className="text-lg font-bold text-white">{week.theme || week.focus || "Weekly Focus"}</h3>
                      {week.careerInsight && (
                        <p className="text-[11px] text-blue-400/80 italic mt-1 line-clamp-2">
                          <Star className="inline h-3 w-3 mr-1 mb-0.5" />
                          {week.careerInsight}
                        </p>
                      )}
                    </div>

                    {/* Tasks */}
                    <div className="space-y-2">
                      {week.tasks?.map((task: any, j: number) => (
                        <div key={j} className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-white/5 hover:bg-black/60 transition-colors">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-200">{task.title}</p>
                            {task.description && (
                              <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                            )}
                            {task.video && (
                              <div className="mt-3 group/video relative overflow-hidden rounded-xl border border-white/5 bg-white/5">
                                <a 
                                  href={`https://www.youtube.com/watch?v=${task.video.videoId}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="block"
                                >
                                  <div className="relative aspect-video">
                                    <img 
                                      src={task.video.thumbnail} 
                                      alt={task.video.title} 
                                      className="w-full h-full object-cover transition-transform group-hover/video:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-opacity">
                                      <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shadow-xl">
                                        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1" />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="p-2">
                                    <p className="text-[10px] text-gray-400 line-clamp-1">{task.video.title}</p>
                                  </div>
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Resources */}
                    {week.resources?.length > 0 && (
                      <div className="pt-2 border-t border-white/5">
                        <p className="text-[10px] text-gray-600 uppercase font-semibold mb-2">Resources</p>
                        <div className="flex flex-wrap gap-2">
                          {week.resources.map((r: string, k: number) => (
                            <span key={k} className="text-[11px] px-2 py-1 rounded-lg bg-white/5 text-gray-400 border border-white/5">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Detailed Curriculum */}
        <TabsContent value="curriculum">
          {roadmapData.length === 0 ? (
            <div className="glass rounded-3xl p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
              <BookOpen className="h-12 w-12 text-blue-400 mb-4 opacity-50" />
              <h2 className="text-2xl font-bold text-white mb-2">No curriculum yet</h2>
              <p className="text-gray-400 max-w-sm">Generate a roadmap first to see the full detailed breakdown of topics and objectives.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {roadmapData.map((week: any, i: number) => (
                <div key={i} className="glass rounded-3xl p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg">
                      {week.weekNumber}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{week.theme || week.focus || `Week ${week.weekNumber}`}</h2>
                      {week.careerInsight && (
                        <p className="text-sm text-blue-400/70 mt-1 max-w-2xl">{week.careerInsight}</p>
                      )}
                      <p className="text-xs text-gray-600 mt-2">{week.tasks?.length} core tasks to complete</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {week.tasks?.map((task: any, j: number) => (
                      <div key={j} className="p-4 rounded-2xl bg-black/30 border border-white/5">
                        <div className="flex items-start gap-3">
                          <Circle className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
                          <div>
                            <h4 className="font-semibold text-white">{task.title}</h4>
                            <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                            {task.video && (
                              <div className="mt-4 max-w-md group/v relative overflow-hidden rounded-2xl border border-white/5 shadow-2xl">
                                <a href={`https://www.youtube.com/watch?v=${task.video.videoId}`} target="_blank" rel="noopener noreferrer">
                                  <div className="relative aspect-video">
                                    <img src={task.video.thumbnail} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                                      <div className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20">
                                        <ExternalLink className="h-5 w-5 text-white" />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="p-3 bg-white/5 backdrop-blur-xl flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Tutorial Available</span>
                                    <span className="text-[10px] text-gray-500">Watch on YouTube</span>
                                  </div>
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources">
          {allResources.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center">
              <Star className="h-12 w-12 text-amber-400 mx-auto mb-4 opacity-50" />
              <p className="text-gray-400">No resources yet. Generate a roadmap to get AI-curated learning resources.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allResources.map((res, i) => (
                <div key={i} className="glass rounded-2xl p-5 border-white/5 hover:bg-white/10 hover:border-blue-500/20 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-blue-500/10 text-blue-400 border-none text-[10px]">Week {res.week}</Badge>
                    <ExternalLink className="h-4 w-4 text-gray-600 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-white mb-1 break-words">{res.title}</p>
                  <p className="text-xs text-gray-500">{res.focus}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
