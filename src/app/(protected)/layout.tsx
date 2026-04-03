import { ClientSidebar } from "@/components/ClientSidebar";
import { requireAuth } from "@/lib/auth";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ENFORCE AUTHENTICATION GUARD
  await requireAuth();

  return (
    <>
      <ClientSidebar />
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-y-auto bg-background md:pt-0 pt-[53px]">
        {children}
      </main>
    </>
  );
}
