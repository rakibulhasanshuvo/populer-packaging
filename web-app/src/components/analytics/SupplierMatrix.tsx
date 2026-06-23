"use client";

import { useStore } from "@/store/useStore";
import { Truck, ShieldCheck, DollarSign, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SupplierMatrix() {
  const { suppliers, products } = useStore();

  return (
    <div className="bg-white dark:bg-surface-dark rounded-apple-xl p-5 shadow-apple-soft border border-black/5 dark:border-white/5 flex flex-col gap-4">
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-semibold text-typography-secondary dark:text-canvas-light/50 tracking-wider">
          Market Intelligence
        </span>
        <h3 className="font-bold text-lg tracking-tight">Supplier Cost Matrix</h3>
      </div>

      <div className="flex flex-col gap-4">
        {products.map((prod) => {
          // Find all suppliers for this product
          const productSuppliers = suppliers.filter((s) => s.productId === prod.id);
          
          if (productSuppliers.length === 0) return null;

          // Find the cheapest supplier
          const cheapestSupplier = productSuppliers.reduce((min, s) => 
            s.basePrice < min.basePrice ? s : min
          , productSuppliers[0]);

          return (
            <div key={prod.id} className="border-b border-black/5 dark:border-white/5 pb-4 last:border-b-0 last:pb-0">
              <span className="text-xs font-bold text-typography-primary dark:text-canvas-light">
                {prod.name}
              </span>

              <div className="grid grid-cols-1 gap-2.5 mt-2.5">
                {productSuppliers.map((sup) => {
                  const isCheapest = sup.id === cheapestSupplier.id;
                  
                  return (
                    <div
                      key={sup.id}
                      className={cn(
                        "p-3 rounded-apple-lg border flex items-center justify-between transition-[background-color,border-color] select-none",
                        isCheapest
                          ? "bg-apple-blue/5 border-apple-blue/20 dark:bg-apple-blue/10"
                          : "bg-canvas-light dark:bg-black/20 border-black/5 dark:border-white/5"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Truck className={cn("w-4 h-4", isCheapest ? "text-apple-blue" : "text-typography-secondary")} aria-hidden="true" />
                        <div>
                          <div className="font-bold text-xs text-typography-primary dark:text-canvas-light flex items-center gap-1.5">
                            {sup.name}
                            {isCheapest && (
                              <span className="text-[8px] bg-apple-blue text-white px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider">
                                Best Rate
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-typography-secondary dark:text-canvas-light/60 mt-0.5">
                            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" aria-hidden="true" /> {sup.leadTimeDays}d lead time</span>
                            <span>Dev: ±৳{sup.historicalDeviation.toFixed(3)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={cn("font-bold text-xs", isCheapest ? "text-apple-blue" : "text-typography-primary dark:text-canvas-light")}>
                          ৳{sup.basePrice.toFixed(3)} / unit
                        </div>
                        <span className="text-[8px] text-typography-secondary dark:text-canvas-light/40">Base Price</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
