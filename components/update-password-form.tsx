"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useState } from "react";

export function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const supabase = createClient();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "28px" }}>
        <div style={{ width: "52px", height: "52px", background: "#2E5FA3", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <h1 style={{ fontSize: "20px", fontWeight: "600", color: "#0F1E3C", margin: 0 }}>VHE Scout</h1>
        <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Field Operations</p>
      </div>

      {success ? (
        <div style={{ background: "#fff", borderRadius: "16px", border: "0.5px solid #e2e8f5", padding: "24px", textAlign: "center" }}>
          <div style={{ width: "44px", height: "44px", background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 style={{ fontSize: "15px", fontWeight: "500", color: "#0F1E3C", marginBottom: "8px" }}>Password updated</h2>
          <p style={{ fontSize: "12px", color: "#64748b", lineHeight: "1.6" }}>
            Your password has been changed successfully.
          </p>
          <Link href="/auth/login" style={{ display: "block", marginTop: "16px", fontSize: "12px", color: "#2E5FA3", textDecoration: "none", fontWeight: "500" }}>
            Back to sign in
          </Link>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: "16px", border: "0.5px solid #e2e8f5", padding: "24px" }}>
          <h2 style={{ fontSize: "15px", fontWeight: "500", color: "#0F1E3C", marginBottom: "4px" }}>Set new password</h2>
          <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "20px" }}>Enter and confirm your new password below.</p>

          <form onSubmit={handleUpdatePassword} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "10px", fontWeight: "500", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>Password</label>
              <input
                type="password"
                placeholder="New password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "0.5px solid #e2e8f5", fontSize: "13px", color: "#0F1E3C", background: "#ffffff", outline: "none", WebkitAppearance: "none", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "10px", fontWeight: "500", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "0.5px solid #e2e8f5", fontSize: "13px", color: "#0F1E3C", background: "#ffffff", outline: "none", WebkitAppearance: "none", boxSizing: "border-box" }}
              />
            </div>

            {error && (
              <div style={{ padding: "10px 14px", borderRadius: "10px", background: "#fee2e2", color: "#DC2626", fontSize: "12px" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{ width: "100%", padding: "12px", borderRadius: "10px", background: isLoading ? "#4a7fc1" : "#2E5FA3", color: "#fff", border: "none", fontSize: "13px", fontWeight: "500", cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.8 : 1 }}>
              {isLoading ? "Saving..." : "Save new password"}
            </button>
          </form>
        </div>
      )}

      <p style={{ textAlign: "center", fontSize: "10px", color: "#94a3b8", marginTop: "20px" }}>
        Valerus Home Experts · Internal Use Only
      </p>
    </div>
  );
}
