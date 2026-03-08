"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Truck, Headphones } from 'lucide-react';
import { usePathname } from 'next/navigation';

const Footer = () => {
    const pathname = usePathname();

    if (pathname?.startsWith('/admin')) {
        return null;
    }

    return (
        <footer className="w-full bg-[#0a0a0a] border-t border-white/10 pt-20 pb-10">
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="md:col-span-5 space-y-6">
                        <Link href="/" className="text-3xl font-bold tracking-tighter italic text-white flex items-center gap-2">
                            KATOVE
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                            Premium gaming gear for the ultimate performance. Elevate your setup with our curated collection of high-end peripherals and hardware designed for champions.
                        </p>
                    </div>

                    {/* Newsletter */}
                    <div className="md:col-span-7">
                        <h3 className="text-white font-bold mb-6 tracking-wide">STAY UPDATED</h3>
                        <div className="bg-[#151515] p-6 rounded-2xl border border-white/5">
                            <p className="text-gray-400 text-sm mb-4">
                                Subscribe for exclusive deals, new product drops, and gaming news.
                            </p>
                            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                                <div className="relative">
                                    <input 
                                        type="email" 
                                        placeholder="Enter your email" 
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition-all placeholder:text-gray-600"
                                    />
                                    <button 
                                        type="submit"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#ccff00] rounded-lg text-black hover:bg-[#b3e600] transition-colors"
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-600">
                                    By subscribing, you agree to our Privacy Policy.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10 border-t border-white/5 mb-10">
                    <TrustBadge icon={Truck} title="Free Shipping" desc="On all orders over $150" />
                    <TrustBadge icon={ShieldCheck} title="2 Year Warranty" desc="Comprehensive coverage" />
                    <TrustBadge icon={Headphones} title="24/7 Support" desc="Expert assistance anytime" />
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-xs">
                        © 2026 Katove. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="/affiliate" className="text-xs text-[#ccff00] hover:text-white transition-colors font-bold uppercase tracking-widest">Partner Program</Link>
                        <Link href="#" className="text-xs text-gray-500 hover:text-white transition-colors">Terms</Link>
                        <Link href="#" className="text-xs text-gray-500 hover:text-white transition-colors">Privacy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

function TrustBadge({ icon: Icon, title, desc }: { icon: React.ElementType, title: string, desc: string }) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-[#151515]/50 border border-white/5">
            <div className="w-12 h-12 rounded-full bg-[#ccff00]/10 flex items-center justify-center text-[#ccff00]">
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <h4 className="text-white font-bold text-sm">{title}</h4>
                <p className="text-gray-500 text-xs">{desc}</p>
            </div>
        </div>
    );
}

export default Footer;
