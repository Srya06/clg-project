"use client";

import { motion } from "framer-motion";
import { 
  Sparkles, 
  Map as MapIcon, 
  Trophy, 
  Calendar, 
  ArrowRight,
  BrainCircuit,
  Cpu,
  Globe
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { departmentService } from "@/services/department.service";

export default function LandingPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [eventsRes, achievementsRes] = await Promise.all([
          departmentService.getAllEvents(),
          departmentService.getFeaturedAchievements(),
        ]);
        setEvents(eventsRes.data.data.events || []);
        setAchievements(achievementsRes.data.data.achievements || []);
      } catch (error) {
        console.error("Failed to fetch landing data", error);
      }
    }
    fetchData();
  }, []);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-orange-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 bg-white rounded-full p-1 shadow-2xl shadow-blue-500/20">
              <img 
                src="/logo.png" 
                alt="MIT Mysore Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=MIT+AI&background=0D8ABC&color=fff";
                }}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Government science college hassan
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-blue-400 font-bold">STUDENT PORTAL</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <Link href="#events" className="hover:text-white transition-colors">Events</Link>
            <Link href="#achievements" className="hover:text-white transition-colors">Hall of Fame</Link>
            <Link href="#about" className="hover:text-white transition-colors">About</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-sm font-semibold hover:bg-white/5">Login</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6 shadow-lg shadow-blue-500/20">
                Join Hub
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 px-6">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto text-center space-y-8 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest"
          >
            <Sparkles className="w-3 h-3" />
            Empowering the Future of Intelligence
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-bold tracking-tighter text-white"
          >
            Unleash Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-orange-500">
              AI Potential
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-400 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed"
          >
            The official digital hub for students. 
            Personalized roadmaps, real-time event tracking, and career acceleration.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <Link href="/register">
              <Button className="h-14 px-8 rounded-2xl bg-white text-black hover:bg-gray-200 text-lg font-bold group">
                Create My Profile
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#events">
              <Button variant="outline" className="h-14 px-8 rounded-2xl border-white/10 hover:bg-white/5 text-lg font-bold">
                Explore Events
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Feature Cards */}
        <section className="max-w-7xl mx-auto py-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <MapIcon className="w-8 h-8 text-blue-400" />,
              title: "AI Roadmaps",
              desc: "Personalized learning paths generated by advanced LLMs tailored to your departmental goals."
            },
            {
              icon: <Trophy className="w-8 h-8 text-orange-400" />,
              title: "Leaderboard",
              desc: "Compete with peers and earn credits for your achievements and technical contributions."
            },
            {
              icon: <Calendar className="w-8 h-8 text-purple-400" />,
              title: "Event Hub",
              desc: "Stay updated with departmental hackathons, workshops, and industry conferences."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="glass p-10 rounded-[3rem] border-white/5 hover:border-white/10 transition-all group"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </section>

        {/* Events Section */}
        <section id="events" className="max-w-7xl mx-auto py-32 space-y-12">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold tracking-tight">Upcoming Events</h2>
              <p className="text-gray-500">Major hackathons, workshops, and conferences.</p>
            </div>
            <Button variant="outline" className="rounded-full border-white/10">View Calendar</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.length > 0 ? (
              events.map((event, i) => (
                <div key={i} className="glass overflow-hidden rounded-[2rem] border-white/5 group hover:border-blue-500/30 transition-all">
                  <div className="aspect-[4/3] bg-zinc-900 flex items-center justify-center">
                    {event.image ? (
                      <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                      <Calendar className="w-12 h-12 text-gray-800" />
                    )}
                  </div>
                  <div className="p-6 space-y-3">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">{event.type}</span>
                    <h3 className="text-lg font-bold text-white line-clamp-1">{event.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center glass rounded-[2rem]">
                <p className="text-gray-500">No upcoming events at the moment. Stay tuned!</p>
              </div>
            )}
          </div>
        </section>

        {/* Achievements Section */}
        <section id="achievements" className="max-w-7xl mx-auto py-32 space-y-12 bg-blue-600/5 rounded-[4rem] p-12 border border-blue-600/10">
          <div className="text-center space-y-4">
            <Trophy className="w-12 h-12 text-orange-500 mx-auto" />
            <h2 className="text-5xl font-bold tracking-tight text-white">The Hall of Fame</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Celebrating the incredible milestones achieved by our students and dedicated faculty members.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {achievements.length > 0 ? (
              achievements.map((achievement, i) => (
                <div key={i} className="glass p-8 rounded-[2.5rem] border-white/5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <Star className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{achievement.winnerName}</h4>
                      <p className="text-xs text-blue-400 uppercase font-bold tracking-tighter">{achievement.type}</p>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white">{achievement.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{achievement.description}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <p className="text-gray-600">Our achievements are loading... stay tuned for the brilliance!</p>
              </div>
            )}
          </div>
        </section>

        {/* Branding Section */}
        <section className="max-w-7xl mx-auto py-32 border-t border-white/5">
          <div className="flex flex-col items-center text-center space-y-6">
            <BrainCircuit className="w-16 h-16 text-blue-500 opacity-50" />
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">The Future of CSE-AI is Here.</h2>
            <p className="text-gray-400 max-w-xl">
              From automated resume analysis to agentic career coaching, we're building the infrastructure 
              for the next generation of students.
            </p>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="MIT" className="w-8 h-8 opacity-50" />
            <span className="text-gray-500 font-medium">© 2026 Student Portal.</span>
          </div>
          <div className="flex gap-8 text-gray-500 text-sm">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
