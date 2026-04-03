import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs/promises';
import { getConfigPath } from '@/lib/sysUtils';

const execAsync = util.promisify(exec);

const isWindows = typeof process !== 'undefined' && process.env.OS === 'Windows_NT';

async function checkGatewayRunning(): Promise<boolean> {
  try {
    if (isWindows) {
      const { stdout } = await execAsync('tasklist /FI "COMMANDWINDOWTITLE eq nanobot gateway*"');
      return stdout.toLowerCase().includes('nanobot');
    } else {
      const { stdout } = await execAsync('/bin/systemctl is-active nanobot-gateway');
      return stdout.trim() === 'active';
    }
  } catch (e) {
    return false;
  }
}

export async function GET() {
  try {
    const isRunning = await checkGatewayRunning();
    const versionStr = "v0.1.4.post6 (Edge)";

    let statusStr = 'SYSTEM HALTED\nGateway agent loop is not running.';
    
    if (isRunning) {
        statusStr = 'GATEWAY ACTIVE\nBackground agent loop is actively polling.';
        try {
            const configPath = getConfigPath();
            const data = await fs.readFile(configPath, 'utf-8');
            const config = JSON.parse(data);
            const activeChannels = Object.entries(config.channels || {})
                .filter(([k, v]) => (v as any).enabled === true)
                .map(([k]) => k);
            
            if (activeChannels.length > 0) {
                statusStr += `\nActive Channels: ${activeChannels.join(', ')}`;
            } else {
                statusStr += '\nWarning: No interaction channels enabled.';
            }
        } catch(e) {}
    }

    return NextResponse.json({
      version: versionStr,
      statusInfo: statusStr
    });
  } catch (e: any) {
    // Failsafe return instead of 500 error
    return NextResponse.json({
      version: "UNKNOWN",
      statusInfo: "Error connecting to service layer"
    });
  }
}
