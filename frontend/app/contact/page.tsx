"use client";

import React, { useState } from "react";
import { MessageSquare, Mail, MapPin, Send } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <main className="min-h-screen bg-[#050505] pt-32 pb-20 text-white">
       <Navbar /> 
       
       <div className="max-w-[1200px] mx-auto px-6">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
               <div>
                   <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic mb-6 uppercase">
                       SECURE <span className="text-[#ccff00]">CHANNEL</span>
                   </h1>
                   <p className="text-gray-400 text-lg mb-12">
                       Establish a direct link with Command. Our support operatives are standing by to assist with deployment coordination and asset technical support.
                   </p>

                   <div className="space-y-8">
                       <div className="flex gap-6 items-start">
                           <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0 text-[#ccff00]">
                               <Mail className="w-6 h-6" />
                           </div>
                           <div>
                               <h3 className="font-bold text-lg mb-1 uppercase tracking-tighter">Comms Array</h3>
                               <p className="text-gray-400">support@katove.example.com</p>
                               <span className="text-[10px] uppercase font-bold text-gray-500 mt-2 block tracking-widest">Active 24/7/365</span>
                           </div>
                       </div>
                       
                       <div className="flex gap-6 items-start">
                           <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center flex-shrink-0 text-[#ccff00]">
                               <MapPin className="w-6 h-6" />
                           </div>
                           <div>
                               <h3 className="font-bold text-lg mb-1 uppercase tracking-tighter">Physical Base</h3>
                               <p className="text-gray-400">101 Engineering Sector<br/>New Mumbai, 400001</p>
                           </div>
                       </div>
                   </div>
               </div>

               <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-10">
                   {!sent ? (
                       <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                           <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                               <MessageSquare className="w-6 h-6 text-[#ccff00]" /> Initialize Comms
                           </h2>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="space-y-2">
                                   <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Operative Name</label>
                                   <input required type="text" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] transition-colors" />
                               </div>
                               <div className="space-y-2">
                                   <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Secure Email</label>
                                   <input required type="email" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] transition-colors" />
                               </div>
                           </div>

                           <div className="space-y-2">
                               <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Encryption Key / Order ID (Optional)</label>
                               <input type="text" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-[#ccff00] transition-colors" />
                           </div>

                           <div className="space-y-2">
                               <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Transmission Payload</label>
                               <textarea required rows={5} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] transition-colors resize-none"></textarea>
                           </div>

                           <button className="w-full bg-[#ccff00] text-black font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-[#b3e600] transition-all hover:gap-5">
                               TRANSMIT <Send className="w-5 h-5" />
                           </button>
                       </form>
                   ) : (
                       <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center text-center py-20">
                           <div className="w-20 h-20 bg-[#ccff00]/10 rounded-full flex items-center justify-center mb-6">
                               <Send className="w-10 h-10 text-[#ccff00]" />
                           </div>
                           <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-4">Signal Sent</h2>
                           <p className="text-gray-400">Your transmission has been securely routed. Command will respond within standard operational limits (24 hours).</p>
                           <button onClick={() => setSent(false)} className="mt-8 text-sm font-bold uppercase tracking-widest text-[#ccff00] hover:text-white transition-colors">Start New Secure Comms</button>
                       </motion.div>
                   )}
               </div>
           </div>
       </div>
    </main>
  );
}
