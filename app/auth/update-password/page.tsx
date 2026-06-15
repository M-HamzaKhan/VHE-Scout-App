import { UpdatePasswordForm } from "@/components/update-password-form";

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
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
