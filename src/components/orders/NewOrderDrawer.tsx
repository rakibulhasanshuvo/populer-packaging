"use client";

import { useState, useEffect } from "react";
import { useUIStore } from "@/store/useUIStore";
import { X, Plus, BarChart, DollarSign, ShoppingBag, Folder } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";

interface Product {
  id: string;
  name: string;
  sku: string;
  stock_quantity: number;
  avg_unit_cost: number;
}

interface NewOrderDrawerProps {
  onRefresh: () => void;
}

export default function NewOrderDrawer({ onRefresh }: NewOrderDrawerProps) {
  const { isOrderSheetOpen, setOrderSheetOpen } = useUIStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [fixedSetupCost, setFixedSetupCost] = useState("150");
  const [loading, setLoading] = useState(false);

  // Fetch available products list for dropdown selection
  useEffect(() => {
    async function loadProducts() {
      const { data } = await supabase
        .from("products")
        .select("id, name, sku, stock_quantity, avg_unit_cost");
      if (data) {
        setProducts(data);
        if (data.length > 0) {
          setProductId(data[0].id);
          // Set default selling price based on average cost + markup
          setSellingPrice((data[0].avg_unit_cost * 1.5).toFixed(2));
        }
      }
    }
    if (isOrderSheetOpen) {
      loadProducts();
    }
  }, [isOrderSheetOpen]);

  // Update default selling price when selected product changes
  const handleProductChange = (id: string) => {
    setProductId(id);
    const selected = products.find((p) => p.id === id);
    if (selected) {
      setSellingPrice((selected.avg_unit_cost * 1.5).toFixed(2));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const qty = parseInt(quantity) || 0;
    const sellPrice = parseFloat(sellingPrice) || 0;
    const setupCost = parseFloat(fixedSetupCost) || 0;

    if (!productId || qty <= 0) {
      alert("Please select a valid product and quantity.");
      setLoading(false);
      return;
    }

    try {
      // 1. Insert order record
      const { error: orderError } = await supabase.from("orders").insert([
        {
          product_id: productId,
          quantity: qty,
          selling_price: sellPrice,
          fixed_setup_cost: setupCost,
          status: "pending",
        },
      ]);
      if (orderError) throw orderError;

      // 2. Deduct product inventory levels
      const product = products.find((p) => p.id === productId);
      if (product) {
        const newStock = Math.max(0, product.stock_quantity - qty);
        const { error: updateError } = await supabase
          .from("products")
          .update({ stock_quantity: newStock })
          .eq("id", productId);
        if (updateError) throw updateError;
      }

      setOrderSheetOpen(false);
      setQuantity("");
      onRefresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert("Error logging order: " + err.message);
      } else {
        alert("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOrderSheetOpen && (
        <>
          {/* Backdrop Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setOrderSheetOpen(false)}
            className="fixed inset-0 bg-black/60 z-50"
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-card-surface rounded-t-[24px] shadow-2xl z-50 overflow-hidden border-t border-white/10 pb-8"
          >
            {/* Grab Handle */}
            <button
              type="button"
              aria-label="Close drawer"
              onClick={() => setOrderSheetOpen(false)}
              className="w-full flex justify-center py-3 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-inset"
            >
              <div className="w-10 h-1 bg-white/20 rounded-full group-hover:bg-white/40 transition-colors" />
            </button>

            <div className="px-5 flex flex-col gap-6 max-h-[80vh] overflow-y-auto no-scrollbar">
              {/* Header Title */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-typography-secondary tracking-wider">
                    Client Pipeline
                  </span>
                  <h2 className="text-lg font-bold text-typography-primary leading-tight">
                    Create New Client Order
                  </h2>
                </div>
                <button
                  type="button"
                  aria-label="Close drawer"
                  onClick={() => setOrderSheetOpen(false)}
                  className="p-1 rounded-full hover:bg-white/5 text-typography-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue"
                >
                  <X className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Product Selection */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="product-select" className="text-xs font-bold uppercase tracking-wider text-typography-secondary px-1">
                    Select Material
                  </label>
                  <div className="relative">
                    <select
                      id="product-select"
                      value={productId}
                      onChange={(e) => handleProductChange(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-apple-lg pl-9 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-apple-blue font-semibold text-typography-primary appearance-none"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku}) - {p.stock_quantity.toLocaleString()} in stock
                        </option>
                      ))}
                      {products.length === 0 && (
                        <option value="">No products available in catalog</option>
                      )}
                    </select>
                    <Folder className="w-4 h-4 text-typography-secondary/60 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  </div>
                </div>

                {/* Quantity & Fixed Setup Overhead */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="qty-input" className="text-xs font-bold uppercase tracking-wider text-typography-secondary px-1">
                      Order Quantity
                    </label>
                    <div className="relative">
                      <input
                        id="qty-input"
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 5000"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-apple-lg pl-9 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-apple-blue font-semibold text-typography-primary"
                      />
                      <BarChart className="w-4 h-4 text-typography-secondary/60 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="setup-input" className="text-xs font-bold uppercase tracking-wider text-typography-secondary px-1">
                      Setup Overhead (TK)
                    </label>
                    <div className="relative">
                      <input
                        id="setup-input"
                        type="number"
                        required
                        min="0"
                        placeholder="150"
                        value={fixedSetupCost}
                        onChange={(e) => setFixedSetupCost(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-apple-lg pl-9 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-apple-blue font-semibold text-typography-primary"
                      />
                      <DollarSign className="w-4 h-4 text-typography-secondary/60 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                    </div>
                  </div>
                </div>

                {/* Selling Price */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="sell-input" className="text-xs font-bold uppercase tracking-wider text-typography-secondary px-1">
                    Selling Price (Unit BDT)
                  </label>
                  <div className="relative">
                    <input
                      id="sell-input"
                      type="number"
                      required
                      step="0.001"
                      min="0.01"
                      placeholder="0.00"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-apple-lg pl-9 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-apple-blue font-semibold text-typography-primary"
                    />
                    <ShoppingBag className="w-4 h-4 text-typography-secondary/60 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-electric hover:bg-indigo-electric/90 text-white font-bold py-3.5 rounded-apple-lg text-sm flex items-center justify-center gap-1.5 select-none active:scale-98 transition-transform shadow-sm mt-3 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" /> {loading ? "Logging Order..." : "Create Order & Log"}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
