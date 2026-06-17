export default function Page() {
  return (
    <div style={{
      minHeight: "100svh",
      background: "#eef1f8",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px"
    }}>
      <div style={{ width: "100%", maxWidth: "360px" }}>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "28px" }}>
          <div style={{ width: "52px", height: "52px", background: "#2E5FA3", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: "600", color: "#0F1E3C", margin: 0 }}>VHE Scout</h1>
          <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>Field Operations Â· OKC & KC</p>
        </div>

        <div style={{ background: "#fff", borderRadius: "16px", border: "0.5px solid #e2e8f5", padding: "24px", textAlign: "center" }}>
          <div style={{ width: "48px", height: "48px", background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#0F1E3C", marginBottom: "8px" }}>Request received</h2>
          <p style={{ fontSize: "12px", color: "#64748b", lineHeight: "1.7", marginBottom: "20px" }}>
            Your account request has been submitted. An Ops Manager will review and approve your account. Once approved, you will be able to sign in.
          </p>
          <a href="/auth/login" style={{ display: "block", width: "100%", padding: "12px", borderRadius: "10px", background: "#2E5FA3", color: "#fff", textDecoration: "none", fontSize: "13px", fontWeight: "500", textAlign: "center" }}>
            Back to sign in
          </a>
        </div>

        <p style={{ textAlign: "center", fontSize: "10px", color: "#94a3b8", marginTop: "20px" }}>
          Valerus Home Experts Â· Internal Use Only
        </p>
      </div>
    </div>
  );
}
