"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<any>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const [sysRes, procRes] = await Promise.all([
        fetch('/api/status'),
        fetch('/api/process')
      ]);
      const sysData = await sysRes.json();
      const procData = await procRes.json();
      
      setStatus(sysData);
      setIsRunning(procData.isRunning);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleProcessAction = async (action: 'start' | 'stop') => {
    setActionLoading(true);
    try {
      await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      await fetchStatus();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex-1 md:p-10 p-4 pt-8 overflow-y-auto">
      <header className="mb-8 md:mb-12 border-b border-border pb-6">
        <h2 className="text-2xl md:text-4xl font-bold tracking-tighter mb-2 uppercase">{t("dashboard.title")}</h2>
        <p className="text-muted-foreground text-[10px] md:text-sm tracking-widest uppercase">{t("dashboard.subtitle")}</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-10">
        {/* Status Panel */}
        <div className="border border-border flex flex-col">
          <div className="px-4 md:px-6 py-4 border-b border-border flex justify-between items-center uppercase tracking-widest text-[10px] md:text-xs font-bold text-muted-foreground">
            <span>{t("dashboard.monitor")}</span>
            <div className="flex items-center gap-2">
              <span className="text-[9px] md:text-[10px]">{isRunning ? t("dashboard.active") : t("dashboard.inactive")}</span>
              <span className={`h-2 w-2 ${isRunning ? 'bg-foreground' : 'bg-destructive/50'}`}></span>
            </div>
          </div>
          <div className="p-6 md:p-8 flex-1 flex flex-col gap-8">
            <div className="grid grid-cols-2 gap-6 md:gap-8">
              <div>
                <div className="text-[9px] md:text-[10px] text-muted-foreground mb-2 uppercase tracking-widest">{t("dashboard.service")}</div>
                <div className="text-xl md:text-2xl font-light">nanobot-gateway</div>
              </div>
              <div>
                <div className="text-[9px] md:text-[10px] text-muted-foreground mb-2 uppercase tracking-widest">{t("dashboard.port")}</div>
                <div className="text-xl md:text-2xl font-light font-mono">18790</div>
              </div>
              <div>
                <div className="text-[9px] md:text-[10px] text-muted-foreground mb-2 uppercase tracking-widest">{t("dashboard.version")}</div>
                <div className="text-lg md:text-xl font-light font-mono">{status?.version ? status.version.replace(/[^v0-9.]/g, '') : '--'}</div>
              </div>
            </div>
            
            <div className="mt-auto pt-4 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => handleProcessAction('start')}
                disabled={actionLoading || isRunning}
                className="flex-1 border border-foreground bg-transparent text-foreground py-3 px-6 hover:bg-foreground hover:text-background transition-colors duration-200 uppercase tracking-widest text-[10px] font-bold disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-foreground"
              >
                {actionLoading && !isRunning ? t("dashboard.initializing") : t("dashboard.init")}
              </button>
              <button 
                onClick={() => handleProcessAction('stop')}
                disabled={actionLoading || !isRunning}
                className="flex-1 border border-destructive text-destructive py-3 px-6 hover:bg-destructive hover:text-destructive-foreground transition-colors duration-200 uppercase tracking-widest text-[10px] font-bold disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-destructive"
              >
                {t("dashboard.halt")}
              </button>
            </div>
          </div>
        </div>

        {/* Sys Info Panel */}
        <div className="border border-border flex flex-col bg-card">
          <div className="px-4 md:px-6 py-4 border-b border-border uppercase tracking-widest text-[10px] md:text-xs font-bold text-muted-foreground">
            <span>{t("dashboard.diag")}</span>
          </div>
          <div className="p-4 md:p-6 flex-1 text-muted-foreground font-mono text-[11px] md:text-[13px] overflow-x-auto relative min-h-[250px] md:min-h-[300px]">
            {loading && <div className="absolute inset-0 flex items-center justify-center bg-background/80"><span className="animate-pulse">{t("dashboard.awaiting")}</span></div>}
            <pre className="leading-loose">
{`$ nanobot status --diagnostics

${status?.statusInfo || ''}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
