import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatarInitials: string;
  role: string;
  adminId: string;
}

interface ProfileState {
  profile: UserProfile;
  theme: "light" | "dark" | "system";
  pushEnabled: boolean;
  emailNotifications: boolean;

  updateProfile: (updates: Partial<Omit<UserProfile, "role" | "adminId">>) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setPushEnabled: (enabled: boolean) => void;
  setEmailNotifications: (enabled: boolean) => void;
}

// Background sync helper to communicate profile updates to backend API
const syncProfileWithBackend = async (data: {
  name: string;
  email: string;
  phone: string;
  theme: string;
}) => {
  try {
    const res = await fetch("/api/profile/sync-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      console.warn("API Profile Sync failed (fallback to offline localStorage).");
    }
  } catch (err) {
    console.error("Network error during API Profile Sync:", err);
  }
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: {
        name: "Rakibul Hasan Shuvo",
        email: "shuvo@popularpackaging.com",
        phone: "+8801712345678",
        avatarInitials: "RS",
        role: "Operations Administrator",
        adminId: "SP-ADMIN-01",
      },
      theme: "dark",
      pushEnabled: false,
      emailNotifications: true,

      updateProfile: (updates) =>
        set((state) => {
          const newInitials = updates.name
            ? updates.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            : state.profile.avatarInitials;

          const updatedProfile = {
            ...state.profile,
            ...updates,
            avatarInitials: updates.name ? newInitials : state.profile.avatarInitials,
          };

          // Async sync to Supabase/PostgreSQL backend route
          syncProfileWithBackend({
            name: updatedProfile.name,
            email: updatedProfile.email,
            phone: updatedProfile.phone,
            theme: state.theme,
          });

          return {
            profile: updatedProfile,
          };
        }),

      setTheme: (theme) =>
        set((state) => {
          // Async sync to Supabase/PostgreSQL backend route
          syncProfileWithBackend({
            name: state.profile.name,
            email: state.profile.email,
            phone: state.profile.phone,
            theme,
          });
          return { theme };
        }),

      setPushEnabled: (enabled) => set({ pushEnabled: enabled }),
      setEmailNotifications: (enabled) => set({ emailNotifications: enabled }),
    }),
    {
      name: "supply-pro-profile-state",
    }
  )
);
