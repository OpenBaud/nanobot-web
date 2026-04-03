"use client";

import { useState } from "react";
import { Lock, ArrowRight, Terminal } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export function LoginForm({ action }: { action: (formData: FormData) => Promise<any> }) {
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    try {
      const res = await action(formData);
      if (res?.error) {
        setError(res.error);
      }
    } catch (err: any) {
      setError(t("auth.sys_error") || "UNEXPECTED ERROR");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-3 border-b border-foreground/30 pb-4">
          <div className="w-4 h-4 bg-red-500 animate-pulse" />
          <h1 className="text-xl tracking-widest font-bold uppercase">{t("auth.system_locked")}</h1>
        </div>
        <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">
          {t("auth.auth_required")}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 text-xs flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            {error}
          </div>
        )}

        {showRecovery ? (
          <div className="bg-foreground/5 border border-foreground/20 p-4 text-xs">
            <p className="mb-2 text-muted-foreground uppercase">{t("auth.recovery_inst")}</p>
            <p className="mb-2">{t("auth.recovery_desc")}</p>
            <code className="bg-black text-green-400 p-2 block w-full overflow-x-auto whitespace-nowrap mt-2">
              rm data/auth.json && systemctl restart nanobot-web
            </code>
            <button 
              type="button" 
              onClick={() => setShowRecovery(false)}
              className="mt-4 text-foreground/70 hover:text-foreground underline decoration-foreground/30 underline-offset-4"
            >
              {t("auth.return")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-muted-foreground tracking-widest uppercase">
                {t("auth.credentials")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full bg-background border border-foreground/20 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-foreground transition-colors font-mono placeholder:text-foreground/20"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium bg-foreground text-background hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground focus:ring-offset-background disabled:opacity-50 transition-all uppercase tracking-widest mt-2"
            >
              {loading ? t("auth.authenticating") : t("auth.initialize")}
              {!loading && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
            </button>
            
            <div className="mt-4 flex justify-between items-center text-[10px]">
              <span className="text-muted-foreground">{t("auth.edge_secure")}</span>
              <button 
                type="button" 
                onClick={() => setShowRecovery(true)}
                className="text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
              >
                {t("auth.forgot")}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="mt-8 text-[10px] text-muted-foreground border-t border-foreground/10 pt-4 flex justify-between uppercase tracking-widest">
        <span>EDGE NODE UI v1.0</span>
        <span>{t("auth.edge_secure")} ACTIVE</span>
      </div>
    </>
  );
}
