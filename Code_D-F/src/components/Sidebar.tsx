import React from 'react';
import { Home, Map, Bell, Settings, User, LogOut, BarChart3, Award, Trophy, Upload, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = ({ role }: { role: 'student' | 'teacher' | 'hod' | 'admin' }) => {
  const pathname = usePathname();

  const menuItems = role === 'student' 
    ? [
        { icon: Home, label: 'Overview', href: '/student' },
        { icon: Map, label: 'Roadmap', href: '/student/roadmap' },
        { icon: Award, label: 'Certificates', href: '/student/certificates' },
        { icon: Bell, label: 'Notifications', href: '/student/notifications' },
        { icon: User, label: 'Profile', href: '/student/profile' },
      ]
    : role === 'teacher'
    ? [
        { icon: Home, label: 'Dashboard', href: '/teacher' },
        { icon: Upload, label: 'CSV Uploads', href: '/teacher' },
        { icon: Users, label: 'Students', href: '/teacher/students' },
        { icon: BarChart3, label: 'Analytics', href: '/teacher/analytics' },
      ]
    : [
        { icon: BarChart3, label: 'Analytics', href: '/hod/analytics' },
        { icon: Trophy, label: 'Leaderboard', href: '/hod/rankings' },
        { icon: Map, label: 'Management', href: '/hod/management' },
        { icon: Bell, label: 'Announcements', href: '/hod/announcements' },
        { icon: Settings, label: 'Settings', href: '/admin/settings' },
      ];


  return (
    <div className="flex h-screen w-64 flex-col border-r border-white/10 bg-[#0A0E17] p-6 sticky top-0">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-600 font-bold text-white shadow-lg shadow-cyan-500/20">
          C
        </div>
        <span className="text-xl font-bold tracking-tight text-white uppercase italic">CSE-AI</span>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-cyan-500/10 text-cyan-400 shadow-[inset_0_0_20px_rgba(34,211,238,0.05)]' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 pt-6">
        <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-400 transition-all hover:bg-red-500/10 hover:text-red-400">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
