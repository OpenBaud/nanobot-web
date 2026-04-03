"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";

export default function NetworkPage() {
  const { lang } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);

  // Mock state for design purposes
  const [eth0, setEth0] = useState({
    enabled: true,
    dhcp: true,
    ip: "192.168.1.100",
    subnet: "255.255.255.0",
    gateway: "192.168.1.1",
    dns: "8.8.8.8, 1.1.1.1",
    mac: "00:1A:2B:3C:4D:5E"
  });

  const [wlan0, setWlan0] = useState({
    enabled: false,
    ssid: "",
    password: "",
    hidden: false,
    mac: "00:1A:2B:3C:4D:5F"
  });

  const [wwan0, setWwan0] = useState({
    enabled: false,
    apn: "internet",
    pin: "",
    dialNumber: "*99#",
    signal: "-85 dBm / LTE"
  });

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Implement actual save logic calling /api/network
    setTimeout(() => setIsSaving(false), 1000);
  };

  const handleRefresh = async () => {
    // Mock refresh
  };

  const t = (key: string) => {
    const dict: any = {
      "en": {
        "title": "NETWORK CONFIGURATION",
        "subtitle": "EDGE GATEWAY INTERFACES",
        "refresh": "REFRESH STATUS",
        "commit": "APPLY CHANGES",
        "committing": "APPLYING...",
        "eth0_title": "ETH0 / WIRED",
        "wlan0_title": "WLAN0 / WIRELESS",
        "wwan0_title": "WWAN0 / CELLULAR",
        "dhcp": "DHCP (AUTO IP)",
        "ip_addr": "IP ADDRESS",
        "subnet": "SUBNET MASK",
        "gateway": "GATEWAY",
        "dns": "DNS SERVERS",
        "ssid": "NETWORK NAME (SSID)",
        "password": "PASSWORD",
        "hidden": "HIDDEN NETWORK",
        "apn": "APN",
        "pin": "SIM PIN CODE",
        "dial": "DIAL NUMBER",
        "signal": "SIGNAL STRENGTH",
        "enable": "ENABLE INTERFACE",
        "disable": "DISABLE INTERFACE"
      },
      "zh": {
         "title": "网络配置",
         "subtitle": "边缘网关接口",
         "refresh": "刷新状态",
         "commit": "应用更改",
         "committing": "应用中...",
         "eth0_title": "ETH0 / 有线网络",
         "wlan0_title": "WLAN0 / 无线网络",
         "wwan0_title": "WWAN0 / 蜂窝网络",
         "dhcp": "DHCP (自动获取IP)",
         "ip_addr": "IP 地址",
         "subnet": "子网掩码",
         "gateway": "网关",
         "dns": "DNS 服务器",
         "ssid": "网络名称 (SSID)",
         "password": "密码",
         "hidden": "隐藏网络",
         "apn": "接入点名称 (APN)",
         "pin": "SIM 卡 PIN 码",
         "dial": "拨号号码",
         "signal": "信号强度",
         "enable": "启用接口",
         "disable": "禁用接口"
      }
    };
    return dict[lang === "en" ? "en" : "zh"][key] || key;
  };

  return (
    <div className="flex-1 md:p-10 p-4 pt-8 overflow-y-auto">
      <header className="mb-8 md:mb-12 border-b border-border pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tighter mb-2 uppercase">{t("title")}</h2>
          <p className="text-muted-foreground text-[10px] md:text-sm tracking-widest uppercase">{t("subtitle")}</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={handleRefresh}
            className="flex-1 md:flex-none text-[10px] uppercase tracking-widest font-bold text-foreground bg-transparent border border-border px-4 md:px-6 py-3 hover:bg-card transition-colors"
          >
            {t("refresh")}
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 md:flex-none text-[10px] uppercase tracking-widest font-bold text-background bg-foreground px-4 md:px-6 py-3 hover:bg-muted-foreground transition-colors disabled:opacity-50"
          >
            {isSaving ? t("committing") : t("commit")}
          </button>
        </div>
      </header>

      <div className="max-w-4xl space-y-6 md:space-y-8 pb-20">
        
        {/* ETH0 (Wired) */}
        <section className={`p-4 md:p-6 border transition-all duration-300 ${eth0.enabled ? 'border-foreground bg-card' : 'border-border bg-transparent opacity-60'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-border/50 gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                 <span className={`w-3 h-3 ${eth0.enabled ? 'bg-foreground animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-muted-foreground'}`}></span>
                 <h3 className="text-lg md:text-xl font-bold tracking-widest uppercase">{t("eth0_title")}</h3>
              </div>
            </div>
            <div className="text-[10px] font-mono text-muted-foreground">MAC: {eth0.mac}</div>
          </div>

          <div className="space-y-6">
            <label className="flex items-center gap-4 cursor-pointer group w-max">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={eth0.dhcp}
                  onChange={(e) => setEth0({...eth0, dhcp: e.target.checked})}
                  className="appearance-none w-5 h-5 border border-border checked:bg-foreground checked:border-foreground transition-colors rounded-none"
                />
                {eth0.dhcp && (
                  <svg className="absolute w-3 h-3 text-background pointer-events-none" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"/>
                  </svg>
                )}
              </div>
              <div className="font-bold text-xs md:text-sm tracking-widest uppercase">{t("dhcp")}</div>
            </label>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 transition-opacity duration-300 ${eth0.dhcp ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase block">{t("ip_addr")}</label>
                <input 
                  type="text" 
                  value={eth0.ip}
                  onChange={(e) => setEth0({...eth0, ip: e.target.value})}
                  disabled={eth0.dhcp}
                  className="w-full bg-transparent border-b border-border pb-2 focus:border-foreground outline-none font-mono text-sm transition-colors text-foreground disabled:text-muted-foreground"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase block">{t("subnet")}</label>
                <input 
                  type="text" 
                  value={eth0.subnet}
                  onChange={(e) => setEth0({...eth0, subnet: e.target.value})}
                  disabled={eth0.dhcp}
                  className="w-full bg-transparent border-b border-border pb-2 focus:border-foreground outline-none font-mono text-sm transition-colors text-foreground disabled:text-muted-foreground"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase block">{t("gateway")}</label>
                <input 
                  type="text" 
                  value={eth0.gateway}
                  onChange={(e) => setEth0({...eth0, gateway: e.target.value})}
                  disabled={eth0.dhcp}
                  className="w-full bg-transparent border-b border-border pb-2 focus:border-foreground outline-none font-mono text-sm transition-colors text-foreground disabled:text-muted-foreground"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase block">{t("dns")}</label>
                <input 
                  type="text" 
                  value={eth0.dns}
                  onChange={(e) => setEth0({...eth0, dns: e.target.value})}
                  disabled={eth0.dhcp}
                  className="w-full bg-transparent border-b border-border pb-2 focus:border-foreground outline-none font-mono text-sm transition-colors text-foreground disabled:text-muted-foreground"
                />
              </div>
            </div>
          </div>
        </section>

        {/* WLAN0 (Wi-Fi) */}
        <section className={`p-4 md:p-6 border transition-all duration-300 ${wlan0.enabled ? 'border-foreground bg-card' : 'border-border bg-transparent opacity-60'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-border/50 gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                 <span className={`w-3 h-3 ${wlan0.enabled ? 'bg-foreground animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-muted-foreground'}`}></span>
                 <h3 className="text-lg md:text-xl font-bold tracking-widest uppercase">{t("wlan0_title")}</h3>
              </div>
              <div className="text-[10px] font-mono text-muted-foreground hidden sm:block">MAC: {wlan0.mac}</div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
              <div className="text-[10px] font-mono text-muted-foreground sm:hidden">MAC: {wlan0.mac}</div>
              <button 
                onClick={() => setWlan0({...wlan0, enabled: !wlan0.enabled})}
                className={`text-[10px] px-4 py-2 font-bold tracking-widest uppercase border transition-colors ${wlan0.enabled ? 'border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground' : 'border-foreground text-foreground hover:bg-foreground hover:text-background'}`}
              >
                {wlan0.enabled ? t("disable") : t("enable")}
              </button>
            </div>
          </div>

          {wlan0.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase block">{t("ssid")}</label>
                <input 
                  type="text" 
                  value={wlan0.ssid}
                  onChange={(e) => setWlan0({...wlan0, ssid: e.target.value})}
                  className="w-full bg-transparent border-b border-border pb-2 focus:border-foreground outline-none font-mono text-sm transition-colors text-foreground"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase block">{t("password")}</label>
                <input 
                  type="password" 
                  value={wlan0.password}
                  onChange={(e) => setWlan0({...wlan0, password: e.target.value})}
                  className="w-full bg-transparent border-b border-border pb-2 focus:border-foreground outline-none font-mono text-sm transition-colors text-foreground"
                />
              </div>
              <div className="md:col-span-2 pt-2">
                <label className="flex items-center gap-4 cursor-pointer group w-max">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      checked={wlan0.hidden}
                      onChange={(e) => setWlan0({...wlan0, hidden: e.target.checked})}
                      className="appearance-none w-5 h-5 border border-border checked:bg-foreground checked:border-foreground transition-colors rounded-none"
                    />
                    {wlan0.hidden && (
                      <svg className="absolute w-3 h-3 text-background pointer-events-none" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"/>
                      </svg>
                    )}
                  </div>
                  <div className="font-bold text-xs md:text-sm tracking-widest uppercase">{t("hidden")}</div>
                </label>
              </div>
            </div>
          )}
        </section>

        {/* WWAN0 (Cellular 4G) */}
        <section className={`p-4 md:p-6 border transition-all duration-300 ${wwan0.enabled ? 'border-foreground bg-card' : 'border-border bg-transparent opacity-60'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-border/50 gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                 <span className={`w-3 h-3 ${wwan0.enabled ? 'bg-foreground animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-muted-foreground'}`}></span>
                 <h3 className="text-lg md:text-xl font-bold tracking-widest uppercase">{t("wwan0_title")}</h3>
              </div>
              <div className="text-[10px] font-mono text-muted-foreground hidden sm:flex items-center gap-2">
                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M8.288 15c-3.926 0-6.612-2.807-8.153-5.355C-.237 8.98 1.5 7.6 1.5 7.6s1.611.83 2.127 2.115c.677 1.685 2.123 3.385 4.661 3.385 2.537 0 3.984-1.7 4.66-3.385.517-1.284 2.128-2.115 2.128-2.115s1.737 1.38 1.383 2.045C14.9 12.193 12.213 15 8.288 15z"></path></svg>
                 {wwan0.signal}
              </div>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
              <div className="text-[10px] font-mono text-muted-foreground sm:hidden flex items-center gap-2">
                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M8.288 15c-3.926 0-6.612-2.807-8.153-5.355C-.237 8.98 1.5 7.6 1.5 7.6s1.611.83 2.127 2.115c.677 1.685 2.123 3.385 4.661 3.385 2.537 0 3.984-1.7 4.66-3.385.517-1.284 2.128-2.115 2.128-2.115s1.737 1.38 1.383 2.045C14.9 12.193 12.213 15 8.288 15z"></path></svg>
                 {wwan0.signal}
              </div>
              <button 
                onClick={() => setWwan0({...wwan0, enabled: !wwan0.enabled})}
                className={`text-[10px] px-4 py-2 font-bold tracking-widest uppercase border transition-colors ${wwan0.enabled ? 'border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground' : 'border-foreground text-foreground hover:bg-foreground hover:text-background'}`}
              >
                {wwan0.enabled ? t("disable") : t("enable")}
              </button>
            </div>
          </div>

          {wwan0.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase block">{t("apn")}</label>
                <input 
                  type="text" 
                  value={wwan0.apn}
                  onChange={(e) => setWwan0({...wwan0, apn: e.target.value})}
                  className="w-full bg-transparent border-b border-border pb-2 focus:border-foreground outline-none font-mono text-sm transition-colors text-foreground"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase block">{t("dial")}</label>
                <input 
                  type="text" 
                  value={wwan0.dialNumber}
                  onChange={(e) => setWwan0({...wwan0, dialNumber: e.target.value})}
                  className="w-full bg-transparent border-b border-border pb-2 focus:border-foreground outline-none font-mono text-sm transition-colors text-foreground"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase block">{t("pin")}</label>
                <input 
                  type="password" 
                  value={wwan0.pin}
                  onChange={(e) => setWwan0({...wwan0, pin: e.target.value})}
                  className="w-full bg-transparent border-b border-border pb-2 focus:border-foreground outline-none font-mono text-sm transition-colors text-foreground"
                  placeholder="OPTIONAL"
                />
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
