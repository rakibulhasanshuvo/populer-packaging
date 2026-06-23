"use client";

import { useStore } from "@/store/useStore";
import { Bell, X, AlertTriangle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function HomeAlerts() {
  const { alerts, dismissAlert } = useStore();

  if (alerts.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1.5 px-1">
        <Bell className="w-4 h-4 text-apple-amber" aria-hidden="true" />
        <span className="text-xs font-bold uppercase tracking-wider text-typography-secondary dark:text-canvas-light/60">
          Critical Alerts ({alerts.length})
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        <AnimatePresence>
          {alerts.map((alert) => {
            const isRed = alert.severity === "red";
            
            return (
              <motion.div
                key={alert.id}
                role="status"
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: -150, transition: { duration: 0.2 } }}
                drag="x"
                dragDirectionLock
                dragConstraints={{ right: 0, left: -200 }}
                dragElastic={{ right: 0.05, left: 0.5 }}
                onDragEnd={(event, info) => {
                  if (info.offset.x < -80) {
                    dismissAlert(alert.id);
                  }
                }}
                className={`p-4 rounded-apple-lg border relative flex gap-3 shadow-sm cursor-grab active:cursor-grabbing select-none ${
                  isRed
                    ? "bg-apple-red/5 border-apple-red/20 text-apple-red dark:text-red-400"
                    : "bg-apple-amber/5 border-apple-amber/20 text-apple-amber dark:text-amber-400"
                }`}
              >
                {/* Severity Icon */}
                <div className="mt-0.5 shrink-0">
                  {isRed ? (
                    <AlertCircle className="w-5 h-5 text-apple-red" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-apple-amber" aria-hidden="true" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pr-6 select-none">
                  <div className="font-bold text-sm leading-tight text-typography-primary dark:text-canvas-light">
                    {alert.title}
                  </div>
                  <div className="text-xs mt-1 text-typography-secondary dark:text-canvas-light/70 leading-normal">
                    {alert.message}
                  </div>
                  <span className="text-[9px] mt-1.5 block opacity-60">
                    {alert.timestamp}
                  </span>
                </div>

                {/* Close Button */}
                <button type="button"
                  onClick={() => dismissAlert(alert.id)}
                  aria-label="Dismiss alert"
                  className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue"
                >
                  <X className="w-4 h-4 text-typography-secondary" aria-hidden="true" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
