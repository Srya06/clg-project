"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  User, 
  Map, 
  CheckSquare, 
  Users, 
  Settings,
  BrainCircuit,
  LogOut,
  KeyRound,
} from "lucide-react";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";

const studentLinks = [
  { name: "Dashboard", href: "/student", icon: LayoutDashboard },
  { name: "Roadmap", href: "/student/roadmap", icon: Map },
  { name: "Progress", href: "/student/progress", icon: CheckSquare },
  { name: "Profile", href: "/student/profile", icon: User },
  { name: "AI Mentor", href: "/ai/chat", icon: BrainCircuit },
];

const hodLinks = [
  { name: "Overview", href: "/hod", icon: LayoutDashboard },
  { name: "Students", href: "/hod/students", icon: Users },
  { name: "Rankings", href: "/hod/rankings", icon: Map },
];

export function Sidebar({ role = "student" }: { role?: "student" | "hod" }) {
  const pathname = usePathname();
  const links = role === "hod" ? hodLinks : studentLinks;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl">
      <div className="flex h-full flex-col px-4 py-6">
        <div className="mb-8 px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              GSC
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 hover:bg-white/5",
                  isActive ? "text-white" : "text-gray-400 hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 rounded-xl bg-white/5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.2 }}
                  />
                )}
                <link.icon className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-blue-400" : "group-hover:text-blue-400"
                )} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2 border-t border-white/5 pt-6">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-400 transition-all hover:bg-white/5 hover:text-white"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
          {/* HOD-only: Change Password */}
          {links === hodLinks && (
            <Link
              href="/hod/change-password"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-amber-600/70 transition-all hover:bg-amber-500/10 hover:text-amber-400"
            >
              <KeyRound className="h-5 w-5" />
              Change Password
            </Link>
          )}
          <button
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition-all hover:bg-red-400/10"
            onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
