"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/useUIStore";
import OrderCard from "@/components/orders/OrderCard";
import NewOrderDrawer from "@/components/orders/NewOrderDrawer";
import { Plus, Package, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface Order {
  id: string;
  product_id: string;
  quantity: number;
  selling_price: number;
  fixed_setup_cost: number;
  status: "pending" | "completed";
  created_at: string;
  products: {
    name: string;
    sku: string;
    avg_unit_cost: number;
  } | null;
}

const STAGES = [
  { label: "All", value: "All" as const },
  { label: "Pending", value: "pending" as const },
  { label: "Completed", value: "completed" as const },
];

export default function OrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { setOrderSheetOpen } = useUIStore();
  const [activeStage, setActiveStage] = useState<"All" | "pending" | "completed">("All");

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const filteredOrders = initialOrders.filter((o) => {
    return activeStage === "All" || o.status === activeStage;
  });

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Page Title & Add action */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-semibold text-typography-secondary tracking-wider">
            Production Line
          </span>
          <h1 className="font-bold text-lg tracking-tight flex items-center gap-2">
            Active Pipeline
            {isPending && <RefreshCw className="w-4 h-4 animate-spin text-typography-secondary" />}
          </h1>
        </div>

        <button
          onClick={() => setOrderSheetOpen(true)}
          className="bg-indigo-electric hover:bg-indigo-electric/90 text-white font-bold py-2.5 px-4 rounded-apple-lg text-xs flex items-center gap-1.5 select-none active:scale-95 transition-all shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue"
        >
          <Plus className="w-4 h-4" aria-hidden="true" /> Create Order
        </button>
      </div>

      {/* Segmented iOS Style Stage Switcher Slider */}
      <div className="bg-card-surface border border-white/8 p-1 rounded-apple-lg flex items-center justify-between relative overflow-hidden select-none">
        {STAGES.map((stage) => {
          const isActive = activeStage === stage.value;
          return (
            <button
              key={stage.value}
              onClick={() => setActiveStage(stage.value)}
              className={`flex-1 text-center py-2 text-[11px] font-bold rounded-md relative transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue cursor-pointer ${
                isActive ? "text-typography-primary" : "text-typography-secondary"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-stage-pill"
                  className="absolute inset-0 bg-black/40 rounded-md shadow-sm border border-white/10 -z-10"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              {stage.label}
            </button>
          );
        })}
      </div>

      {/* Active Pipeline Card Stack */}
      <div className="flex flex-col gap-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((o) => (
            <OrderCard key={o.id} order={o} onRefresh={handleRefresh} />
          ))
        ) : (
          <div className="text-center py-12 bg-card-surface rounded-apple-lg border border-dashed border-white/8 text-typography-secondary text-sm flex flex-col items-center gap-3 select-none">
            <Package className="w-8 h-8 text-typography-secondary/60" aria-hidden="true" />
            <span className="font-medium text-typography-secondary">No orders in this stage.</span>
            <button
              onClick={() => setOrderSheetOpen(true)}
              className="mt-1 bg-indigo-electric/10 hover:bg-indigo-electric/20 text-indigo-electric font-bold py-1.5 px-4 rounded-full text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue cursor-pointer"
            >
              Create Order
            </button>
          </div>
        )}
      </div>

      {/* Add New Order bottom sheet */}
      <NewOrderDrawer onRefresh={handleRefresh} />
    </div>
  );
}
