import { requireAuth, getAuthConfig, setupSystemAuth } from "@/lib/auth";
import { SecurityView } from "./SecurityView";
import { revalidatePath } from "next/cache";

export default async function SecuritySettingsPage() {
  await requireAuth();

  const config = getAuthConfig();
  const isLocked = !!config;

  // Server action for setting up or updating auth
  async function handleSetup(formData: FormData) {
    "use server";
    const password = formData.get("password") as string;
    const confirm = formData.get("confirm") as string;
    const email = formData.get("email") as string | undefined;

    if (!password || password.length < 8) {
      return { error: "PASSWORD MUST BE AT LEAST 8 CHARACTERS" };
    }
    if (password !== confirm) {
      return { error: "PASSWORDS DO NOT MATCH" };
    }

    try {
      // Pass empty string if email is undefined/null
      await setupSystemAuth(password, email || "");
      // Revalidate the whole app to clear the static unlocked state
      revalidatePath('/', 'layout');
      return { success: true };
    } catch (e: any) {
      return { error: e.message || "FAILED TO SECURE SYSTEM" };
    }
  }

  return (
    <SecurityView 
      isLocked={isLocked} 
      recoveryEmail={config?.recoveryEmail || null} 
      action={handleSetup} 
    />
  );
}
