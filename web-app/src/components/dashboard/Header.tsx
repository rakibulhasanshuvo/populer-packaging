"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function Header() {
  const [fullName, setFullName] = useState<string>("User");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();
          if (data?.full_name) {
            setFullName(data.full_name);
          } else if (user.email) {
            setFullName(user.email.split("@")[0]);
          }
        }
      } catch (e) {
        // Fallback if supabase client is not initialized or user not logged in
      }
    }
    fetchProfile();
  }, []);

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "US";

  return (
    <header className="fixed top-0 left-0 right-0 h-16 px-4 bg-black/40 backdrop-blur-xl border-b border-white/10 flex items-center justify-between z-40 pt-[calc(env(safe-area-inset-top)+8px)]">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-electric flex items-center justify-center text-white font-bold text-lg shadow-sm">
          S
        </div>
        <span className="font-bold text-lg tracking-tight text-typography-primary">Supply Pro</span>
        <span className="text-[10px] uppercase font-semibold bg-cyan-neon/10 text-cyan-neon px-1.5 py-0.5 rounded-full tracking-wider">
          PWA
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-cyan-neon/10 text-cyan-neon flex items-center justify-center font-bold text-xs border border-cyan-neon/20">
          {initials}
        </div>
      </div>
    </header>
  );
}


