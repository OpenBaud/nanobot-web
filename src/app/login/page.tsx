import { getAuthConfig } from "@/lib/auth";
import { LoginForm } from "@/components/LoginForm";

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export default async function LoginPage() {
  try {
    const config = await getAuthConfig();
    if (!config) {
      return (
        <html lang="en">
          <head>
            <meta httpEquiv="refresh" content="0; url=/" />
          </head>
          <body className="bg-black text-white font-mono flex items-center justify-center h-screen">
            <script dangerouslySetInnerHTML={{ __html: "window.location.href = '/';" }}></script>
          </body>
        </html>
      );
    }
  } catch (e: any) {
    if (e.message !== 'NEXT_REDIRECT') throw e;
  }

  return (
    <div className="flex flex-1 items-center justify-center h-full w-full bg-background text-foreground font-mono p-4">
      <div className="border border-foreground/30 p-6 md:p-8 max-w-md w-full bg-background/50 backdrop-blur shadow-2xl">
        <LoginForm />
      </div>
    </div>
  );
}
