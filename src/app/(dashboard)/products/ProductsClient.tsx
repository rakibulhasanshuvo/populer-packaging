"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/useUIStore";
import ProductCard from "@/components/products/ProductCard";
import ProductDrawer from "@/components/products/ProductDrawer";
import { Search, Plus, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface Product {
  id: string;
  name: string;
  sku: string;
  stock_quantity: number;
  avg_unit_cost: number;
  supplier_name: string;
}

export default function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { setProductDrawerOpen } = useUIStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const filteredProducts = initialProducts.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.supplier_name.toLowerCase().includes(query)
    );
  });

  const handleDelete = async (productId: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from the catalog?`)) {
      try {
        const { error } = await supabase
          .from("products")
          .delete()
          .eq("id", productId);
        if (error) throw error;
        handleRefresh();
      } catch (err: unknown) {
        if (err instanceof Error) {
          alert("Error deleting product: " + err.message);
        } else {
          alert("An unknown error occurred.");
        }
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title & Add action */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-semibold text-typography-secondary tracking-wider">
            Inventory & Price List
          </span>
          <h1 className="font-bold text-lg tracking-tight flex items-center gap-2">
            Materials Catalog
            {isPending && <RefreshCw className="w-4 h-4 animate-spin text-typography-secondary" />}
          </h1>
        </div>

        <button
          onClick={() => {
            setSelectedProduct(null);
            setProductDrawerOpen(true);
          }}
          className="bg-indigo-electric hover:bg-indigo-electric/90 text-white font-bold py-2.5 px-4 rounded-apple-lg text-xs flex items-center gap-1.5 select-none active:scale-95 transition-all shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue"
        >
          <Plus className="w-4 h-4" aria-hidden="true" /> Create Material
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <input
          type="text"
          name="search"
          autoComplete="off"
          aria-label="Search materials catalog"
          placeholder="Search SKU, name, or supplier…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-card-surface border border-white/8 rounded-apple-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-apple-blue font-semibold text-typography-primary"
        />
        <Search className="w-5 h-5 text-typography-secondary/60 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
      </div>

      {/* Product Card Lists */}
      <div className="flex flex-col gap-3">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                sku={p.sku}
                stockQuantity={p.stock_quantity}
                avgUnitCost={p.avg_unit_cost}
                supplierName={p.supplier_name}
                onEdit={() => {
                  setSelectedProduct(p);
                  setProductDrawerOpen(true);
                }}
                onDelete={() => handleDelete(p.id, p.name)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-card-surface rounded-apple-lg border border-dashed border-white/8 text-typography-secondary text-sm">
            No materials found in the catalog.
          </div>
        )}
      </div>

      {/* Slide up add/edit product drawer */}
      <ProductDrawer
        productToEdit={selectedProduct}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
