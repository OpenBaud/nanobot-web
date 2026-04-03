import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import { getConfigPath } from '@/lib/sysUtils';

export async function GET() {
  try {
    const configPath = getConfigPath();
    const data = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(data);
    
    // Map nested config to flat UI state for providers
    const providersUI: Record<string, { apiKey: string, apiBase: string }> = {};
    if (config.providers) {
      for (const [key, value] of Object.entries(config.providers)) {
        if (typeof value === 'object' && value !== null) {
           providersUI[key] = {
             apiKey: (value as any).apiKey || '',
             apiBase: (value as any).apiBase || ''
           };
        }
      }
    }

    const uiConfig = {
      model: config.agents?.defaults?.model || 'anthropic/claude-opus-4-5',
      provider: config.agents?.defaults?.provider || 'auto',
      maxTokens: config.agents?.defaults?.maxTokens || 8192,
      temperature: config.agents?.defaults?.temperature || 0.1,
      restrictToWorkspace: config.tools?.restrictToWorkspace || false,
      providers: providersUI
    };
    
    return NextResponse.json(uiConfig);
  } catch (e) {
    return NextResponse.json({ error: 'Config not found or invalid', details: String(e) }, { status: 404 });
  }
}

export async function POST(req: Request) {
  try {
    const updates = await req.json();
    const configPath = getConfigPath();
    
    let currentConfig: any = {};
    try {
       const data = await fs.readFile(configPath, 'utf-8');
       currentConfig = JSON.parse(data);
    } catch(e) {} // Ignore if file doesn't exist
    
    // Map flat UI state back to nested config
    currentConfig.agents = currentConfig.agents || {};
    currentConfig.agents.defaults = currentConfig.agents.defaults || {};
    if (updates.model !== undefined) currentConfig.agents.defaults.model = updates.model;
    if (updates.provider !== undefined) currentConfig.agents.defaults.provider = updates.provider;
    if (updates.maxTokens !== undefined) currentConfig.agents.defaults.maxTokens = updates.maxTokens;
    if (updates.temperature !== undefined) currentConfig.agents.defaults.temperature = updates.temperature;
    
    currentConfig.tools = currentConfig.tools || {};
    if (updates.restrictToWorkspace !== undefined) currentConfig.tools.restrictToWorkspace = updates.restrictToWorkspace;
    
    currentConfig.providers = currentConfig.providers || {};
    if (updates.providers) {
      for (const [providerKey, creds] of Object.entries(updates.providers)) {
        const pCreds = creds as any;
        if (pCreds.apiKey || pCreds.apiBase || currentConfig.providers[providerKey]) {
           currentConfig.providers[providerKey] = currentConfig.providers[providerKey] || {};
           if (pCreds.apiKey !== undefined) currentConfig.providers[providerKey].apiKey = pCreds.apiKey;
           // Only write apiBase if it's explicitly set to a string, or if it was previously set and is now cleared.
           // Setting it to empty string "" in JSON config will override default routing in nanobot.
           if (pCreds.apiBase) {
             currentConfig.providers[providerKey].apiBase = pCreds.apiBase;
           } else if (pCreds.apiBase === "" && currentConfig.providers[providerKey].apiBase) {
             currentConfig.providers[providerKey].apiBase = null; // Clear override
           }
        }
      }
    }
    
    // Ensure dir exists
    await fs.mkdir(configPath.replace(/config\.json$/, ''), { recursive: true });
    await fs.writeFile(configPath, JSON.stringify(currentConfig, null, 2), 'utf-8');
    
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
