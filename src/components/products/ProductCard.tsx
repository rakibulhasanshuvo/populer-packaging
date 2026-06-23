"use client";

import { Package, AlertTriangle, Edit3, Trash2 } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  sku: string;
  stockQuantity: number;
  avgUnitCost: number;
  supplierName: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ProductCard({
  name,
  sku,
  stockQuantity,
  avgUnitCost,
  supplierName,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const isLowStock = stockQuantity < 5000;

  return (
    <div className="bg-card-surface rounded-apple-lg border border-white/8 relative overflow-hidden flex justify-between w-full hover:border-white/15 transition-colors">
      <div className="p-4 flex-1 flex items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-typography-secondary">
            <Package className="w-5 h-5" aria-hidden="true" />
          </div>

          <div>
            <span className="text-[10px] uppercase font-semibold text-typography-secondary tracking-wider">
              SKU: {sku}
            </span>
            <div className="font-bold text-sm text-typography-primary mt-0.5 leading-snug">
              {name}
            </div>
            
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs font-semibold text-typography-primary">
                {stockQuantity.toLocaleString()} in stock
              </span>
              {isLowStock && (
                <span className="flex items-center gap-0.5 text-[9px] bg-system-red/10 text-system-red px-1.5 py-0.5 rounded-full font-bold">
                  <AlertTriangle className="w-2.5 h-2.5" aria-hidden="true" /> Low Stock
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="text-right mr-1 shrink-0">
          <div className="text-xs font-bold text-cyan-neon">
            Avg Cost: ৳{avgUnitCost.toFixed(2)}
          </div>
          <div className="text-[9px] text-typography-secondary mt-1">
            Supplier: {supplierName}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center border-l border-white/8 px-3 gap-2 shrink-0 select-none bg-black/10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onEdit) onEdit();
          }}
          className="p-2 bg-indigo-electric/10 hover:bg-indigo-electric/20 text-indigo-electric rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-neon"
          title="Edit Details"
        >
          <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onDelete) onDelete();
          }}
          className="p-2 bg-system-red/10 hover:bg-system-red/20 text-system-red rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-neon"
          title="Delete Material"
        >
          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
