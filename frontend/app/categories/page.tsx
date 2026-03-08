"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Box } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  product_count?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data: Category[]) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch categories:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
     return (
        <main className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-mono uppercase tracking-widest text-sm">
            <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}>
              SCANNING MATRIX SECURE SECTORS...
            </motion.span>
        </main>
     )
  }

  return (
    <main className="min-h-screen bg-[#050505] pt-32 pb-20 text-white">
       <Navbar /> 
       
       <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                  <h1 className="text-4xl md:text-7xl font-black italic tracking-tighter mb-4 uppercase">
                    HARDWARE <span className="text-[#ccff00]">CLASSES</span>
                  </h1>
                  <p className="text-gray-400 max-w-xl text-lg relative pl-4 border-l-2 border-[#ccff00]/50">
                      Navigate our classified sectors. From high-end tactical rigs to precision peripherals, locate exactly what your deployment requires.
                  </p>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {categories.map((cat, index) => (
                <Link key={cat.id} href={`/collections?category=${cat.id}`}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="group relative bg-[#0a0a0a] rounded-[2rem] overflow-hidden border border-white/5 hover:border-[#ccff00]/50 transition-all duration-500 hover:-translate-y-2 p-8"
                    >
                        {/* Decorative Background Element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[4rem] -mr-8 -mt-8 group-hover:bg-[#ccff00]/10 transition-colors" />
                        <div className="absolute top-6 right-6 text-white/10 group-hover:text-[#ccff00] transition-colors">
                            <Box className="w-12 h-12 stroke-[1px]" />
                        </div>

                        <div className="relative z-10 pt-16">
                            <span className="text-[10px] font-mono text-[#ccff00] uppercase tracking-widest block mb-2">
                                Sector: /{cat.slug}
                            </span>
                            <h3 className="text-3xl font-black uppercase text-white tracking-tighter italic mb-4 group-hover:text-[#ccff00] transition-colors leading-none">
                                {cat.name}
                            </h3>
                            <p className="text-gray-500 text-sm mb-8 line-clamp-2">
                                {cat.description || "Top-tier selections for elite operatives."}
                            </p>
                            
                            <div className="flex items-center justify-between border-t border-white/10 pt-6">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    Explore Sector
                                </span>
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white group-hover:bg-[#ccff00] group-hover:text-black transition-all">
                                    <ArrowRight className="w-5 h-5 group-hover:-rotate-45 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </Link>
             ))}

             {categories.length === 0 && (
                 <div className="col-span-full py-20 text-center">
                     <p className="text-gray-500 font-mono">No categories secured yet.</p>
                 </div>
             )}
          </div>
       </div>
    </main>
  );
}
