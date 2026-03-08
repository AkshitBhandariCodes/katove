"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const router = useRouter();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-[101] w-full max-w-md h-full bg-[#0a0a0a] border-l border-white/10 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-[#ccff00]" />
                <h2 className="text-xl font-bold text-white">Your Cart ({totalItems})</h2>
              </div>
              <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-[#111] flex items-center justify-center text-gray-600">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Your cart is empty</h3>
                  <p className="text-gray-500">Looks like you haven&apos;t added any elite gear yet.</p>
                  <button 
                    onClick={onClose}
                    className="bg-[#ccff00] text-black font-bold px-8 py-3 rounded-xl hover:bg-[#b3e600] transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-[#111] p-4 rounded-2xl border border-white/5 group relative">
                    <div className="w-20 h-20 bg-black rounded-xl overflow-hidden flex-shrink-0 relative border border-white/5">
                      <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold truncate mb-1">{item.name}</h4>
                      <div className="text-[#ccff00] font-mono font-bold mb-3">${(item.price * item.quantity).toFixed(2)}</div>
                      <div className="flex items-center gap-3">
                         <div className="flex items-center bg-black rounded-lg border border-white/10 px-2 h-8">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:text-[#ccff00]"><Minus className="w-3 h-3" /></button>
                            <span className="w-8 text-center text-sm font-mono">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:text-[#ccff00]"><Plus className="w-3 h-3" /></button>
                         </div>
                         <button onClick={() => removeItem(item.id)} className="text-gray-500 hover:text-red-500 transition-colors ml-auto">
                            <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-white/5 bg-[#0d0d0d] space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-gray-400 text-sm">Subtotal</span>
                  <span className="text-2xl font-bold text-white font-mono">${totalPrice.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500">Shipping and taxes calculated at checkout.</p>
                <button 
                  onClick={() => {
                    onClose();
                    router.push('/checkout');
                  }}
                  className="w-full bg-[#ccff00] text-black font-bold py-4 rounded-xl hover:bg-[#b3e600] transition-all flex items-center justify-center gap-2"
                >
                  Checkout Now <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
