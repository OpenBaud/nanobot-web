"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";

type Driver = {
  id: string;
  name: string;
  status: "active" | "inactive";
  interface: string;
  version: string;
  tx: string;
  rx: string;
};

export default function DriversPage() {
  const { t } = useLanguage();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedIds(next);
  };

  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/drivers');
      if (res.ok) {
        const data = await res.json();
        setDrivers(data.drivers);
      }
    } catch (e) {
      console.error("Failed to fetch drivers", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleToggle = async (id: string, currentStatus: "active" | "inactive") => {
    const action = currentStatus === "active" ? "stop" : "start";
    setActionLoading(id);
    try {
      await fetch('/api/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action })
      });
      
      setDrivers(prev => prev.map(d => 
        d.id === id ? { ...d, status: action === 'start' ? 'active' : 'inactive' } : d
      ));
    } catch (e) {
      console.error("Action failed", e);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return <div className="md:p-10 p-4 pt-8 font-mono animate-pulse uppercase tracking-widest text-xs">Acquiring Driver Telemetry...</div>;
  }

  return (
    <div className="flex-1 md:p-10 p-4 pt-8 overflow-y-auto">
      <header className="mb-12 border-b border-border pb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tighter mb-2 uppercase">{t("drivers.title")}</h2>
          <p className="text-muted-foreground text-xs md:text-sm tracking-widest uppercase">{t("drivers.subtitle")}</p>
        </div>
        <button 
          onClick={fetchDrivers}
          className="w-full md:w-auto text-[10px] uppercase tracking-widest font-bold text-foreground bg-transparent border border-border px-6 py-3 hover:bg-card transition-colors"
        >
          {t("drivers.refresh")}
        </button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-20">
        {drivers.map(driver => {
          const isActive = driver.status === "active";
          const isActionLoading = actionLoading === driver.id;
          const isExpanded = expandedIds.has(driver.id);

          return (
            <div key={driver.id} className={`p-4 md:p-6 border transition-all duration-300 flex flex-col ${isActive ? 'border-foreground bg-card' : 'border-border bg-transparent opacity-70'}`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <span className={`w-2 h-2 ${isActive ? 'bg-foreground animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-muted-foreground'}`}></span>
                  <h3 className="text-lg md:text-xl font-bold tracking-widest uppercase">{driver.name}</h3>
                </div>
                <div className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                  {driver.interface}
                </div>
              </div>

              {isExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 pt-6 border-t border-border/30 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <div className="text-[10px] text-muted-foreground mb-2 uppercase tracking-widest">{t("drivers.version")}</div>
                    <div className="text-sm font-mono text-foreground">{driver.version}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground mb-2 uppercase tracking-widest">{t("drivers.tx_rx")}</div>
                    <div className="text-sm font-mono text-foreground flex gap-4">
                      <span>↑ {driver.tx}</span>
                      <span>↓ {driver.rx}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-4 mt-4 pt-4 border-t border-border/10">
                <button 
                  onClick={() => handleToggle(driver.id, driver.status)}
                  disabled={isActionLoading}
                  className={`flex-[2] py-3 px-4 transition-colors duration-200 uppercase tracking-widest text-[10px] font-bold border ${
                    isActive 
                      ? 'border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground' 
                      : 'border-foreground bg-foreground text-background hover:bg-muted-foreground hover:border-muted-foreground'
                  } disabled:opacity-30`}
                >
                  {isActionLoading ? '...' : (isActive ? t("drivers.stop") : t("drivers.start"))}
                </button>
                <button 
                  onClick={() => toggleExpand(driver.id)}
                  className={`flex-1 border border-border text-muted-foreground py-3 px-4 hover:border-foreground hover:text-foreground transition-colors duration-200 uppercase tracking-widest text-[10px] font-bold ${isExpanded ? 'bg-border/20 text-foreground border-foreground' : ''}`}
                >
                  {t("drivers.details")}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
