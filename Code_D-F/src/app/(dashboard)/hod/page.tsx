"use client";

import { motion } from "framer-motion";
import { 
  Users, 
  AlertTriangle, 
  BarChart3, 
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Search,
  ChevronRight,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { hodService } from "@/services/hod.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Container = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`glass rounded-3xl p-6 ${className}`}
  >
    {children}
  </motion.div>
);

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/5 ${className}`} />;
}

export default function HODDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [metrics, setMetrics] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [riskAlerts, setRiskAlerts] = useState<any[]>([]);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [isAnnouncing, setIsAnnouncing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHODData = async () => {
      try {
        setLoading(true);
        const [analyticsRes, alertsRes] = await Promise.all([
          hodService.getAnalytics(),
          hodService.getAlerts()
        ]);

        const analyticsData = analyticsRes.data?.data || {};
        const alertsData = alertsRes.data?.data || [];

        setMetrics([
          { label: "Total Students", value: analyticsData.totalStudents || "0", change: "+0%", trendingUp: true, icon: Users, color: "text-blue-400" },
          { label: "Avg. Performance", value: `${analyticsData.averagePerformance || 0}%`, change: "+0%", trendingUp: true, icon: BarChart3, color: "text-purple-400" },
          { label: "At-Risk Students", value: analyticsData.atRiskCount || "0", change: "-0%", trendingUp: false, icon: AlertTriangle, color: "text-orange-400" },
          { label: "Top Rankers", value: analyticsData.topPerformersCount || "0", change: "+0%", trendingUp: true, icon: Trophy, color: "text-amber-400" },
        ]);

        setRiskAlerts(Array.isArray(alertsData) ? alertsData : []);
      } catch (error) {
        console.error("Error fetching HOD dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.role === "hod") {
      fetchHODData();
    }
  }, [session]);

  // No full-page spinner — render with skeleton UI so navigation is instant

  const handleAnnounce = async () => {
    if (!announcementTitle || !announcementMessage) return;
    setIsAnnouncing(true);
    try {
      await hodService.sendAnnouncement({
        title: announcementTitle,
        body: announcementMessage
      });
      toast({
        title: "Announcement Sent",
        description: "Your message has been broadcasted to all students.",
      });
      setIsDialogOpen(false);
      setAnnouncementTitle("");
      setAnnouncementMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send announcement.",
        variant: "destructive"
      });
    } finally {
      setIsAnnouncing(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-white">Department Overview</h1>
          <p className="text-gray-400">{session?.user?.department || "General"} Department • Academic Year 2023-24</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl h-12 border-white/10 bg-white/5 text-white">
            Export Report
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl h-12 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                <Plus className="h-4 w-4 mr-2" /> New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-white/10 text-white sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Broadcast a message to all students in your department.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Title</label>
                  <Input 
                    value={announcementTitle}
                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                    placeholder="e.g. Mandatory Meeting" 
                    className="bg-white/5 border-white/10 text-white h-10 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Message</label>
                  <textarea 
                    value={announcementMessage}
                    onChange={(e) => setAnnouncementMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full min-h-[100px] p-3 bg-white/5 border border-white/10 text-white rounded-xl outline-none focus:ring-1 ring-blue-500/50 resize-none"
                  />
                </div>
                <Button 
                  onClick={handleAnnounce} 
                  disabled={isAnnouncing || !announcementTitle || !announcementMessage}
                  className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 text-white"
                >
                  {isAnnouncing ? "Sending..." : "Send Announcement"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass rounded-3xl p-6 space-y-4">
                <div className="flex justify-between"><Skeleton className="h-11 w-11 rounded-2xl" /><Skeleton className="h-5 w-10 rounded-md" /></div>
                <div className="space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-8 w-28" /></div>
              </div>
            ))
          : metrics.map((stat, i) => (
              <Container key={i} className="hover:bg-white/[0.07] transition-colors cursor-default group">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="text-[10px] border-white/10 text-gray-400">
                    Live
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
                    <span className={`text-sm font-medium flex items-center ${stat.trendingUp ? "text-emerald-400" : "text-orange-400"}`}>
                      {stat.trendingUp ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                      {stat.change}
                    </span>
                  </div>
                </div>
              </Container>
            ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Trends Chart Placeholder */}
        <Container className="lg:col-span-2 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-white">Performance Analytics</h2>
            <div className="flex gap-2">
              <Badge className="bg-blue-600 text-white border-none cursor-pointer">Daily</Badge>
              <Badge className="bg-white/5 text-gray-400 border-none hover:bg-white/10 cursor-pointer">Weekly</Badge>
              <Badge className="bg-white/5 text-gray-400 border-none hover:bg-white/10 cursor-pointer">Monthly</Badge>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 rounded-3xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent group-hover:from-blue-500/10 transition-colors" />
            <div className="text-center relative z-10">
              <BarChart3 className="h-12 w-12 text-blue-500/50 mb-4 mx-auto" />
              <p className="text-gray-500 max-w-[200px] text-sm italic">Historical trend engine initialized. Waiting for student activity cycles.</p>
            </div>
          </div>
        </Container>

        {/* Risk Alerts List */}
        <Container className="flex flex-col border-orange-500/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Critical Alerts</h2>
            <Badge className="bg-orange-500/10 text-orange-400 border-none uppercase text-[10px]">Real-time</Badge>
          </div>
          <div className="space-y-4 flex-1">
            {riskAlerts.length === 0 ? (
              <div className="text-center py-10">
                <AlertTriangle className="h-10 w-10 text-emerald-500/30 mx-auto mb-4" />
                <p className="text-sm text-gray-500 italic">No critical risk flags detected in the current cohort.</p>
              </div>
            ) : (
              riskAlerts.map((alert, i) => (
                <div key={i} className="p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/[0.08] transition-all group cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <div className="space-y-0.5">
                      <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{alert.studentName}</h4>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{alert.studentId || "Student"}</p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`border-none px-2 py-0 text-[10px] ${
                        alert.severity === "high" ? "bg-red-500/10 text-red-400" : "bg-orange-500/10 text-orange-400"
                      }`}
                    >
                      {alert.severity || "Medium"} Risk
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">{alert.reason}</p>
                    <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-white transition-all transform translate-x-1 opacity-0 group-hover:opacity-100" />
                  </div>
                </div>
              ))
            )}
          </div>
          <Button variant="ghost" className="w-full mt-6 text-gray-500 hover:text-white hover:bg-white/5 py-4 h-auto rounded-2xl">
            Audit All Cohorts
          </Button>
        </Container>
      </div>

      {/* Quick Search Section */}
      <Container className="bg-gradient-to-r from-blue-900/10 to-indigo-900/10 border-blue-500/20">
        <div className="flex items-center gap-6">
          <div className="hidden md:flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shrink-0">
            <Search className="h-6 w-6" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-bold text-white text-lg">Student Intelligence Search</h3>
            <p className="text-sm text-gray-400">Instantly retrieve neural performance profile for any student identity.</p>
          </div>
          <div className="flex-1 max-w-md">
            <div className="flex w-full items-center gap-2 rounded-xl bg-black/40 px-4 py-2 border border-white/10 group-focus-within:border-blue-500/50 transition-colors">
              <input 
                type="text" 
                placeholder="Name, UID or System ID..." 
                className="w-full bg-transparent text-white outline-none placeholder:text-gray-600 text-sm h-8"
              />
              <ChevronRight className="h-4 w-4 text-blue-500" />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
