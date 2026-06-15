"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/protected` },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col", className)} {...props}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "28px" }}>
        <div style={{ width: "52px", height: "52px", background: "#2E5FA3", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <h1 style={{ fontSize: "20px", fontWeight: "600", color: "#0F1E3C", margin: 0 }}>VHE Scout</h1>
        <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Field Operations · OKC & KC</p>
      </div>

      <div style={{ background: "#fff", borderRadius: "16px", border: "0.5px solid #e2e8f5", padding: "24px" }}>
        <h2 style={{ fontSize: "15px", fontWeight: "500", color: "#0F1E3C", marginBottom: "4px" }}>Create your account</h2>
        <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "20px" }}>Enter your details to get started as a VHE Scout.</p>

        <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "10px", fontWeight: "500", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>Email address</label>
            <input
              type="email"
              placeholder="scout@valerusre.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "0.5px solid #e2e8f5", fontSize: "13px", color: "#0F1E3C", background: "#f8fafc", outline: "none" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "10px", fontWeight: "500", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "0.5px solid #e2e8f5", fontSize: "13px", color: "#0F1E3C", background: "#f8fafc", outline: "none" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "10px", fontWeight: "500", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>Confirm password</label>
            <input
              type="password"
              required
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "0.5px solid #e2e8f5", fontSize: "13px", color: "#0F1E3C", background: "#f8fafc", outline: "none" }}
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
            {isLoading ? "Creating account..." : "Create account"}
          </button>

          <div style={{ textAlign: "center", fontSize: "12px", color: "#64748b" }}>
            Already have an account?{" "}
            <Link href="/auth/login" style={{ color: "#2E5FA3", textDecoration: "none", fontWeight: "500" }}>Sign in</Link>
          </div>
        </form>
      </div>

      <p style={{ textAlign: "center", fontSize: "10px", color: "#94a3b8", marginTop: "20px" }}>
        Valerus Home Experts · Internal Use Only
      </p>
    </div>
  );
}
