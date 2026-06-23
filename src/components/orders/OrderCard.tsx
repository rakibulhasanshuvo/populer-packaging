"use client";

import { useState } from "react";
import { Calendar, CheckCircle2, ArrowRight, Trash2, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface OrderCardProps {
  order: {
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
  };
  onRefresh: () => void;
}

export default function OrderCard({ order, onRefresh }: OrderCardProps) {
  const [updating, setUpdating] = useState(false);

  const quantity = order.quantity;
  const sellingPrice = order.selling_price;
  const avgUnitCost = order.products?.avg_unit_cost || 0;
  const setupCost = order.fixed_setup_cost;

  // Formula: Net Profit = (Quantity * Selling Price) - ((Quantity * Avg Unit Cost) + Setup Cost)
  const revenue = quantity * sellingPrice;
  const totalCost = (quantity * avgUnitCost) + setupCost;
  const netProfit = revenue - totalCost;
  const profitMarginPercent = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  const handleToggleStatus = async () => {
    setUpdating(true);
    const newStatus = order.status === "pending" ? "completed" : "pending";
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", order.id);
      if (error) throw error;
      onRefresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert("Error updating order: " + err.message);
      } else {
        alert("An unknown error occurred.");
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this order?")) {
      try {
        const { error } = await supabase
          .from("orders")
          .delete()
          .eq("id", order.id);
        if (error) throw error;
        onRefresh();
      } catch (err: unknown) {
        if (err instanceof Error) {
          alert("Error deleting order: " + err.message);
        } else {
          alert("An unknown error occurred.");
        }
      }
    }
  };

  return (
    <div className="bg-card-surface rounded-apple-xl p-4 border border-white/8 flex flex-col gap-4">
      {/* Header Info */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[10px] bg-black/40 px-2 py-0.5 rounded text-typography-secondary tracking-wider">
              {order.products?.sku || "SKU-UNKNOWN"}
            </span>
            <span className="text-xs font-semibold text-typography-secondary">
              {order.products?.name || "Deleted Material"}
            </span>
          </div>
          <h3 className="font-bold text-sm text-typography-primary mt-1.5 leading-snug">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h3>
        </div>

        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            order.status === "completed"
              ? "bg-system-green/10 text-system-green border-system-green/20"
              : "bg-indigo-electric/10 text-indigo-electric border-indigo-electric/20"
          }`}
        >
          {order.status.toUpperCase()}
        </span>
      </div>

      {/* Margin Breakdown Card */}
      <div className="bg-black/20 rounded-apple-lg p-3 border border-white/8 space-y-2 text-xs font-semibold text-typography-secondary">
        <div className="flex justify-between items-center">
          <span>Invoiced Revenue (Sell)</span>
          <span className="text-typography-primary">
            {quantity.toLocaleString()} × ৳{sellingPrice.toFixed(2)} = ৳{revenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Sourcing Cost (Buy)</span>
          <span className="text-typography-primary">
            ৳{totalCost.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            <span className="text-[9px] text-typography-secondary/60 ml-1">
              (Avg Unit: ৳{avgUnitCost.toFixed(2)})
            </span>
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Setup Cost (Overhead)</span>
          <span className="text-typography-primary">
            +৳{setupCost.toFixed(2)}
          </span>
        </div>
        <div className="border-t border-white/8 pt-2 flex justify-between items-center text-sm font-bold">
          <span>Net Profit</span>
          <div className="text-right">
            <span className={netProfit > 0 ? "text-system-green" : "text-system-red"}>
              ৳{netProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
            <span
              className={`text-[10px] font-bold ml-1.5 px-2 py-0.5 rounded-full ${
                netProfit > 0
                  ? "bg-system-green/10 text-system-green"
                  : "bg-system-red/10 text-system-red"
              }`}
            >
              {profitMarginPercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-typography-secondary pt-1 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" aria-hidden="true" />
          <span>Logged: {new Date(order.created_at).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Complete toggle */}
          <button type="button"
            onClick={handleToggleStatus}
            disabled={updating}
            className="bg-indigo-electric/10 hover:bg-indigo-electric/20 text-indigo-electric font-bold py-1 px-3 rounded-full text-xs flex items-center gap-1 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-neon"
          >
            {order.status === "pending" ? (
              <>
                <span>Complete</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </>
            ) : (
              <>
                <span>Reopen</span>
              </>
            )}
          </button>

          {/* Delete */}
          <button type="button"
            onClick={handleDelete}
            className="p-1 text-system-red hover:bg-system-red/10 rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-neon"
            title="Delete Order"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
