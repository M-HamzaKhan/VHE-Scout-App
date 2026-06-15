import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="min-h-svh bg-[#eef1f8] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
