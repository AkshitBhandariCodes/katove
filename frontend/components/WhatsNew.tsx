"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { getApiUrl } from "@/utils/api";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: { name: string };
}

export function WhatsNew() {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    fetch(getApiUrl("/api/products"))
      .then(res => res.json())
      .then(data => setItems(Array.isArray(data) ? data.slice(0, 6) : []))
      .catch(err => console.error("Failed to fetch products", err));
  }, []);

  const categoryColors: Record<string, string> = {
    "Hardware": "bg-green-500",
    "Streaming": "bg-purple-600",
    "Peripherals": "bg-blue-500",
    "Furniture": "bg-orange-500",
    "Consoles": "bg-red-500",
  };

  return (
    <section className="py-20 bg-[#050505] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="text-[var(--primary-color)] text-sm font-bold tracking-widest uppercase">Collections</span>
            <h2 className="text-4xl font-bold text-white mt-2">What&apos;s New</h2>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
            <button className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-colors">
                <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-8 snap-x scrollbar-hide">
          {items.map((item, index) => {
            const catName = item.category?.name || "General";
            const colorClass = categoryColors[catName] || "bg-gray-600";
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="min-w-[280px] md:min-w-[320px] lg:min-w-[360px] h-[450px] relative rounded-3xl overflow-hidden group snap-center border border-white/5 bg-[#0f0f0f] cursor-pointer"
                onClick={() => window.location.href = `/product/${item.id}`}
              >
                <div className="absolute inset-0">
                   <div className={`w-full h-full ${colorClass} opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />
                   <Image src={item.image || "/images/placeholder.png"} alt={item.name} fill className="object-cover mix-blend-overlay group-hover:scale-110 transition-transform duration-700" unoptimized />
                   <div className="absolute inset-20 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                   <h3 className="text-2xl font-bold text-white mb-4 leading-tight group-hover:text-[var(--primary-color)] transition-colors">{item.name}</h3>
                   <div className="flex items-center justify-between">
                     <span className="text-[var(--primary-color)] font-bold text-lg">${item.price?.toFixed(2)}</span>
                     <span className="inline-flex items-center gap-2 text-sm font-bold text-white border-b border-[var(--primary-color)] pb-0.5 hover:text-[var(--primary-color)] transition-colors">
                       Shop Now
                     </span>
                   </div>
                </div>
                
                {index === 0 && (
                    <div className="absolute top-4 left-4 bg-[var(--primary-color)] text-black text-xs font-bold px-3 py-1 rounded-full">
                        New Arrival
                    </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
