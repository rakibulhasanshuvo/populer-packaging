import { RefreshCw } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex justify-center items-center py-20 text-typography-secondary">
      <RefreshCw className="w-6 h-6 animate-spin mr-2" />
      Loading catalog...
    </div>
  );
}
