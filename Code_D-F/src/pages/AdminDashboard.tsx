import React from 'react';
import Sidebar from '../components/Sidebar';
import DashboardCard from '../components/DashboardCard';
import { Users, AlertCircle, TrendingUp, Megaphone, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen bg-[#06090F] text-white">
      <Sidebar role="admin" />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-white/90">Platform Analytics</h1>
          <p className="mt-1 text-gray-400">Monitoring student engagement and performance metrics across departments.</p>
        </header>

        <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Students', value: '1,284', trend: '+12%', up: true, icon: Users },
            { label: 'Avg. Score', value: '742', trend: '+5%', up: true, icon: TrendingUp },
            { label: 'At-Risk', value: '24', trend: '-2%', up: false, icon: AlertCircle },
            { label: 'Active Goals', value: '892', trend: '+18%', up: true, icon: Megaphone },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/5 p-2 rounded-lg text-gray-400">
                  <stat.icon size={20} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold ${stat.up ? 'text-green-400' : 'text-red-400'}`}>
                   {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                   {stat.trend}
                </div>
              </div>
              <p className="text-sm font-medium text-gray-400">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Top Performers Table */}
          <DashboardCard title="Student Leaderboard" className="lg:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="pb-4 font-medium">Student</th>
                    <th className="pb-4 font-medium">Branch</th>
                    <th className="pb-4 font-medium">Score</th>
                    <th className="pb-4 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { name: 'Aditya Verma', branch: 'CSE', score: 985, status: 'Elite' },
                    { name: 'Priya Sharma', branch: 'ECE', score: 962, status: 'Elite' },
                    { name: 'Rohan Gupta', branch: 'CSE', score: 945, status: 'Advanced' },
                    { name: 'Ishita Singh', branch: 'IT', score: 938, status: 'Advanced' },
                  ].map((student) => (
                    <tr key={student.name} className="group hover:bg-white/5">
                      <td className="py-4 font-medium text-white/90">{student.name}</td>
                      <td className="py-4 text-gray-400">{student.branch}</td>
                      <td className="py-4">
                        <span className="text-cyan-400 font-bold">{student.score}</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-[10px] font-bold text-cyan-400 uppercase tracking-wider border border-cyan-500/20">
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardCard>

          {/* At-Risk Alerts */}
          <DashboardCard title="Urgent Attention Required">
            <div className="space-y-4">
              {[
                { name: 'Sameer Khan', reason: 'No GitHub activity for 14 days', severity: 'high' },
                { name: 'Anjali Das', reason: 'Score dropped by 40 points', severity: 'medium' },
              ].map((alert) => (
                <div key={alert.name} className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                   <div className="flex items-center gap-2 mb-1">
                      <AlertCircle size={14} className="text-red-400" />
                      <span className="text-sm font-bold text-red-400 uppercase tracking-tighter">Issue detected</span>
                   </div>
                   <p className="text-sm font-medium text-white">{alert.name}</p>
                   <p className="text-xs text-gray-400 mt-1">{alert.reason}</p>
                </div>
              ))}
              <button className="w-full mt-2 py-2 text-xs font-bold text-gray-400 border border-white/5 rounded-lg hover:bg-white/5 transition-colors">
                View All Alerts
              </button>
            </div>
          </DashboardCard>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
