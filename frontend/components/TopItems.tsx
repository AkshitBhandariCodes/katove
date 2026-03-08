"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { getApiUrl } from "@/utils/api";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
}

export function TopItems() {
  const [topItems, setTopItems] = useState<Product[]>([]);

  useEffect(() => {
    fetch(getApiUrl("/api/products"))
      .then(res => res.json())
      .then(data => setTopItems(data.slice(0, 4)))
      .catch(err => console.error("Failed to fetch top items", err));
  }, []);

  return (
    <section className="py-20 bg-[#0a0a0a]">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="mb-12">
            <span className="text-[#ccff00] text-sm font-bold tracking-widest uppercase">Top Items</span>
            <h2 className="text-4xl font-bold text-white mt-2">Top 10 Items Of The Month</h2>
            <p className="text-gray-400 mt-4 max-w-2xl">Only the best made the list—gear that delivers real in-game advantage.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-[#111] rounded-3xl overflow-hidden border border-white/5 hover:border-[#ccff00]/50 transition-colors"
            >
               {/* Image Area */}
               <div className="h-[300px] relative p-8 flex items-center justify-center bg-[#0d0d0d]">
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-xs font-bold text-white px-3 py-1 rounded-full border border-white/10 group-hover:bg-[#ccff00] group-hover:text-black transition-colors">
                      Specs
                  </div>
                  <Image src={item.image} alt={item.name} width={200} height={200} className="object-contain group-hover:scale-110 transition-transform duration-500" />
               </div>

               {/* Content */}
               <div className="p-6">
                  <div className="text-xs text-gray-500 mb-2 font-medium">Gaming Gear</div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.name}</h3>
                  <div className="flex items-center justify-between">
                      <span className="text-[#ccff00] font-bold">${item.price.toFixed(2)}</span>
                      <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-[#ccff00] hover:text-black transition-colors">
                          <Plus className="w-4 h-4" />
                      </button>
                  </div>
               </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
