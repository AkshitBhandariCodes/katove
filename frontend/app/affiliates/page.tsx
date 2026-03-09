"use client";

import React, { useState, useEffect } from "react";
import { getApiUrl } from "@/utils/api";
import { useRouter } from "next/navigation";
import { TrendingUp, Users, DollarSign, Link as LinkIcon, BarChart3, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";

export default function AffiliatesLandingPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [roleMode, setRoleMode] = useState<'content_creator' | 'sales_manager'>('content_creator');
  const [registering, setRegistering] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (user && token) {
      // Check if already an affiliate - redirect to dashboard
      fetch(getApiUrl("/api/affiliates/dashboard"), {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (res.ok) {
            router.push('/affiliate');
          } else {
            setCheckingStatus(false);
          }
        })
        .catch(() => setCheckingStatus(false));
    } else {
      setCheckingStatus(false);
    }
  }, [user, token, authLoading, router]);

  const handleRegister = async () => {
    if (!user || !token) return;
    setRegistering(true);
    setErrorMsg('');
    try {
      const res = await fetch(getApiUrl("/api/affiliates/register"), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type: roleMode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      router.push('/affiliate');
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setRegistering(false);
    }
  };

  if (checkingStatus || authLoading) {
    return (
      <main className="min-h-screen bg-[#050505] flex justify-center items-center">
        <Navbar />
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] pt-32 pb-20 text-white">
      <Navbar />
      <div className="max-w-[1100px] mx-auto px-6">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="bg-[var(--primary-color)]/10 text-[var(--primary-color)] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Partner Program</span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic mt-6 mb-4 uppercase">
            MONETIZE YOUR <span className="text-[var(--primary-color)]">INFLUENCE</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Earn commission on every sale through your unique referral links. Track clicks, conversions, and revenue in real-time from your personal dashboard.
          </p>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {[
            { icon: LinkIcon, step: "01", title: "Share Links", desc: "Get unique links for the homepage and every product. Share via socials, email, or your website." },
            { icon: BarChart3, step: "02", title: "Track Everything", desc: "Real-time analytics: clicks per product, conversions, revenue, and commission earned." },
            { icon: DollarSign, step: "03", title: "Earn Commission", desc: "Earn a percentage on every sale you refer. Commissions are tracked and attributed automatically." },
          ].map((item, idx) => (
            <div key={idx} className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-[var(--primary-color)]/20 transition-all">
              <span className="text-[80px] font-black text-white/[0.02] absolute -top-4 -right-2 group-hover:text-[var(--primary-color)]/[0.05] transition-colors">{item.step}</span>
              <item.icon className="w-10 h-10 text-[var(--primary-color)] mb-5" />
              <h3 className="text-lg font-bold mb-2 uppercase">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {[
            { label: "Commission Rate", val: "Up to 10%" },
            { label: "Cookie Duration", val: "30 Days" },
            { label: "Payout Cycle", val: "Monthly" },
            { label: "Link Types", val: "Product + General" },
          ].map((s, i) => (
            <div key={i} className="bg-[#111] border border-white/5 p-6 rounded-2xl text-center">
              <div className="text-2xl font-mono font-black text-[var(--primary-color)]">{s.val}</div>
              <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-2">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Registration */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 md:p-12">
            {!user ? (
              <div className="text-center">
                <Users className="w-16 h-16 text-[var(--primary-color)]/30 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">Sign In to Apply</h3>
                <p className="text-gray-400 mb-6">You need an account to join the partner program. Sign in or create an account first.</p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-center mb-2 uppercase tracking-tight">Join the Program</h3>
                <p className="text-sm text-gray-500 text-center mb-8">Choose your role and start earning</p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <label className={`cursor-pointer border-2 rounded-2xl p-6 flex-1 transition-all ${roleMode === 'content_creator' ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/5' : 'border-white/10 bg-[#111] hover:border-white/30'}`}>
                    <input type="radio" name="role" value="content_creator" checked={roleMode === 'content_creator'} onChange={() => setRoleMode('content_creator')} className="hidden" />
                    <div className="font-bold text-white text-lg mb-1">Content Creator</div>
                    <p className="text-xs text-gray-500 font-mono">Influencers, bloggers, YouTubers</p>
                  </label>
                  <label className={`cursor-pointer border-2 rounded-2xl p-6 flex-1 transition-all ${roleMode === 'sales_manager' ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/5' : 'border-white/10 bg-[#111] hover:border-white/30'}`}>
                    <input type="radio" name="role" value="sales_manager" checked={roleMode === 'sales_manager'} onChange={() => setRoleMode('sales_manager')} className="hidden" />
                    <div className="font-bold text-white text-lg mb-1">Sales Manager</div>
                    <p className="text-xs text-gray-500 font-mono">B2B referrers, resellers</p>
                  </label>
                </div>

                {errorMsg && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-6">{errorMsg}</div>}

                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="w-full py-4 bg-[var(--primary-color)] text-black font-black uppercase text-sm tracking-widest rounded-xl hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {registering ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5" /> Apply Now</>}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Two types comparison */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-purple-500/5 border border-purple-500/10 rounded-3xl p-8">
            <div className="text-purple-400 text-[10px] font-black uppercase tracking-widest mb-4">Content Creator</div>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" /> Personal dashboard with real-time analytics</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" /> Unique links for each product</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" /> General referral link for homepage</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" /> Per-product click and sales tracking</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" /> Commission on all referred sales</li>
            </ul>
          </div>
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-3xl p-8">
            <div className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">Sales Manager</div>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" /> Full partner dashboard & reporting</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" /> Custom product referral links</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" /> Bulk referral tracking</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" /> Revenue and commission analytics</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" /> Dedicated commission rate</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
