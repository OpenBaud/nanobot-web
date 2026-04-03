"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { SecurityForm } from "./SecurityForm";

interface SecurityViewProps {
  isLocked: boolean;
  recoveryEmail: string | null;
  action: (formData: FormData) => Promise<any>;
}

export function SecurityView({ isLocked, recoveryEmail, action }: SecurityViewProps) {
  const { t } = useLanguage();

  return (
    <div className="flex-1 md:p-10 p-4 pt-8 overflow-y-auto">
      <header className="mb-12 border-b border-border pb-6">
        <h2 className="text-2xl md:text-4xl font-bold tracking-tighter mb-2 uppercase font-mono">{t("security.title")}</h2>
        <p className="text-sm text-muted-foreground uppercase tracking-wider font-mono">
          {isLocked ? t("security.locked_desc") : t("security.unlocked_desc")}
        </p>
      </header>

      <div className="max-w-4xl space-y-12 pb-20 font-mono">
        <div className="border border-foreground/20 p-6 md:p-8 bg-background/50">
          <div className="flex items-center gap-3 mb-8">
            <div className={`w-3 h-3 ${isLocked ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
            <h2 className="text-lg md:text-xl font-bold tracking-widest uppercase min-w-[280px]">
              {isLocked ? t("security.active") : t("security.disabled")}
            </h2>
          </div>

          {isLocked ? (
            <div className="flex flex-col gap-6 text-sm max-w-2xl">
              <p className="text-muted-foreground uppercase">
                {t("security.enforced")}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8 border-t border-foreground/10 pt-6">
                <div className="text-muted-foreground uppercase text-xs font-bold md:pt-1">{t("security.recovery_email")}</div>
                <div className="md:col-span-2 text-foreground truncate">{recoveryEmail || t("security.unspecified")}</div>
                
                <div className="text-muted-foreground uppercase text-xs font-bold md:pt-1">{t("security.reset_proc")}</div>
                <div className="md:col-span-2">
                  <code className="bg-black text-green-400 p-2.5 px-4 block w-full overflow-x-auto whitespace-nowrap shadow-inner border border-foreground/10">
                    rm data/auth.json
                  </code>
                </div>
              </div>
            </div>
          ) : (
            <SecurityForm action={action} />
          )}
        </div>
      </div>
    </div>
  );
}
