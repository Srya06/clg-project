import React from 'react';
import Sidebar from '../components/Sidebar';
import DashboardCard from '../components/DashboardCard';
import { GitBranch, Trophy, Calendar, CheckCircle2 } from 'lucide-react';

const StudentDashboard = () => {
  return (
    <div className="flex min-h-screen bg-[#06090F] text-white">
      <Sidebar role="student" />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white/90">Welcome back, Surya</h1>
            <p className="mt-1 text-gray-400">Here's what's happening on your learning path today.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-400">Platform Score</p>
              <p className="text-2xl font-bold text-cyan-400">850 / 1000</p>
            </div>
            <div className="h-12 w-12 rounded-full border-2 border-cyan-500/20 p-1">
              <div className="h-full w-full rounded-full bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Progress Card */}
          <DashboardCard title="Active Roadmap: Week 2" className="lg:col-span-2">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Next.js Fundamentals</span>
                <span className="text-sm text-cyan-400">60% Complete</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                <div className="h-full w-[60%] rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 shadow-[0_0_10px_rgba(34,211,238,0.3)]"></div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  { label: 'SSR vs CSR', done: true },
                  { label: 'File-based Routing', done: true },
                  { label: 'API Routes', done: false },
                  { label: 'Middleware Implementation', done: false },
                ].map((task) => (
                  <div key={task.label} className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
                    <CheckCircle2 size={18} className={task.done ? 'text-green-400' : 'text-gray-500'} />
                    <span className={`text-sm ${task.done ? 'text-white' : 'text-gray-400'}`}>{task.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </DashboardCard>

          {/* Stats Column */}
          <div className="space-y-6">
            <DashboardCard title="Integration Status">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <GitBranch className="text-white" size={20} />
                    <span className="text-sm">GitHub</span>
                  </div>
                  <span className="rounded-full bg-green-500/10 px-2 py-1 text-[10px] font-bold text-green-400 uppercase tracking-wider">Connected</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 opacity-50">
                  <div className="flex items-center gap-3">
                    <Trophy className="text-white" size={20} />
                    <span className="text-sm">LeetCode</span>
                  </div>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Not Linked</span>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title="Upcoming Deadlines">
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="bg-cyan-500/10 p-2 rounded-lg text-cyan-400">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Project Submission</p>
                    <p className="text-xs text-gray-400">Due in 2 days</p>
                  </div>
                </div>
              </div>
            </DashboardCard>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
