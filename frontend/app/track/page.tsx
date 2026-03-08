"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, PackageOpen, Truck, CheckCircle, Crosshair } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";

export default function TrackPage() {
  const [orderId, setOrderId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Dummy pipeline for UI demo
  const dummyHistory = [
      { status: 'order_received', date: '2026-03-05 10:22 AM', desc: 'Signal acquired. Order confirmed.' },
      { status: 'payment_confirmed', date: '2026-03-05 14:15 PM', desc: 'Funds verified globally.' },
      { status: 'preparing_package', date: '2026-03-06 09:00 AM', desc: 'Secure packaging protocol initiated.' },
      { status: 'courier_picked_up', date: '2026-03-06 17:30 PM', desc: 'Asset acquired by logistics operative.' },
      { status: 'out_for_delivery', date: 'Pending', desc: 'Asset in terminal transit to your location.' },
  ];

  const handleSearch = (e: React.FormEvent) => {
      e.preventDefault();
      if (!orderId) return;
      setIsSearching(true);
      setTimeout(() => {
          setIsSearching(false);
          setHasSearched(true);
      }, 1500);
  };

  return (
    <main className="min-h-screen bg-[#050505] pt-32 pb-20 text-white">
       <Navbar /> 
       
       <div className="max-w-[800px] mx-auto px-6">
            <div className="text-center mb-16">
                <Crosshair className="w-16 h-16 text-[#ccff00] mx-auto mb-6 opacity-50" />
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic mb-4 uppercase">
                    ASSET <span className="text-white">TRACKING</span>
                </h1>
                <p className="text-gray-400 text-lg">
                    Enter your secure shipment ID to monitor deployment status in real-time.
                </p>
            </div>

            <form onSubmit={handleSearch} className="mb-16">
                <div className="relative group max-w-xl mx-auto">
                    <input 
                        type="text" 
                        placeholder="ENTER ORDER OR TRACKING ID" 
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl pl-6 pr-20 py-6 text-white text-lg font-mono focus:outline-none focus:border-[#ccff00] transition-all uppercase placeholder:text-gray-600"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                    />
                    <button 
                        type="submit"
                        disabled={isSearching}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#ccff00] rounded-xl flex items-center justify-center text-black hover:bg-[#b3e600] transition-colors disabled:opacity-50"
                    >
                        {isSearching ? (
                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Search className="w-5 h-5 font-bold" />
                        )}
                    </button>
                </div>
            </form>

            <AnimatePresence>
                {hasSearched && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 md:p-12 shadow-2xl"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-8 mb-8 gap-4">
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter">Status Report</h2>
                                <p className="text-gray-500 font-mono mt-1 text-sm">ORD-{orderId.toUpperCase()}</p>
                            </div>
                            <div className="bg-[#ccff00]/10 border border-[#ccff00]/20 px-4 py-2 rounded-lg text-[#ccff00] font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
                                IN TRANSIT
                            </div>
                        </div>

                        <div className="relative pl-8 space-y-10 before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-white/10 before:to-transparent">
                            {dummyHistory.map((item, index) => {
                                const isCompleted = index < 4;
                                const isCurrent = index === 3;
                                
                                return (
                                    <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group md:mx-auto">
                                        <div className={`flex items-center justify-center w-6 h-6 rounded-full border-4 shrink-0 shadow z-10 
                                            ${isCompleted ? 'bg-[#ccff00] border-[#0a0a0a]' : 'bg-[#111] border-white/20'}`}
                                        >
                                            {isCompleted && <CheckCircle className="w-4 h-4 text-black absolute" />}
                                        </div>
                                        
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2rem)] p-5 rounded-2xl bg-[#111] border border-white/5 group-hover:border-white/10 transition-colors">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className={`font-black tracking-tighter uppercase text-sm ${isCompleted ? 'text-white' : 'text-gray-500'}`}>
                                                    {item.status.replace(/_/g, ' ')}
                                                </div>
                                            </div>
                                            <div className={`text-xs font-mono mb-2 ${isCompleted ? 'text-[#ccff00]' : 'text-gray-600'}`}>
                                                {item.date}
                                            </div>
                                            <div className="text-gray-400 text-sm">
                                                {item.desc}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
       </div>
    </main>
  );
}
