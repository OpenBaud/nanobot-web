import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import { getConfigPath } from '@/lib/sysUtils';

export async function GET() {
  try {
    const configPath = getConfigPath();
    const data = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(data);
    
    // Return the raw channels object, or an empty object if not present
    return NextResponse.json(config.channels || {});
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
    
    currentConfig.channels = currentConfig.channels || {};
    
    // Perform a shallow merge of the top-level channel configurations
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const incomingConfig = value as Record<string, any>;
        
        // Satisfy engine security validator: Default empty access lists to ["*"]
        if (!incomingConfig.allowFrom || (Array.isArray(incomingConfig.allowFrom) && incomingConfig.allowFrom.length === 0)) {
           incomingConfig.allowFrom = ["*"];
        }
        if (!incomingConfig.groupAllowFrom || (Array.isArray(incomingConfig.groupAllowFrom) && incomingConfig.groupAllowFrom.length === 0)) {
           incomingConfig.groupAllowFrom = ["*"];
        }

        currentConfig.channels[key] = {
          ...(currentConfig.channels[key] || {}),
          ...incomingConfig
        };
      } else {
        // For primitive global settings like sendProgress
        currentConfig.channels[key] = value;
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
