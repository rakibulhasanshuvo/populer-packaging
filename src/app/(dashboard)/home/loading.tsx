import { RefreshCw } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page Title */}
      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-semibold text-typography-secondary tracking-wider">
          Operations Hub
        </span>
        <h1 className="font-bold text-lg tracking-tight">Dashboard Overview</h1>
      </div>

      <div className="flex justify-center items-center py-20 text-typography-secondary">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        Hydrating metrics...
      </div>
    </div>
  );
}
