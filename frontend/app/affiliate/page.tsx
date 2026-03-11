"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getApiUrl } from "@/utils/api";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import {
  Loader2, Copy, CheckCircle, TrendingUp, DollarSign, Users,
  Link as LinkIcon, ExternalLink, BarChart3, ArrowUpRight, MousePointerClick
} from "lucide-react";

interface AffiliateLink {
  id: string;
  product_id: string | null;
  url_code: string;
  clicks: number;
  conversions: number;
  revenue: number;
  commission: number;
  sales: number;
  product?: { id: string; name: string; slug: string; selling_price: number } | null;
}

interface Conversion {
  id: string;
  order_id: string;
  referral_link_id: string | null;
  order_total: number;
  commission_amount: number;
  created_at: string;
}

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
  created_at: string;
  links: AffiliateLink[];
  conversions: Conversion[];
}

export default function AffiliateDashboard() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [generatingLink, setGeneratingLink] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [roleMode, setRoleMode] = useState<'content_creator' | 'sales_manager'>('content_creator');

  const [copiedLink, setCopiedLink] = useState('');
  const [activeTab, setActiveTab] = useState<'links' | 'earnings'>('links');

  useEffect(() => {
    if (authLoading) return;
    if (user && token) {
      fetchDashboard();
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [user, token, authLoading]);

  const fetchDashboard = async () => {
    try {
      const res = await fetch(getApiUrl("/api/affiliates/dashboard"), {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAffiliate(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(getApiUrl("/api/products"));
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateLink = async () => {
    if (!selectedProduct) return;
    setGeneratingLink(true);
    try {
      const res = await fetch(getApiUrl("/api/affiliates/links"), {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ product_id: selectedProduct })
      });
      if (res.ok) {
        await fetchDashboard();
        setSelectedProduct('');
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingLink(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(text);
    setTimeout(() => setCopiedLink(''), 2000);
  };

  const handleInlineRegister = async () => {
    if (!user || !token) return;
    setRegistering(true);
    try {
      const res = await fetch(getApiUrl("/api/affiliates/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ type: roleMode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      // Re-fetch dashboard to populate affiliate state
      await fetchDashboard();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRegistering(false);
    }
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const apiBase = getApiUrl('');

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#050505] pt-32 pb-20 flex justify-center items-center">
        <Navbar />
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 md:px-12 flex items-center justify-center">
        <Navbar />
        <div className="bg-[#111] p-10 rounded-3xl border border-white/10 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-4">Partner Dashboard</h2>
          <p className="text-gray-400 mb-6">You must be signed in to access the affiliate dashboard.</p>
        </div>
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 md:px-12 flex items-center justify-center">
        <Navbar />
        <div className="bg-[#111] p-10 rounded-3xl border border-white/10 text-center max-w-lg w-full">
          <Users className="w-12 h-12 text-[var(--primary-color)] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Join the Partner Program</h2>
          <p className="text-gray-400 mb-8 text-sm">Choose your role and start earning commission on every sale you refer.</p>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <label className={`cursor-pointer border-2 rounded-2xl p-5 flex-1 transition-all text-left ${roleMode === 'content_creator' ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/5' : 'border-white/10 bg-[#0a0a0a] hover:border-white/30'}`}>
              <input type="radio" name="role" value="content_creator" checked={roleMode === 'content_creator'} onChange={() => setRoleMode('content_creator')} className="hidden" />
              <div className="font-bold text-white mb-1">Content Creator</div>
              <p className="text-[11px] text-gray-500 font-mono">Influencers, bloggers, YouTubers</p>
            </label>
            <label className={`cursor-pointer border-2 rounded-2xl p-5 flex-1 transition-all text-left ${roleMode === 'sales_manager' ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/5' : 'border-white/10 bg-[#0a0a0a] hover:border-white/30'}`}>
              <input type="radio" name="role" value="sales_manager" checked={roleMode === 'sales_manager'} onChange={() => setRoleMode('sales_manager')} className="hidden" />
              <div className="font-bold text-white mb-1">Sales Manager</div>
              <p className="text-[11px] text-gray-500 font-mono">B2B referrers, resellers</p>
            </label>
          </div>

          <button
            onClick={handleInlineRegister}
            disabled={registering}
            className="w-full py-3.5 bg-[var(--primary-color)] text-black font-black uppercase text-sm tracking-widest rounded-xl hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {registering ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5" /> Apply Now</>}
          </button>
        </div>
      </div>
    );
  }

  const links = affiliate.links || [];
  const conversions = affiliate.conversions || [];
  const generalLink = links.find(l => !l.product_id);
  const productLinks = links.filter(l => l.product_id);

  // Compute conversion rate
  const conversionRate = affiliate.total_clicks > 0
    ? ((affiliate.total_sales / affiliate.total_clicks) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 md:px-12">
      <Navbar />
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter">
              Partner <span className="text-[var(--primary-color)]">Dashboard</span>
            </h1>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${affiliate.status === 'approved' ? 'bg-green-500/20 text-green-400' : affiliate.status === 'pending' ? 'bg-orange-500/20 text-orange-400' : 'bg-red-500/20 text-red-400'}`}>
                {affiliate.status}
              </span>
              <span className="text-sm text-gray-500 font-mono uppercase">{affiliate.type?.replace('_', ' ')}</span>
              <span className="text-sm text-gray-600">|</span>
              <span className="text-sm text-gray-500 font-mono">{user.name}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Commission Rate</div>
            <div className="text-3xl font-mono text-[var(--primary-color)] font-black">{affiliate.commission_rate}%</div>
          </div>
        </header>

        {affiliate.status !== 'approved' && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-5 text-orange-200 text-sm">
            <strong>Your account is {affiliate.status}.</strong> Link generation is restricted until approved by an admin.
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={MousePointerClick} label="Total Clicks" value={affiliate.total_clicks} />
          <StatCard icon={CheckCircle} label="Total Sales" value={affiliate.total_sales} />
          <StatCard icon={BarChart3} label="Conv. Rate" value={`${conversionRate}%`} />
          <StatCard icon={DollarSign} label="Revenue" value={`$${parseFloat(String(affiliate.total_revenue || 0)).toFixed(2)}`} accent />
          <StatCard icon={DollarSign} label="Commission" value={`$${parseFloat(String(affiliate.total_commission || 0)).toFixed(2)}`} accent highlight />
        </div>

        {/* General Link */}
        {generalLink && (
          <div className="bg-[var(--primary-color)]/5 border border-[var(--primary-color)]/20 rounded-3xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-black text-[var(--primary-color)] uppercase tracking-widest mb-2">General Referral Link (Homepage)</div>
                <div className="text-base md:text-lg font-mono text-white break-all">{apiBase}/api/r/{generalLink.url_code}</div>
                <div className="flex gap-5 mt-3 text-xs text-gray-500">
                  <span><strong className="text-white">{generalLink.clicks}</strong> clicks</span>
                  <span><strong className="text-white">{generalLink.sales}</strong> sales</span>
                  <span><strong className="text-[var(--primary-color)]">${parseFloat(String(generalLink.revenue || 0)).toFixed(2)}</strong> revenue</span>
                  <span><strong className="text-[var(--primary-color)]">${parseFloat(String(generalLink.commission || 0)).toFixed(2)}</strong> commission</span>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(`${apiBase}/api/r/${generalLink.url_code}`)}
                className={`px-5 py-3 rounded-xl font-bold text-sm transition-all shrink-0 flex items-center gap-2 ${copiedLink === `${apiBase}/api/r/${generalLink.url_code}` ? 'bg-[var(--primary-color)] text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
              >
                {copiedLink === `${apiBase}/api/r/${generalLink.url_code}` ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedLink === `${apiBase}/api/r/${generalLink.url_code}` ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-[#111] p-1 rounded-xl w-fit">
          <button onClick={() => setActiveTab('links')} className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'links' ? 'bg-[var(--primary-color)] text-black' : 'text-gray-500 hover:text-white'}`}>
            Product Links ({productLinks.length})
          </button>
          <button onClick={() => setActiveTab('earnings')} className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'earnings' ? 'bg-[var(--primary-color)] text-black' : 'text-gray-500 hover:text-white'}`}>
            Earnings ({conversions.length})
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === 'links' && (
              <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-8">
                <h3 className="text-lg font-bold text-white uppercase tracking-tighter mb-6">Product Referral Links</h3>
                {productLinks.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    <LinkIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No product links created yet. Generate one using the panel on the right.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {productLinks.map((link) => {
                      const fullUrl = `${apiBase}/api/r/${link.url_code}`;
                      return (
                        <div key={link.id} className="bg-[#151515] border border-white/5 p-5 rounded-2xl hover:border-white/10 transition-colors">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-white mb-1 flex items-center gap-2">
                                {link.product?.name || 'Unknown Product'}
                                {link.product?.selling_price && (
                                  <span className="text-xs text-gray-500 font-mono">${link.product.selling_price}</span>
                                )}
                              </div>
                              <div className="text-xs font-mono text-gray-500 break-all">{fullUrl}</div>
                              <div className="flex gap-4 mt-3 flex-wrap">
                                <MiniStat label="Clicks" value={link.clicks} />
                                <MiniStat label="Sales" value={link.sales} />
                                <MiniStat label="Revenue" value={`$${parseFloat(String(link.revenue || 0)).toFixed(2)}`} accent />
                                <MiniStat label="Commission" value={`$${parseFloat(String(link.commission || 0)).toFixed(2)}`} accent />
                              </div>
                            </div>
                            <button
                              onClick={() => copyToClipboard(fullUrl)}
                              className={`p-3 rounded-xl transition-colors shrink-0 ${copiedLink === fullUrl ? 'bg-[var(--primary-color)] text-black' : 'bg-white/5 text-white hover:bg-[var(--primary-color)] hover:text-black'}`}
                            >
                              {copiedLink === fullUrl ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'earnings' && (
              <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-8">
                <h3 className="text-lg font-bold text-white uppercase tracking-tighter mb-6">Earnings History</h3>
                {conversions.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No earnings recorded yet. Share your links to start earning!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] uppercase font-bold tracking-widest text-gray-500">
                          <th className="pb-4 pr-4">Date</th>
                          <th className="pb-4 pr-4">Order ID</th>
                          <th className="pb-4 pr-4">Order Total</th>
                          <th className="pb-4 text-[var(--primary-color)]">Commission</th>
                        </tr>
                      </thead>
                      <tbody className="font-mono text-sm">
                        {conversions.slice().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((conv) => (
                          <tr key={conv.id} className="border-b border-white/5 last:border-0 text-gray-300">
                            <td className="py-4 pr-4">{new Date(conv.created_at).toLocaleDateString()}</td>
                            <td className="py-4 pr-4 text-xs text-gray-500">{conv.order_id.slice(0, 8)}...</td>
                            <td className="py-4 pr-4">${parseFloat(String(conv.order_total)).toFixed(2)}</td>
                            <td className="py-4 font-bold text-[var(--primary-color)]">+${parseFloat(String(conv.commission_amount)).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Generate Product Link */}
            {affiliate.status === 'approved' && (
              <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/5 rounded-3xl p-6">
                <h3 className="text-base font-bold text-white uppercase tracking-tighter mb-2">Generate Product Link</h3>
                <p className="text-[11px] text-gray-500 mb-5 font-mono">Create a unique tracking link for a specific product.</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest ml-1 block mb-2">Select Product</label>
                    <select
                      value={selectedProduct}
                      onChange={e => setSelectedProduct(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[var(--primary-color)] appearance-none"
                    >
                      <option value="">-- Choose Product --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleGenerateLink}
                    disabled={generatingLink || !selectedProduct}
                    className="w-full py-3 bg-white text-black font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-[var(--primary-color)] transition-colors disabled:opacity-50"
                  >
                    {generatingLink ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Generate Link'}
                  </button>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-[#111] border border-white/5 rounded-3xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-tighter mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Product Links</span>
                  <span className="text-sm font-mono text-white font-bold">{productLinks.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Total Links</span>
                  <span className="text-sm font-mono text-white font-bold">{links.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Conversion Rate</span>
                  <span className="text-sm font-mono text-[var(--primary-color)] font-bold">{conversionRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Avg Order Value</span>
                  <span className="text-sm font-mono text-white font-bold">
                    ${conversions.length > 0
                      ? (conversions.reduce((acc, c) => acc + parseFloat(String(c.order_total)), 0) / conversions.length).toFixed(2)
                      : '0.00'}
                  </span>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-[#111] border border-white/5 rounded-3xl p-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-tighter mb-4">How It Works</h3>
              <ul className="text-xs text-gray-400 space-y-3 font-mono">
                <li className="flex gap-2">
                  <span className="text-[var(--primary-color)]">01.</span> Share your unique links via socials, email, or website.
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--primary-color)]">02.</span> Clicks are tracked. Referral is stored for 30 days via cookies.
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--primary-color)]">03.</span> When a purchase is completed, you earn {affiliate.commission_rate}% commission.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent, highlight }: { icon: any; label: string; value: string | number; accent?: boolean; highlight?: boolean }) {
  return (
    <div className={`p-5 rounded-2xl border relative overflow-hidden group ${highlight ? 'bg-[var(--primary-color)]/5 border-[var(--primary-color)]/20' : 'bg-[#111] border-white/5'}`}>
      <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className="w-16 h-16" />
      </div>
      <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2 relative">{label}</div>
      <div className={`text-2xl md:text-3xl font-mono font-black relative ${highlight ? 'text-[var(--primary-color)]' : accent ? 'text-[var(--primary-color)]' : 'text-white'}`}>
        {value}
      </div>
    </div>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <span className="text-xs text-gray-500">
      <strong className={accent ? 'text-[var(--primary-color)]' : 'text-white'}>{value}</strong> {label.toLowerCase()}
    </span>
  );
}
