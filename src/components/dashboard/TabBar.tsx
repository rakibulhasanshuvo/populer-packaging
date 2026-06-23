"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, FolderClosed, ShoppingBag, PieChart } from "lucide-react";

const TABS = [
  { path: "/home", label: "Home", icon: Home },
  { path: "/products", label: "Catalog", icon: FolderClosed },
  { path: "/orders", label: "Orders", icon: ShoppingBag },
  { path: "/analytics", label: "Analytics", icon: PieChart },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[84px] bg-black/40 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-4 z-40 pb-[calc(env(safe-area-inset-bottom)+12px)]">
      {TABS.map((tab) => {
        const isActive = pathname.startsWith(tab.path);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.path}
            href={tab.path}
            className="relative flex flex-col items-center justify-center py-2 px-4 focus:outline-none rounded-xl select-none"
          >
            {isActive && (
              <motion.div
                layoutId="active-tab-indicator"
                className="absolute inset-0 bg-apple-blue/10 rounded-full -z-10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <Icon
              aria-hidden="true"
              className={`h-5 w-5 transition-colors duration-200 ${isActive ? "text-apple-blue" : "text-typography-secondary"}`}
            />
            <span
              className={`text-[10px] mt-1 font-medium transition-colors duration-200 ${isActive ? "text-apple-blue" : "text-typography-secondary"}`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
