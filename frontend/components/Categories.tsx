"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function Categories() {
  return (
    <section className="py-20 bg-[#0a0a0a]">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="mb-12">
            <span className="text-[#ccff00] text-sm font-bold tracking-widest uppercase">Categories</span>
            <h2 className="text-4xl font-bold text-white mt-2">Shop Across Categories</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-auto md:h-[600px]">
            {/* Big Card - PCs */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative rounded-[40px] overflow-hidden border border-white/5 group bg-[#111] h-[500px] md:h-auto"
            >
                <div className="absolute inset-x-0 top-0 p-10 z-10 text-center">
                    <h3 className="text-3xl font-bold text-white mb-2">Gaming PCs</h3>
                    <p className="text-gray-400 mb-6 font-medium">High-performance systems for every playstyle.</p>
                    <button 
                        onClick={() => window.location.href = '/collections'}
                        className="px-6 py-2 rounded-full border border-white/20 text-white font-bold text-sm hover:bg-[#ccff00] hover:text-black hover:border-[#ccff00] transition-all"
                    >
                        Shop Now
                    </button>
                </div>
                <div className="absolute inset-0 pt-32 flex items-center justify-center">
                    <Image src="/categories/pc_view.png" alt="Gaming PC" width={500} height={500} className="object-contain group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
            </motion.div>

            {/* Right Side Grid */}
            <div className="flex flex-col gap-6 md:grid md:grid-rows-2">
                <div className="grid grid-cols-2 gap-6 h-[280px] md:h-auto">
                    {/* Mice */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="relative rounded-[40px] overflow-hidden border border-white/5 group bg-[#111] p-6 flex flex-col items-center text-center"
                    >
                         <h3 className="text-xl font-bold text-white mb-1">Mice</h3>
                         <p className="text-xs text-gray-500 mb-4">Speed and control.</p>
                         <button 
                            onClick={() => window.location.href = '/collections'}
                            className="px-4 py-1.5 rounded-full border border-white/20 text-white text-xs font-bold hover:bg-[#ccff00] hover:text-black hover:border-[#ccff00] transition-colors mb-4"
                        >
                            Shop Now
                        </button>
                        <div className="flex-1 w-full relative">
                            <Image src="/categories/mice_view.png" alt="Mouse" fill className="object-contain p-2 group-hover:scale-110 transition-transform" />
                        </div>
                    </motion.div>

                    {/* Keyboards */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="relative rounded-[40px] overflow-hidden border border-white/5 group bg-[#111] p-6 flex flex-col items-center text-center"
                    >
                         <h3 className="text-xl font-bold text-white mb-1">Keyboards</h3>
                         <p className="text-xs text-gray-500 mb-4">Responsive play.</p>
                         <button 
                            onClick={() => window.location.href = '/collections'}
                            className="px-4 py-1.5 rounded-full border border-white/20 text-white text-xs font-bold hover:bg-[#ccff00] hover:text-black hover:border-[#ccff00] transition-colors mb-4"
                        >
                            Shop Now
                        </button>
                         <div className="flex-1 w-full relative">
                            <Image src="/categories/keyboard_view.png" alt="Keyboard" fill className="object-contain p-2 group-hover:scale-110 transition-transform" />
                        </div>
                    </motion.div>
                </div>

                {/* Chairs */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="relative rounded-[40px] overflow-hidden border border-white/5 group bg-[#111] flex items-center justify-between p-10 h-[280px] md:h-auto"
                >
                    <div className="z-10 relative max-w-[50%]">
                        <h3 className="text-2xl font-bold text-white mb-2">Chairs</h3>
                        <p className="text-gray-400 mb-6 text-sm">Ergonomic chairs for gaming comfort.</p>
                        <button 
                            onClick={() => window.location.href = '/collections'}
                            className="px-6 py-2 rounded-full border border-white/20 text-white font-bold text-sm hover:bg-[#ccff00] hover:text-black hover:border-[#ccff00] transition-all"
                        >
                            Shop Now
                        </button>
                    </div>
                     <div className="absolute right-0 top-0 bottom-0 w-1/2">
                        <Image src="/categories/chair_view.png" alt="Chair" fill className="object-contain p-4 group-hover:scale-105 transition-transform" />
                    </div>
                </motion.div>
            </div>
        </div>
      </div>
    </section>
  );
}
