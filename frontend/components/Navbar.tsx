"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, User, ShoppingBag, Menu, X, TrendingUp, Laptop, Monitor, Gamepad2, Headphones, LogOut, ChevronRight, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { AuthModal } from "./AuthModal";
import { CartDrawer } from "./CartDrawer";

export function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsSearchOpen(false);
      router.push(`/collections?search=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between relative z-50">
          <Link href="/" className="text-2xl font-bold tracking-tighter italic text-white flex items-center gap-2">
              KATOVE
          </Link>

          <div className="hidden md:flex items-center gap-8 bg-[#1a1a1a]/50 px-6 py-2.5 rounded-full border border-white/5">
            <NavLink href="/">Store</NavLink>
            <NavLink href="/categories">Classes</NavLink>
            <NavLink href="/collections">Arsenal</NavLink>
            <NavLink href="/track">Track</NavLink>
            <NavLink href="/installments">Finance</NavLink>
            <NavLink href="/affiliate">Partners</NavLink>
            <NavLink href="/contact">Support</NavLink>
            <div className="pl-4 border-l border-white/10 relative">
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${isSearchOpen ? 'bg-[var(--primary-color)] text-black scale-110' : 'text-gray-400 hover:text-white'}`}
              >
                {isSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block" ref={userMenuRef}>
              <button 
                onClick={() => user ? setIsUserMenuOpen(!isUserMenuOpen) : setIsAuthModalOpen(true)}
                className={`flex items-center gap-2 transition-colors ${user ? 'text-[var(--primary-color)]' : 'text-white hover:text-[var(--primary-color)]'}`}
              >
                <User className="w-6 h-6" />
                {user && <span className="hidden lg:block text-sm font-bold truncate max-w-[100px]">{user.name.split(' ')[0]}</span>}
              </button>
              
              <AnimatePresence>
                {isUserMenuOpen && user && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-4 w-48 bg-[#0a0a0a] border border-white/10 rounded-2xl p-2 shadow-2xl"
                  >
                    <div className="px-4 py-3 border-b border-white/5 mb-1">
                      <div className="text-xs text-gray-500 mb-1">Signed in as</div>
                      <div className="text-sm font-bold text-white truncate">{user.email}</div>
                    </div>

                    <Link 
                      href="/account"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 rounded-xl transition-all"
                    >
                      <User className="w-4 h-4" /> Dashboard
                    </Link>
                    
                    <Link 
                      href="/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 rounded-xl transition-all"
                    >
                      <ShoppingBag className="w-4 h-4" /> My Orders
                    </Link>

                    {user?.role === 'admin' && (
                      <Link 
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 rounded-xl transition-all font-bold"
                      >
                        <Settings className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}

                    <button 
                      onClick={() => { logout(); setIsUserMenuOpen(false); }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => setIsCartOpen(true)} className="relative text-white hover:text-[var(--primary-color)] transition-colors group">
              <ShoppingBag className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--primary-color)] text-black text-[10px] font-bold flex items-center justify-center rounded-full animate-in zoom-in">
                  {totalItems}
                </span>
              )}
            </button>
            
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className="md:hidden text-white hover:text-[var(--primary-color)] transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-[80px] left-0 right-0 bg-[#0a0a0a] border-b border-white/10 shadow-2xl z-40 hidden md:block"
            >
              <div className="max-w-[1400px] mx-auto px-6 py-12" ref={searchContainerRef}>
                <div className="max-w-4xl mx-auto space-y-8">
                  <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 text-gray-500 group-focus-within:text-[var(--primary-color)] transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Search for powerful gaming gear..." 
                      className="w-full bg-[#151515] text-white text-3xl font-medium pl-20 pr-8 py-8 rounded-2xl border border-white/5 focus:border-[var(--primary-color)]/50 focus:bg-[#1a1a1a] focus:outline-none placeholder:text-gray-700 transition-all"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearch}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-[var(--primary-color)] uppercase tracking-widest mb-2">
                          <TrendingUp className="w-4 h-4" />
                          <span>Trending Now</span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                          {['RTX 4090', 'Mechanical Keyboards', 'OLED 240Hz', 'Liquid Cooling'].map((term) => (
                              <button key={term} className="text-sm text-gray-300 bg-[#1a1a1a] hover:bg-[#252525] hover:text-white px-5 py-2.5 rounded-lg border border-white/5 transition-all">
                                  {term}
                              </button>
                          ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                       <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Browse Categories</h3>
                       <div className="grid grid-cols-2 gap-4">
                          <CategoryItem icon={Laptop} label="Gaming Laptops" />
                          <CategoryItem icon={Monitor} label="Monitors" />
                          <CategoryItem icon={Gamepad2} label="Peripherals" />
                          <CategoryItem icon={Headphones} label="Audio Gear" />
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col h-full p-6">
              <div className="flex items-center justify-between mb-8">
                <Link href="/" className="text-2xl font-bold tracking-tighter italic text-white" onClick={() => setIsMobileMenuOpen(false)}>
                  KATOVE
                </Link>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto">
                 {/* Search Mobile */}
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Search..." 
                      className="w-full bg-[#111] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-[var(--primary-color)] transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if(e.key === 'Enter') {
                           setIsMobileMenuOpen(false);
                           router.push(`/collections?search=${encodeURIComponent(searchQuery)}`);
                        }
                      }}
                    />
                 </div>

                 <nav className="flex flex-col gap-2">
                    <MobileNavLink href="/" onClick={() => setIsMobileMenuOpen(false)}>Store</MobileNavLink>
                    <MobileNavLink href="/categories" onClick={() => setIsMobileMenuOpen(false)}>Classes</MobileNavLink>
                    <MobileNavLink href="/collections" onClick={() => setIsMobileMenuOpen(false)}>Arsenal</MobileNavLink>
                    <MobileNavLink href="/track" onClick={() => setIsMobileMenuOpen(false)}>Track Cargo</MobileNavLink>
                    <MobileNavLink href="/installments" onClick={() => setIsMobileMenuOpen(false)}>Financing</MobileNavLink>
                    <MobileNavLink href="/affiliate" onClick={() => setIsMobileMenuOpen(false)}>Creator Hub</MobileNavLink>
                    <MobileNavLink href="/contact" onClick={() => setIsMobileMenuOpen(false)}>Intel / Support</MobileNavLink>
                 </nav>

                 <div className="pt-6 border-t border-white/10">
                    {user ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 px-4 py-2 bg-[#111] rounded-xl border border-white/5">
                           <div className="w-10 h-10 rounded-full bg-[var(--primary-color)]/10 flex items-center justify-center text-[var(--primary-color)]">
                              <User className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="text-sm font-bold text-white">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                           </div>
                        </div>
                        <Link 
                          href="/account" 
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:bg-white/5 rounded-xl transition-all"
                        >
                           <User className="w-5 h-5" /> Dashboard
                        </Link>
                        <Link 
                          href="/orders" 
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:bg-white/5 rounded-xl transition-all"
                        >
                           <ShoppingBag className="w-5 h-5" /> My Orders
                        </Link>
                        {user.role === 'admin' && (
                          <Link 
                            href="/admin" 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 rounded-xl transition-all font-bold"
                          >
                             <Settings className="w-5 h-5" /> Admin Panel
                          </Link>
                        )}
                        <button 
                           onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                           className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                           <LogOut className="w-5 h-5" /> Sign Out
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }}
                        className="w-full bg-[var(--primary-color)] text-black font-bold py-4 rounded-xl hover:bg-[#b3e600] transition-colors"
                      >
                        Sign In / Register
                      </button>
                    )}
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm top-[80px] hidden md:block" />
        )}
      </AnimatePresence>
    </>
  );
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className="text-2xl font-bold text-white hover:text-[var(--primary-color)] py-4 border-b border-white/5 flex items-center justify-between group"
    >
      {children}
      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-[var(--primary-color)] transition-colors" /> 
    </Link>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-1 relative group"
    >
      {children}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[var(--primary-color)] transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}

function CategoryItem({ icon: Icon, label }: { icon: React.ElementType, label: string }) {
  return (
    <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#1a1a1a] border border-transparent hover:border-white/5 transition-all group text-left">
      <div className="w-10 h-10 rounded-lg bg-[#151515] flex items-center justify-center text-gray-400 group-hover:text-[var(--primary-color)] group-hover:bg-black transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-gray-300 group-hover:text-white font-medium">{label}</span>
    </button>
  );
}
