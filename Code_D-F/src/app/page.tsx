"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CinematicIntro } from "@/components/ui/cinematic-intro";
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Award, 
  Calendar, 
  Trophy, 
  ArrowRight, 
  Star, 
  MapPin, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  Brain,
  Rocket
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { publicService } from "@/services/public.service";

export default function LandingPage() {
  const [introStep, setIntroStep] = useState<'intro' | 'main'>('intro');
  const [showContent, setShowContent] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);

  const handleIntroComplete = () => {
    setIntroStep('main');
  };

  useEffect(() => {
    if (introStep === 'main') {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 1200);
      fetchPublicData();
      return () => clearTimeout(timer);
    }
  }, [introStep]);

  const fetchPublicData = async () => {
    try {
      const [eRes, aRes] = await Promise.all([
        publicService.getEvents(),
        publicService.getAchievements()
      ]);
      setEvents(eRes.data?.data || []);
      setAchievements(aRes.data?.data || []);
    } catch (error) {
      console.error("Public fetch failed", error);
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <AnimatePresence>
        {introStep === 'intro' && (
          <CinematicIntro onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      <div className={`transition-all duration-1000 ${introStep === 'main' ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Navigation Bar */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 backdrop-blur-md bg-black/20 border-b border-white/5">
           <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-gradient-to-br from-cyan-400 to-indigo-600 rounded-full flex items-center justify-center overflow-hidden border border-white/10 shadow-lg shadow-cyan-500/20">
                 <img 
                   src="/logo.jpg" 
                   alt="MIT Logo" 
                   className="w-full h-full object-cover" 
                   onError={(e) => {
                     (e.target as any).src = "https://ui-avatars.com/api/?name=MIT+AI&background=06b6d4&color=fff";
                   }}
                 />
              </div>
              <div className="flex flex-col">
                 <span className="text-sm font-black tracking-tighter text-white">Government science college hassan</span>
                 <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest leading-none">STUDENT PORTAL</span>
              </div>
           </div>
           <div className="hidden md:flex items-center gap-8">
              <a href="#events" className="text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest">Events</a>
              <a href="#hall-of-fame" className="text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest">Hall of Fame</a>
              <a href="#about" className="text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest">About</a>
              <Button variant="ghost" className="text-xs font-bold text-white uppercase tracking-widest" asChild>
                 <Link href="/login">Login</Link>
              </Button>
              <Button className="bg-white text-black hover:bg-cyan-400 font-bold px-6 rounded-full text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95" asChild>
                 <Link href="/register">Join Department</Link>
              </Button>
           </div>
        </nav>

        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center p-4 pt-20">
          <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
          
          <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
             <motion.div
               initial={{ opacity: 0, x: -30 }}
               animate={showContent ? { opacity: 1, x: 0 } : {}}
               transition={{ duration: 1, delay: 0.2 }}
               className="space-y-8 relative z-10"
             >
                <div className="space-y-4">
                   <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em]">
                     Empowering Innovation
                   </Badge>
                   <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter text-white">
                     BUILD YOUR <br />
                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600">FUTURE</span> IN AI.
                   </h1>
                   <p className="text-lg text-gray-400 max-w-lg leading-relaxed">
                     The official digital ecosystem for students. Real-time roadmaps, AI-driven credit systems, and a competitive honor roll.
                   </p>
                </div>

                <div className="flex items-center gap-6">
                   <Button size="lg" className="h-16 px-10 text-lg font-black bg-white text-black hover:bg-cyan-400 rounded-[2rem] transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-cyan-500/10" asChild>
                      <Link href="/login" className="flex items-center gap-2">Launch Portal <ArrowRight className="h-5 w-5" /></Link>
                   </Button>
                </div>

                <div className="flex items-center gap-8 pt-8">
                   <div className="flex flex-col">
                      <span className="text-3xl font-black text-white">500+</span>
                      <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Active Students</span>
                   </div>
                   <div className="w-[1px] h-10 bg-white/10" />
                   <div className="flex flex-col">
                      <span className="text-3xl font-black text-white">25+</span>
                      <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Live Projects</span>
                   </div>
                </div>
             </motion.div>

             <div className="relative h-[500px] lg:h-[700px]">
                <AnimatePresence>
                   {showContent && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="w-full h-full"
                      >
                         <SplineScene 
                           scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                           className="w-full h-full"
                         />
                      </motion.div>
                   )}
                </AnimatePresence>
             </div>
          </div>
        </section>

        {/* Events Section */}
        <section id="events" className="py-32 px-8 relative overflow-hidden">
           {/* Background Decoration */}
           <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-600/5 blur-[120px] rounded-full -ml-48 -mt-48" />

           <div className="max-w-7xl mx-auto space-y-16">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                 <div className="space-y-4">
                    <h2 className="text-5xl font-black tracking-tight text-white flex items-center gap-4">
                      Upcoming Events <Calendar className="h-10 w-10 text-cyan-400" />
                    </h2>
                    <p className="text-gray-500 max-w-xl text-lg">
                      Stay updated with the latest hackathons, workshops, and technical conferences hosted by the college.
                    </p>
                 </div>
                 <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 font-black flex items-center gap-2">
                    View All Events <ChevronRight className="h-5 w-5" />
                 </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {events.length > 0 ? events.slice(0, 3).map((event, i) => (
                    <motion.div 
                      key={event._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="group p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 transition-all"
                    >
                       <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                          <Calendar className="h-7 w-7" />
                       </div>
                       <Badge className="bg-cyan-500/10 text-cyan-400 border-none mb-4 uppercase text-[10px] tracking-widest">{event.type}</Badge>
                       <h3 className="text-2xl font-black text-white mb-4 group-hover:text-cyan-400 transition-colors">{event.title}</h3>
                       <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-2">
                          {event.description}
                       </p>
                       <div className="flex items-center justify-between pt-6 border-t border-white/5">
                          <div className="flex flex-col">
                             <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Date</span>
                             <span className="text-xs text-white font-bold">{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex flex-col text-right">
                             <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Location</span>
                             <span className="text-xs text-white font-bold">{event.location}</span>
                          </div>
                       </div>
                    </motion.div>
                 )) : (
                   <div className="col-span-3 py-20 text-center opacity-20">
                      <p className="text-xl font-bold">No upcoming events scheduled</p>
                   </div>
                 )}
              </div>
           </div>
        </section>

        {/* Hall of Fame / Achievements */}
        <section id="hall-of-fame" className="py-32 px-8 bg-white/[0.01] border-y border-white/5 relative">
           <div className="max-w-7xl mx-auto space-y-20">
              <div className="text-center space-y-6">
                 <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
                   The Honor Roll
                 </Badge>
                 <h2 className="text-6xl font-black tracking-tighter text-white">
                   HALL OF FAME
                 </h2>
                 <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                   Celebrating the exceptional achievements of our students and faculty in research, innovation, and global competitions.
                 </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {achievements.length > 0 ? achievements.slice(0, 4).map((ach, i) => (
                    <motion.div 
                      key={ach._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative p-8 rounded-[2rem] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/5 overflow-hidden group hover:border-amber-500/30 transition-all"
                    >
                       {/* Background Symbol */}
                       <Trophy className="absolute -right-8 -bottom-8 h-40 w-40 text-amber-500/5 rotate-12 group-hover:scale-125 transition-transform duration-700" />
                       
                       <div className="relative z-10 space-y-6">
                          <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                             <Award className="h-6 w-6" />
                          </div>
                          <div>
                             <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-2">{ach.category}</h4>
                             <h3 className="text-xl font-bold text-white mb-2 leading-tight">{ach.title}</h3>
                             <p className="text-sm text-cyan-400 font-bold mb-4">{ach.winnerName}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-black/40 text-[11px] text-gray-500 italic border border-white/5">
                             "{ach.description}"
                          </div>
                       </div>
                    </motion.div>
                 )) : (
                   <div className="col-span-4 py-20 text-center opacity-20">
                      <p className="text-xl font-bold text-white uppercase tracking-widest">History is being written...</p>
                   </div>
                 )}
              </div>
           </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-8 flex justify-center">
           <div className="max-w-4xl w-full p-12 md:p-20 rounded-[3rem] bg-gradient-to-br from-cyan-600/20 to-purple-600/20 border border-white/10 text-center space-y-10 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
              <div className="relative z-10 space-y-6">
                 <h2 className="text-5xl font-black tracking-tight text-white">
                   READY TO ORCHESTRATE <br />YOUR ACADEMIC JOURNEY?
                 </h2>
                 <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
                   Join the most advanced academic ecosystem. Build your roadmap, earn credits, and become part of the institutional legacy.
                 </p>
                 <div className="flex flex-wrap justify-center gap-4 pt-4">
                    <Button size="lg" className="h-16 px-12 bg-white text-black font-black text-lg rounded-full hover:bg-cyan-400 transition-all hover:scale-105 active:scale-95 shadow-2xl" asChild>
                       <Link href="/register">Get Started Now</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="h-16 px-12 border-white/10 text-white font-bold text-lg rounded-full hover:bg-white/5 transition-all" asChild>
                       <Link href="/login">Student Login</Link>
                    </Button>
                 </div>
              </div>
           </div>
        </section>

        {/* Footer */}
        <footer className="py-20 px-8 border-t border-white/5">
           <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="flex items-center gap-4 opacity-50">
                 <div className="h-10 w-10 bg-white p-1 rounded-full grayscale">
                    <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-sm font-black tracking-tighter text-white">Government science college hassan</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">STUDENT PORTAL</span>
                 </div>
              </div>
              
              <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-gray-600">
                 <a href="#" className="hover:text-white transition-colors">Privacy</a>
                 <a href="#" className="hover:text-white transition-colors">Faculty</a>
                 <a href="#" className="hover:text-white transition-colors">Github</a>
                 <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              </div>

              <div className="text-[10px] font-bold text-gray-700 uppercase tracking-[0.4em]">
                 © 2024 CODE-D-B ECOSYSTEM
              </div>
           </div>
        </footer>

      </div>
    </main>
  );
}
