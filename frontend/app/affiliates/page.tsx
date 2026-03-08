"use client";

import React, { useState, useEffect } from "react";
import { getApiUrl } from "@/utils/api";
import Link from "next/link";
import { Copy, TrendingUp, Users, DollarSign, ArrowRight, Share2, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

interface AffiliateData {
    id: string;
    type: string;
    referral_code: string;
    commission_rate: number;
    status: string;
    total_clicks: number;
    total_sales: number;
    total_revenue: number;
    total_commission: number;
}

export default function AffiliatesPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading before making any decisions
    if (authLoading) return;

    if (user && token) {
        fetch(getApiUrl("/api/affiliates/dashboard"), {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
            if (res.ok) return res.json();
            throw new Error("Not an affiliate");
        })
        .then(d => { setData(d); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
        setLoading(false);
    }
  }, [user, token, authLoading]);

  const handleRegister = async () => {
      setRegistering(true);
      try {
          const res = await fetch(getApiUrl("/api/affiliates/register"), {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
              },
              body: JSON.stringify({ type: 'content_creator' })
          });
          if (!res.ok) throw new Error('Registration failed');
          // Re-fetch dashboard to get the full data with links
          const dashRes = await fetch(getApiUrl("/api/affiliates/dashboard"), {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (dashRes.ok) {
              const d = await dashRes.json();
              setData(d);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setRegistering(false);
      }
  };

  const copyLink = () => {
      if (data?.referral_code) {
          navigator.clipboard.writeText(`${window.location.origin}/?ref=${data.referral_code}`);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      }
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex justify-center items-center text-[#ccff00] font-mono text-sm uppercase">Loading Hub Data...</div>;

  return (
    <main className="min-h-screen bg-[#050505] pt-32 pb-20 text-white">
       <Navbar /> 
       
       <div className="max-w-[1200px] mx-auto px-6">
            {!data ? (
                /* Registration / Landing */
                <div className="text-center max-w-3xl mx-auto mt-10">
                    <span className="bg-[#ccff00]/10 text-[#ccff00] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Creator Program</span>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic mt-6 mb-4 uppercase">
                        MONETIZE YOUR <span className="text-[#ccff00]">INFLUENCE</span>
                    </h1>
                    <p className="text-gray-400 text-lg mb-12">
                        Receive up to 10% commission on every secure deployment initiated through your unique network link. Monitor telemetry via your personal command center.
                    </p>
                    
                    {!user ? (
                        <div className="bg-[#111] border border-white/5 p-8 rounded-3xl max-w-sm mx-auto">
                            <h3 className="text-xl font-bold mb-4">Authentication Required</h3>
                            <p className="text-sm text-gray-400 mb-6">You must establish a secure connection (log in) before applying for the Creator tier.</p>
                            <button className="w-full bg-white text-black font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-gray-200 transition-colors">
                                Access Mainframe
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={handleRegister}
                            disabled={registering}
                            className="bg-[#ccff00] text-black text-lg font-black uppercase tracking-widest px-12 py-5 rounded-2xl hover:bg-[#b3e600] transition-transform hover:scale-105"
                        >
                            {registering ? 'Processing...' : 'Apply for Creator Tier'}
                        </button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left">
                        {[
                            { i: Users, t: "Build Network", d: "Share custom links via your existing channels." },
                            { i: TrendingUp, t: "Track Metrics", d: "Real-time analytics on clicks and conversions." },
                            { i: DollarSign, t: "Earn Revenue", d: "10% baseline commission on valid sales." }
                        ].map((m, idx) => (
                            <div key={idx} className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/5">
                                <m.i className="w-10 h-10 text-[#ccff00] mb-4" />
                                <h3 className="text-lg font-bold mb-2 uppercase">{m.t}</h3>
                                <p className="text-sm text-gray-500">{m.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                /* Creator Dashboard */
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic uppercase">
                                COMMAND <span className="text-[#ccff00]">CENTER</span>
                            </h1>
                            <p className="text-gray-400 font-mono text-sm mt-2">Active Operative: {user?.name}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-lg">Status: <span className="text-[#ccff00]">{data.status || 'pending'}</span></span>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-lg">Rate: <span className="text-white">{data.commission_rate ?? 10}%</span></span>
                        </div>
                    </div>

                    <div className="bg-[#ccff00]/10 border border-[#ccff00]/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex-1">
                            <span className="text-xs font-black text-[#ccff00] uppercase tracking-widest block mb-2">Your Unique Deployment Broadcast Link</span>
                            <div className="text-lg md:text-xl font-mono text-white break-all">
                                {typeof window !== 'undefined' ? window.location.origin : ''}/?ref={data.referral_code || 'loading...'}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={copyLink}
                                className={`flex items-center gap-2 px-6 py-4 rounded-xl font-bold transition-all ${copied ? 'bg-[#ccff00] text-black' : 'bg-[#111] text-white hover:bg-white/10'}`}
                            >
                                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                {copied ? 'COPIED' : 'COPY'}
                            </button>
                            <button className="flex items-center gap-2 px-6 py-4 rounded-xl bg-[#ccff00] text-black font-bold hover:bg-[#b3e600] transition-colors uppercase text-sm tracking-widest">
                                <Share2 className="w-5 h-5" /> Broadcast
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Total Signals (Clicks)" value={data.total_clicks ?? 0} icon={TrendingUp} />
                        <StatCard title="Confirmed Deployments" value={data.total_sales ?? 0} icon={Users} />
                        <StatCard title="Network Revenue" value={`$${parseFloat(String(data.total_revenue ?? 0)).toFixed(2)}`} icon={ArrowRight} isMoney />
                        <StatCard title="Pending Commission" value={`$${parseFloat(String(data.total_commission ?? 0)).toFixed(2)}`} icon={DollarSign} isMoney highlight />
                    </div>
                </div>
            )}
       </div>
    </main>
  );
}

function StatCard({ title, value, icon: Icon, isMoney, highlight }: any) {
    return (
        <div className={`p-8 rounded-[2rem] border ${highlight ? 'bg-[#ccff00]/5 border-[#ccff00]/20' : 'bg-[#0a0a0a] border-white/5'}`}>
            <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</span>
                <Icon className={`w-5 h-5 ${highlight ? 'text-[#ccff00]' : 'text-gray-500'}`} />
            </div>
            <div className={`text-4xl font-mono font-black ${highlight ? 'text-[#ccff00]' : 'text-white'}`}>
                {value}
            </div>
        </div>
    );
}
