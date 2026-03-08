"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getApiUrl } from "@/utils/api";
import { Loader2, Copy, CheckCircle, TrendingUp, DollarSign, Users } from "lucide-react";

export default function AffiliateDashboard() {
  const { user, token, isLoading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [affiliate, setAffiliate] = useState<any>(null);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  
  const [roleMode, setRoleMode] = useState('content_creator');
  const [registering, setRegistering] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [generatingLink, setGeneratingLink] = useState(false);

  const [copiedLink, setCopiedLink] = useState('');

  useEffect(() => {
    // Wait for auth to finish loading before making any decisions
    if (authLoading) return;
    
    if (user && token) {
      fetchDashboard();
      fetchProducts();
    } else {
      // Auth finished loading and there's no user
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
        // data has data.links, data.conversions etc based on the backend
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

  const handleRegister = async () => {
    setRegistering(true);
    setErrorMsg('');
    try {
      const res = await fetch(getApiUrl("/api/affiliates/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ type: roleMode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      await fetchDashboard();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setRegistering(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] pt-32 pb-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 md:px-12 flex items-center justify-center">
        <div className="bg-[#111] p-10 rounded-3xl border border-white/10 text-center max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-4">Partner Hub</h2>
          <p className="text-gray-400 mb-6">You must be signed in to access the affiliate dashboard.</p>
          <a href="/login" className="px-8 py-3 bg-[var(--primary-color)] text-black font-bold uppercase rounded-xl hover:bg-white transition-colors block">Sign In</a>
        </div>
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 md:px-12">
        <div className="max-w-3xl mx-auto bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 md:p-12 text-center">
          <div className="w-20 h-20 bg-[var(--primary-color)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-[var(--primary-color)]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter mb-4">
            Become a <span className="text-[var(--primary-color)]">Partner</span>
          </h1>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            Join the Katove affiliate network. Earn commissions on every sale you refer to our store.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <label className={`cursor-pointer border-2 rounded-2xl p-6 flex-1 transition-all ${roleMode === 'content_creator' ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/5' : 'border-white/10 bg-[#111] hover:border-white/30'}`}>
              <input type="radio" name="role" value="content_creator" checked={roleMode === 'content_creator'} onChange={() => setRoleMode('content_creator')} className="hidden" />
              <div className="font-bold text-white text-xl mb-2">Content Creator</div>
              <p className="text-sm text-gray-500 font-mono">For influencers and bloggers</p>
            </label>
            <label className={`cursor-pointer border-2 rounded-2xl p-6 flex-1 transition-all ${roleMode === 'sales_manager' ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/5' : 'border-white/10 bg-[#111] hover:border-white/30'}`}>
              <input type="radio" name="role" value="sales_manager" checked={roleMode === 'sales_manager'} onChange={() => setRoleMode('sales_manager')} className="hidden" />
              <div className="font-bold text-white text-xl mb-2">Sales Manager</div>
              <p className="text-sm text-gray-500 font-mono">For B2B and bulk referrers</p>
            </label>
          </div>

          {errorMsg && <div className="text-red-500 mb-6 bg-red-500/10 p-4 rounded-xl">{errorMsg}</div>}

          <button 
            onClick={handleRegister} 
            disabled={registering}
            className="px-10 py-4 bg-[var(--primary-color)] text-black font-black uppercase text-xl tracking-widest rounded-xl hover:bg-white transition-all disabled:opacity-50"
          >
            {registering ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Apply Now'}
          </button>
        </div>
      </div>
    );
  }

  // Determine base URL dynamically
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  // Extract tracking things
  const links = affiliate.links || [];
  const conversions = affiliate.conversions || [];

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-4 md:px-12">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter">
              Partner <span className="text-[var(--primary-color)]">Dashboard</span>
            </h1>
            <div className="flex items-center gap-3 mt-4">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${affiliate.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                {affiliate.status}
              </span>
              <span className="text-sm text-gray-500 font-mono uppercase">Role: {affiliate.type?.replace('_', ' ')}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Commission Rate</div>
            <div className="text-3xl font-mono text-[var(--primary-color)] font-black">{affiliate.commission_rate}%</div>
          </div>
        </header>

        {affiliate.status !== 'approved' && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6 text-orange-200">
            <strong>Your account is currently {affiliate.status}.</strong> You can view your dashboard, but commission accrual and link generation may be restricted until an admin approves your account.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#111] border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingUp className="w-20 h-20" /></div>
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2 relative">Total Clicks</div>
            <div className="text-4xl font-mono text-white font-black relative">{affiliate.total_clicks}</div>
          </div>
          <div className="bg-[#111] border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><CheckCircle className="w-20 h-20" /></div>
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2 relative">Total Sales</div>
            <div className="text-4xl font-mono text-white font-black relative">{affiliate.total_sales}</div>
          </div>
          <div className="bg-[#111] border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><DollarSign className="w-20 h-20" /></div>
            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2 relative">Total Revenue</div>
            <div className="text-4xl font-mono text-[var(--primary-color)] font-black relative">${parseFloat(affiliate.total_revenue || 0).toFixed(2)}</div>
          </div>
          <div className="bg-[var(--primary-color)]/5 border border-[var(--primary-color)]/20 p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-[var(--primary-color)] group-hover:opacity-10 transition-opacity"><DollarSign className="w-20 h-20" /></div>
            <div className="text-[10px] text-[var(--primary-color)] uppercase font-bold tracking-widest mb-2 relative">Total Commission</div>
            <div className="text-4xl font-mono text-[var(--primary-color)] font-black relative">${parseFloat(affiliate.total_commission || 0).toFixed(2)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-white uppercase tracking-tighter mb-6">Your Referral Links</h3>
              
              <div className="space-y-4">
                {links.map((link: any) => {
                  const fullUrl = `${getApiUrl('')}/api/r/${link.url_code}`;
                  const isMain = !link.product_id;
                  
                  return (
                    <div key={link.id} className="bg-[#151515] border border-white/5 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-white mb-1">{isMain ? 'Store Homepage (General)' : (link.product?.name || 'Unknown Product')}</div>
                        <div className="text-sm font-mono text-gray-400 break-all">{fullUrl}</div>
                        <div className="flex gap-4 mt-2">
                          <span className="text-xs text-gray-500"><strong className="text-white">{link.clicks}</strong> clicks</span>
                          <span className="text-xs text-gray-500"><strong className="text-white">{link.conversions}</strong> conversions</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(fullUrl)}
                        className="p-3 bg-white/5 hover:bg-[var(--primary-color)] hover:text-black text-white rounded-xl transition-colors shrink-0 flex items-center justify-center gap-2"
                      >
                        {copiedLink === fullUrl ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        <span className="text-xs font-bold uppercase md:hidden">Copy</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-white uppercase tracking-tighter mb-6">Recent Earnings</h3>
              {conversions.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No earnings recorded yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] uppercase font-bold tracking-widest text-gray-500">
                        <th className="pb-4">Date</th>
                        <th className="pb-4">Order Total</th>
                        <th className="pb-4 text-[var(--primary-color)]">Commission</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-sm">
                      {conversions.slice().reverse().slice(0, 5).map((conv: any) => (
                        <tr key={conv.id} className="border-b border-white/5 last:border-0 text-gray-300">
                          <td className="py-4">{new Date(conv.created_at).toLocaleDateString()}</td>
                          <td className="py-4">${parseFloat(conv.order_total).toFixed(2)}</td>
                          <td className="py-4 font-bold text-[var(--primary-color)]">+${parseFloat(conv.commission_amount).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/5 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-white uppercase tracking-tighter mb-2">Create Product Link</h3>
              <p className="text-xs text-gray-500 mb-6 font-mono">Generate a unique tracking link for a specific product to share with your audience.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest ml-2 block mb-2">Select Product</label>
                  <select 
                    value={selectedProduct} 
                    onChange={e => setSelectedProduct(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[var(--primary-color)] appearance-none"
                  >
                    <option value="">-- Choose a Product --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                
                <button 
                  onClick={handleGenerateLink}
                  disabled={generatingLink || !selectedProduct}
                  className="w-full py-4 bg-white text-black font-black uppercase text-sm tracking-widest rounded-2xl hover:bg-[var(--primary-color)] transition-colors disabled:opacity-50"
                >
                  {generatingLink ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Generate Link'}
                </button>
              </div>
            </div>
            
            <div className="bg-[#111] border border-white/5 rounded-3xl p-8">
              <h3 className="text-sm font-bold text-white uppercase tracking-tighter mb-4">How it works</h3>
              <ul className="text-xs text-gray-400 space-y-3 font-mono">
                <li className="flex gap-2">
                  <span className="text-[var(--primary-color)]">01.</span> Share your unique links on your website, socials, or via email.
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--primary-color)]">02.</span> We track clicks and use cookies to attribute sales up to 30 days after the click.
                </li>
                <li className="flex gap-2">
                  <span className="text-[var(--primary-color)]">03.</span> When a purchase is completed, you earn your {affiliate.commission_rate}% commission!
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
