"use client";

import { useState, useEffect } from "react";
import { useStore, computeOrderMargins } from "@/store/useStore";
import SupplierMatrix from "@/components/analytics/SupplierMatrix";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { DollarSign, Landmark, PieChart, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  const { orders, products } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate profitability by category
  const categoryProfitMap: Record<string, { revenue: number; profit: number }> = {
    "Courier Poly": { revenue: 0, profit: 0 },
    "Garments": { revenue: 0, profit: 0 },
    "Labels": { revenue: 0, profit: 0 },
  };

  orders.forEach((order) => {
    const product = products.find((p) => p.id === order.productId);
    if (product) {
      const margins = computeOrderMargins(order, product);
      if (categoryProfitMap[product.category]) {
        categoryProfitMap[product.category].revenue += margins.invoiceRevenue;
        categoryProfitMap[product.category].profit += margins.netProfit;
      }
    }
  });

  const chartData = Object.keys(categoryProfitMap).map((cat) => {
    const data = categoryProfitMap[cat];
    const margin = data.revenue > 0 ? (data.profit / data.revenue) * 100 : 0;
    return {
      category: cat,
      profit: data.profit,
      margin: Number(margin.toFixed(1)),
    };
  });

  const COLORS = ["#0071E3", "#5856D6", "#34C759"];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Title */}
      <div className="flex flex-col px-1">
        <span className="text-[10px] uppercase font-semibold text-typography-secondary dark:text-canvas-light/60 tracking-wider">
          Performance Analytics
        </span>
        <h1 className="font-bold text-lg tracking-tight">Business Intelligence</h1>
      </div>

      {/* Category Profit Analysis Chart */}
      <div className="bg-white dark:bg-surface-dark rounded-apple-xl p-5 shadow-apple-soft border border-black/5 dark:border-white/5 flex flex-col gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-semibold text-typography-secondary dark:text-canvas-light/50 tracking-wider">
            Profitability Index
          </span>
          <h2 className="font-bold text-lg tracking-tight">Category Profit Margin (%)</h2>
        </div>

        <div className="h-44 w-full mt-2">
          {!mounted ? (
            <div className="w-full h-full bg-black/5 dark:bg-white/5 animate-pulse rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#86868B" }} unit="%" />
              <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#86868B" }} width={80} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255,255,255,0.9)",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
                formatter={(value: any) => [`${value}%`, "Margin"]}
              />
              <Bar dataKey="margin" radius={[0, 4, 4, 0]} barSize={16}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Quarterly Capital Report */}
      <div className="bg-white dark:bg-surface-dark rounded-apple-xl p-5 shadow-apple-soft border border-black/5 dark:border-white/5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-apple-indigo/10 flex items-center justify-center text-apple-indigo">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-typography-secondary dark:text-canvas-light/50 tracking-wider">
              Financial Allocation
            </span>
            <h2 className="font-bold text-base tracking-tight leading-tight">Quarterly Outflow Report</h2>
          </div>
        </div>

        <div className="space-y-4">
          {/* Outflow Breakdown lines */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-typography-secondary mb-1">
                <span>Raw Materials Acquisition</span>
                <span className="text-typography-primary dark:text-canvas-light">58% (৳24,500)</span>
              </div>
              <div className="w-full bg-canvas-light dark:bg-black/40 h-2 rounded-full overflow-hidden border border-black/5">
                <div className="bg-apple-blue h-full" style={{ width: "58%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-typography-secondary mb-1">
                <span>Logistics & Freight</span>
                <span className="text-typography-primary dark:text-canvas-light">24% (৳10,120)</span>
              </div>
              <div className="w-full bg-canvas-light dark:bg-black/40 h-2 rounded-full overflow-hidden border border-black/5">
                <div className="bg-apple-indigo h-full" style={{ width: "24%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-typography-secondary mb-1">
                <span>Factory Overhead Run-rate</span>
                <span className="text-typography-primary dark:text-canvas-light">18% (৳7,590)</span>
              </div>
              <div className="w-full bg-canvas-light dark:bg-black/40 h-2 rounded-full overflow-hidden border border-black/5">
                <div className="bg-apple-amber h-full" style={{ width: "18%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supplier rates Comparison Table */}
      <SupplierMatrix />
    </div>
  );
}
