"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { QRCodeSVG } from "qrcode.react";
import { X } from "lucide-react";

export default function ChannelsPage() {
  const { t } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [channels, setChannels] = useState<any>({});
  
  // Auth state
  const [authChannel, setAuthChannel] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Channels that are known to use interactive login flows
  const INTERACTIVE_CHANNELS = ['weixin', 'whatsapp'];
  
  const GLOBAL_KEYS = ['sendProgress', 'sendToolHints', 'sendMaxRetries'];

  const fetchChannels = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/channels');
      if (res.ok) {
        const data = await res.json();
        setChannels(data);
      }
    } catch (e) {
      console.error("Failed to load channels config", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payloadToSave = JSON.parse(JSON.stringify(channels));
      
      Object.keys(payloadToSave).forEach(ch => {
        if (!GLOBAL_KEYS.includes(ch)) {
           if (typeof payloadToSave[ch].allowFrom === 'string') {
             const str = payloadToSave[ch].allowFrom.trim();
             if (str === "") {
                payloadToSave[ch].allowFrom = [];
             } else {
                payloadToSave[ch].allowFrom = str.split(',').map((s: string) => s.trim());
             }
           }
        }
      });

      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadToSave)
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Server returned an error');
      }
      
      await fetchChannels();
    } catch (e: any) {
      console.error(e);
      alert("FAIL: CHANNELS_WRITE_ERROR - " + (e.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleGlobalChange = (key: string, value: any) => {
    setChannels((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleChannelChange = (channelName: string, field: string, value: any) => {
    setChannels((prev: any) => ({
      ...prev,
      [channelName]: {
        ...prev[channelName],
        [field]: value
      }
    }));
  };

  const handleAuthenticate = async (channelName: string) => {
    setAuthChannel(channelName);
    setAuthLoading(true);
    setAuthUrl(null);
    setAuthError(null);

    try {
        const res = await fetch('/api/channels/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channel: channelName })
        });
        const data = await res.json();
        
        if (res.ok && data.url) {
            setAuthUrl(data.url);
        } else {
            setAuthError(data.error || "Failed to retrieve authentication URL.");
        }
    } catch (e: any) {
        console.error("Auth Exception:", e);
        setAuthError(e.message || "An unexpected error occurred during authentication.");
        alert("FAIL: AUTHENTICATION_ERROR - " + (e.message || "Unknown error"));
    } finally {
        setAuthLoading(false);
    }
  };

  const closeAuthModal = () => {
      setAuthChannel(null);
      setAuthUrl(null);
      setAuthError(null);
  };

  if (isLoading) {
    return <div className="md:p-10 p-4 pt-8 font-mono animate-pulse uppercase tracking-widest text-xs">Acquiring Channel Telemetry...</div>;
  }

  const channelNames = Object.keys(channels).filter(k => !GLOBAL_KEYS.includes(k)).sort();

  return (
    <div className="flex-1 md:p-10 p-4 pt-8 overflow-y-auto relative">
      {/* Auth Modal Overlay */}
      {authChannel && (
         <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-6">
            <div className="border border-border bg-card max-w-lg w-full p-6 md:p-8 relative flex flex-col items-center text-center shadow-2xl">
                <button 
                  onClick={closeAuthModal}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X size={24} />
                </button>
                
                <h3 className="text-xl md:text-2xl font-bold uppercase tracking-widest mb-2">{authChannel} AUTHENTICATION</h3>
                <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest mb-8">Scan QR Code via mobile app</p>

                {authLoading && (
                    <div className="py-12 animate-pulse text-sm font-mono tracking-widest text-foreground">
                        NEGOTIATING_SESSION_URL...
                    </div>
                )}

                {authError && (
                    <div className="py-8 text-destructive text-sm font-mono border border-destructive/30 w-full bg-destructive/10 p-4">
                        ERROR: {authError}
                    </div>
                )}

                {authUrl && (
                    <div className="flex flex-col items-center w-full gap-8">
                        <div className="bg-white p-4">
                            <QRCodeSVG 
                                value={authUrl} 
                                size={256}
                                level="M"
                            />
                        </div>
                        <div className="w-full text-left">
                            <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase block mb-2">Direct Link Fallback</label>
                            <a 
                              href={authUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="block w-full bg-transparent border-b border-foreground pb-2 focus:border-foreground outline-none font-mono text-xs transition-colors text-foreground overflow-hidden text-ellipsis whitespace-nowrap hover:text-primary"
                            >
                                {authUrl}
                            </a>
                        </div>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-4 leading-relaxed max-w-md">
                            Once scanned successfully on your device, you can close this window. The backend agent will preserve the session state. Ensure to restart the Gateway.
                        </p>
                    </div>
                )}
            </div>
         </div>
      )}

      <header className="mb-12 border-b border-border pb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tighter mb-2 uppercase">{t("channels.title")}</h2>
          <p className="text-muted-foreground text-xs md:text-sm tracking-widest uppercase">{t("channels.subtitle")}</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <button 
            onClick={fetchChannels}
            className="w-full md:w-auto text-[10px] uppercase tracking-widest font-bold text-foreground bg-transparent border border-border px-6 py-3 hover:bg-card transition-colors"
          >
            {t("config.refresh")}
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full md:w-auto text-[10px] uppercase tracking-widest font-bold text-background bg-foreground px-6 py-3 hover:bg-muted-foreground transition-colors disabled:opacity-50"
          >
            {isSaving ? t("config.committing") : t("config.commit")}
          </button>
        </div>
      </header>

      <div className="max-w-5xl space-y-12 pb-20">
        
        {/* Global Settings */}
        <section>
          <div className="mb-6 pb-2 border-b border-border">
            <span className="text-sm font-bold tracking-widest uppercase text-foreground">{t("channels.global")}</span>
          </div>
          <div className="flex flex-col gap-6">
            <label className="flex items-center gap-4 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={channels.sendProgress || false}
                  onChange={(e) => handleGlobalChange('sendProgress', e.target.checked)}
                  className="appearance-none w-5 h-5 border border-border checked:bg-foreground checked:border-foreground transition-colors rounded-none"
                />
                {channels.sendProgress && (
                  <svg className="absolute w-3 h-3 text-background pointer-events-none" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"/>
                  </svg>
                )}
              </div>
              <div className="font-bold text-sm tracking-widest uppercase">{t("channels.send_progress")}</div>
            </label>

            <label className="flex items-center gap-4 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={channels.sendToolHints || false}
                  onChange={(e) => handleGlobalChange('sendToolHints', e.target.checked)}
                  className="appearance-none w-5 h-5 border border-border checked:bg-foreground checked:border-foreground transition-colors rounded-none"
                />
                {channels.sendToolHints && (
                  <svg className="absolute w-3 h-3 text-background pointer-events-none" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"/>
                  </svg>
                )}
              </div>
              <div className="font-bold text-sm tracking-widest uppercase">{t("channels.send_tool_hints")}</div>
            </label>
          </div>
        </section>

        {/* Dynamic Channel List */}
        <section className="space-y-8">
          {channelNames.map(channelName => {
            const configObj = channels[channelName];
            const isEnabled = configObj.enabled === true;
            const configKeys = Object.keys(configObj).filter(k => k !== 'enabled');
            const requiresAuth = INTERACTIVE_CHANNELS.includes(channelName);

            return (
              <div key={channelName} className={`p-4 md:p-6 border transition-all duration-300 ${isEnabled ? 'border-foreground bg-card shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'border-border bg-transparent opacity-60'}`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-4 border-b border-border/50">
                   <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                     <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 ${isEnabled ? 'bg-foreground shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'bg-muted-foreground'}`}></span>
                        <h3 className="text-lg md:text-xl font-bold tracking-widest uppercase">{channelName}</h3>
                     </div>
                     {requiresAuth && isEnabled && (
                         <button 
                            onClick={() => handleAuthenticate(channelName)}
                            className="w-full md:w-auto text-[10px] px-3 py-1 font-bold tracking-widest uppercase border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors"
                         >
                            AUTHORIZE SESSION
                         </button>
                     )}
                   </div>
                   
                   <button 
                     onClick={() => handleChannelChange(channelName, 'enabled', !isEnabled)}
                     className={`w-full md:w-auto text-[10px] px-4 py-2 font-bold tracking-widest uppercase border transition-colors ${isEnabled ? 'border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground' : 'border-foreground text-foreground hover:bg-foreground hover:text-background'}`}
                   >
                     {isEnabled ? t("channels.disable") : t("channels.enable")}
                   </button>
                </div>

                {isEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 pt-4">
                    {configKeys.map(key => {
                      let val = configObj[key];
                      let valType = typeof val;

                      if (valType === 'object' && val !== null) {
                        if (Array.isArray(val) && (key === 'allowFrom' || key === 'groupAllowFrom')) {
                           val = val.join(', ');
                           valType = 'string';
                        } else {
                           return null;
                        }
                      }

                      if (valType === 'boolean') {
                        return (
                          <div key={key} className="flex items-center gap-4 h-12">
                            <label className="flex items-center gap-4 cursor-pointer group">
                              <div className="relative flex items-center justify-center">
                                <input 
                                  type="checkbox" 
                                  checked={val}
                                  onChange={(e) => handleChannelChange(channelName, key, e.target.checked)}
                                  className="appearance-none w-4 h-4 border border-border checked:bg-foreground checked:border-foreground transition-colors rounded-none"
                                />
                                {val && (
                                  <svg className="absolute w-2.5 h-2.5 text-background pointer-events-none" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"/>
                                  </svg>
                                )}
                              </div>
                              <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">{key}</span>
                            </label>
                          </div>
                        );
                      }

                      const isSensitive = key.toLowerCase().includes('token') || 
                                          key.toLowerCase().includes('secret') || 
                                          key.toLowerCase().includes('password');

                      return (
                        <div key={key} className="space-y-3">
                          <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase block">
                            {key}
                            {(key === 'allowFrom') && <span className="ml-2 text-destructive lowercase tracking-normal">(use * for all, or comma separated IDs)</span>}
                          </label>
                          <input 
                            type={valType === 'number' ? 'number' : (isSensitive ? 'password' : 'text')}
                            value={val === null ? '' : val}
                            onChange={(e) => handleChannelChange(channelName, key, valType === 'number' ? Number(e.target.value) : e.target.value)}
                            className="w-full bg-transparent border-b border-border pb-2 focus:border-foreground outline-none font-mono text-sm transition-colors text-foreground"
                            placeholder={key === 'allowFrom' ? "*, or 1234, 5678" : ""}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
