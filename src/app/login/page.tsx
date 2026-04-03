import { redirect } from "next/navigation";
import { loginAction, getAuthConfig } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  // If system is NOT locked, users shouldn't even see the login page
  const config = getAuthConfig();
  if (!config) {
    redirect("/");
  }

  async function handleLogin(formData: FormData) {
    "use server";
    const password = formData.get("password") as string;
    
    if (!password) {
      return { error: "PASSWORD REQUIRED" };
    }

    let success = false;
    let errorMessage = "";

    try {
      const res = await loginAction(password);
      if (res.success) {
        success = true;
      } else {
        errorMessage = res.message || "INVALID CREDENTIALS";
      }
    } catch (e: any) {
      if (e.message === "NEXT_REDIRECT") throw e;
      errorMessage = e.message || "SYSTEM ERROR";
    }

    if (success) {
      redirect("/"); 
    } else {
      return { error: errorMessage };
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center h-full w-full bg-background text-foreground font-mono p-4">
      <div className="border border-foreground/30 p-6 md:p-8 max-w-md w-full bg-background/50 backdrop-blur shadow-2xl">
        <LoginForm action={handleLogin} />
      </div>
    </div>
  );
}
