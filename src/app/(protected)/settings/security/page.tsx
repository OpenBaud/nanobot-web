import { requireAuth, getAuthConfig } from "@/lib/auth";
import { SecurityView } from "./SecurityView";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export default async function SecuritySettingsPage() {
  await requireAuth();

  const config = await getAuthConfig();
  const isLocked = !!config;

  return (
    <SecurityView
      isLocked={isLocked}
      recoveryEmail={config?.recoveryEmail || null}
    />
  );
}
