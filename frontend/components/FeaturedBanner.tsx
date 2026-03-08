"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function FeaturedBanner() {
  return (
    <section className="py-10 px-6 bg-[#050505]">
      <div className="max-w-[1400px] mx-auto relative rounded-[40px] overflow-hidden min-h-[400px] md:min-h-[600px] flex items-center justify-center border border-white/10 group">
        {/* Background Image */}
        <div className="absolute inset-0">
             <Image 
                src="/images/chip_banner.png" 
                alt="Gaming Processor" 
                fill 
                className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-black/60" /> {/* Dark overlay */}
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-[#ccff00]/10 border border-[#ccff00]/20 rounded-full px-4 py-1.5 mb-8"
            >
                <div className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
                <span className="text-[#ccff00] text-xs font-bold uppercase tracking-wider">Exclusive Technology</span>
            </motion.div>
            
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}
                className="text-5xl md:text-7xl font-bold text-white leading-tight mb-8 tracking-tighter"
            >
                Engineered For The <br />
                Modern Gaming World <br />
                With Unmatched Power
            </motion.h2>

            <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
                viewport={{ once: true }}
                onClick={() => window.location.href = '/collections'}
                className="bg-[#ccff00] text-black font-bold text-lg px-10 py-4 rounded-full hover:bg-white transition-colors shadow-[0_0_20px_rgba(204,255,0,0.3)]"
            >
                Explore Now
            </motion.button>
        </div>
      </div>
    </section>
  );
}
