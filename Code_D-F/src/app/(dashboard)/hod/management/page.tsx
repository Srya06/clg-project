"use client";

import { motion } from "framer-motion";
import { 
  Calendar, 
  Trophy, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  MapPin, 
  Clock,
  User,
  Star,
  Search,
  LayoutGrid,
  List as ListIcon,
  X,
  Save,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { hodService } from "@/services/hod.service";
import { toast } from "@/hooks/use-toast";

export default function ManagementPage() {
  const [activeTab, setActiveTab] = useState<'events' | 'achievements'>('events');
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = activeTab === 'events' 
        ? await hodService.getEvents() 
        : await hodService.getAchievements();
      setItems(res.data?.data || []);
    } catch (error) {
      console.error("Fetch failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (item: any = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData(activeTab === 'events' ? {
        type: 'hackathon',
        date: new Date().toISOString().split('T')[0]
      } : {
        type: 'student',
        category: 'competition',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (activeTab === 'events') {
        if (editingItem) {
          await hodService.updateEvent(editingItem._id, formData);
          toast({ title: "Event Updated", description: "Changes saved successfully." });
        } else {
          await hodService.createEvent(formData);
          toast({ title: "Event Created", description: "New event added to calendar." });
        }
      } else {
        if (editingItem) {
          await hodService.updateAchievement(editingItem._id, formData);
          toast({ title: "Achievement Updated", description: "Changes saved successfully." });
        } else {
          await hodService.createAchievement(formData);
          toast({ title: "Achievement Added", description: "New accolade added to Hall of Fame." });
        }
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast({ title: "Save Failed", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      if (activeTab === 'events') await hodService.deleteEvent(id);
      else await hodService.deleteAchievement(id);
      toast({ title: "Deleted Successfully" });
      fetchData();
    } catch (error) {
      toast({ title: "Delete Failed", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-3 py-1">
            HOD Admin Control
          </Badge>
          <h1 className="text-4xl font-black tracking-tight text-white">
            Departmental Management
          </h1>
          <p className="text-gray-400">
            Control the event calendar and curate the departmental Hall of Fame.
          </p>
        </div>

        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5">
           <button 
             onClick={() => setActiveTab('events')}
             className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
               activeTab === 'events' ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/20" : "text-gray-400 hover:text-white"
             }`}
           >
             <Calendar className="h-4 w-4" /> Events
           </button>
           <button 
             onClick={() => setActiveTab('achievements')}
             className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
               activeTab === 'achievements' ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/20" : "text-gray-400 hover:text-white"
             }`}
           >
             <Trophy className="h-4 w-4" /> Achievements
           </button>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="glass rounded-[2.5rem] border-white/5 p-8 min-h-[600px] relative overflow-hidden">
         {/* Background Glow */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full -mr-48 -mt-48" />

         <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
               <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold text-white capitalize">{activeTab} List</h2>
                  <Badge className="bg-white/5 text-gray-400 border-none">{items.length} Total</Badge>
               </div>
               
               <button 
                 onClick={() => handleOpenModal()}
                 className="px-6 py-3 bg-white text-black font-black rounded-2xl flex items-center gap-2 hover:bg-cyan-400 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-cyan-500/10"
               >
                 <Plus className="h-5 w-5" /> Add New {activeTab === 'events' ? 'Event' : 'Achievement'}
               </button>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="h-10 w-10 text-cyan-400 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Synchronizing departmental data...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-40 text-center opacity-30">
                 <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    {activeTab === 'events' ? <Calendar size={40} /> : <Trophy size={40} />}
                 </div>
                 <h3 className="text-xl font-bold text-white">No {activeTab} yet</h3>
                 <p className="text-gray-500 mt-2">Start by creating your first entry above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {items.map((item) => (
                   <motion.div 
                     layout
                     key={item._id}
                     className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 transition-all group"
                   >
                     <div className="flex items-start justify-between mb-4">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${activeTab === 'events' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-500/10 text-amber-400'}`}>
                           {activeTab === 'events' ? <Calendar className="h-6 w-6" /> : <Trophy className="h-6 w-6" />}
                        </div>
                        <div className="flex items-center gap-2">
                           <button 
                             onClick={() => handleOpenModal(item)}
                             className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-cyan-500/20 hover:text-cyan-400 transition-all"
                           >
                              <Edit3 size={18} />
                           </button>
                           <button 
                             onClick={() => handleDelete(item._id)}
                             className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all"
                           >
                              <Trash2 size={18} />
                           </button>
                        </div>
                     </div>

                     <div className="space-y-1 mb-4">
                        <Badge className="bg-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-none">
                           {activeTab === 'events' ? item.type : item.category}
                        </Badge>
                        <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">{item.title}</h3>
                        {activeTab === 'achievements' && (
                           <p className="text-cyan-400 font-bold text-sm flex items-center gap-1">
                              <User className="h-3 w-3" /> {item.winnerName}
                           </p>
                        )}
                     </div>

                     <p className="text-gray-500 text-sm line-clamp-2 mb-6">
                        {item.description}
                     </p>

                     <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                           <Clock className="h-3.5 w-3.5" />
                           {new Date(item.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        {activeTab === 'events' && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                             <MapPin className="h-3.5 w-3.5" />
                             {item.location}
                          </div>
                        )}
                        {item.isFeatured && (
                           <Badge className="bg-amber-500/10 text-amber-400 border-none flex items-center gap-1">
                              <Star className="h-3 w-3 fill-amber-400" /> Featured
                           </Badge>
                        )}
                     </div>
                   </motion.div>
                 ))}
              </div>
            )}
         </div>
      </div>

      {/* Modal / Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="absolute inset-0 bg-black/80 backdrop-blur-sm"
             onClick={() => setIsModalOpen(false)}
           />
           
           <motion.div 
             initial={{ scale: 0.9, opacity: 0, y: 20 }}
             animate={{ scale: 1, opacity: 1, y: 0 }}
             className="relative z-110 w-full max-w-2xl glass rounded-[2.5rem] border-white/10 p-8 shadow-2xl"
           >
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-bold text-white">
                    {editingItem ? 'Edit' : 'Create New'} {activeTab === 'events' ? 'Event' : 'Achievement'}
                 </h2>
                 <button 
                   onClick={() => setIsModalOpen(false)}
                   className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                 >
                    <X size={20} />
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Title</label>
                    <input 
                      value={formData.title || ''}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder={`Enter ${activeTab} title...`}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500 transition-all"
                    />
                 </div>

                 <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Description</label>
                    <textarea 
                      value={formData.description || ''}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Tell us more about this..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500 transition-all resize-none"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Type / Category</label>
                    <select 
                      value={activeTab === 'events' ? formData.type : formData.category}
                      onChange={(e) => setFormData({...formData, [activeTab === 'events' ? 'type' : 'category']: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500 transition-all appearance-none"
                    >
                       {activeTab === 'events' ? (
                          <>
                             <option value="hackathon">Hackathon</option>
                             <option value="workshop">Workshop</option>
                             <option value="conference">Conference</option>
                             <option value="webinar">Webinar</option>
                             <option value="other">Other</option>
                          </>
                       ) : (
                          <>
                             <option value="competition">Competition</option>
                             <option value="research">Research</option>
                             <option value="certification">Certification</option>
                             <option value="patent">Patent</option>
                             <option value="other">Other</option>
                          </>
                       )}
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Date</label>
                    <input 
                      type="date"
                      value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-500 transition-all"
                    />
                 </div>

                 {activeTab === 'events' ? (
                   <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Location</label>
                      <input 
                        value={formData.location || ''}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="Lab 4, Seminar Hall, or Virtual..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500 transition-all"
                      />
                   </div>
                 ) : (
                   <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Winner / Recipient Name</label>
                      <input 
                        value={formData.winnerName || ''}
                        onChange={(e) => setFormData({...formData, winnerName: e.target.value})}
                        placeholder="Who achieved this?"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-cyan-500 transition-all"
                      />
                   </div>
                 )}
              </div>

              <div className="mt-10 flex gap-4">
                 <button 
                   onClick={() => setIsModalOpen(false)}
                   className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all"
                 >
                    Cancel
                 </button>
                 <button 
                   onClick={handleSave}
                   disabled={isSaving}
                   className="flex-[2] py-4 rounded-2xl bg-cyan-600 text-white font-black hover:bg-cyan-500 shadow-xl shadow-cyan-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                 >
                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    {editingItem ? 'Save Changes' : `Create ${activeTab === 'events' ? 'Event' : 'Achievement'}`}
                 </button>
              </div>
           </motion.div>
        </div>
      )}
    </div>
  );
}
