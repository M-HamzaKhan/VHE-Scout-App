import { AuthButton } from "@/components/auth-button";
import { Suspense } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <nav style={{
        background: "var(--navy)",
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ color: "#fff", fontSize: "14px", fontWeight: "500" }}>
          VHE Scout
        </div>
        <Suspense fallback={null}>
          <AuthButton />
        </Suspense>
      </nav>
      <main>{children}</main>
    </div>
  );
}
