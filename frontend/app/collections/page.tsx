"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, ShoppingBag, Check } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { useCart } from "@/context/CartContext";

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
}

export default function CollectionsPage() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { addItem } = useCart();
  const [addedId, setAddedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`)
      .then((res) => res.json())
      .then((data: Product[]) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error("Failed to fetch products:", err);
        setLoading(false);
      });
  }, []);

  const handleAddToCart = (product: Product) => {
    addItem(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  if (loading) {
     return (
        <main className="min-h-screen bg-[#050505] pt-32 pb-20 flex items-center justify-center text-white font-mono">
            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}>
              ACCESSING STORE DATA...
            </motion.div>
        </main>
     )
  }

  return (
    <main className="min-h-screen bg-[#050505] pt-32 pb-20">
       <Navbar /> 
       
       <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                  <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter italic mb-2">
                    ALL <span className="text-[#ccff00]">COLLECTIONS</span>
                  </h1>
                  <p className="text-gray-400 max-w-xl">
                      Explore our full range of premium gaming gear. High-performance equipment designed for the ultimate competitive edge.
                  </p>
              </div>
              <div className="text-gray-500 text-sm font-mono border border-white/10 px-4 py-2 rounded-full">
                  Showing {products.length} Products
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {products.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="group relative bg-[#0a0a0a] rounded-3xl overflow-hidden border border-white/5 hover:border-[#ccff00]/50 transition-all duration-300 hover:-translate-y-1"
                >
                   <div className="h-[300px] relative p-8 flex items-center justify-center bg-[#111] overflow-hidden">
                      <div className="absolute top-4 right-4 z-10">
                          <button 
                            onClick={() => handleAddToCart(item)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${addedId === item.id ? 'bg-[#ccff00] text-black' : 'bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-[#ccff00] hover:text-black hover:border-[#ccff00]'}`}
                          >
                              {addedId === item.id ? <Check className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                          </button>
                      </div>
                      <Link href={`/product/${item.id}`} className="block w-full h-full relative">
                        <Image 
                            src={item.image} 
                            alt={item.name} 
                            width={240} 
                            height={240} 
                            className="object-contain w-full h-full group-hover:scale-110 group-hover:rotate-2 transition-transform duration-500" 
                        />
                      </Link>
                      <Link href={`/product/${item.id}`} className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                   </div>

                   <div className="p-6">
                      <div className="flex justify-between items-start gap-4">
                          <Link href={`/product/${item.id}`}>
                            <h3 className="text-lg font-bold text-white group-hover:text-[#ccff00] transition-colors leading-tight cursor-pointer truncate w-full">
                                {item.name}
                            </h3>
                          </Link>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                          <span className="text-white font-mono font-bold text-lg">${parseFloat(item.price).toFixed(2)}</span>
                          <button 
                            onClick={() => handleAddToCart(item)}
                            className={`text-sm font-bold px-5 py-2 rounded-full transition-all flex items-center gap-2 group/btn ${addedId === item.id ? 'bg-[#ccff00] text-black' : 'bg-white text-black hover:bg-[#ccff00]'}`}
                          >
                              {addedId === item.id ? (
                                <>ADDED <Check className="w-3.5 h-3.5" /></>
                              ) : (
                                <>ADD <Plus className="w-3.5 h-3.5 group-hover/btn:rotate-90 transition-transform" /></>
                              )}
                          </button>
                      </div>
                   </div>
                </motion.div>
             ))}
          </div>
       </div>
    </main>
  );
}
