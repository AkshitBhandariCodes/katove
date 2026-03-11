"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { getApiUrl } from "@/utils/api";
import catMice from "@/assets/image copy 2.png";
import catKeyboards from "@/assets/image copy.png";
import catChairs from "@/assets/image.png";
import catPC from "@/assets/image copy 5.png";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

const fallbackImages: Record<string, any> = {
  mice: catMice,
  keyboards: catKeyboards,
  chairs: catChairs,
  pcs: catPC,
  "gaming-pcs": catPC,
};

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch(getApiUrl("/api/categories"))
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(err => console.error("Failed to fetch categories", err));
  }, []);

  const getCatImage = (cat: Category) => {
    if (cat.image_url) return cat.image_url;
    const key = cat.slug?.toLowerCase() || cat.name?.toLowerCase();
    for (const [k, v] of Object.entries(fallbackImages)) {
      if (key.includes(k)) return v;
    }
    return catPC;
  };

  // Use first 4 categories, or fallback layout
  const mainCat = categories[0];
  const smallCats = categories.slice(1, 3);
  const wideCat = categories[3];

  if (categories.length === 0) {
    // Fallback to static layout
    return (
      <section className="py-20 bg-[#0a0a0a]">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-12">
            <span className="text-[var(--primary-color)] text-sm font-bold tracking-widest uppercase">Categories</span>
            <h2 className="text-4xl font-bold text-white mt-2">Shop Across Categories</h2>
          </div>
          <div className="text-center py-20 text-gray-600">Loading categories...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-[#0a0a0a]">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="mb-12">
            <span className="text-[var(--primary-color)] text-sm font-bold tracking-widest uppercase">Categories</span>
            <h2 className="text-4xl font-bold text-white mt-2">Shop Across Categories</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-auto md:h-[600px]">
            {/* Big Card - First Category */}
            {mainCat && (
              <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="relative rounded-[40px] overflow-hidden border border-white/5 group bg-[#111] h-[500px] md:h-auto cursor-pointer"
                  onClick={() => window.location.href = `/categories?cat=${mainCat.slug}`}
              >
                  <div className="absolute inset-x-0 top-0 p-10 z-10 text-center">
                      <h3 className="text-3xl font-bold text-white mb-2">{mainCat.name}</h3>
                      <p className="text-gray-400 mb-6 font-medium">{mainCat.description || `Explore ${mainCat.name}`}</p>
                      <button className="px-6 py-2 rounded-full border border-white/20 text-white font-bold text-sm hover:bg-[var(--primary-color)] hover:text-black hover:border-[var(--primary-color)] transition-all">
                          Shop Now
                      </button>
                  </div>
                  <div className="absolute inset-0 pt-32 flex items-center justify-center">
                      <Image src={getCatImage(mainCat)} alt={mainCat.name} width={500} height={500} className="object-contain group-hover:scale-105 transition-transform duration-700" unoptimized={!!mainCat.image_url} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
              </motion.div>
            )}

            {/* Right Side Grid */}
            <div className="flex flex-col gap-6 md:grid md:grid-rows-2">
                <div className="grid grid-cols-2 gap-6 h-[280px] md:h-auto">
                    {smallCats.map((cat, i) => (
                      <motion.div 
                          key={cat.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 * (i + 1) }}
                          className="relative rounded-[40px] overflow-hidden border border-white/5 group bg-[#111] p-6 flex flex-col items-center text-center cursor-pointer"
                          onClick={() => window.location.href = `/categories?cat=${cat.slug}`}
                      >
                           <h3 className="text-xl font-bold text-white mb-1">{cat.name}</h3>
                           <p className="text-xs text-gray-500 mb-4">{cat.description || `Browse ${cat.name}`}</p>
                           <button className="px-4 py-1.5 rounded-full border border-white/20 text-white text-xs font-bold hover:bg-[var(--primary-color)] hover:text-black hover:border-[var(--primary-color)] transition-colors mb-4">
                              Shop Now
                          </button>
                          <div className="flex-1 w-full relative">
                              <Image src={getCatImage(cat)} alt={cat.name} fill className="object-contain p-2 group-hover:scale-110 transition-transform" unoptimized={!!cat.image_url} />
                          </div>
                      </motion.div>
                    ))}
                    {smallCats.length < 2 && (
                      <div className="relative rounded-[40px] overflow-hidden border border-white/5 bg-[#111] p-6 flex flex-col items-center justify-center text-center">
                        <p className="text-gray-600 text-sm">More Categories Coming Soon</p>
                      </div>
                    )}
                </div>

                {/* Wide Bottom Category */}
                {wideCat ? (
                  <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                      className="relative rounded-[40px] overflow-hidden border border-white/5 group bg-[#111] flex items-center justify-between p-10 h-[280px] md:h-auto cursor-pointer"
                      onClick={() => window.location.href = `/categories?cat=${wideCat.slug}`}
                  >
                      <div className="z-10 relative max-w-[50%]">
                          <h3 className="text-2xl font-bold text-white mb-2">{wideCat.name}</h3>
                          <p className="text-gray-400 mb-6 text-sm">{wideCat.description || `Explore ${wideCat.name}`}</p>
                          <button className="px-6 py-2 rounded-full border border-white/20 text-white font-bold text-sm hover:bg-[var(--primary-color)] hover:text-black hover:border-[var(--primary-color)] transition-all">
                              Shop Now
                          </button>
                      </div>
                      <div className="absolute right-0 bottom-0 w-[60%] h-[90%]">
                          <Image src={getCatImage(wideCat)} alt={wideCat.name} fill className="object-contain group-hover:scale-105 transition-transform" unoptimized={!!wideCat.image_url} />
                      </div>
                  </motion.div>
                ) : (
                  <div className="relative rounded-[40px] overflow-hidden border border-white/5 bg-[#111] p-10 flex items-center justify-center h-[280px] md:h-auto">
                    <p className="text-gray-600 text-sm">More Categories Coming Soon</p>
                  </div>
                )}
            </div>
        </div>
      </div>
    </section>
  );
}
