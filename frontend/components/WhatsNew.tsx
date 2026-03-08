"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

const newItems = [
  {
    id: 1,
    title: "Fastest Gaming Processors",
    image: "/images/chip_banner.png", 
    category: "Hardware",
    color: "bg-green-500",
  },
  {
    id: 2,
    title: "Everything You Need For A Smooth Broadcast",
    image: "/images/hero-pc.png", 
    category: "Streaming",
    color: "bg-purple-600",
  },
  {
    id: 3,
    title: "New Gaming Mice",
    image: "/images/hero-headset.png",
    category: "Peripherals",
    color: "bg-blue-500",
  },
  {
    id: 4,
    title: "Game In Full Comfort With Ergonomic Chairs",
    image: "/images/hero-chair.png",
    category: "Furniture",
    color: "bg-orange-500",
  },
  {
    id: 5,
    title: "The Best Consoles Of 2025",
    image: "/images/hero-pc.png",
    category: "Consoles",
    color: "bg-red-500",
  },
];

export function WhatsNew() {
  return (
    <section className="py-20 bg-[#050505] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="text-[#ccff00] text-sm font-bold tracking-widest uppercase">Collections</span>
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
          {newItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="min-w-[280px] md:min-w-[320px] lg:min-w-[360px] h-[450px] relative rounded-3xl overflow-hidden group snap-center border border-white/5 bg-[#0f0f0f]"
            >
              <div className="absolute inset-0">
                 {/* Replace this with actual Next/Image when you have more images */}
                 <div className={`w-full h-full ${item.color} opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />
                 <Image src={item.image} alt={item.title} fill className="object-cover mix-blend-overlay group-hover:scale-110 transition-transform duration-700" />
                 <div className="absolute inset-20 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" /> {/* Keeping subtle gradient for readability only */}
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                 <h3 className="text-2xl font-bold text-white mb-4 leading-tight group-hover:text-[#ccff00] transition-colors">{item.title}</h3>
                 <a href="/collections" className="inline-flex items-center gap-2 text-sm font-bold text-white border-b border-[#ccff00] pb-0.5 hover:text-[#ccff00] transition-colors">
                    Shop Now
                 </a>
              </div>
              
              {/* Badge */}
              {item.id === 1 && (
                  <div className="absolute top-4 left-4 bg-[#ccff00] text-black text-xs font-bold px-3 py-1 rounded-full">
                      New Arrival
                  </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
