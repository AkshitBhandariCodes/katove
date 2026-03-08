"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Check, ArrowRight, Upload, ShieldCheck, AlertCircle, Building, Calculator, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  
  // Steps: info -> payment -> success
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    notes: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<'manual' | 'installment'>('manual');
  
  // Payment Settings (for manual)
  const [paymentSettings, setPaymentSettings] = useState({
    instructions: "",
    qr: "",
  });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  // Installment Settings
  const [productDetails, setProductDetails] = useState<any[]>([]);
  const [installmentMonths, setInstallmentMonths] = useState(12);
  const [installmentDocs, setInstallmentDocs] = useState<File[]>([]);

  useEffect(() => {
    if (user) {
      const nameParts = (user.name || "").split(" ");
      setFormData(prev => ({
        ...prev,
        first_name: nameParts[0] || prev.first_name,
        last_name: nameParts.slice(1).join(" ") || prev.last_name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (items.length === 0 && step === 'info') router.push("/");
    if (!loading && !user && step === 'info') {
      router.push("/");
    }
  }, [items, router, step, user, loading]);

  useEffect(() => {
    // Fetch system settings
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`)
      .then(res => res.json())
      .then(data => {
          setPaymentSettings({
              instructions: data.paymentInstructions || data.payment_instructions || "",
              qr: data.paymentQr || data.payment_qr_url || ""
          });
      })
      .catch(err => console.error(err));
      
    // Fetch product details for cart items to check installment eligibility and cost prices
    if (items.length > 0) {
      Promise.all(items.map(item => 
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${item.id}`).then(res => res.json())
      )).then(data => setProductDetails(data))
        .catch(err => console.error(err));
    }
  }, [items]);

  const handleInfoContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        setInstallmentDocs([...installmentDocs, ...Array.from(e.target.files)]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setProofFile(file);
        setProofPreview(URL.createObjectURL(file));
    }
  };

  const submitOrder = async () => {
    if (!user) {
        alert("Authentication Required: Please login to initialize the transaction protocol.");
        return;
    }
    
    if (paymentMethod === 'manual' && !proofFile) {
        alert("Please upload your payment proof before submitting.");
        return;
    }
    if (paymentMethod === 'installment' && installmentDocs.length === 0) {
        alert("Please upload 6 months of income proof to proceed.");
        return;
    }

    setLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');

      // 1. Create the Order
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(item => ({
            product_id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          total: totalPrice,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          email: formData.email,
          address_line_1: formData.address_line_1,
          address_line_2: formData.address_line_2,
          city: formData.city,
          notes: formData.notes,
          referral_code: refCode || undefined,
          is_installment: paymentMethod === 'installment',
          user: {
            name: `${formData.first_name} ${formData.last_name}`.trim(),
            email: formData.email,
            id: user?.id || "guest-" + Date.now(),
          }
        })
      });

      if (!res.ok) throw new Error("Failed to create sequence order");
      const orderData = await res.json();
      setOrderId(orderData.id);

      // 2. Process specific payment paths
      if (paymentMethod === 'manual' && proofFile) {
        const uploadData = new FormData();
        uploadData.append("paymentProof", proofFile);
        const payRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderData.id}/pay`, {
            method: "PUT",
            body: uploadData
        });
        if (!payRes.ok) throw new Error("Failed to upload manual payment proof.");
      } 
      else if (paymentMethod === 'installment') {
        const token = localStorage.getItem('token');
        for (const item of items) {
            const prodMatch = productDetails.find(p => p.id === item.id);
            if (prodMatch && prodMatch.installment_eligible) {
               const installData = new FormData();
               installData.append("product_id", item.id);
               installData.append("months", String(installmentMonths));
               installData.append("order_id", orderData.id);
               installmentDocs.forEach(doc => installData.append("documents", doc));
               
               const instRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/installments/request`, {
                 method: "POST",
                 headers: { "Authorization": `Bearer ${token}` },
                 body: installData
               });
               if (!instRes.ok) throw new Error(`Failed to request installment for ${item.name}`);
            }
        }
      }

      clearCart();
      setStep('success');

    } catch (err) {
      alert((err as any).message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && step === 'info') return null;

  // Installment Computations
  const isCartInstallmentEligible = productDetails.length > 0 && productDetails.every(p => p.installment_eligible);
  const cartTotalSellingPrice = productDetails.reduce((sum, p) => {
    const cartItem = items.find(i => i.id === p.id);
    return sum + (p.selling_price * (cartItem?.quantity || 1));
  }, 0);
  const cartUpfrontAmount = cartTotalSellingPrice * 0.20;
  const cartRemainingAmount = cartTotalSellingPrice - cartUpfrontAmount;
  const monthlyPayment = cartRemainingAmount > 0 ? cartRemainingAmount / installmentMonths : 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
            {/* Progress Bar */}
            <div className="flex items-center justify-between mb-12 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -z-0"></div>
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step === 'info' ? 'bg-[var(--primary-color)] text-black shadow-[0_0_20px_#ccff00]' : 'bg-[#111] border border-white/20 text-gray-500'}`}>1</div>
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step === 'payment' ? 'bg-[var(--primary-color)] text-black shadow-[0_0_20px_#ccff00]' : 'bg-[#111] border border-white/20 text-gray-500'}`}>2</div>
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step === 'success' ? 'bg-[var(--primary-color)] text-black shadow-[0_0_20px_#ccff00]' : 'bg-[#111] border border-white/20 text-gray-500'}`}>3</div>
            </div>

            <AnimatePresence mode="wait">
                {step === 'info' && (
                    <motion.div 
                        key="info"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-12"
                    >
                        <form onSubmit={handleInfoContinue} className="space-y-6">
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter">Shipping <span className="text-[var(--primary-color)]">Data</span></h2>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">First Name</label>
                                        <input required value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary-color)] transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Last Name</label>
                                        <input required value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary-color)] transition-all" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Phone Number</label>
                                        <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary-color)] transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Email Address</label>
                                        <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary-color)] transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Address Line 1</label>
                                    <input required value={formData.address_line_1} onChange={e => setFormData({...formData, address_line_1: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary-color)] transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Address Line 2 <span className="text-gray-700">(Optional)</span></label>
                                    <input value={formData.address_line_2} onChange={e => setFormData({...formData, address_line_2: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary-color)] transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">City</label>
                                    <input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary-color)] transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Notes <span className="text-gray-700">(Optional)</span></label>
                                    <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={3} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary-color)] transition-all resize-none" />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full bg-[var(--primary-color)] text-black font-black py-4 rounded-2xl uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#e6ff66] transition-all disabled:opacity-50"
                                disabled={!user}
                            >
                                {!user ? "Log In Required" : "Continue To Payment"} <ArrowRight className="w-5 h-5" />
                            </button>
                            {!user && (
                                <p className="text-[10px] text-center text-red-500 font-bold uppercase tracking-widest mt-2 animate-pulse">
                                    Strategic Error: Authentication protocol must be active to proceed.
                                </p>
                            )}
                        </form>

                        <div className="bg-[#111] border border-white/10 rounded-3xl p-8 h-fit">
                            <h3 className="text-xl font-bold uppercase italic mb-6">Order Summary</h3>
                            <div className="space-y-4 mb-6">
                                {items.map(item => (
                                    <div key={item.id} className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-black rounded-lg border border-white/5 relative overflow-hidden flex-shrink-0">
                                             <Image src={item.image} alt={item.name} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-bold text-white line-clamp-1">{item.name}</div>
                                            <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                                        </div>
                                        <div className="font-mono font-bold text-[var(--primary-color)]">${(Number(item.price) * item.quantity).toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                                <div className="text-xs font-bold uppercase text-gray-500 tracking-widest">Total Amount</div>
                                <div className="text-3xl font-black italic text-white">${totalPrice.toFixed(2)}</div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 'payment' && (
                    <motion.div 
                        key="payment"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="max-w-4xl mx-auto space-y-8"
                    >
                         <div className="text-center">
                            <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter mb-2">Configure <span className="text-[var(--primary-color)]">Payment</span></h2>
                            <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Select how you want to deploy assets</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setPaymentMethod('manual')}
                                className={`p-6 rounded-2xl border-2 tracking-widest font-black uppercase transition-all ${paymentMethod === 'manual' ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/5 text-[var(--primary-color)]' : 'border-white/10 bg-[#111] text-gray-400 hover:border-white/30'}`}
                            >
                                <Building className="w-8 h-8 mx-auto mb-2" />
                                Manual Transfer
                            </button>
                            <button 
                                onClick={() => setPaymentMethod('installment')}
                                className={`p-6 rounded-2xl border-2 tracking-widest font-black uppercase transition-all ${paymentMethod === 'installment' ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/5 text-[var(--primary-color)]' : 'border-white/10 bg-[#111] text-gray-400 hover:border-white/30'}`}
                            >
                                <ShieldCheck className="w-8 h-8 mx-auto mb-2" />
                                Installment Plan
                            </button>
                        </div>

                        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-12 mt-6">
                            
                            {/* MANUAL TRANSFER TAB */}
                            {paymentMethod === 'manual' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
                                        {paymentSettings.qr && (
                                            <div className="w-48 h-48 bg-white p-4 rounded-2xl flex-shrink-0">
                                                <div className="relative w-full h-full">
                                                    <Image src={paymentSettings.qr} alt="Payment QR" fill className="object-contain" />
                                                </div>
                                            </div>
                                        )}
                                        <div className="space-y-4 text-center md:text-left">
                                            <h3 className="text-xl font-bold text-white uppercase italic">Instructions</h3>
                                            <div className="text-gray-400 text-sm whitespace-pre-wrap font-mono leading-relaxed bg-[#111] p-4 rounded-xl border border-white/5">
                                                {paymentSettings.instructions || "No custom instructions provided."}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Upload className="w-4 h-4 text-[var(--primary-color)]" />
                                            Upload Transaction Proof
                                        </h3>
                                        
                                        <div className="relative group">
                                            <input 
                                                type="file" id="proof-upload" accept="image/*" onChange={handleFileChange} className="hidden" 
                                            />
                                            <label htmlFor="proof-upload" className={`w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${proofPreview ? 'border-[var(--primary-color)] bg-black' : 'border-white/10 bg-black/50 hover:border-white/20 hover:bg-white/5'}`}>
                                                {proofPreview ? (
                                                    <div className="relative w-full h-full p-2">
                                                        <Image src={proofPreview} alt="Preview" fill className="object-contain" />
                                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <span className="text-xs font-bold text-white uppercase">Change File</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Upload className="w-8 h-8 text-gray-500 mb-2" />
                                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Click to upload screenshot</span>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* INSTALLMENT PLAN TAB */}
                            {paymentMethod === 'installment' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {!isCartInstallmentEligible ? (
                                        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex gap-4 text-red-400">
                                            <AlertCircle className="w-6 h-6 flex-shrink-0" />
                                            <div className="text-sm">
                                                <p className="font-bold mb-1">Ineligible Assets Detected</p>
                                                <p className="text-red-400/80">One or more items in your cart do not qualify for financing. Please adjust your cart or select manual transfer.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="space-y-4">
                                                <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Term Duration (Months)</label>
                                                <div className="flex gap-4">
                                                    {[12, 24, 36, 48].map(m => (
                                                        <button 
                                                            key={m}
                                                            onClick={() => setInstallmentMonths(m)}
                                                            className={`flex-1 py-4 rounded-xl font-mono text-sm transition-all border ${installmentMonths === m ? 'bg-white text-black border-white' : 'bg-black border-white/5 text-gray-400 hover:border-white/20'}`}
                                                        >
                                                            {m}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="bg-[#111] p-6 rounded-2xl border border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6">
                                                <div>
                                                    <span className="block text-[10px] text-gray-500 font-bold uppercase">Total Value</span>
                                                    <span className="font-mono text-white text-lg">${totalPrice.toFixed(2)}</span>
                                                </div>
                                                <div>
                                                    <span className="font-mono text-[var(--primary-color)] text-lg">${cartUpfrontAmount.toFixed(2)}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] text-gray-500 font-bold uppercase">To Finance</span>
                                                    <span className="font-mono text-white text-lg">${cartRemainingAmount.toFixed(2)}</span>
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] text-gray-500 font-bold uppercase">Avg Monthly</span>
                                                    <span className="font-mono text-white text-lg">${monthlyPayment.toFixed(2)}</span>
                                                </div>
                                            </div>

                                            <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl flex gap-4 text-blue-400">
                                                <ShieldCheck className="w-6 h-6 flex-shrink-0" />
                                                <div className="text-sm">
                                                    <p className="font-bold mb-1">Upload Last 6 Months Income Proof</p>
                                                    <p className="text-blue-400/80">Bank statements or pay slips required to verify eligibility. Your upfront amount will be collected securely during approval.</p>
                                                </div>
                                            </div>
                                            
                                            <div className="border-2 border-dashed border-white/10 hover:border-[var(--primary-color)]/50 transition-colors rounded-[2rem] p-12 text-center bg-[#111] relative">
                                                <input 
                                                    type="file" multiple accept=".pdf,.png,.jpg,.jpeg" onChange={handleDocumentUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                                <Upload className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                                <h3 className="text-lg font-bold text-white mb-2">Upload Income Proof</h3>
                                                <p className="text-sm text-gray-500">Drag & drop or click. PDF, JPG, PNG.</p>
                                            </div>

                                            {installmentDocs.length > 0 && (
                                                <div className="space-y-3">
                                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Encypted Uploads ({installmentDocs.length})</h4>
                                                    {installmentDocs.map((file, i) => (
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
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="mt-8 pt-6 border-t border-white/10">
                                <button 
                                    onClick={submitOrder} 
                                    disabled={loading || (paymentMethod === 'installment' && (!isCartInstallmentEligible || installmentDocs.length === 0)) || (paymentMethod === 'manual' && !proofFile)}
                                    className="w-full bg-[var(--primary-color)] text-black font-black py-4 rounded-2xl uppercase tracking-widest hover:bg-[#b3e600] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Complete Order"}
                                </button>
                                <button 
                                    onClick={() => setStep('info')}
                                    className="w-full mt-4 text-gray-500 font-bold uppercase tracking-widest py-4 hover:text-white transition-all flex items-center justify-center"
                                >
                                    Back to Shipping
                                </button>
                            </div>

                        </div>
                    </motion.div>
                )}

                {step === 'success' && (
                    <motion.div 
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-xl mx-auto text-center space-y-8 pt-12"
                    >
                        <div className="w-32 h-32 bg-[var(--primary-color)]/10 rounded-full flex items-center justify-center mx-auto border border-[var(--primary-color)]/20 animate-pulse">
                            <Check className="w-16 h-16 text-[var(--primary-color)]" />
                        </div>
                        
                        <div>
                            <h2 className="text-5xl font-black italic text-white uppercase tracking-tighter mb-4">Order <span className="text-[var(--primary-color)]">Initiated</span></h2>
                            <p className="text-gray-400 font-mono text-sm leading-relaxed max-w-sm mx-auto">
                                {paymentMethod === 'installment' 
                                  ? "Your installment request and proof were transmitted securely. Admin review completes within 24 working hours."
                                  : "Your payment proof has been received. Our team will verify the transaction and process your order shortly."}
                            </p>
                        </div>

                        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 max-w-sm mx-auto">
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Order Reference</div>
                            <div className="text-xl font-mono text-white font-bold">{orderId?.slice(0, 8)}</div>
                        </div>

                        <button 
                            onClick={() => router.push('/')}
                            className="bg-white text-black px-10 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                        >
                            Return to Base
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
  );
}
