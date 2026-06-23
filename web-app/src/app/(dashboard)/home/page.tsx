import MetricCard from "@/components/home/MetricCard";
import { supabase } from "@/lib/supabase/client";
import { AlertCircle } from "lucide-react";

export const revalidate = 0;

interface LowStockProduct {
  name: string;
  sku: string;
  stock_quantity: number;
}

export default async function HomePage() {
  // 1. Fetch active orders (pending)
  const { count: activeOrdersCount, error: activeErr } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  if (activeErr) {
    console.error("Error loading active orders on server:", activeErr.message);
  }

  // 2. Fetch completed orders
  const { count: completedCount, error: compErr } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed");
  if (compErr) {
    console.error("Error loading completed orders on server:", compErr.message);
  }

  // 3. Fetch products catalog count
  const { count: catalogCount, error: prodErr } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });
  if (prodErr) {
    console.error("Error loading catalog count on server:", prodErr.message);
  }

  // 4. Fetch low stock items (< 5000 units)
  const { data: lowStockItems, error: lowStockErr } = await supabase
    .from("products")
    .select("name, stock_quantity, sku")
    .lt("stock_quantity", 5000);
  if (lowStockErr) {
    console.error("Error loading low stock items on server:", lowStockErr.message);
  }

  const lowStockCount = lowStockItems?.length || 0;
  const items = (lowStockItems as LowStockProduct[] | null) || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title */}
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-semibold text-typography-secondary tracking-wider">
          Operations Hub
        </span>
        <h1 className="font-bold text-lg tracking-tight">Dashboard Overview</h1>
      </div>

      {/* Bento Metric Grid */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          title="Active Orders"
          value={activeOrdersCount || 0}
          changeDescription="Pending production"
          colorTheme="cyan"
        />
        <MetricCard
          title="Low Stock Alerts"
          value={lowStockCount}
          changeDescription="Below 5k threshold"
          colorTheme="red"
        />
        <MetricCard
          title="Materials Catalog"
          value={catalogCount || 0}
          changeDescription="Total product items"
          colorTheme="indigo"
        />
        <MetricCard
          title="Completed Runs"
          value={completedCount || 0}
          changeDescription="Successfully delivered"
          colorTheme="green"
        />
      </div>

      {/* Low Stock Warning Details Panel */}
      {items.length > 0 && (
        <div className="bg-card-surface border border-white/8 rounded-apple-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-system-red">
            <AlertCircle className="w-5 h-5" />
            <h2 className="font-bold text-sm">Critical Inventory Alerts</h2>
          </div>
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <div
                key={item.sku}
                className="flex items-center justify-between text-xs py-2 border-b border-white/5 last:border-0"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-typography-primary">{item.name}</span>
                  <span className="text-[10px] text-typography-secondary">SKU: {item.sku}</span>
                </div>
                <span className="text-system-red font-bold">
                  {item.stock_quantity.toLocaleString()} left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
