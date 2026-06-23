"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Info } from "lucide-react";

interface DataPoint {
  month: string;
  sells: number;
  buys: number;
  storedAsset: number;
}

const chartData: DataPoint[] = [
  { month: "Jan", sells: 28000, buys: 18000, storedAsset: 6000 },
  { month: "Feb", sells: 35000, buys: 22000, storedAsset: 8500 },
  { month: "Mar", sells: 31000, buys: 29000, storedAsset: 14000 }, // dips here (heavy bulk buy)
  { month: "Apr", sells: 42000, buys: 24000, storedAsset: 12000 },
  { month: "May", sells: 38000, buys: 19000, storedAsset: 10500 },
  { month: "Jun", sells: 48000, buys: 26000, storedAsset: 15000 },
];

export default function CashFlowChart() {
  const [isAssetGrowthMode, setIsAssetGrowthMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Map data depending on view mode
  const data = chartData.map((d) => {
    // If Asset Growth Mode, factor in stored inventory value to offset bulk raw purchases
    const adjustedBuys = isAssetGrowthMode ? Math.max(2000, d.buys - d.storedAsset) : d.buys;
    return {
      ...d,
      adjustedBuys,
    };
  });

  if (!mounted) {
    return (
      <div className="bg-white dark:bg-surface-dark rounded-apple-xl p-5 shadow-apple-soft border border-black/5 dark:border-white/5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="w-16 h-2.5 bg-black/10 dark:bg-white/10 rounded animate-pulse" />
            <span className="w-36 h-4 bg-black/10 dark:bg-white/10 rounded mt-2 animate-pulse" />
          </div>
          <div className="w-24 h-7 bg-black/10 dark:bg-white/10 rounded-full animate-pulse" />
        </div>
        <div className="h-48 w-full bg-black/5 dark:bg-white/5 animate-pulse rounded-lg mt-2" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-surface-dark rounded-apple-xl p-5 shadow-apple-soft border border-black/5 dark:border-white/5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-semibold text-typography-secondary dark:text-canvas-light/60 tracking-wider">
            Financial Pulse
          </span>
          <span className="font-bold text-lg tracking-tight">Cash Outflow vs Inflow</span>
        </div>

        {/* Toggle Capsule Switcher */}
        <div className="flex bg-canvas-light dark:bg-black/40 p-0.5 rounded-full border border-black/5 dark:border-white/5 text-[10px] font-medium relative select-none">
          <button
            onClick={() => setIsAssetGrowthMode(false)}
            className={`py-1.5 px-3 rounded-full transition-[background-color,color,box-shadow] relative z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue ${!isAssetGrowthMode
                ? "bg-white dark:bg-surface-dark text-apple-blue font-bold shadow-sm"
                : "text-typography-secondary dark:text-canvas-light/60"
              }`}
          >
            Cash Flow
          </button>
          <button
            onClick={() => setIsAssetGrowthMode(true)}
            className={`py-1.5 px-3 rounded-full transition-[background-color,color,box-shadow] relative z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue ${isAssetGrowthMode
                ? "bg-white dark:bg-surface-dark text-apple-blue font-bold shadow-sm"
                : "text-typography-secondary dark:text-canvas-light/60"
              }`}
          >
            Asset Growth
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div className="h-48 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSells" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0071E3" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#0071E3" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorBuys" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF9500" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#FF9500" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#86868B" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#86868B" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255,255,255,0.9)",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                fontSize: "12px",
                color: "#1D1D1F",
              }}
              labelStyle={{ fontWeight: "bold" }}
            />
            <Area
              type="monotone"
              dataKey="sells"
              name="Sells (Inflow)"
              stroke="#0071E3"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSells)"
            />
            <Area
              type="monotone"
              dataKey="adjustedBuys"
              name="Buys (Outflow)"
              stroke="#FF9500"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorBuys)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Helper Context Info */}
      <div className="flex items-start gap-2 bg-canvas-light dark:bg-black/20 p-3 rounded-apple-lg text-[10px] text-typography-secondary dark:text-canvas-light/70 leading-relaxed border border-black/5 dark:border-white/5">
        <Info className="w-3.5 h-3.5 text-apple-blue shrink-0 mt-0.5" aria-hidden="true" />
        {isAssetGrowthMode ? (
          <span>
            <strong>Asset Growth View enabled:</strong> Large raw materials acquisitions are capitalized. Costs are offset by the stored value of materials remaining in the warehouse ledger.
          </span>
        ) : (
          <span>
            <strong>Cash Flow View enabled:</strong> Displays direct cash outflows when purchasing bulk materials, reflecting the immediate impact on factory liquidity.
          </span>
        )}
      </div>
    </div>
  );
}
