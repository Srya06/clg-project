"use client";

import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { notificationService } from "@/services/notification.service";
import { formatDistanceToNow } from "date-fns";

export function Navbar() {
  const { data: session } = useSession();
  const userName = session?.user?.firstName || "User";
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchNotifications() {
      if (session?.user) {
        try {
          const res = await notificationService.getNotifications();
          const notifs = res.data?.notifications || [];
          setNotifications(notifs);
          setUnreadCount(notifs.filter((n: any) => !n.read).length);
        } catch (error) {
          console.error("Failed to fetch notifications", error);
        }
      }
    }
    fetchNotifications();
    // In a real app, you might poll this or use WebSockets
  }, [session]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/5 bg-black/20 px-8 backdrop-blur-md">
      <div className="flex w-full max-w-sm items-center gap-2 rounded-xl bg-white/5 px-3 py-1 border border-white/10">
        <Search className="h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search resources, students..."
          className="w-full bg-transparent px-2 py-1 text-sm outline-none placeholder:text-gray-500"
        />
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white hover:bg-white/5">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-zinc-900 border-white/10 text-white p-0">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h3 className="font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${!notif.read ? 'bg-blue-500/[0.02]' : ''}`}
                    onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className={`text-sm ${!notif.read ? 'font-semibold text-white' : 'text-gray-300'}`}>
                        {notif.title}
                      </p>
                      {!notif.read && <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1" />}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{notif.message}</p>
                    <p className="text-[10px] text-gray-600">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                ))
              )}
            </div>
            <div className="p-2 border-t border-white/5">
              <Button 
                variant="ghost" 
                className="w-full text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                onClick={async () => {
                  try {
                    await notificationService.markAllAsRead();
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                    setUnreadCount(0);
                  } catch (error) {
                    console.error(error);
                  }
                }}
              >
                Mark all as read
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-white/5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 outline outline-2 outline-offset-2 outline-white/10">
                <User className="h-5 w-5 text-white" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-white/10 text-white">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session?.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem className="focus:bg-white/5 cursor-pointer">Profile</DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-white/5 cursor-pointer">Security</DropdownMenuItem>
            <DropdownMenuItem 
              className="focus:bg-white/5 cursor-pointer text-red-400 focus:text-red-400"
              onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
