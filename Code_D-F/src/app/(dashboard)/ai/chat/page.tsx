"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  BrainCircuit,
  RotateCcw,
  PlusCircle,
  Code
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { aiService } from "@/services/ai.service";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export default function AIChatPage() {
  const { data: session } = useSession();
  const firstName = session?.user?.firstName || session?.user?.name?.split(' ')[0] || "there";

  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "1",
      role: "assistant",
      content: `Hello! I'm your AI Academic Mentor. Ask me anything about your coding journey, roadmap, or skills — I'm here to help.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await aiService.chat(input);
      const replyText = response.data?.data?.reply || response.data?.reply || "I'm processing your request. Let's look at your roadmap together.";
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: replyText,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error: unknown) {
      // Extract meaningful error message from axios error
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axiosMsg = (error as any)?.response?.data?.message as string | undefined;
      let friendlyMsg = "Sorry, I couldn't reach the AI service right now. Please try again in a moment.";
      if (axiosMsg?.includes('AI_QUOTA_EXCEEDED') || axiosMsg?.includes('quota')) {
        friendlyMsg = "⚠️ The AI API quota has been exceeded for today. Please try again tomorrow or contact the admin to upgrade the API key.";
      } else if (axiosMsg) {
        friendlyMsg = `⚠️ ${axiosMsg}`;
      }
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: friendlyMsg,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Mentor</h1>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online & Ready to Assist
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-400 hover:text-white hover:bg-white/5 rounded-xl"
            onClick={() => {
              setMessages([{
                id: "1",
                role: "assistant",
                content: "Chat history cleared. How else can I help?",
                timestamp: new Date(),
              }]);
            }}
          >
             <RotateCcw className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-gray-400 hover:text-white hover:bg-white/5 rounded-xl"
            onClick={() => {
              setMessages([{
                id: "1",
                role: "assistant",
                content: "New session started. Ask me anything about your roadmap!",
                timestamp: new Date(),
              }]);
            }}
          >
             <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 glass rounded-3xl mb-6 relative overflow-hidden flex flex-col border-white/5 shadow-2xl">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`h-8 w-8 rounded-xl shrink-0 flex items-center justify-center border ${
                    msg.role === "user" 
                      ? "bg-blue-600 border-blue-400 text-white" 
                      : "bg-zinc-900 border-white/10 text-indigo-400"
                  }`}>
                    {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-white/5 text-gray-200 border border-white/5 rounded-tl-none backdrop-blur-sm"
                  }`}>
                    {msg.content}
                    <p className={`text-[10px] mt-2 opacity-50 ${msg.role === "user" ? "text-right" : ""}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="flex justify-start gap-3"
            >
              <div className="h-8 w-8 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-indigo-400">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none">
                <div className="flex gap-1">
                  <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2 }} className="h-1.5 w-1.5 bg-gray-400 rounded-full" />
                  <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="h-1.5 w-1.5 bg-gray-400 rounded-full" />
                  <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="h-1.5 w-1.5 bg-gray-400 rounded-full" />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-black/40 border-t border-white/5 backdrop-blur-xl">
          <div className="relative flex items-center gap-2 max-w-4xl mx-auto">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-500 hover:text-white hover:bg-white/5 rounded-xl"
              onClick={() => setInput(prev => prev + " ```javascript\n\n```")}
            >
               <Code className="h-5 w-5" />
            </Button>
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder={isTyping ? "Waiting for response..." : "Ask your mentor anything..."}
                disabled={isTyping}
                className="w-full bg-white/5 border border-white/10 text-white rounded-2xl h-12 pl-4 pr-12 focus:ring-1 ring-blue-500/50 outline-none placeholder:text-gray-600 transition-all focus:border-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <motion.button
                whileHover={{ scale: isTyping ? 1 : 1.05 }}
                whileTap={{ scale: isTyping ? 1 : 0.95 }}
                onClick={handleSend}
                disabled={isTyping}
                className="absolute right-2 top-1.5 h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </motion.button>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-500 hover:text-white hover:bg-white/5 rounded-xl"
              onClick={() => {
                setInput("Give me a motivational quote to start my learning session.");
                handleSend();
              }}
            >
               <Sparkles className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-[10px] text-center text-gray-600 mt-3 uppercase tracking-widest font-bold">
            Powered by CODE-D-F AI-Architect
          </p>
        </div>
      </div>
    </div>
  );
}
