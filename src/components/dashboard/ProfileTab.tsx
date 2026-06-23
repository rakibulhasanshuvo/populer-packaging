"use client";

import React, { useState } from "react";
import { useProfileStore } from "@/store/useProfileStore";
import { User, Mail, Phone, ShieldCheck, LogOut, CheckCircle, AlertCircle } from "lucide-react";

export default function ProfileTab() {
  const { profile, updateProfile } = useProfileStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    // Validation
    if (!name.trim()) {
      setError("Name cannot be empty");
      return;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    const phoneRegex = /^\+?[0-9\s\-()]{7,18}$/;
    if (!phoneRegex.test(phone)) {
      setError("Please enter a valid phone number");
      return;
    }

    updateProfile({ name, email, phone });
    setIsEditing(false);
    setSuccess("Profile updated successfully!");
    
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };

  const handleCancel = () => {
    setName(profile.name);
    setEmail(profile.email);
    setPhone(profile.phone);
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="space-y-6 pt-1">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-surface-dark p-5 rounded-apple-lg border border-black/5 dark:border-white/5 shadow-apple-soft flex flex-col items-center text-center">
        <div className="w-18 h-18 rounded-full bg-apple-blue/10 dark:bg-apple-blue/20 flex items-center justify-center text-apple-blue font-bold text-2xl border border-apple-blue/20 mb-3 shadow-inner">
          {profile.avatarInitials}
        </div>
        <h3 className="font-bold text-base text-typography-primary dark:text-canvas-light">
          {profile.name}
        </h3>
        <p className="text-xs text-typography-secondary mt-0.5">
          {profile.role}
        </p>
        <span className="text-[10px] uppercase font-semibold bg-apple-blue/10 text-apple-blue px-2 py-0.5 rounded-full mt-2 tracking-wider">
          {profile.adminId}
        </span>
      </div>

      {/* Success / Error Alerts */}
      {success && (
        <div aria-live="polite" className="bg-apple-green/10 text-apple-green px-4 py-3 rounded-apple-lg border border-apple-green/20 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div aria-live="polite" className="bg-apple-red/10 text-apple-red px-4 py-3 rounded-apple-lg border border-apple-red/20 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile details form */}
      <form onSubmit={handleSave} className="space-y-4">
        <div className="bg-white dark:bg-surface-dark p-4 rounded-apple-lg border border-black/5 dark:border-white/5 space-y-4">
          {/* Name input */}
          <div className="space-y-1">
            <label htmlFor="profile-name" className="text-[10px] font-bold uppercase tracking-wider text-typography-secondary">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-typography-secondary/60" aria-hidden="true" />
              <input
                id="profile-name"
                name="name"
                type="text"
                autoComplete="name"
                disabled={!isEditing}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-canvas-light dark:bg-black/20 border border-black/5 dark:border-white/5 text-sm focus:outline-none focus:ring-1 focus:ring-apple-blue disabled:opacity-75 transition-all"
              />
            </div>
          </div>

          {/* Email input */}
          <div className="space-y-1">
            <label htmlFor="profile-email" className="text-[10px] font-bold uppercase tracking-wider text-typography-secondary">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-typography-secondary/60" aria-hidden="true" />
              <input
                id="profile-email"
                name="email"
                type="email"
                autoComplete="email"
                spellCheck={false}
                disabled={!isEditing}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-canvas-light dark:bg-black/20 border border-black/5 dark:border-white/5 text-sm focus:outline-none focus:ring-1 focus:ring-apple-blue disabled:opacity-75 transition-all"
              />
            </div>
          </div>

          {/* Phone input */}
          <div className="space-y-1">
            <label htmlFor="profile-phone" className="text-[10px] font-bold uppercase tracking-wider text-typography-secondary">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 w-4 h-4 text-typography-secondary/60" aria-hidden="true" />
              <input
                id="profile-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                disabled={!isEditing}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-canvas-light dark:bg-black/20 border border-black/5 dark:border-white/5 text-sm focus:outline-none focus:ring-1 focus:ring-apple-blue disabled:opacity-75 transition-all"
              />
            </div>
          </div>

          {/* Read Only Access Rights Indicator */}
          <div className="space-y-1 border-t border-black/5 dark:border-white/5 pt-3">
            <label className="text-[10px] font-bold uppercase tracking-wider text-typography-secondary">
              Permissions Level
            </label>
            <div className="flex items-center gap-2 text-xs text-apple-green font-semibold bg-apple-green/5 p-2 rounded-lg border border-apple-green/10">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Full Read & Write Access (Owner)</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-typography-primary dark:text-canvas-light py-2.5 rounded-apple-lg text-xs font-semibold transition-colors focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-apple-blue hover:bg-apple-blue/90 text-white py-2.5 rounded-apple-lg text-xs font-semibold transition-colors focus:outline-none"
              >
                Save Changes
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="w-full bg-apple-blue hover:bg-apple-blue/90 text-white py-2.5 rounded-apple-lg text-xs font-semibold transition-colors focus:outline-none"
            >
              Edit Profile
            </button>
          )}
        </div>
      </form>

      {/* Log out section */}
      <button
        onClick={() => {
          if (confirm("Are you sure you want to log out of the PWA session?")) {
            alert("Demo session cleared.");
          }
        }}
        className="w-full bg-apple-red/5 hover:bg-apple-red/10 border border-apple-red/10 hover:border-apple-red/20 text-apple-red py-3 rounded-apple-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 focus:outline-none"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out Account</span>
      </button>
    </div>
  );
}
