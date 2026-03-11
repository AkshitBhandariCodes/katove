"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, AlertCircle, Upload, ShieldCheck, ChevronRight, Calculator, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { getApiUrl } from "@/utils/api";
import { useAuth } from "@/context/AuthContext";

interface Product {
  id: string;
  name: string;
  selling_price: number;
  slug?: string;
  image_url?: string;
}

export default function InstallmentsPage() {
  const { user, token } = useAuth();
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [formData, setFormData] = useState({
      product_id: "",
      months: 12,
      documents: [] as File[]
  });

  useEffect(() => {
    fetch(getApiUrl("/api/products"))
      .then(res => res.json())
      .then((data: Product[]) => {
        setProducts(Array.isArray(data) ? data.filter((p: any) => p.installment_eligible) : []);
      })
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, []);

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          setFormData({ ...formData, documents: [...formData.documents, ...Array.from(e.target.files)] });
      }
  };

  const selectedProduct = products.find(p => p.id === formData.product_id);
  const upfrontAmount = selectedProduct ? selectedProduct.selling_price * 0.2 : 0;
  const remainingAmount = selectedProduct ? selectedProduct.selling_price - upfrontAmount : 0;
  const monthlyPayment = selectedProduct ? remainingAmount / formData.months : 0;

  const handleSubmit = async () => {
    if (!token || !selectedProduct) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const fd = new FormData();
      fd.append('product_id', formData.product_id);
      fd.append('months', String(formData.months));
      formData.documents.forEach(file => fd.append('documents', file));

      const res = await fetch(getApiUrl("/api/installments/request"), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Request failed');
      setStep(3);
    } catch (e: any) {
      setSubmitError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] pt-32 pb-20 text-white">
       <Navbar /> 
       
       <div className="max-w-[1400px] mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="bg-[var(--primary-color)]/10 text-[var(--primary-color)] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Katove Finance</span>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter italic mt-6 mb-4 uppercase">
                    FLEXIBLE <span className="text-white">DEPLOYMENT</span>
                </h1>
                <p className="text-gray-400 text-lg">
                    Secure your elite tactical gear today. Pay over time with our zero-interest financing options up to 12 months.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* Information Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-[#0a0a0a] rounded-[2rem] border border-white/5 p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-color)]/5 rounded-bl-[4rem] group-hover:bg-[var(--primary-color)]/10 transition-colors" />
                        <ShieldCheck className="w-10 h-10 text-[var(--primary-color)] mb-6" />
                        <h3 className="text-xl font-black uppercase tracking-tighter mb-2">0% Interest Standard</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">No hidden fees, no interest jumps. What you see is exactly what you pay spread across your selected term.</p>
                    </div>
                    
                    <div className="bg-[#0a0a0a] rounded-[2rem] border border-white/5 p-8">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">How It Works</h3>
                        <ul className="space-y-6">
                            {[
                                { title: "Select Asset", desc: "Choose an eligible high-tier product." },
                                { title: "Submit Uplink", desc: "Upload 2 recent pay slips or income proof." },
                                { title: "Awaiting Clearance", desc: "Admin review within 24 working hours." },
                                { title: "Deployment", desc: "Pay the 20% upfront and gear ships." }
                            ].map((s, i) => (
                                <li key={i} className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-mono text-white flex-shrink-0">{i+1}</div>
                                    <div>
                                        <h4 className="font-bold text-sm text-white">{s.title}</h4>
                                        <p className="text-xs text-gray-500 mt-1 block">{s.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Main Form Area */}
                <div className="lg:col-span-8">
                    <div className="bg-[#0a0a0a] rounded-[2rem] border border-white/5 p-8 md:p-12">
                        
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
                                    <div className="w-10 h-10 rounded-full bg-[var(--primary-color)] text-black flex items-center justify-center font-bold">1</div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter">Configure Plan</h2>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Eligible Asset Selection</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {loadingProducts ? (
                                                <div className="col-span-2 text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[var(--primary-color)] mx-auto" /></div>
                                            ) : products.length === 0 ? (
                                                <div className="col-span-2 text-center py-8 text-gray-500">No installment-eligible products available</div>
                                            ) : products.map(p => (
                                                <div 
                                                    key={p.id} 
                                                    onClick={() => setFormData({...formData, product_id: p.id})}
                                                    className={`p-5 rounded-2xl cursor-pointer transition-all border ${formData.product_id === p.id ? 'bg-[var(--primary-color)]/10 border-[var(--primary-color)] text-white' : 'bg-black border-white/5 text-gray-400 hover:border-white/20'}`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-sm uppercase">{p.name}</h4>
                                                        {formData.product_id === p.id && <CheckCircle className="w-5 h-5 text-[var(--primary-color)]" />}
                                                    </div>
                                                    <p className="font-mono mt-2 text-[var(--primary-color)]">${p.selling_price?.toFixed(2)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {selectedProduct && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Term Duration (Months)</label>
                                            <div className="flex gap-4">
                                                {[12, 24, 36, 48].map(m => (
                                                    <button 
                                                        key={m}
                                                        onClick={() => setFormData({...formData, months: m})}
                                                        className={`flex-1 py-4 rounded-xl font-mono text-sm transition-all border ${formData.months === m ? 'bg-white text-black border-white' : 'bg-black border-white/5 text-gray-400 hover:border-white/20'}`}
                                                    >
                                                        {m}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="bg-[#111] p-6 rounded-2xl border border-white/5 mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                                                <div>
                                                    <span className="block text-[10px] text-gray-500 font-bold uppercase">Total Value</span>
                                                    <span className="font-mono text-white text-lg">${selectedProduct.selling_price.toFixed(2)}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] text-gray-500 font-bold uppercase">Upfront (20%)</span>
                                                    <span className="font-mono text-[var(--primary-color)] text-lg">${upfrontAmount.toFixed(2)}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] text-gray-500 font-bold uppercase">To Finance</span>
                                                    <span className="font-mono text-white text-lg">${remainingAmount.toFixed(2)}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] text-gray-500 font-bold uppercase">Avg Monthly</span>
                                                    <span className="font-mono text-white text-lg">${monthlyPayment.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="pt-6">
                                        <button 
                                            disabled={!selectedProduct}
                                            onClick={() => setStep(2)}
                                            className="w-full bg-[var(--primary-color)] text-black font-black uppercase tracking-widest py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--primary-color)] transition-colors"
                                        >
                                            Proceed to Verification
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
                                    <button onClick={() => setStep(1)} className="w-10 h-10 rounded-full bg-white/5 text-white flex items-center justify-center hover:bg-white/10 transition-colors"><ChevronRight className="w-5 h-5 rotate-180" /></button>
                                    <div className="w-10 h-10 rounded-full bg-[var(--primary-color)] text-black flex items-center justify-center font-bold">2</div>
                                    <h2 className="text-2xl font-black uppercase tracking-tighter">Compliance Upload</h2>
                                </div>

                                <div className="space-y-8">
                                    <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl flex gap-4 text-blue-400">
                                        <AlertCircle className="w-6 h-6 flex-shrink-0" />
                                        <div className="text-sm">
                                            <p className="font-bold mb-1">Required Documentation</p>
                                            <p className="text-blue-400/80">Please upload your 2 most recent bank statements or pay slips. This confirms your eligibility for the {formData.months}-month financing tier.</p>
                                        </div>
                                    </div>

                                    <div className="border-2 border-dashed border-white/10 hover:border-[var(--primary-color)]/50 transition-colors rounded-[2rem] p-12 text-center bg-[#111] relative">
                                        <input 
                                            type="file" 
                                            multiple 
                                            accept=".pdf,.png,.jpg,.jpeg"
                                            onChange={handleDocumentUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <Upload className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                        <h3 className="text-lg font-bold text-white mb-2">Drag & Drop Secure Files</h3>
                                        <p className="text-sm text-gray-500">or click to browse local systems. PDF, JPG, PNG up to 10MB.</p>
                                    </div>

                                    {formData.documents.length > 0 && (
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Encypted Uploads ({formData.documents.length})</h4>
                                            {formData.documents.map((file, i) => (
                                                <div key={i} className="flex items-center justify-between bg-[#151515] p-4 rounded-xl border border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center"><Calculator className="w-4 h-4 text-gray-400" /></div>
                                                        <span className="text-sm text-white font-mono truncate max-w-[200px]">{file.name}</span>
                                                    </div>
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {submitError && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-4 rounded-xl mb-4">{submitError}</div>}

                                    <div className="pt-6">
                                        <button 
                                            disabled={formData.documents.length === 0 || submitting || !token}
                                            onClick={handleSubmit}
                                            className="w-full bg-[var(--primary-color)] text-black font-black uppercase tracking-widest py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-colors flex items-center justify-center gap-2"
                                        >
                                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Transmit Request for Review'}
                                        </button>
                                        {!token && <p className="text-xs text-gray-500 text-center mt-2">Sign in to submit a request</p>}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                                <div className="w-24 h-24 rounded-full bg-[var(--primary-color)]/10 flex items-center justify-center mx-auto mb-8">
                                    <CheckCircle className="w-12 h-12 text-[var(--primary-color)]" />
                                </div>
                                <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-4 text-white">Transmission Successful</h2>
                                <p className="text-gray-400 max-w-sm mx-auto mb-8">
                                    Your secure deployment request has been logged. Admin review will be completed within 24 hours. You will receive comms via email.
                                </p>
                                <div className="bg-[#111] border border-white/5 p-6 rounded-2xl max-w-sm mx-auto text-left mb-8 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Reference ID:</span>
                                        <span className="text-white font-mono">FIN-{Math.floor(Math.random() * 9000) + 1000}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Asset:</span>
                                        <span className="text-white font-bold truncate max-w-[150px]">{selectedProduct?.name}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Status:</span>
                                        <span className="text-yellow-500 font-bold uppercase text-xs tracking-widest">Awaiting Clearance</span>
                                    </div>
                                </div>
                                <Link href="/" className="inline-block border text-[10px] border-white/20 text-white font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all px-8 py-4 rounded-full">
                                    Return to Base
                                </Link>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
       </div>
    </main>
  );
}
