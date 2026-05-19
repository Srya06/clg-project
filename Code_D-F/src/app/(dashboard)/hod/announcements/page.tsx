"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Megaphone, 
  Trash2, 
  Users, 
  Calendar,
  Send,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { hodService } from "@/services/hod.service";
import { formatDistanceToNow } from "date-fns";

export default function HODAnnouncements() {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    body: "",
    priority: "medium",
    targetBranch: "",
    targetYear: "",
    notifyByEmail: false
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await hodService.getAnnouncements();
      setAnnouncements(res.data?.announcements || []);
    } catch (error) {
      console.error("Failed to fetch announcements", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await hodService.sendAnnouncement(newAnnouncement);
      toast({ title: "Success", description: "Announcement sent successfully" });
      setNewAnnouncement({ title: "", body: "", priority: "medium", targetBranch: "", targetYear: "", notifyByEmail: false });
      fetchAnnouncements();
    } catch (error) {
      toast({ title: "Error", description: "Failed to send announcement", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await hodService.deleteAnnouncement(id);
      setAnnouncements(announcements.filter(a => a._id !== id));
      toast({ title: "Archived", description: "Announcement has been archived." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete announcement", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <section>
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Campus Announcements</h1>
        <p className="text-gray-400 text-lg">Broadcast information to specific branches and batches.</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creation Form */}
        <div className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-3xl p-8 sticky top-24 space-y-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <Plus className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Create New</h2>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Title</label>
                <Input 
                  value={newAnnouncement.title}
                  onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                  placeholder="e.g. Hackathon 2024" 
                  className="bg-white/5 border-white/10 text-white rounded-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Message</label>
                <textarea 
                  value={newAnnouncement.body}
                  onChange={e => setNewAnnouncement({...newAnnouncement, body: e.target.value})}
                  className="w-full min-h-[120px] p-4 bg-white/5 border border-white/10 text-white rounded-2xl outline-none focus:ring-1 ring-blue-500/50 resize-none placeholder:text-gray-600 text-sm"
                  placeholder="Details about the event..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Branch</label>
                  <Input 
                    value={newAnnouncement.targetBranch}
                    onChange={e => setNewAnnouncement({...newAnnouncement, targetBranch: e.target.value})}
                    placeholder="All" 
                    className="bg-white/5 border-white/10 text-white rounded-xl h-10 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Year</label>
                  <Input 
                    type="number"
                    value={newAnnouncement.targetYear}
                    onChange={e => setNewAnnouncement({...newAnnouncement, targetYear: e.target.value})}
                    placeholder="All" 
                    className="bg-white/5 border-white/10 text-white rounded-xl h-10 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="notify"
                  checked={newAnnouncement.notifyByEmail}
                  onChange={e => setNewAnnouncement({...newAnnouncement, notifyByEmail: e.target.checked})}
                  className="rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="notify" className="text-sm text-gray-400">Notify by Email</label>
              </div>

              <Button 
                type="submit" 
                disabled={creating}
                className="w-full rounded-xl h-12 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20"
              >
                {creating ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                  <><Send className="h-4 w-4 mr-2" /> Send Broadcast</>
                )}
              </Button>
            </form>
          </motion.div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
             <div className="flex items-center justify-center py-20">
               <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
             </div>
          ) : announcements.length === 0 ? (
            <div className="glass rounded-3xl p-20 text-center space-y-4">
              <Megaphone className="h-12 w-12 text-gray-600 mx-auto" />
              <p className="text-gray-500">No active announcements found.</p>
            </div>
          ) : (
            announcements.map((ann) => (
              <motion.div 
                key={ann._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-3xl p-6 border-white/5 hover:bg-white/5 transition-colors relative group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                      <Megaphone className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{ann.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] bg-white/5 border-none text-gray-400">
                          {ann.targetBranch || "All Branches"}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] bg-white/5 border-none text-gray-400">
                          {ann.targetYear ? `Year ${ann.targetYear}` : "All Years"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(ann._id)}
                    className="text-gray-500 hover:text-red-400 hover:bg-red-400/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <p className="text-gray-300 text-sm leading-relaxed mb-6 whitespace-pre-wrap">{ann.body}</p>
                
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                   <div className="flex items-center gap-4 text-xs text-gray-500">
                     <span className="flex items-center gap-1.5">
                       <Users className="h-3.5 w-3.5" />
                       {ann.acknowledgedBy?.length || 0} Acknowledged
                     </span>
                     <span className="flex items-center gap-1.5">
                       <Calendar className="h-3.5 w-3.5" />
                       {formatDistanceToNow(new Date(ann.createdAt), { addSuffix: true })}
                     </span>
                   </div>
                   {ann.priority === 'urgent' && (
                     <Badge className="bg-red-500/10 text-red-400 border-none animate-pulse">Urgent</Badge>
                   )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
