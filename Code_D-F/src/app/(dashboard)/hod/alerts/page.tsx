"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight,
  User,
  Search,
  Filter,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { hodService } from "@/services/hod.service";
import Link from "next/link";

export default function HODAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [topPerformers, setTopPerformers] = useState<any[]>([]);
  const [lowPerformers, setLowPerformers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [alertsRes, topRes, lowRes] = await Promise.all([
          hodService.getAlerts(),
          hodService.getTopPerformers(),
          hodService.getLowPerformers()
        ]);
        setAlerts(alertsRes.data?.data || []);
        setTopPerformers(topRes.data?.data || []);
        setLowPerformers(lowRes.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch performance data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const renderStudentList = (students: any[], type: 'alert' | 'top' | 'low') => {
    const filtered = students.filter(s => 
      s.firstName?.toLowerCase().includes(search.toLowerCase()) || 
      s.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (filtered.length === 0) {
      return (
        <div className="py-20 text-center text-gray-500">
          No students found matching your criteria.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((student) => (
          <Link key={student._id} href={`/hod/students/${student._id}`}>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-4 border-white/5 hover:bg-white/5 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center border border-white/5">
                  <User className="h-6 w-6 text-white/50" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{student.firstName} {student.lastName}</h4>
                  <p className="text-xs text-gray-500">{student.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{student.score || 0}%</p>
                  <Badge variant="outline" className={`text-[10px] border-none px-0 ${
                    type === 'top' ? 'text-emerald-400' :
                    type === 'low' ? 'text-red-400' :
                    'text-orange-400'
                  }`}>
                    {student.grade || 'N/A'}
                  </Badge>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-white transition-colors" />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-12">
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Student Performance</h1>
          <p className="text-gray-400 text-lg">Detailed alerts and filtered performance lists.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search students..." 
              className="pl-10 bg-white/5 border-white/10 text-white rounded-xl w-64"
            />
          </div>
          <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 text-white">
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        </div>
      ) : (
        <Tabs defaultValue="alerts" className="w-full">
          <TabsList className="bg-white/5 border border-white/10 rounded-xl p-1 mb-8">
            <TabsTrigger value="alerts" className="rounded-lg data-[state=active]:bg-orange-500/10 data-[state=active]:text-orange-400">
              <AlertTriangle className="h-4 w-4 mr-2" /> Critical Alerts ({alerts.length})
            </TabsTrigger>
            <TabsTrigger value="top" className="rounded-lg data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-400">
              <TrendingUp className="h-4 w-4 mr-2" /> Top Performers ({topPerformers.length})
            </TabsTrigger>
            <TabsTrigger value="low" className="rounded-lg data-[state=active]:bg-red-500/10 data-[state=active]:text-red-400">
              <TrendingDown className="h-4 w-4 mr-2" /> Low Performers ({lowPerformers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts">
            <div className="glass rounded-3xl p-8 border-orange-500/10">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-400" /> Students Requiring Attention
              </h2>
              {renderStudentList(alerts, 'alert')}
            </div>
          </TabsContent>

          <TabsContent value="top">
            <div className="glass rounded-3xl p-8 border-emerald-500/10">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" /> High Achieving Students
              </h2>
              {renderStudentList(topPerformers, 'top')}
            </div>
          </TabsContent>

          <TabsContent value="low">
            <div className="glass rounded-3xl p-8 border-red-500/10">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-400" /> At-Risk Students
              </h2>
              {renderStudentList(lowPerformers, 'low')}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
