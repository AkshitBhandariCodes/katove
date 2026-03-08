"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Loader2, ChevronRight, Clock, CheckCircle, Truck, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

interface OrderItem {
    product_name: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    items: OrderItem[];
    total: number;
    address_line_1: string;
    city: string;
    status: string;
    createdAt: string;
    created_at: string;
    payment_proof_url: string | null;
    is_installment: boolean;
}

export default function UserOrdersPage() {
    const { user, token, isLoading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        if (user && token) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/user`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(async res => {
                if (!res.ok) {
                    const text = await res.text();
                    console.error("Server error response:", text);
                    throw new Error(`Server responded with ${res.status}`);
                }
                const contentType = res.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    const text = await res.text();
                    console.error("Non-JSON response received:", text);
                    throw new Error("Received non-JSON response from server");
                }
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setOrders(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
                }
            })
            .catch(err => {
                console.error("Failed to fetch orders:", err);
            })
            .finally(() => setLoading(false));
        } else {
            const timer = setTimeout(() => setLoading(false), 0);
            return () => clearTimeout(timer);
        }
    }, [user, token, authLoading]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'payment_pending': return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'payment_verification': return <AlertCircle className="w-4 h-4 text-blue-400" />;
            case 'payment_confirmed': return <CheckCircle className="w-4 h-4 text-[var(--primary-color)]" />;
            case 'order_received': return <CheckCircle className="w-4 h-4 text-cyan-400" />;
            case 'preparing_package': return <Clock className="w-4 h-4 text-orange-400" />;
            case 'courier_picked_up': return <Truck className="w-4 h-4 text-indigo-400" />;
            case 'out_for_delivery': return <Truck className="w-4 h-4 text-purple-400" />;
            case 'delivered': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'rejected_returned': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'canceled': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'payment_pending': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'payment_verification': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'payment_confirmed': return 'text-[var(--primary-color)] bg-[var(--primary-color)]/10 border-[var(--primary-color)]/20';
            case 'order_received': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
            case 'preparing_package': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
            case 'courier_picked_up': return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
            case 'out_for_delivery': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
            case 'delivered': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'rejected_returned': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'canceled': return 'text-red-500 bg-red-500/10 border-red-500/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    const [tab, setTab] = useState<'normal' | 'installments'>('normal');

    if (authLoading || (loading && user)) {
        return (
            <main className="min-h-screen bg-[#050505] text-white">
                <Navbar />
                <div className="flex flex-col items-center justify-center pt-40 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-[var(--primary-color)]" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest animate-pulse">Accessing Encrypted Records...</span>
                </div>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="min-h-screen bg-[#050505] text-white">
                <Navbar />
                <div className="max-w-7xl mx-auto px-6 pt-40 pb-20 text-center space-y-8">
                     <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                        <XCircle className="w-12 h-12 text-red-500" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black italic uppercase tracking-tighter">Access <span className="text-red-500">Denied</span></h2>
                        <p className="text-gray-500 font-mono text-sm max-w-sm mx-auto">Authorization key missing. Please sign in to view your transaction protocols.</p>
                    </div>
                    <button onClick={() => window.location.href='/'} className="bg-white text-black px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-200 transition-all">
                        Initialize Return
                    </button>
                </div>
                <Footer />
            </main>
        );
    }

    const filteredOrders = orders.filter(o => tab === 'normal' ? !o.is_installment : o.is_installment);

    return (
        <main className="min-h-screen bg-[#050505] text-white">
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
                <header className="mb-12">
                    <div className="flex items-center gap-3 text-[var(--primary-color)] mb-2">
                        <ShoppingBag className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Personal Vault</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">My <span className="text-[var(--primary-color)]">Orders</span></h1>
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-4">Tracking {orders.length} transaction protocols in real-time</p>
                </header>

                <div className="flex gap-4 mb-8">
                    <button 
                        onClick={() => setTab('normal')}
                        className={`px-6 py-2 rounded-full text-xs font-black tracking-widest uppercase transition-all ${tab === 'normal' ? 'bg-[var(--primary-color)] text-black' : 'bg-[#111] text-gray-500 hover:text-white'}`}
                    >
                        Standard Orders
                    </button>
                    <button 
                        onClick={() => setTab('installments')}
                        className={`px-6 py-2 rounded-full text-xs font-black tracking-widest uppercase transition-all ${tab === 'installments' ? 'bg-[var(--primary-color)] text-black' : 'bg-[#111] text-gray-500 hover:text-white'}`}
                    >
                        Installment Plans
                    </button>
                </div>

                <div className="grid gap-6">
                    {filteredOrders.length === 0 ? (
                        <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-20 text-center space-y-6">
                            <ShoppingBag className="w-16 h-16 text-gray-800 mx-auto" />
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-white uppercase italic">No Orders Detected</h3>
                                <p className="text-sm text-gray-600 font-mono max-w-xs mx-auto uppercase">Your transaction history is clear in this sector.</p>
                            </div>
                            <Link href="/collections" className="inline-block bg-[var(--primary-color)] text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all text-sm">
                                Explore Armory
                            </Link>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {filteredOrders.map((order, idx) => (
                                <motion.div 
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-10 hover:border-[var(--primary-color)]/30 transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[var(--primary-color)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    
                                    <div className="flex flex-col md:flex-row gap-8 justify-between">
                                        <div className="flex-1 space-y-6">
                                            <div className="flex flex-wrap items-center gap-4">
                                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                                                    ID: {order.id.slice(-8).toUpperCase()}
                                                </span>
                                                <span className="text-xs text-gray-500 font-mono flex items-center gap-2">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(order.created_at || order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </span>
                                                <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${getStatusColor(order.status)}`}>
                                                    {getStatusIcon(order.status)}
                                                    {order.status}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="text-[10px] font-black text-white uppercase tracking-tighter opacity-50">Deployed Units</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {order.items.map((item, i) => (
                                                        <div key={i} className="flex items-center gap-3 bg-black border border-white/5 px-4 py-2 rounded-xl text-sm group-hover:border-[var(--primary-color)]/20 transition-colors">
                                                            <span className="text-[var(--primary-color)] font-black">x{item.quantity}</span>
                                                            <span className="text-white font-bold">{item.product_name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                                <div className="space-y-2">
                                                    <div className="text-[10px] font-black text-white uppercase tracking-tighter opacity-50">Shipping Destination</div>
                                                    <p className="text-sm text-gray-400 font-mono leading-relaxed">
                                                        {order.address_line_1}<br />
                                                        {order.city}
                                                    </p>
                                                </div>
                                                {order.payment_proof_url && (
                                                     <div className="space-y-2">
                                                        <div className="text-[10px] font-black text-white uppercase tracking-tighter opacity-50">Payment Verification</div>
                                                        <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest">
                                                            <CheckCircle className="w-4 h-4" />
                                                            Proof Transmitted
                                                        </div>
                                                     </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end justify-between min-w-[180px] border-t md:border-t-0 md:border-l border-white/5 pt-6 md:pt-0 md:pl-10">
                                            <div className="text-right">
                                                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Transaction</div>
                                                <div className="text-4xl font-black italic text-white group-hover:text-[var(--primary-color)] transition-colors">
                                                    ${order.total.toFixed(2)}
                                                </div>
                                            </div>

                                            {order.status === 'payment_pending' && (
                                                <Link 
                                                    href={`/checkout?orderId=${order.id}`}
                                                    className="w-full mt-6 bg-[var(--primary-color)] text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#e6ff66] text-center transition-all"
                                                >
                                                    Complete Payment
                                                </Link>
                                            )}
                                            
                                            <div className="mt-6 flex items-center gap-2 text-gray-600 group-hover:text-gray-400 transition-colors uppercase text-[10px] font-black tracking-widest">
                                                Status Hooked <ChevronRight className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
            <Footer />
        </main>
    );
}
