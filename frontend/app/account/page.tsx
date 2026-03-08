"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User, Package, CreditCard, Crosshair, ChevronRight, Share2, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

export default function AccountPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  if (!user) {
      return (
          <main className="min-h-screen bg-[#050505] flex justify-center items-center text-[#ccff00] font-mono text-sm uppercase">
              Authentication Required...
          </main>
      );
  }

  return (
    <main className="min-h-screen bg-[#050505] pt-32 pb-20 text-white">
       <Navbar /> 
       
       <div className="max-w-[1200px] mx-auto px-6">
            <div className="flex flex-col md:flex-row gap-12">
                
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 space-y-2 flex-shrink-0">
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-6 mb-6 flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-full bg-[#ccff00]/10 flex items-center justify-center text-[#ccff00] mb-4">
                            <User className="w-10 h-10" />
                        </div>
                        <h2 className="font-bold text-lg">{user.name}</h2>
                        <p className="text-xs text-gray-500 font-mono mt-1">{user.email}</p>
                    </div>

                    <nav className="flex flex-col gap-2">
                        {[
                            { id: 'profile', icon: User, label: 'Profile' },
                            { id: 'orders', icon: Package, label: 'Deployments' },
                            { id: 'financing', icon: CreditCard, label: 'Active Financing' },
                            { id: 'affiliate', icon: Share2, label: 'Creator Hub' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-left border transition-all ${activeTab === tab.id ? 'bg-[#ccff00]/10 border-[#ccff00]/30 text-[#ccff00]' : 'bg-[#0a0a0a] border-white/5 text-gray-400 hover:border-white/20 hover:text-white'}`}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span className="font-bold text-sm tracking-widest uppercase">{tab.label}</span>
                            </button>
                        ))}

                        <button 
                            onClick={logout}
                            className="flex items-center gap-3 px-5 py-4 rounded-2xl text-left border border-white/5 bg-[#0a0a0a] text-red-500 mt-8 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-bold text-sm tracking-widest uppercase">Sever Connection</span>
                        </button>
                    </nav>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-8 md:p-12 overflow-hidden relative">
                    {/* Decorative Background Element */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'profile' && (
                            <div className="space-y-8 relative z-10">
                                <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-8">Personal <span className="text-[#ccff00]">Clearance</span></h1>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
                                        <input type="text" defaultValue={user.name} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] transition-colors" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email Address</label>
                                        <input type="email" defaultValue={user.email} disabled className="w-full bg-[#111] border border-white/5 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed" />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button className="bg-[#ccff00] text-black font-black uppercase tracking-widest px-8 py-3 rounded-xl hover:bg-[#b3e600] transition-colors">
                                        Submit Updates
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="space-y-8 relative z-10">
                                <div className="flex justify-between items-end mb-8">
                                    <h1 className="text-3xl font-black italic uppercase tracking-tighter">Asset <span className="text-[#ccff00]">Deployments</span></h1>
                                    <Link href="/orders" className="text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1">
                                        View Full Audit <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                                
                                <div className="bg-[#111] border border-white/5 p-8 rounded-2xl text-center">
                                    <Package className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400">No active deployments found for this operative.</p>
                                    <Link href="/collections" className="inline-block mt-4 text-[#ccff00] text-sm font-bold uppercase tracking-widest border border-[#ccff00]/20 px-6 py-2 rounded-full hover:bg-[#ccff00]/10 transition-colors">Initiate New Procurement</Link>
                                </div>
                            </div>
                        )}

                        {activeTab === 'financing' && (
                            <div className="space-y-8 relative z-10">
                                <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-8">Active <span className="text-[#ccff00]">Financing</span></h1>
                                <div className="bg-[#111] border border-white/5 p-8 rounded-2xl text-center">
                                    <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400">No financing plans currently linked to this profile.</p>
                                    <Link href="/installments" className="inline-block mt-4 text-[#ccff00] text-sm font-bold uppercase tracking-widest border border-[#ccff00]/20 px-6 py-2 rounded-full hover:bg-[#ccff00]/10 transition-colors">Explore Options</Link>
                                </div>
                            </div>
                        )}

                        {activeTab === 'affiliate' && (
                            <div className="space-y-8 relative z-10 text-center py-10">
                                <Crosshair className="w-16 h-16 text-[#ccff00] mx-auto mb-6" />
                                <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Command <span className="text-[#ccff00]">Center</span> Access</h1>
                                <p className="text-gray-400 max-w-sm mx-auto mb-8">Manage your network broadcasts, track successful conversions, and request commission payouts.</p>
                                <Link href="/affiliates" className="inline-block bg-[#ccff00] text-black font-black uppercase tracking-widest border border-[#ccff00]/20 px-10 py-4 rounded-xl hover:bg-[#b3e600] transition-all hover:scale-105">
                                    Access Creator Dashboard
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </div>

            </div>
       </div>
    </main>
  );
}
