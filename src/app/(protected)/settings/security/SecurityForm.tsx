"use client";

import { useState } from "react";
import { Terminal, Save } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

export function SecurityForm({ action }: { action: (formData: FormData) => Promise<any> }) {
  const { t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    const formData = new FormData(e.currentTarget);
    try {
      const res = await action(formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccess(true);
        // Refresh page or user is now locked.
        window.location.reload();
      }
    } catch (err: any) {
      setError(t("auth.sys_error") || "UNEXPECTED ERROR");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-2xl">
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 text-xs flex items-center gap-3 uppercase tracking-wider">
          <Terminal className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-4 text-xs flex items-center gap-3 uppercase tracking-wider">
          <Terminal className="w-4 h-4 shrink-0" />
          {t("security.success")}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        <div className="flex flex-col gap-3">
          <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase block">
            {t("security.new_pass")}
          </label>
          <input
            type="password"
            name="password"
            required
            className="w-full bg-transparent border-b border-border pb-2 focus:border-foreground outline-none font-mono text-sm transition-colors"
            placeholder="••••••••"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase block">
            {t("security.confirm_pass")}
          </label>
          <input
            type="password"
            name="confirm"
            required
            className="w-full bg-transparent border-b border-border pb-2 focus:border-foreground outline-none font-mono text-sm transition-colors"
            placeholder="••••••••"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-8 mt-2">
        <div className="flex justify-between items-end">
          <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase block">
            {t("security.email_label")}
          </label>
          <span className="text-[10px] text-muted-foreground uppercase bg-foreground/10 px-2 py-0.5">OPTIONAL</span>
        </div>
        <input
          type="email"
          name="email"
          className="w-full max-w-md bg-transparent border-b border-border pb-2 focus:border-foreground outline-none font-mono text-sm transition-colors placeholder:text-foreground/20"
          placeholder="admin@edge.node"
        />
        <p className="text-xs text-muted-foreground mt-2 uppercase max-w-md leading-relaxed">
          {t("security.email_desc")}
        </p>
      </div>

      <div className="pt-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto min-w-[240px] flex items-center justify-center py-3 px-8 border border-transparent text-[10px] font-bold bg-foreground text-background hover:bg-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground focus:ring-offset-background disabled:opacity-50 transition-colors uppercase tracking-widest"
        >
          <Save className="mr-3 h-4 w-4" />
          {loading ? t("security.committing") : t("security.init_sec")}
        </button>
      </div>
    </form>
  );
}
