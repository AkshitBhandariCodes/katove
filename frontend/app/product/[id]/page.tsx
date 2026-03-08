"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Star, ShieldCheck, Truck, Minus, Plus, ShoppingCart, Heart, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";

interface Product {
  id: string;
  name: string;
  price: number | string;
  image: string;
  description: string;
}

export default function ProductPage() {
  const params = useParams() as { id: string | string[] };
  const [qty, setQty] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (params.id) {
        const id = Array.isArray(params.id) ? params.id[0] : params.id;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("Not found");
                return res.json();
            })
            .then((data: Product) => {
                setProduct(data);
                setLoading(false);
            })
            .catch((err: unknown) => {
                console.error(err);
                setLoading(false);
                setProduct(null);
            });
    }
  }, [params]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, qty);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-mono uppercase tracking-widest text-sm">
      <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}>
        Initializing Data Stream...
      </motion.span>
    </div>
  );

  if (!product) return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white gap-6">
          <div className="text-6xl font-black italic text-white/10 select-none">404</div>
          <h1 className="text-2xl font-bold">Product Decrypted Error</h1>
          <Link href="/collections" className="bg-[#ccff00] text-black px-8 py-3 rounded-full font-bold hover:bg-[#b3e600] transition-colors">Return to Armory</Link>
      </div>
  );

  return (
    <main className="min-h-screen bg-[#050505] pt-32 pb-20 text-white">
      <Navbar />
      
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 font-medium">
            <Link href="/" className="hover:text-[#ccff00] transition-colors">Home</Link>
            <span className="opacity-30">/</span>
            <Link href="/collections" className="hover:text-[#ccff00] transition-colors">Armory</Link>
            <span className="opacity-30">/</span>
            <span className="text-[#ccff00] font-bold">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="space-y-4"
            >
                <div className="bg-[#0a0a0a] rounded-[2rem] border border-white/5 p-12 flex items-center justify-center aspect-square relative group overflow-hidden shadow-2xl">
                    <div className="absolute top-6 left-6 z-10">
                        <span className="bg-[#ccff00] text-black text-[10px] font-black px-4 py-1.5 rounded-full tracking-tighter">ELITE GRADE</span>
                    </div>
                    <Image 
                        src={product.image} 
                        alt={product.name} 
                        width={600} 
                        height={600} 
                        className="object-contain w-full h-full group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700"
                        priority
                    />
                    <div className="absolute inset-0 bg-[#ccff00]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-col h-full"
            >
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex text-[#ccff00]">
                        {[1, 2, 3, 4, 5].map((i) => (
                           <Star key={i} className={`w-4 h-4 ${i === 5 ? 'opacity-30' : 'fill-current'}`} />
                        ))}
                    </div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Verified Tactical Score (128)</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-black tracking-tighter italic mb-4 leading-none uppercase">{product.name}</h1>
                
                <div className="text-4xl font-black text-[#ccff00] mb-8 font-mono">
                    ${Number(product.price).toFixed(2)}
                </div>

                <p className="text-gray-400 leading-relaxed mb-8 max-w-lg text-lg">
                    {product.description}
                </p>

                <div className="mb-10 space-y-6">
                    <div>
                        <span className="text-xs font-black text-gray-500 block mb-3 uppercase tracking-tighter">Select Configuration</span>
                        <div className="flex gap-4">
                            {['ONYX', 'ALABASTER', 'NEXUS GREEN'].map((color, i) => (
                                <button 
                                    key={i}
                                    className={`px-4 py-2 border text-[10px] font-black tracking-tighter rounded-full transition-all ${i === 0 ? 'bg-white text-black border-white' : 'border-white/10 text-white hover:border-white/30'}`}
                                >
                                    {color}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-10">
                    <div className="flex items-center bg-[#111] rounded-2xl border border-white/5 px-2 h-16 w-full sm:w-fit">
                        <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-4 hover:text-[#ccff00] transition-colors"><Minus className="w-4 h-4" /></button>
                        <span className="w-12 text-center font-mono font-black text-xl">{qty}</span>
                        <button onClick={() => setQty(qty + 1)} className="p-4 hover:text-[#ccff00] transition-colors"><Plus className="w-4 h-4" /></button>
                    </div>
                    
                    <button 
                      onClick={handleAddToCart}
                      className={`flex-1 h-16 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 ${isAdded ? 'bg-white text-black' : 'bg-[#ccff00] text-black hover:bg-[#d9ff33]'}`}
                    >
                        {isAdded ? (
                          <>
                            <Check className="w-6 h-6 stroke-[3px]" />
                            ADDED TO CART
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-6 h-6 stroke-[3px]" />
                            DEPLOY ITEM
                          </>
                        )}
                    </button>

                    <button className="h-16 w-16 rounded-2xl bg-[#111] border border-white/5 flex items-center justify-center hover:border-[#ccff00] hover:text-[#ccff00] transition-colors flex-shrink-0">
                        <Heart className="w-6 h-6" />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-10 border-t border-white/5 mt-auto">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#ccff00]/10 flex items-center justify-center text-[#ccff00]">
                            <Truck className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="block text-sm font-black uppercase tracking-tighter">Rapid Deployment</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold">Standard on orders $150+</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#ccff00]/10 flex items-center justify-center text-[#ccff00]">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="block text-sm font-black uppercase tracking-tighter">Nexus Shield</span>
                            <span className="text-[10px] text-gray-500 uppercase font-bold">24-Month Secure Warranty</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
      </div>
    </main>
  );
}
