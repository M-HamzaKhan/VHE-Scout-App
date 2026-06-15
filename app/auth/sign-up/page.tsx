import { SignUpForm } from "@/components/sign-up-form";

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
        <SignUpForm />
      </div>
    </div>
  );
}
