"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { Navbar } from "@/components/dashboard/Navbar";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isHodRoute = pathname.startsWith("/hod");

  useEffect(() => {
    if (status === "loading") return;

    // Not logged in — redirect to appropriate login
    if (status === "unauthenticated") {
      router.replace(isHodRoute ? "/hod/login" : "/login");
      return;
    }

    if (session?.user) {
      const role = session.user.role;

      // ── HOD route guard ────────────────────────────────────────────────────
      if (isHodRoute) {
        if (role !== "hod") {
          // Non-HOD user trying to access HOD dashboard → kick to HOD login
          router.replace("/hod/login");
          return;
        }
        // HOD logged in but must change password first
        if ((session as any).forcePasswordChange && pathname !== "/hod/change-password") {
          router.replace("/hod/change-password");
          return;
        }
      }

      // ── Student/Teacher route guard ────────────────────────────────────────
      if (!isHodRoute && role === "hod") {
        // HOD accidentally on student routes → redirect to HOD dashboard
        router.replace("/hod");
        return;
      }
    }
  }, [status, session, router, pathname, isHodRoute]);

  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Immersive Background Mesh */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-mesh" />
      </div>

      <Sidebar role={isHodRoute ? "hod" : "student"} />

      <div className="relative flex flex-1 flex-col pl-64">
        <Navbar />
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
