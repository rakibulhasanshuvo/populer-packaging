"use client";

import { useState, useEffect } from "react";
import { useUIStore } from "@/store/useUIStore";
import { X, Plus, Edit3, Box, BarChart, DollarSign, Tag, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";

interface Product {
  id: string;
  name: string;
  sku: string;
  stock_quantity: number;
  avg_unit_cost: number;
  supplier_name: string;
}

interface ProductDrawerProps {
  productToEdit?: Product | null;
  onRefresh: () => void;
}

export default function ProductDrawer({ productToEdit, onRefresh }: ProductDrawerProps) {
  const { isProductDrawerOpen, setProductDrawerOpen } = useUIStore();

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [avgUnitCost, setAvgUnitCost] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSku(productToEdit.sku);
      setStockQuantity(productToEdit.stock_quantity.toString());
      setAvgUnitCost(productToEdit.avg_unit_cost.toString());
      setSupplierName(productToEdit.supplier_name);
    } else {
      setName("");
      setSku("");
      setStockQuantity("");
      setAvgUnitCost("");
      setSupplierName("");
    }
  }, [productToEdit, isProductDrawerOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      stock_quantity: parseInt(stockQuantity) || 0,
      avg_unit_cost: parseFloat(avgUnitCost) || 0,
      supplier_name: supplierName.trim(),
    };

    try {
      if (productToEdit) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", productToEdit.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("products")
          .insert([payload]);
        if (error) throw error;
      }
      setProductDrawerOpen(false);
      onRefresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert("Error saving product: " + err.message);
      } else {
        alert("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isProductDrawerOpen && (
        <>
          {/* Backdrop Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setProductDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 z-50"
          />

          {/* Bottom Sheet Drawer */}
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
              onClick={() => setProductDrawerOpen(false)}
              className="w-full flex justify-center py-3 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-neon focus-visible:ring-inset"
            >
              <div className="w-10 h-1 bg-white/20 rounded-full group-hover:bg-white/40 transition-colors" />
            </button>

            <div className="px-5 flex flex-col gap-6 max-h-[80vh] overflow-y-auto no-scrollbar">
              {/* Header Title */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-typography-secondary tracking-wider">
                    Materials Catalog
                  </span>
                  <h2 className="text-lg font-bold text-typography-primary leading-tight">
                    {productToEdit ? "Modify Material & Cost" : "Add New Packaging Material"}
                  </h2>
                </div>
                <button
                  type="button"
                  aria-label="Close drawer"
                  onClick={() => setProductDrawerOpen(false)}
                  className="p-1 rounded-full hover:bg-white/5 text-typography-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-neon"
                >
                  <X className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Material Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="material-name-input" className="text-xs font-bold uppercase tracking-wider text-typography-secondary px-1">
                    Material Name
                  </label>
                  <div className="relative">
                    <input
                      id="material-name-input"
                      type="text"
                      required
                      placeholder="e.g. Customized D-cut Bag, Tape…"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-apple-lg pl-9 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-neon font-semibold text-typography-primary"
                    />
                    <Box className="w-4 h-4 text-typography-secondary/60 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  </div>
                </div>

                {/* SKU */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="sku-input" className="text-xs font-bold uppercase tracking-wider text-typography-secondary px-1">
                    SKU (Stock Keeping Unit)
                  </label>
                  <div className="relative">
                    <input
                      id="sku-input"
                      type="text"
                      required
                      placeholder="e.g. POLY-MED-01"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-apple-lg pl-9 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-neon font-semibold text-typography-primary"
                    />
                    <Tag className="w-4 h-4 text-typography-secondary/60 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  </div>
                </div>

                {/* Supplier Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="supplier-input" className="text-xs font-bold uppercase tracking-wider text-typography-secondary px-1">
                    Supplier Name
                  </label>
                  <div className="relative">
                    <input
                      id="supplier-input"
                      type="text"
                      required
                      placeholder="e.g. PolyTech Industries"
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-apple-lg pl-9 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-neon font-semibold text-typography-primary"
                    />
                    <Truck className="w-4 h-4 text-typography-secondary/60 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  </div>
                </div>

                {/* Stock Quantity & Avg Unit Cost */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="qty-input" className="text-xs font-bold uppercase tracking-wider text-typography-secondary px-1">
                      Stock Quantity
                    </label>
                    <div className="relative">
                      <input
                        id="qty-input"
                        type="number"
                        required
                        min="0"
                        placeholder="0"
                        value={stockQuantity}
                        onChange={(e) => setStockQuantity(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-apple-lg pl-9 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-neon font-semibold text-typography-primary"
                      />
                      <BarChart className="w-4 h-4 text-typography-secondary/60 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="cost-input" className="text-xs font-bold uppercase tracking-wider text-typography-secondary px-1">
                      Avg Unit Cost (TK)
                    </label>
                    <div className="relative">
                      <input
                        id="cost-input"
                        type="number"
                        required
                        step="0.001"
                        min="0"
                        placeholder="0.00"
                        value={avgUnitCost}
                        onChange={(e) => setAvgUnitCost(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-apple-lg pl-9 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-neon font-semibold text-typography-primary"
                      />
                      <DollarSign className="w-4 h-4 text-typography-secondary/60 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-electric hover:bg-indigo-electric/90 text-white font-bold py-3.5 rounded-apple-lg text-sm flex items-center justify-center gap-1.5 select-none active:scale-98 transition-transform shadow-sm mt-4 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-neon"
                >
                  {productToEdit ? (
                    <>
                      <Edit3 className="w-4 h-4" aria-hidden="true" /> {loading ? "Updating..." : "Update Material"}
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" aria-hidden="true" /> {loading ? "Adding..." : "Add to Catalog"}
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
