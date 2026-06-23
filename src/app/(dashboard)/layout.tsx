"use client";

import Header from "@/components/dashboard/Header";
import TabBar from "@/components/dashboard/TabBar";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-typography-primary pb-[100px] pt-20">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-apple-blue focus:text-black focus:rounded-md focus:font-semibold focus:shadow-md focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Persistent Top Header */}
      <Header />

      {/* Main Content Area with Route Transitions */}
      <main
        id="main-content"
        className="flex-1 w-full max-w-lg mx-auto px-4 py-4 focus:outline-none relative"
        tabIndex={-1}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent Bottom Tab Bar */}
      <TabBar />
    </div>
  );
}

