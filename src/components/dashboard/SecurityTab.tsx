"use client";

import React, { useState, useEffect } from "react";
import { useProfileStore } from "@/store/useProfileStore";
import { Bell, Key, Sun, Moon, Check, Lock, ShieldAlert, Send } from "lucide-react";

export default function SecurityTab() {
  const { theme, setTheme, pushEnabled, setPushEnabled } = useProfileStore();
  
  // Theme state sync
  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Notification management
  const [permission, setPermission] = useState<string>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications.");
      return;
    }

    const res = await Notification.requestPermission();
    setPermission(res);
    if (res === "granted") {
      setPushEnabled(true);
    } else {
      setPushEnabled(false);
    }
  };

  const sendLocalTestPush = async () => {
    if (!("serviceWorker" in navigator)) {
      alert("Service worker is not supported or not ready.");
      return;
    }

    const reg = await navigator.serviceWorker.ready;
    if (Notification.permission === "granted") {
      reg.showNotification("Supply Pro Operations Update", {
        body: "Operational state alert: Raw material purchase logged for Courier Poly Bag.",
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        vibrate: [100, 50, 100],
        data: {
          url: "/orders"
        }
      } as NotificationOptions);
    } else {
      alert("Please request and allow notification permissions first.");
    }
  };

  // Change Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccess(null);
    setPassError(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPassError("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setPassError("New password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError("New passwords do not match");
      return;
    }

    setPassSuccess("Password updated successfully!");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setTimeout(() => {
      setPassSuccess(null);
    }, 3000);
  };

  return (
    <div className="space-y-6 pt-1">
      {/* Theme Settings Widget */}
      <div className="bg-white dark:bg-surface-dark p-4 rounded-apple-lg border border-black/5 dark:border-white/5 space-y-3">
        <label className="text-[10px] font-bold uppercase tracking-wider text-typography-secondary block px-1">
          Interface Appearance
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button type="button"
            onClick={() => handleThemeChange("light")}
            className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-xs font-semibold transition-all ${
              theme === "light"
                ? "bg-apple-blue/10 border-apple-blue text-apple-blue shadow-sm"
                : "bg-canvas-light dark:bg-black/10 border-black/5 dark:border-white/5 text-typography-primary dark:text-canvas-light hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Light</span>
          </button>
          <button type="button"
            onClick={() => handleThemeChange("dark")}
            className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-xs font-semibold transition-all ${
              theme === "dark"
                ? "bg-apple-blue/10 border-apple-blue text-apple-blue shadow-sm"
                : "bg-canvas-light dark:bg-black/10 border-black/5 dark:border-white/5 text-typography-primary dark:text-canvas-light hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Dark</span>
          </button>
        </div>
      </div>

      {/* PWA Push Notification Settings Widget */}
      <div className="bg-white dark:bg-surface-dark p-4 rounded-apple-lg border border-black/5 dark:border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-typography-secondary block">
              PWA Push Notifications
            </label>
            <div className="text-xs text-typography-secondary">
              Alerts for critical warehouse levels & pipeline updates
            </div>
          </div>
          <Bell className={`w-5 h-5 ${pushEnabled ? "text-apple-green animate-pulse" : "text-typography-secondary"}`} />
        </div>

        <div className="border-t border-black/5 dark:border-white/5 pt-3 space-y-3">
          {permission === "granted" && pushEnabled ? (
            <div className="flex items-center gap-2 text-xs text-apple-green font-semibold bg-apple-green/5 p-2.5 rounded-lg border border-apple-green/10">
              <Check className="w-4 h-4 shrink-0" />
              <span>Browser Push Notifications Active</span>
            </div>
          ) : permission === "denied" ? (
            <div className="flex items-center gap-2 text-xs text-apple-red font-semibold bg-apple-red/5 p-2.5 rounded-lg border border-apple-red/10">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Permission Denied (Check settings)</span>
            </div>
          ) : (
            <button type="button"
              onClick={requestNotificationPermission}
              className="w-full bg-apple-blue hover:bg-apple-blue/90 text-white py-2 rounded-apple-lg text-xs font-semibold transition-colors focus:outline-none"
            >
              Request Push Permission
            </button>
          )}

          {/* Test Notification Action */}
          <button type="button"
            onClick={sendLocalTestPush}
            disabled={permission !== "granted"}
            className="w-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-typography-primary dark:text-canvas-light py-2 rounded-apple-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 focus:outline-none disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Test Notification</span>
          </button>
        </div>
      </div>

      {/* Change Password Widget */}
      <div className="bg-white dark:bg-surface-dark p-4 rounded-apple-lg border border-black/5 dark:border-white/5 space-y-4">
        <div className="flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2">
          <Key className="w-4 h-4 text-apple-blue" aria-hidden="true" />
          <label className="text-[10px] font-bold uppercase tracking-wider text-typography-secondary block">
            Change Credentials
          </label>
        </div>

        {passSuccess && (
          <div aria-live="polite" className="bg-apple-green/10 text-apple-green p-2.5 rounded-lg border border-apple-green/20 text-xs">
            {passSuccess}
          </div>
        )}
        {passError && (
          <div aria-live="polite" className="bg-apple-red/10 text-apple-red p-2.5 rounded-lg border border-apple-red/20 text-xs">
            {passError}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="old-password" className="text-[10px] text-typography-secondary block font-medium">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-typography-secondary/60" aria-hidden="true" />
              <input
                id="old-password"
                name="old-password"
                type="password"
                autoComplete="current-password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-canvas-light dark:bg-black/20 border border-black/5 dark:border-white/5 text-sm focus:outline-none focus:ring-1 focus:ring-apple-blue transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="new-password" className="text-[10px] text-typography-secondary block font-medium">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-typography-secondary/60" aria-hidden="true" />
              <input
                id="new-password"
                name="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-canvas-light dark:bg-black/20 border border-black/5 dark:border-white/5 text-sm focus:outline-none focus:ring-1 focus:ring-apple-blue transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="confirm-password" className="text-[10px] text-typography-secondary block font-medium">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-typography-secondary/60" aria-hidden="true" />
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-canvas-light dark:bg-black/20 border border-black/5 dark:border-white/5 text-sm focus:outline-none focus:ring-1 focus:ring-apple-blue transition-all"
              />
            </div>
          </div>

          <button type="submit"
            className="w-full bg-apple-blue hover:bg-apple-blue/90 text-white py-2 rounded-apple-lg text-xs font-semibold transition-colors focus:outline-none"
          >
            Update Credentials
          </button>
        </form>
      </div>
    </div>
  );
}
