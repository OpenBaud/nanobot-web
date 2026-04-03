import { ClientSidebar } from "@/components/ClientSidebar";
import { requireAuth } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ENFORCE AUTHENTICATION GUARD
  let needsRedirect = false;
  try {
    await requireAuth();
  } catch (e: any) {
    if (e.message === 'NEXT_REDIRECT') {
      needsRedirect = true;
    } else {
      throw e;
    }
  }

  if (needsRedirect) {
    return (
      <html lang="en">
        <head>
          <meta httpEquiv="refresh" content="0; url=/login" />
        </head>
        <body className="bg-black text-white font-mono flex items-center justify-center h-screen">
          <p>Redirecting to secure login...</p>
          <script dangerouslySetInnerHTML={{ __html: "window.location.href = '/login';" }}></script>
        </body>
      </html>
    );
  }

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
