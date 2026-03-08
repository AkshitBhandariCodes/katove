"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Timer } from "lucide-react";

const deals = [
  {
    id: 1,
    name: "Advanced Gaming Mouse",
    originalPrice: "$59.00",
    price: "$39.00",
    image: "/images/hero-pc.png", // Placeholder
  },
  {
    id: 2,
    name: "Over-Ear Wired Headset",
    originalPrice: "$89.00",
    price: "$69.00",
    image: "/images/hero-headset.png",
  },
  {
    id: 3,
    name: "PrimeStation 510 Desktop",
    originalPrice: "$999.00",
    price: "$849.00",
    image: "/images/hero-pc.png",
  },
  {
    id: 4,
    name: "Wireless Gaming Mouse",
    originalPrice: "$79.00",
    price: "$59.00",
    image: "/images/hero-pc.png", // Placeholder
  },
];

export function HotDeals() {
  return (
    <section className="py-20 bg-[#050505]">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
            <div>
                <span className="text-[#ccff00] text-sm font-bold tracking-widest uppercase">Sale</span>
                <h2 className="text-4xl font-bold text-white mt-2">Score Big With Hot Deals</h2>
            </div>
            
            {/* Timer */}
            <div className="hidden md:flex items-center gap-4 border border-[#ccff00]/30 rounded-full px-6 py-2 bg-[#ccff00]/5">
                <Timer className="text-[#ccff00] w-5 h-5" />
                <div className="flex items-center gap-2 font-mono text-xl font-bold text-white">
                    <span>02</span><span className="text-gray-500 text-sm">:</span>
                    <span>02</span><span className="text-gray-500 text-sm">:</span>
                    <span>50</span><span className="text-gray-500 text-sm">:</span>
                    <span className="text-[#ccff00]">43</span>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {deals.map((item, index) => (
                <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                >
                    <div className="relative bg-[#111] rounded-3xl overflow-hidden mb-4 border border-white/5 hover:border-[#ccff00]/50 transition-colors aspect-square flex items-center justify-center p-8">
                        <div className="absolute top-4 right-4 bg-black text-xs font-bold text-gray-300 px-3 py-1 rounded-full border border-white/10">
                            Specs
                        </div>
                        <Image src={item.image} alt={item.name} width={200} height={200} className="object-contain group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1 font-medium">Vault</div>
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#ccff00] transition-colors cursor-pointer">{item.name}</h3>
                        <div className="flex items-center gap-3">
                            <span className="text-white font-bold">{item.price}</span>
                            <span className="text-gray-600 line-through text-sm">{item.originalPrice}</span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
}
