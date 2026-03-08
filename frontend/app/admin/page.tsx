"use client";

import React, { useState, useEffect } from "react";
import { getApiUrl } from "@/utils/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/utils/supabase";
import Image from "next/image";
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  LogOut, 
  Loader2, 
  X, 
  Upload, 
  Check, 
  AlertCircle,
  DollarSign,
  Settings,
  Menu,
  ShoppingBag,
  ChevronRight,
  ExternalLink,
  CreditCard,
  Users,
  FolderTree,
  Monitor,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---

interface Product {
  id: string;
  name: string;
  price: number;
  cost_price?: number;
  selling_price?: number;
  discount_price?: number;
  stock?: number;
  category_id?: string;
  description: string;
  image: string;
  installment_eligible?: boolean;
  seo_title?: string;
  seo_description?: string;
  og_image_url?: string;
  category?: { id: string; name: string };
}

// --- Main Component ---

export default function AdminPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)]" />
        {!isLoading && (!user || user.role !== 'admin') && (
          <p className="text-red-500 font-bold animate-pulse">Access Denied. Relocating...</p>
        )}
      </div>
    );
  }

  return <Dashboard onLogout={() => router.push("/")} />;
}



// --- Dashboard Component ---

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<'products' | 'orders' | 'settings' | 'installments' | 'affiliates' | 'categories'>('products');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleViewChange = (newView: 'products' | 'orders' | 'settings' | 'installments' | 'affiliates' | 'categories') => {
    setView(newView);
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex overflow-hidden font-sans">
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0a0a0a] border-b border-white/5 z-40 flex items-center justify-between px-4">
        <div className="text-xl font-black italic text-white flex items-center gap-1">
            KATOVE<span className="text-[var(--primary-color)]">.</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-400 hover:text-white">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar Backdrop (Mobile) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 w-72 bg-[#0a0a0a] border-r border-white/5 z-50 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-8 hidden md:block">
            <div className="text-2xl font-black italic text-white flex items-center gap-2">
                KATOVE<span className="text-[var(--primary-color)]">.</span>
            </div>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em] mt-2">Command Center</p>
        </div>

        {/* Mobile Header in Sidebar */}
        <div className="md:hidden p-6 flex justify-between items-center border-b border-white/5">
             <div className="text-xl font-black italic text-white flex items-center gap-1">
                MENU
            </div>
            <button onClick={() => setIsSidebarOpen(false)}>
                <X className="w-6 h-6 text-gray-500" />
            </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <SidebarItem 
                active={view === 'products'} 
                icon={<Package className="w-5 h-5" />} 
                label="Products" 
                onClick={() => handleViewChange('products')} 
            />
            <SidebarItem 
                active={view === 'orders'} 
                icon={<ShoppingBag className="w-5 h-5" />} 
                label="Orders" 
                onClick={() => handleViewChange('orders')} 
            />
            <SidebarItem 
                active={view === 'categories'} 
                icon={<FolderTree className="w-5 h-5" />} 
                label="Categories" 
                onClick={() => handleViewChange('categories')} 
            />
            <SidebarItem 
                active={view === 'installments'} 
                icon={<CreditCard className="w-5 h-5" />} 
                label="Installments" 
                onClick={() => handleViewChange('installments')} 
            />
            <SidebarItem 
                active={view === 'affiliates'} 
                icon={<Users className="w-5 h-5" />} 
                label="Affiliates" 
                onClick={() => handleViewChange('affiliates')} 
            />
            <SidebarItem 
                active={view === 'settings'} 
                icon={<Settings className="w-5 h-5" />} 
                label="Settings" 
                onClick={() => handleViewChange('settings')} 
            />
        </nav>

        <div className="p-6 border-t border-white/5 bg-[#0a0a0a]">
            <div className="bg-[#111] p-4 rounded-2xl mb-4 border border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 rounded-full bg-[var(--primary-color)] animate-pulse shadow-[0_0_10px_#ccff00]" />
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">System Status</span>
              </div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">All Systems Operational</div>
            </div>
            <button 
                onClick={onLogout}
                className="flex items-center gap-3 w-full px-6 py-4 text-gray-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all font-bold group"
            >
                <LogOut className="w-5 h-5 group-hover:text-red-500 transition-colors" />
                <span className="uppercase text-xs tracking-widest">Terminate Session</span>
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen pt-16 md:pt-0 bg-[#050505] relative">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none fixed"></div>
        <div className="max-w-7xl mx-auto p-6 md:p-12 pb-32">
            <AnimatePresence mode="wait">
                <motion.div
                    key={view}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {view === 'products' && <ProductManager />}
                    {view === 'orders' && <OrdersManager />}
                    {view === 'categories' && <CategoriesManager />}
                    {view === 'installments' && <InstallmentsManager />}
                    {view === 'affiliates' && <AffiliatesManager />}
                    {view === 'settings' && <SettingsManager />}
                </motion.div>
            </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-4 w-full px-6 py-4 rounded-xl transition-all border group relative overflow-hidden ${
                active 
                    ? 'bg-[var(--primary-color)] text-black border-[var(--primary-color)] shadow-[0_0_20px_rgba(204,255,0,0.2)]' 
                    : 'bg-transparent text-gray-500 hover:text-white hover:bg-white/5 border-transparent'
            }`}
        >
            <div className={`relative z-10 ${active ? 'text-black' : 'group-hover:text-white transition-colors'}`}>
                {icon}
            </div>
            <span className={`font-bold uppercase tracking-widest text-xs relative z-10 ${active ? 'text-black' : ''}`}>{label}</span>
            {active && <ChevronRight className="w-4 h-4 ml-auto text-black relative z-10" />}
        </button>
    )
}

// --- Product Manager ---

function ProductManager() {
    const { token } = useAuth();
    const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const fetchProducts = async () => {
        try {
            const res = await fetch(getApiUrl("/api/products"));
            const data = await res.json();
            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch products", error);
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        
        try {
            const res = await fetch(getApiUrl(`/api/products/${id}`), {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                setProducts(products.filter(p => p.id !== id));
            } else {
                alert("Failed to delete product");
            }
        } catch {
            alert("Error deleting product");
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setMode('edit');
    };

    if (mode === 'create' || mode === 'edit') {
        return (
            <ProductForm 
                mode={mode} 
                initialData={editingProduct} 
                onCancel={() => {
                    setMode('list');
                    setEditingProduct(null);
                }}
                onSuccess={() => {
                    setMode('list');
                    setEditingProduct(null);
                    fetchProducts();
                }}
            />
        );
    }

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter">Inventory <span className="text-[var(--primary-color)]">Matrix</span></h2>
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-2">{products.length} Units Active on Mainframe</p>
                </div>
                <button 
                    onClick={() => setMode('create')}
                    className="bg-[var(--primary-color)] text-black px-8 py-4 rounded-2xl font-black hover:bg-[#d9ff33] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase text-sm shadow-[0_0_20px_rgba(204,255,0,0.3)]"
                >
                    <Plus className="w-5 h-5 stroke-[3px]" />
                    Deploy New Unit
                </button>
            </header>

            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-4 flex gap-4 backdrop-blur-xl">
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                    <input 
                        type="text" 
                        placeholder="Search inventory database..." 
                        className="w-full bg-black/50 border border-white/5 rounded-2xl pl-16 pr-6 py-5 text-white focus:outline-none focus:border-[var(--primary-color)]/50 focus:bg-black transition-all placeholder:text-gray-700 text-sm font-medium"
                    />
                </div>
            </div>

            {isLoading ? (
                 <div className="flex flex-col items-center justify-center p-20 gap-4">
                     <Loader2 className="w-10 h-10 animate-spin text-[var(--primary-color)]" />
                     <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest animate-pulse">Synchronizing Database...</span>
                 </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    <AnimatePresence>
                        {products.map((product) => (
                            <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-5 flex flex-col md:flex-row items-center gap-8 hover:border-[var(--primary-color)]/30 hover:bg-[#0f0f0f] transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[var(--primary-color)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                
                                <div className="w-full md:w-32 h-32 bg-black rounded-2xl flex items-center justify-center p-4 relative overflow-hidden flex-shrink-0 border border-white/5 group-hover:border-[var(--primary-color)]/20 transition-colors">
                                     <div className="relative w-full h-full p-2">
                                        <Image 
                                            src={product.image && product.image.trim() !== '' ? product.image : '/placeholder-image.png'} 
                                            alt={product.name} 
                                            fill
                                            className="object-contain group-hover:scale-110 transition-transform duration-500"
                                        />
                                     </div>
                                </div>
                                <div className="flex-1 text-center md:text-left w-full">
                                    <div className="text-[10px] font-black text-[var(--primary-color)] uppercase tracking-tighter mb-1 select-none opacity-50">SKU: {String(product.id).padStart(8, '0')}</div>
                                    <h3 className="text-xl md:text-2xl font-black italic text-white uppercase tracking-tighter mb-2 group-hover:text-[var(--primary-color)] transition-colors line-clamp-1">{product.name}</h3>
                                    <p className="text-sm text-gray-500 font-medium line-clamp-2 max-w-xl">{product.description}</p>
                                </div>
                                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end relative z-10">
                                    <div className="px-6 py-3 bg-black rounded-xl border border-white/5 text-xl font-mono text-[var(--primary-color)] font-black tracking-tighter shadow-inner">
                                        ${parseFloat(String(product.price)).toFixed(2)}
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleEdit(product)}
                                            className="w-12 h-12 bg-white/5 hover:bg-white text-gray-400 hover:text-black rounded-xl transition-all flex items-center justify-center relative z-20"
                                            title="Edit"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(product.id)}
                                            className="w-12 h-12 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all flex items-center justify-center"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    
                    {products.length === 0 && (
                        <div className="text-center py-40 bg-[#0a0a0a] rounded-[3rem] border border-white/5 border-dashed flex flex-col items-center gap-6">
                            <Package className="w-16 h-16 text-gray-800" />
                            <div>
                              <h3 className="text-xl font-bold text-gray-600 uppercase">Inventory Empty</h3>
                              <p className="text-gray-700 font-mono text-xs mt-2 uppercase tracking-widest">No units detected in vault</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// --- Orders Manager Quote ---


// --- Orders Manager ---

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

interface ShippingAddress {
    address: string;
    city: string;
    zip: string;
}

interface Order {
    id: string;
    items: { product_name: string; quantity: number; price: number }[];
    total: number;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    phone?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    notes?: string;
    user: { name: string; email: string; id: string };
    status: string;
    created_at: string;
    payment_proof_url: string | null;
    is_installment?: boolean;
}

function OrdersManager() {
    const { token } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchOrders = async () => {
        try {
            const res = await fetch(getApiUrl("/api/orders"), {
                 headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch orders", error);
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        setUpdatingId(id);
        try {
            const res = await fetch(getApiUrl(`/api/orders/${id}/status`), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            if (res.ok) {
                setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
            }
        } catch (error) {
            console.error("Failed to update status", error);
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'payment_pending': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            case 'payment_verification': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'payment_confirmed': return 'text-[var(--primary-color)] bg-[var(--primary-color)]/10 border-[var(--primary-color)]/20';
            case 'order_received': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
            case 'preparing_package': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
            case 'courier_picked_up': return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
            case 'out_for_delivery': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
            case 'delivered': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'rejected_returned': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'canceled': return 'text-red-500 bg-red-500/10 border-red-500/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    return (
        <div className="space-y-10">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter">Order <span className="text-[var(--primary-color)]">Log</span></h2>
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-2">{orders.length} Transactions Recorded</p>
                </div>
                <button 
                    onClick={fetchOrders}
                    className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all border border-white/5"
                    title="Refresh"
                >
                    <Loader2 className={`w-5 h-5 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </header>

            {orders.filter(o => !o.is_installment).length === 0 && !isLoading ? (
                <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-10 min-h-[400px] flex flex-col items-center justify-center text-center">
                    <ShoppingBag className="w-20 h-20 text-gray-800 mb-6" />
                    <h3 className="text-2xl font-black text-white uppercase italic">No Orders Detected</h3>
                    <p className="text-gray-600 font-mono text-sm max-w-sm mt-2">
                        System is actively scanning for incoming transfers. Stand by for updates.
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {orders.filter(o => !o.is_installment).map((order) => (
                        <motion.div 
                            key={order.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-8 hover:border-[var(--primary-color)]/30 transition-all group"
                        >
                            <div className="flex flex-col md:flex-row gap-8 justify-between">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                                            ID: {order.id.slice(-6)}
                                        </span>
                                        <span className="text-xs text-gray-500 font-mono">
                                            {new Date(order.created_at || (order as any).createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">{order.first_name || order.user?.name} {order.last_name}</h3>
                                            <p className="text-sm text-gray-400 font-mono">{order.email}</p>
                                            <p className="text-sm text-[var(--primary-color)] font-bold mt-1">{order.phone}</p>
                                        </div>
                                        <div className="text-xs text-gray-400 border-l border-white/10 pl-4 space-y-1">
                                            <p className="font-bold uppercase text-[10px] text-gray-600">Shipment Vector</p>
                                            <p>{order.address_line_1}</p>
                                            {order.address_line_2 && <p>{order.address_line_2}</p>}
                                            <p>{order.city}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="text-xs bg-black border border-white/10 px-3 py-1.5 rounded-lg text-gray-300">
                                                <span className="text-[var(--primary-color)] font-bold">{item.quantity}x</span> {item.product_name || (item as any).name}
                                            </div>
                                        ))}
                                    </div>

                                    {order.notes && (
                                        <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/5 text-xs text-gray-400 italic">
                                            <span className="text-white font-bold block mb-1 uppercase text-[10px] not-italic">Order Memo:</span>
                                            "{order.notes}"
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col items-end gap-6 min-w-[200px]">
                                    <div className="text-right">
                                        <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Value</div>
                                        <div className="text-3xl font-black italic text-[var(--primary-color)] font-mono">
                                            ${order.total.toFixed(2)}
                                        </div>
                                    </div>

                                    <div className={`px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${getStatusColor(order.status)}`}>
                                        <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                                        {order.status}
                                    </div>

                                    <div className="flex items-center gap-3 w-full justify-end">
                                        {order.payment_proof_url && (
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1">
                                                    <Check className="w-3 h-3" /> Payment Submitted
                                                </div>
                                            </div>
                                        )}
                                        
                                        <select 
                                            value={order.status}
                                            onChange={(e) => updateStatus(order.id, e.target.value)}
                                            disabled={updatingId === order.id}
                                            className="bg-[#111] text-white text-xs font-bold border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-[var(--primary-color)] cursor-pointer"
                                        >
                                            <option value="order_received">Order Received</option>
                                            <option value="payment_pending">Payment Pending</option>
                                            <option value="payment_verification">Payment Verification</option>
                                            <option value="payment_confirmed">Payment Confirmed</option>
                                            <option value="preparing_package">Preparing Package</option>
                                            <option value="courier_picked_up">Courier Picked Up</option>
                                            <option value="out_for_delivery">Out for Delivery</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="rejected_returned">Rejected / Returned</option>
                                            <option value="canceled">Canceled</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}

// --- Settings Manager Quote ---


// --- Product Form ---

function ProductForm({ mode, initialData, onCancel, onSuccess }: { mode: 'create' | 'edit'; initialData: Product | null; onCancel: () => void; onSuccess: () => void }) {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.image || null);
    
    const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        price: initialData?.selling_price || initialData?.price || "",
        cost_price: initialData?.cost_price || "",
        discount_price: initialData?.discount_price || "",
        stock: initialData?.stock || 0,
        description: initialData?.description || "",
        category_id: initialData?.category_id || "",
        installment_eligible: initialData?.installment_eligible || false,
        seo_title: initialData?.seo_title || "",
        seo_description: initialData?.seo_description || "",
        og_image_url: initialData?.og_image_url || "",
        image: null as File | null,
    });

    useEffect(() => {
        fetch(getApiUrl("/api/categories"))
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(err => console.error("Failed to load categories", err));
    }, []);

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData(prev => ({ ...prev, image: file }));
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("selling_price", String(formData.price));
            data.append("cost_price", String(formData.cost_price || '0'));
            if (formData.discount_price) data.append("discount_price", String(formData.discount_price));
            data.append("stock", String(formData.stock || '0'));
            if (formData.category_id && formData.category_id !== "") {
                data.append("category_id", formData.category_id);
            }
            data.append("installment_eligible", String(formData.installment_eligible));
            if (formData.seo_title) data.append("seo_title", formData.seo_title);
            if (formData.seo_description) data.append("seo_description", formData.seo_description);
            if (formData.og_image_url) data.append("og_image_url", formData.og_image_url);
            
            // Sync with backend 'images' field (supporting multi-upload in future)
            if (formData.image) {
                data.append("images", formData.image);
            }

            const url = mode === 'create' 
                ? getApiUrl("/api/products") 
                : getApiUrl(`/api/products/${initialData?.id}`);
            
            const method = mode === 'create' ? "POST" : "PUT";

            const res = await fetch(url, {
                method,
                body: data,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                let errMessage = "Protocol Error";
                try {
                    const contentType = res.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const errData = await res.json();
                        errMessage = errData.message || errMessage;
                    } else {
                        const text = await res.text();
                        console.error("Non-JSON error response:", text);
                        errMessage = `Server Error: ${res.status}`;
                    }
                } catch (e) { console.error(e); }
                throw new Error(errMessage);
            }

            onSuccess();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Critical System Failure";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto"
        >
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-6">
                  <button 
                      onClick={onCancel}
                      className="w-14 h-14 bg-[#111] hover:bg-white text-white hover:text-black rounded-2xl transition-all flex items-center justify-center border border-white/5"
                  >
                      <X className="w-6 h-6 stroke-[3px]" />
                  </button>
                  <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter">
                      {mode === 'create' ? 'Unit Deployment' : 'Reconfiguration'}
                  </h2>
                </div>
            </div>

            <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-[var(--primary-color)] to-transparent" />
                
                <form onSubmit={handleSubmit} className="space-y-12">
                    <div className="flex flex-col md:flex-row gap-12">
                        <div className="flex-shrink-0">
                            <div className="relative group">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden" 
                                    id="image-upload"
                                />
                                <label 
                                    htmlFor="image-upload" 
                                    className={`
                                        relative flex flex-col items-center justify-center w-full md:w-80 h-80 rounded-[2.5rem] 
                                        border-2 border-dashed transition-all cursor-pointer overflow-hidden
                                        ${previewUrl ? 'border-[var(--primary-color)] bg-black shadow-[0_0_30px_rgba(204,255,0,0.1)]' : 'border-white/5 bg-black hover:border-[var(--primary-color)]/30 hover:bg-[#111]'}
                                    `}
                                >
                                    {previewUrl ? (
                                        <>
                                            <Image src={previewUrl} alt="Preview" fill className="object-contain p-8 group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                                                <Upload className="w-10 h-10 text-[var(--primary-color)] mb-2" />
                                                <span className="text-white font-black uppercase text-xs tracking-widest">Update Visuals</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-700">
                                            <Upload className="w-12 h-12 mb-4" />
                                            <span className="font-black uppercase text-xs tracking-widest">Upload Visual Proxy</span>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>

                        <div className="flex-1 space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Hardware Designation</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 text-white font-bold focus:outline-none focus:border-[var(--primary-color)] transition-all placeholder:text-gray-800"
                                    placeholder="e.g. TITAN-PRO KEYBOARD"
                                />
                            </div>
                            
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Market Value Configuration</label>
                                <div className="relative">
                                  <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700" />
                                  <input 
                                      type="number" 
                                      name="price"
                                      value={formData.price}
                                      onChange={handleInputChange}
                                      required
                                      step="0.01"
                                      className="w-full bg-black border border-white/5 rounded-2xl pl-16 pr-6 py-4 text-white font-mono font-black text-xl focus:outline-none focus:border-[var(--primary-color)] transition-all placeholder:text-gray-800"
                                      placeholder="000.00"
                                  />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Tactical Specifications</label>
                        <textarea 
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            rows={5}
                            className="w-full bg-black border border-white/5 rounded-3xl px-8 py-6 text-white text-lg leading-relaxed focus:outline-none focus:border-[var(--primary-color)] transition-all resize-none placeholder:text-gray-800"
                            placeholder="Detail the technical superiority of this unit..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Cost Price (Admin Only)</label>
                            <input type="number" name="cost_price" value={formData.cost_price} onChange={handleInputChange} step="0.01" className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 text-white font-mono focus:outline-none focus:border-[var(--primary-color)] transition-all" placeholder="0.00" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Discount Price (Optional)</label>
                            <input type="number" name="discount_price" value={formData.discount_price} onChange={handleInputChange} step="0.01" className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 text-white font-mono focus:outline-none focus:border-[var(--primary-color)] transition-all" placeholder="0.00" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Stock Quantity</label>
                            <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 text-white font-mono focus:outline-none focus:border-[var(--primary-color)] transition-all" placeholder="0" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Category</label>
                            <select name="category_id" value={formData.category_id} onChange={handleInputChange as any} className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 text-white font-mono focus:outline-none focus:border-[var(--primary-color)] transition-all cursor-pointer">
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-3 flex items-center pt-8">
                            <input type="checkbox" id="installment_eligible" name="installment_eligible" checked={formData.installment_eligible} onChange={handleCheckboxChange} className="w-5 h-5 accent-[var(--primary-color)] cursor-pointer" />
                            <label htmlFor="installment_eligible" className="ml-3 text-sm font-bold text-white uppercase tracking-wider cursor-pointer">Eligible for Installment Plans</label>
                        </div>
                    </div>
                    
                    <div className="pt-8 border-t border-white/10">
                        <h3 className="text-xl font-bold text-white uppercase italic mb-6">SEO Configuration</h3>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">SEO Title</label>
                                <input type="text" name="seo_title" value={formData.seo_title} onChange={handleInputChange} className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-[var(--primary-color)] transition-all" />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">SEO Meta Description</label>
                                <textarea name="seo_description" value={formData.seo_description} onChange={handleInputChange} rows={2} className="w-full bg-black border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-[var(--primary-color)] transition-all resize-none" />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 text-red-500 p-6 rounded-2xl text-sm font-bold flex items-center gap-4">
                            <AlertCircle className="w-6 h-6 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="flex gap-6 pt-6 flex-col md:flex-row">
                         <button 
                            type="button"
                            onClick={onCancel}
                            className="flex-1 bg-white/5 text-gray-500 font-black py-5 rounded-2xl hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest text-xs"
                        >
                            Abort Protocol
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="flex-[2] bg-[var(--primary-color)] text-black font-black py-5 rounded-2xl hover:bg-[#d9ff33] transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase text-lg shadow-[0_10px_30px_rgba(204,255,0,0.1)]"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-6 h-6 stroke-[3px]" />}
                            {mode === 'create' ? 'Complete Deployment' : 'Finalize Reconfig'}
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}

// --- Categories Manager ---

function CategoriesManager() {
    const { token } = useAuth();
    const [categories, setCategories] = useState<{id:string;name:string;slug:string;description?:string;sort_order:number}[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");

    const fetchCategories = async () => {
        try {
            const res = await fetch(getApiUrl("/api/categories"));
            const data = await res.json();
            setCategories(Array.isArray(data) ? data : []);
        } catch (e) { 
            console.error(e);
            setCategories([]);
        } finally { 
            setIsLoading(false); 
        }
    };
    useEffect(() => { fetchCategories(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch(getApiUrl("/api/categories"), {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name: newName, description: newDesc })
            });
            setNewName(""); setNewDesc(""); fetchCategories();
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this category?')) return;
        await fetch(getApiUrl(`/api/categories/${id}`), {
            method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchCategories();
    };

    return (
        <div className="space-y-10">
            <header>
                <h2 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter">Category <span className="text-[var(--primary-color)]">Matrix</span></h2>
                <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-2">{categories.length} Categories Active</p>
            </header>
            <form onSubmit={handleCreate} className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 flex flex-col md:flex-row gap-4">
                <input value={newName} onChange={e => setNewName(e.target.value)} required placeholder="Category name" className="flex-1 bg-black border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary-color)]" />
                <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)" className="flex-1 bg-black border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--primary-color)]" />
                <button type="submit" className="bg-[var(--primary-color)] text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-[#e6ff66] transition-all"><Plus className="w-5 h-5 inline mr-2" />Add</button>
            </form>
            {isLoading ? <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)] mx-auto" /></div> : (
                <div className="grid gap-4">
                    {categories.map(cat => (
                        <div key={cat.id} className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-5 flex items-center justify-between hover:border-[var(--primary-color)]/30 transition-all">
                            <div>
                                <h3 className="text-lg font-bold text-white">{cat.name}</h3>
                                <p className="text-sm text-gray-500">{cat.description || 'No description'}</p>
                                <span className="text-[10px] text-gray-600 font-mono">/{cat.slug}</span>
                            </div>
                            <button onClick={() => handleDelete(cat.id)} className="w-10 h-10 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- Installments Manager ---

interface InstallmentRequest {
    id: string; status: string; months: number; monthly_payment: number;
    upfront_amount: number; remaining_amount: number; selling_price: number; cost_price: number;
    admin_note?: string; created_at: string;
    user?: { name: string; email: string; phone?: string };
    product?: { name: string; selling_price: number };
    documents?: { id: string; document_url: string }[];
    payments?: { id: string; amount: number; due_date: string; status: string; paid_date?: string }[];
}

function InstallmentsManager() {
    const { token } = useAuth();
    const [requests, setRequests] = useState<InstallmentRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    const fetchRequests = async () => {
        try {
            // First fetch requests
            const { data: requestsData, error: reqError } = await supabase
                .from('installment_requests')
                .select(`
                    *,
                    product:products(id, name, selling_price),
                    documents:installment_documents(*),
                    payments:installment_payments(*)
                `)
                .order('created_at', { ascending: false });
                
            if (reqError) throw reqError;

            // Fetch profiles
            if (requestsData && requestsData.length > 0) {
                const userIds = [...new Set(requestsData.map(d => d.user_id).filter(Boolean))];
                if (userIds.length > 0) {
                    const { data: profiles, error: profError } = await supabase
                        .from('profiles')
                        .select('id, name, email, role')
                        .in('id', userIds);
                        
                    if (profiles) {
                        requestsData.forEach(r => {
                            r.user = profiles.find(p => p.id === r.user_id) || null;
                        });
                    }
                }
            }
            
            setRequests(requestsData || []);
        } catch (e) {
            console.error(e);
            setErrorMsg(String(e));
            setRequests([]);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => { fetchRequests(); }, []);

    const handleAction = async (id: string, action: 'approve' | 'reject', note?: string) => {
        await fetch(getApiUrl(`/api/installments/${id}/${action}`), {
            method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ admin_note: note || `${action}d by admin` })
        });
        fetchRequests();
    };

    const getStatusBadge = (s: string) => {
        const colors: Record<string,string> = { pending: 'text-yellow-500 bg-yellow-500/10', approved: 'text-[var(--primary-color)] bg-[var(--primary-color)]/10', rejected: 'text-red-500 bg-red-500/10', active: 'text-blue-400 bg-blue-400/10', completed: 'text-green-500 bg-green-500/10' };
        return colors[s] || 'text-gray-400 bg-gray-400/10';
    };

    return (
        <div className="space-y-10">
            <header>
                <h2 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter">Installment <span className="text-[var(--primary-color)]">Requests</span></h2>
                <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-2">{Array.isArray(requests) ? requests.filter(r => r.status === 'pending').length : 0} Pending Review</p>
                {errorMsg && <p className="text-red-500 mt-4 text-sm font-mono">{errorMsg}</p>}
            </header>
            {isLoading ? <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)] mx-auto" /></div> : requests.length === 0 ? (
                <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-20 text-center"><CreditCard className="w-16 h-16 text-gray-800 mx-auto mb-4" /><h3 className="text-xl font-bold text-gray-600">No Installment Requests</h3></div>
            ) : (
                <div className="grid gap-6">
                    {requests.map(req => (
                        <div key={req.id} className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-8 hover:border-[var(--primary-color)]/30 transition-all">
                            <div className="flex flex-col md:flex-row gap-6 justify-between">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusBadge(req.status)}`}>{req.status}</span>
                                        <span className="text-xs text-gray-500 font-mono">{new Date(req.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{req.user?.name || 'Unknown User'}</h3>
                                            <p className="text-sm text-gray-400 font-mono">{req.user?.email}</p>
                                            <p className="text-sm text-[var(--primary-color)] font-bold mt-1">{req.user?.phone}</p>
                                        </div>
                                        <div className="text-xs text-gray-400 border-l border-white/10 pl-4">
                                            <p className="font-bold uppercase text-[10px] text-gray-600 mb-1">Product Context</p>
                                            <p className="text-white font-bold">{req.product?.name}</p>
                                            <p className="mt-1">Initial Price: ${req.product?.selling_price}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <div><div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Upfront</div><div className="text-lg font-mono text-[var(--primary-color)] font-bold">${req.upfront_amount}</div></div>
                                        <div><div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Remaining</div><div className="text-lg font-mono text-white font-bold">${req.remaining_amount}</div></div>
                                        <div><div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Months</div><div className="text-lg font-mono text-white font-bold">{req.months}m</div></div>
                                        <div><div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Monthly</div><div className="text-lg font-mono text-white font-bold">${req.monthly_payment}</div></div>
                                    </div>

                                    {req.documents && req.documents.length > 0 && (
                                        <div className="mt-4 flex flex-wrap gap-3">
                                            {req.documents.map((doc, idx) => (
                                                <div key={idx} className="group/doc relative">
                                                    <div className="text-[10px] text-blue-400 font-bold uppercase flex items-center gap-1 bg-blue-400/10 px-3 py-1.5 rounded-lg border border-blue-400/20 cursor-pointer hover:bg-blue-400/20">
                                                        <Upload className="w-3 h-3" /> Income Proof #{idx + 1}
                                                    </div>
                                                    {/* Preview on hover */}
                                                    <div className="absolute bottom-full left-0 mb-2 w-48 h-48 bg-[#0a0a0a] border border-white/20 rounded-xl overflow-hidden opacity-0 group-hover/doc:opacity-100 pointer-events-none transition-all z-50">
                                                        <Image src={doc.document_url} alt="Proof" fill className="object-contain p-2" unoptimized />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {req.admin_note && (
                                        <div className="mt-4 p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-xs text-gray-400 italic">
                                            <span className="text-red-400 font-bold not-italic">Admin Note:</span> {req.admin_note}
                                        </div>
                                    )}
                                </div>
                                {req.status === 'pending' && (
                                    <div className="flex flex-col gap-2 min-w-[160px]">
                                        <button onClick={() => handleAction(req.id, 'approve')} className="bg-[var(--primary-color)] text-black px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#e6ff66] transition-all">Approve Plan</button>
                                        <button onClick={() => handleAction(req.id, 'reject', prompt('Rejection reason:') || undefined)} className="bg-red-500/10 text-red-500 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-red-500/20 transition-all">Reject</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- Affiliates Manager ---

interface Affiliate {
    id: string; type: string; referral_code: string; commission_rate: number;
    status: string; total_clicks: number; total_sales: number; total_revenue: number; total_commission: number;
    created_at: string;
    user?: { name: string; email: string; phone?: string };
    links?: { url_code: string; clicks: number; conversions: number; product_id?: string }[];
}

function AffiliatesManager() {
    const { token } = useAuth();
    const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAffiliates = async () => {
        try {
            const res = await fetch(getApiUrl("/api/affiliates"), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setAffiliates(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
            setAffiliates([]);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => { fetchAffiliates(); }, []);

    const updateStatus = async (id: string, status: string) => {
        await fetch(getApiUrl(`/api/affiliates/${id}/status`), {
            method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status })
        });
        fetchAffiliates();
    };

    const updateCommission = async (id: string, commission_rate: number) => {
        await fetch(getApiUrl(`/api/affiliates/${id}/commission`), {
            method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ commission_rate })
        });
        fetchAffiliates();
    };

    const getTypeBadge = (t: string) => t === 'sales_manager' ? 'text-blue-400 bg-blue-400/10' : 'text-purple-400 bg-purple-400/10';

    return (
        <div className="space-y-10">
            <header>
                <h2 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter">Affiliate <span className="text-[var(--primary-color)]">Network</span></h2>
                <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-2">{affiliates.length} Partners Registered</p>
            </header>
            {isLoading ? <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)] mx-auto" /></div> : affiliates.length === 0 ? (
                <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-20 text-center"><Users className="w-16 h-16 text-gray-800 mx-auto mb-4" /><h3 className="text-xl font-bold text-gray-600">No Affiliates Yet</h3></div>
            ) : (
                <div className="grid gap-6">
                    {affiliates.map(aff => (
                        <div key={aff.id} className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-6 md:p-8 hover:border-[var(--primary-color)]/30 transition-all">
                            <div className="flex flex-col md:flex-row gap-6 justify-between">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getTypeBadge(aff.type)}`}>{aff.type.replace('_', ' ')}</span>
                                        <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-1 rounded">Code: {aff.referral_code}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white">{aff.user?.name || 'Unknown'} <span className="text-sm text-gray-500 font-normal">{aff.user?.email}</span></h3>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3">
                                        <div><div className="text-[10px] text-gray-500 uppercase font-bold">Clicks</div><div className="text-lg font-mono text-white font-bold">{aff.total_clicks}</div></div>
                                        <div><div className="text-[10px] text-gray-500 uppercase font-bold">Sales</div><div className="text-lg font-mono text-white font-bold">{aff.total_sales}</div></div>
                                        <div><div className="text-[10px] text-gray-500 uppercase font-bold">Revenue</div><div className="text-lg font-mono text-[var(--primary-color)] font-bold">{aff.total_revenue}</div></div>
                                        <div><div className="text-[10px] text-gray-500 uppercase font-bold">Commission</div><div className="text-lg font-mono text-[var(--primary-color)] font-bold">{aff.total_commission}</div></div>
                                        <div 
                                          className="cursor-pointer group relative" 
                                          onClick={() => {
                                              const rate = prompt('Enter new commission rate (%)', String(aff.commission_rate));
                                              if (rate !== null && !isNaN(Number(rate))) {
                                                  updateCommission(aff.id, Number(rate));
                                              }
                                          }}
                                          title="Click to edit commission rate"
                                        >
                                          <div className="text-[10px] text-gray-500 uppercase font-bold group-hover:text-white transition-colors">Rate ✎</div>
                                          <div className="text-lg font-mono text-white font-bold border-b border-transparent group-hover:border-white/30 inline-block">{aff.commission_rate}%</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 min-w-[160px]">
                                    <select value={aff.status} onChange={e => updateStatus(aff.id, e.target.value)} className="bg-[#111] text-white text-xs font-bold border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-[var(--primary-color)] cursor-pointer">
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// --- Hero List Manager ---

function HeroListManager() {
    const { token } = useAuth();
    const [heroes, setHeroes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newHero, setNewHero] = useState<any>({
        title: '', subtitle: '', description: '', discount: '', accent_color: '#ccff00'
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const fetchHeroes = async () => {
        try {
            const res = await fetch(getApiUrl("/api/heroes"));
            const data = await res.json();
            setHeroes(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchHeroes(); }, []);

    const handleAddHero = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (heroes.length >= 5) {
            alert("Maximum fleet capacity reached (5). Please decommission an active asset first.");
            return;
        }

        if (!selectedFile && !newHero.image_url) {
            alert("Image is required for deployment");
            return;
        }

        setIsAdding(true);
        try {
            let finalImageUrl = "";

            if (selectedFile) {
                const fileExt = selectedFile.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
                
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('hero-deployments')
                    .upload(fileName, selectedFile, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) throw new Error("Failed to upload image: " + uploadError.message);

                const { data: { publicUrl } } = supabase.storage
                    .from('hero-deployments')
                    .getPublicUrl(fileName);
                    
                finalImageUrl = publicUrl;
            }

            const payload = {
                ...newHero,
                image_url: finalImageUrl
            };

            const res = await fetch(getApiUrl("/api/heroes"), {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || "Deployment failed");
            }
            
            setNewHero({ title: '', subtitle: '', description: '', discount: '', accent_color: '#ccff00' });
            setSelectedFile(null);
            setPreviewUrl(null);
            fetchHeroes();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Decommission this asset?")) return;
        try {
            const res = await fetch(getApiUrl(`/api/heroes/${id}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) fetchHeroes();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--primary-color)] to-transparent" />
            <h3 className="text-xl font-black uppercase text-white mb-8 italic flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-[var(--primary-color)]" /> Hero Fleet Management
            </h3>

            <div className="space-y-12">
                {/* New Hero Form */}
                <form onSubmit={handleAddHero} className="bg-black/40 border border-white/5 rounded-3xl p-8 space-y-6">
                    <h4 className="text-xs font-black uppercase text-gray-500 tracking-widest mb-4">Commission New Asset</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-600 uppercase">Title</label>
                            <input value={newHero.title} onChange={e => setNewHero({...newHero, title: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[var(--primary-color)] outline-none text-sm" placeholder="Combat Title" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-600 uppercase">Subtitle</label>
                            <input value={newHero.subtitle} onChange={e => setNewHero({...newHero, subtitle: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[var(--primary-color)] outline-none text-sm" placeholder="Sector Tag" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-600 uppercase">Discount Code</label>
                            <input value={newHero.discount} onChange={e => setNewHero({...newHero, discount: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[var(--primary-color)] outline-none text-sm" placeholder="-15%" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-600 uppercase">Accent Color</label>
                            <div className="flex gap-3">
                                <input type="color" value={newHero.accent_color} onChange={e => setNewHero({...newHero, accent_color: e.target.value})} className="w-12 h-12 bg-black border border-white/10 rounded-xl p-1 cursor-pointer" />
                                <input value={newHero.accent_color} onChange={e => setNewHero({...newHero, accent_color: e.target.value})} className="flex-1 bg-black/60 border border-white/10 rounded-xl px-4 text-white font-mono text-xs" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-600 uppercase">Description</label>
                        <textarea value={newHero.description} onChange={e => setNewHero({...newHero, description: e.target.value})} className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[var(--primary-color)] outline-none text-sm resize-none" rows={3} placeholder="Mission objectives..."></textarea>
                    </div>
                    
                    <div className="space-y-4">
                        <input type="file" id="newHeroImg" hidden accept="image/*" onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setSelectedFile(file);
                                const reader = new FileReader();
                                reader.onloadend = () => setPreviewUrl(reader.result as string);
                                reader.readAsDataURL(file);
                            }
                        }} />
                        <div className="flex flex-col md:flex-row gap-6">
                            {previewUrl && (
                                <div className="w-full md:w-48 aspect-video rounded-xl overflow-hidden border border-white/10 shrink-0">
                                    <img src={previewUrl} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <label htmlFor="newHeroImg" className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-6 hover:border-[var(--primary-color)]/30 cursor-pointer bg-black/40">
                                <Upload className="w-6 h-6 text-gray-600 mb-1" />
                                <span className="text-[10px] font-bold text-gray-500 uppercase">{selectedFile ? selectedFile.name : 'Select Tactical Asset'}</span>
                            </label>
                        </div>
                    </div>

                    <button type="submit" disabled={isAdding || heroes.length >= 5} className="w-full bg-white disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-black py-4 rounded-2xl hover:bg-[var(--primary-color)] transition-all uppercase text-sm tracking-tighter mt-4">
                        {isAdding ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : heroes.length >= 5 ? "Fleet Full (Max 5)" : "Deploy Asset"}
                    </button>
                </form>

                {/* Hero List */}
                <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-gray-500 tracking-widest">Active Fleet</h4>
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-[var(--primary-color)]" /> : heroes.length === 0 ? (
                        <div className="text-center py-10 text-gray-600 font-mono text-xs uppercase">No active deployments</div>
                    ) : (
                        <div className="grid gap-4">
                            {heroes.map(hero => (
                                <div key={hero.id} className="bg-black/40 border border-white/5 rounded-2xl p-4 flex gap-6 items-center group">
                                    <div className="w-24 h-16 rounded-lg overflow-hidden shrink-0 border border-white/10">
                                        <img src={hero.image_url} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black uppercase mb-1" style={{ color: hero.accent_color }}>{hero.subtitle || 'General Asset'}</p>
                                        <h5 className="font-bold text-white truncate">{hero.title}</h5>
                                    </div>
                                    <button onClick={() => handleDelete(hero.id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Settings Manager ---

function SettingsManager() {
    const { token } = useAuth();
    const [settings, setSettings] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchSettings = async () => {
        try {
            const res = await fetch(getApiUrl("/api/settings"));
            const data = await res.json();
            setSettings(typeof data === 'object' && data !== null ? data : {});
        } catch (e) {
            console.error(e);
            setSettings({});
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchSettings(); }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError("");
        
        try {
            const formData = new FormData();
            Object.entries(settings).forEach(([key, value]: [string, any]) => {
                // Don't send Base64 preview strings to the server as key-value pairs
                // if they are being replaced by fresh file uploads or intended to be cleared.
                if (!(value instanceof File) && 
                    !key.includes('_url') && 
                    !key.includes('paymentQr') && 
                    !key.includes('heroBanner')) {
                    formData.append(key, value);
                }
            });

            // Handle file uploads separately
            const qrInput = document.getElementById('paymentQr') as HTMLInputElement;
            if (qrInput?.files?.[0]) {
                formData.append('paymentQr', qrInput.files[0]);
            } else if (!settings.payment_qr_url) {
                // If the URL is empty and no new file is selected, signal removal
                formData.append('payment_qr_url', '');
            }
            
            const bannerInput = document.getElementById('heroBanner') as HTMLInputElement;
            if (bannerInput?.files?.[0]) {
                formData.append('heroBanner', bannerInput.files[0]);
            } else if (!settings.hero_banner_url) {
                // If the URL is empty and no new file is selected, signal removal
                formData.append('hero_banner_url', '');
            }

            const res = await fetch(getApiUrl("/api/settings"), {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!res.ok) throw new Error("Failed to update system parameters");
            
            alert("Mainframe Updated Successfully");
            fetchSettings();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (key: string, value: string) => {
        setSettings({ ...settings, [key]: value });
    };

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-[var(--primary-color)]" /></div>;

    return (
        <div className="space-y-12 max-w-4xl mx-auto">
            <header>
                <h2 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter">System <span className="text-[var(--primary-color)]">Matrix</span></h2>
                <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-2">Core Configuration Nexus</p>
            </header>

            <form onSubmit={handleSave} className="space-y-12">
                {/* Design Section */}
                <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-transparent" />
                    <h3 className="text-xl font-black uppercase text-white mb-8 italic flex items-center gap-3">
                        <Monitor className="w-6 h-6 text-blue-500" /> Visual Identity
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3 flex-1">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Primary Base Color</label>
                            <div className="flex flex-col gap-4">
                                <div className="flex gap-4 items-center w-full">
                                    <input type="color" value={settings.primary_color || "#ccff00"} onChange={e => handleChange('primary_color', e.target.value)} className="w-16 h-16 bg-black border border-white/10 rounded-2xl cursor-pointer p-2 shrink-0" />
                                    <input type="text" value={settings.primary_color || "#ccff00"} onChange={e => handleChange('primary_color', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-mono uppercase" />
                                </div>
                                <div className="flex items-center gap-3">
                                    {['#ccff00', '#ff8c00', '#00bfff', '#32cd32'].map(color => (
                                        <button 
                                            key={color} 
                                            type="button"
                                            onClick={() => handleChange('primary_color', color)}
                                            style={{ backgroundColor: color }}
                                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${settings.primary_color === color ? 'border-white' : 'border-transparent'}`}
                                            title={color}
                                        />
                                    ))}
                                    <span className="text-[10px] text-gray-500 uppercase ml-2">Presets</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Global Typography</label>
                            <select value={settings.font_family || "Inter"} onChange={e => handleChange('font_family', e.target.value)} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white font-bold cursor-pointer focus:border-[var(--primary-color)] outline-none">
                                <option value="Inter">Inter (Sans)</option>
                                <option value="Instrument Serif">Instrument Serif (Premium)</option>
                                <option value="Oxanium">Oxanium (Cyberpunk)</option>
                                <option value="Roboto">Roboto</option>
                            </select>
                        </div>
                    </div>
                </div>

                <HeroListManager />

                {/* Checkout Section */}
                <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent" />
                    <h3 className="text-xl font-black uppercase text-white mb-8 italic flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-orange-500" /> Transaction Protocol
                    </h3>
                    
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">Manual Transfer Intel</label>
                            <textarea value={settings.payment_instructions || ""} onChange={e => handleChange('payment_instructions', e.target.value)} className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-[var(--primary-color)] outline-none resize-none" rows={5} placeholder="Bank details, transfer steps..." />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">QR Authentication Hub</label>
                            <div className="flex flex-col sm:flex-row gap-6 items-center">
                                {settings.payment_qr_url && (
                                    <div className="w-32 h-32 bg-white rounded-2xl overflow-hidden shrink-0 border-4 border-white/10">
                                        <Image
                                            src={settings.payment_qr_url}
                                            alt="Current QR Code"
                                            width={128}
                                            height={128}
                                            className="w-full h-full object-contain p-2"
                                            unoptimized
                                        />
                                    </div>
                                )}
                                <div className="flex-1 w-full relative">
                                    <input 
                                        type="file" 
                                        id="paymentQr" 
                                        className="hidden" 
                                        accept="image/png, image/jpeg, image/webp"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setSettings((prev: any) => ({...prev, payment_qr_url: reader.result as string}));
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    <label htmlFor="paymentQr" className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl p-8 cursor-pointer hover:border-[var(--primary-color)]/30 hover:bg-[#111] transition-all bg-black h-full min-h-[128px]">
                                        <Upload className="w-8 h-8 text-gray-600 mb-2" />
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest text-center">
                                            {settings.payment_qr_url ? 'Upload New QR Vector' : 'Upload QR Vector'}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {error && <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 font-bold text-sm flex items-center gap-3"><AlertCircle /> {error}</div>}

                <button type="submit" disabled={isSaving} className="w-full bg-[var(--primary-color)] text-black font-black py-6 rounded-[2rem] hover:bg-[#d9ff33] transition-all flex items-center justify-center gap-4 text-xl uppercase tracking-tighter shadow-2xl">
                    {isSaving ? <Loader2 className="w-8 h-8 animate-spin" /> : <div className="flex items-center gap-3"><Check className="w-8 h-8 stroke-[3px]" /> Deploy Configuration</div>}
                </button>
            </form>
        </div>
    );
}
