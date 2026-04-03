"use client";

import Link from "next/link";
import { Terminal, Settings, Activity, Globe, Network, Wifi, Cpu, Menu, X, Lock, LogOut } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function ClientSidebar() {
  const { lang, toggleLang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on route change on mobile
  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      setIsOpen(false);
    }
    return () => { isMounted = false; };
  }, [pathname]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-background border-b border-border z-40 px-4 py-3 flex items-center justify-between uppercase tracking-widest">
         <div className="flex items-center gap-3 font-bold text-foreground">
            <div className="w-2 h-2 bg-foreground animate-pulse"></div>
            NANOBOT
         </div>
         <button onClick={toggleSidebar} className="text-foreground p-1 border border-border">
            <Menu size={20} />
         </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar (Desktop Fixed, Mobile Drawer) */}
      <aside className={`fixed md:relative top-0 left-0 h-full w-64 md:w-56 border-r border-border bg-background flex flex-col uppercase tracking-widest z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-3">
              <div className="w-3 h-3 bg-foreground"></div>
              NANOBOT
            </h1>
            <p className="text-[10px] text-muted-foreground mt-2">EDGE GATEWAY</p>
          </div>
          <button className="md:hidden text-foreground" onClick={toggleSidebar}>
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          <Link 
            href="/" 
            className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold hover:bg-foreground hover:text-background transition-colors duration-200 ${pathname === '/' ? 'bg-foreground/10 text-foreground' : ''}`}
          >
            <Activity size={14} />
            {t("nav.dashboard")}
          </Link>
          <Link 
            href="/chat" 
            className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold hover:bg-foreground hover:text-background transition-colors duration-200 ${pathname === '/chat' ? 'bg-foreground/10 text-foreground' : ''}`}
          >
            <Terminal size={14} />
            {t("nav.terminal")}
          </Link>
          <Link 
            href="/config" 
            className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold hover:bg-foreground hover:text-background transition-colors duration-200 ${pathname === '/config' ? 'bg-foreground/10 text-foreground' : ''}`}
          >
            <Settings size={14} />
            {t("nav.config")}
          </Link>
          <Link 
            href="/channels" 
            className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold hover:bg-foreground hover:text-background transition-colors duration-200 ${pathname === '/channels' ? 'bg-foreground/10 text-foreground' : ''}`}
          >
            <Network size={14} />
            {t("nav.channels")}
          </Link>
          <Link 
            href="/network" 
            className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold hover:bg-foreground hover:text-background transition-colors duration-200 ${pathname === '/network' ? 'bg-foreground/10 text-foreground' : ''}`}
          >
            <Wifi size={14} />
            {lang === "en" ? "NETWORK" : "网络"}
          </Link>
          <Link 
            href="/drivers" 
            className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold hover:bg-foreground hover:text-background transition-colors duration-200 ${pathname === '/drivers' ? 'bg-foreground/10 text-foreground' : ''}`}
          >
            <Cpu size={14} />
            {lang === "en" ? "DRIVERS" : "驱动"}
          </Link>
          <Link 
            href="/settings/security" 
            className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold hover:bg-foreground hover:text-background transition-colors duration-200 ${pathname === '/settings/security' ? 'bg-foreground/10 text-foreground' : ''}`}
          >
            <Lock size={14} />
            {lang === "en" ? "SECURITY" : "安全"}
          </Link>
        </nav>
        
        {/* Language Toggle & Logout */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <button 
            onClick={toggleLang}
            className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest"
          >
            <Globe size={12} />
            {lang === "en" ? "EN / 中" : "中 / EN"}
          </button>
          <form action="/api/auth/logout" method="POST">
            <button 
              type="submit"
              className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-red-500 transition-colors uppercase tracking-widest"
              title="LOGOUT"
            >
              <LogOut size={12} />
            </button>
          </form>
        </div>

        <div className="p-6 border-t border-border flex items-center gap-2 text-[10px] text-muted-foreground">
           <div className="w-2 h-2 bg-foreground rounded-none animate-pulse"></div>
           {t("nav.status")}
        </div>
      </aside>
    </>
  );
}
