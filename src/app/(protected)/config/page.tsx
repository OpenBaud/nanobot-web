"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";

// Matches the order and keys from nanobot/providers/registry.py
const KNOWN_PROVIDERS = [
  "custom",
  "azure_openai",
  "openrouter",
  "aihubmix",
  "siliconflow",
  "volcengine",
  "volcengine_coding_plan",
  "byteplus",
  "byteplus_coding_plan",
  "anthropic",
  "openai",
  "openai_codex",
  "github_copilot",
  "deepseek",
  "gemini",
  "zhipu",
  "dashscope",
  "moonshot",
  "minimax",
  "mistral",
  "stepfun",
  "vllm",
  "ollama",
  "ovms",
  "groq"
];

// Providers that typically don't require an explicit API Key in config
const LOCAL_OR_OAUTH_PROVIDERS = ["vllm", "ollama", "ovms", "openai_codex", "github_copilot"];

export default function ConfigPage() {
  const { t } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProviderDropdownOpen, setIsProviderDropdownOpen] = useState(false);
  
  const [config, setConfig] = useState<any>({
    model: "",
    provider: "auto",
    maxTokens: 8192,
    temperature: 0.1,
    restrictToWorkspace: false,
    providers: {},
  });

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        // Ensure known providers exist in state so they render inputs
        const mergedProviders = { ...data.providers };
        KNOWN_PROVIDERS.forEach(p => {
          if (!mergedProviders[p]) mergedProviders[p] = { apiKey: "", apiBase: "" };
        });
        setConfig({ ...data, providers: mergedProviders });
      }
    } catch (e) {
      console.error("Failed to load config", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Server error');
      }
    } catch (e: any) {
      console.error(e);
      alert("FAIL: CONFIG_WRITE_ERROR - " + (e.message || "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleProviderChange = (providerName: string, field: 'apiKey' | 'apiBase', value: string) => {
    setConfig((prev: any) => ({
      ...prev,
      providers: {
        ...prev.providers,
        [providerName]: {
          ...prev.providers[providerName],
          [field]: value
        }
      }
    }));
  };

  if (isLoading) {
    return <div className="md:p-10 p-4 pt-8 font-mono animate-pulse uppercase tracking-widest text-xs">Acquiring Configuration...</div>;
  }

  return (
    <div className="flex-1 md:p-10 p-4 pt-8 overflow-y-auto">
      <header className="mb-12 border-b border-border pb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <h2 className="text-2xl md:text-4xl font-bold tracking-tighter mb-2 uppercase">{t("config.title")}</h2>
          <p className="text-muted-foreground text-xs md:text-sm tracking-widest uppercase">{t("config.subtitle")}</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <button 
            onClick={fetchConfig}
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

      <div className="max-w-4xl space-y-12 pb-20">
        
        {/* Agent Settings */}
        <section>
          <div className="mb-6 pb-2 border-b border-border">
            <span className="text-sm font-bold tracking-widest uppercase text-foreground">{t("config.ai_core")}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase block">{t("config.model")}</label>
              <input 
                type="text" 
                value={config.model}
                onChange={(e) => setConfig({...config, model: e.target.value})}
                className="w-full bg-transparent border-b border-border pb-2 focus:border-foreground outline-none font-mono text-sm transition-colors"
                placeholder="e.g. anthropic/claude-3-opus"
              />
            </div>
            <div className="space-y-3 relative">
              <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase block">{t("config.provider")}</label>
              
              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => setIsProviderDropdownOpen(!isProviderDropdownOpen)}
                  className="w-full text-left bg-transparent border-b border-border pb-2 focus:border-foreground outline-none font-mono text-sm transition-colors cursor-pointer uppercase flex justify-between items-center"
                >
                  {config.provider === 'auto' ? 'AUTO_DETECT' : config.provider?.replace(/_/g, ' ')}
                  <svg className={`w-4 h-4 transition-transform duration-200 ${isProviderDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </button>
                
                {isProviderDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-1 border border-border bg-background z-50 max-h-60 overflow-y-auto shadow-2xl">
                    <div 
                      onClick={() => { setConfig({...config, provider: 'auto'}); setIsProviderDropdownOpen(false); }}
                      className="px-4 py-3 text-xs font-mono uppercase cursor-pointer hover:bg-foreground hover:text-background transition-colors border-b border-border/50 last:border-b-0"
                    >
                      AUTO_DETECT
                    </div>
                    {KNOWN_PROVIDERS.map(p => (
                      <div 
                        key={p} 
                        onClick={() => { setConfig({...config, provider: p}); setIsProviderDropdownOpen(false); }}
                        className="px-4 py-3 text-xs font-mono uppercase cursor-pointer hover:bg-foreground hover:text-background transition-colors border-b border-border/50 last:border-b-0"
                      >
                        {p.replace(/_/g, ' ')}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase flex justify-between">
                <span>{t("config.temp")}</span>
                <span className="text-foreground">{config.temperature.toFixed(1)}</span>
              </label>
              <input 
                type="range" 
                min="0" max="2" step="0.1"
                value={config.temperature}
                onChange={(e) => setConfig({...config, temperature: parseFloat(e.target.value)})}
                className="w-full h-1 bg-border rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:rounded-none"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase block">{t("config.tokens")}</label>
              <input 
                type="number" 
                value={config.maxTokens}
                onChange={(e) => setConfig({...config, maxTokens: parseInt(e.target.value)})}
                className="w-full bg-transparent border-b border-border pb-2 focus:border-foreground outline-none font-mono text-sm transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Security / Tools */}
        <section>
          <div className="mb-6 pb-2 border-b border-border">
            <span className="text-sm font-bold tracking-widest uppercase text-destructive">{t("config.security")}</span>
          </div>
          <div>
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-1">
                <input 
                  type="checkbox" 
                  checked={config.restrictToWorkspace}
                  onChange={(e) => setConfig({...config, restrictToWorkspace: e.target.checked})}
                  className="appearance-none w-5 h-5 border border-border checked:bg-destructive checked:border-destructive transition-colors rounded-none"
                />
                {config.restrictToWorkspace && (
                  <svg className="absolute w-3 h-3 text-destructive-foreground pointer-events-none" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter"/>
                  </svg>
                )}
              </div>
              <div>
                <div className="font-bold text-sm tracking-widest uppercase group-hover:text-destructive transition-colors">{t("config.restrict")}</div>
                <div className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-2xl">{t("config.restrict_desc")}</div>
              </div>
            </label>
          </div>
        </section>

        {/* Dynamic API Keys */}
        <section>
          <div className="mb-6 pb-2 border-b border-border">
            <span className="text-sm font-bold tracking-widest uppercase text-foreground">{t("config.vault")}</span>
            <p className="text-[10px] text-muted-foreground mt-2 uppercase">{t("config.provider_keys")}</p>
          </div>
          
          <div className="space-y-8">
            {KNOWN_PROVIDERS.map((providerName) => {
              const isHighlighted = config.provider === providerName || 
                                   (config.provider === 'auto' && config.model.toLowerCase().includes(providerName.replace('_', '-')));
              const creds = config.providers[providerName] || { apiKey: "", apiBase: "" };
              
              // Only show if it has a key configured, OR if it's the currently highlighted provider, or if it's one of the common defaults
              if (!isHighlighted && !creds.apiKey && !creds.apiBase && providerName !== 'openai' && providerName !== 'anthropic') return null;

              const isLocal = LOCAL_OR_OAUTH_PROVIDERS.includes(providerName);

              return (
                <div key={providerName} className={`p-4 md:p-6 border transition-colors duration-500 ${isHighlighted ? 'border-foreground bg-card' : 'border-border bg-transparent'}`}>
                  <div className="flex items-center gap-3 mb-6">
                     <span className={`w-2 h-2 ${isHighlighted ? 'bg-foreground animate-pulse' : 'bg-muted-foreground'}`}></span>
                     <h3 className="text-sm font-bold tracking-widest uppercase">
                       {providerName === 'custom' ? t("config.custom") : providerName.replace(/_/g, ' ')}
                     </h3>
                     {isLocal && <span className="ml-auto text-[9px] px-2 py-1 bg-border text-muted-foreground uppercase tracking-widest">Local / OAuth</span>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {!isLocal && (
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase block">{t("config.api_key")}</label>
                        <input 
                          type="password" 
                          value={creds.apiKey}
                          onChange={(e) => handleProviderChange(providerName, 'apiKey', e.target.value)}
                          className={`w-full bg-transparent border-b ${isHighlighted ? 'border-foreground/50' : 'border-border'} pb-2 focus:border-foreground outline-none font-mono text-sm transition-colors`}
                          placeholder="********************************"
                        />
                      </div>
                    )}
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase block">{t("config.api_base")}</label>
                      <input 
                        type="text" 
                        value={creds.apiBase || ''}
                        onChange={(e) => handleProviderChange(providerName, 'apiBase', e.target.value)}
                        className={`w-full bg-transparent border-b ${isHighlighted ? 'border-foreground/50' : 'border-border'} pb-2 focus:border-foreground outline-none font-mono text-sm transition-colors`}
                        placeholder={isLocal ? "http://localhost:..." : "https://..."}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
