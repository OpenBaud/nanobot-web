import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

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
  const isRunning = await checkGatewayRunning();
  return NextResponse.json({ isRunning });
}

export async function POST(req: Request) {
  try {
    const { action } = await req.json();
    
    if (action === 'start') {
      const isRunning = await checkGatewayRunning();
      if (isRunning) return NextResponse.json({ success: true, message: 'Already running' });
      
      if (isWindows) {
         exec('start /B cmd.exe /c "nanobot gateway"', (err) => {
             if (err) console.error("Win32 Start Error:", err);
         });
         await new Promise(r => setTimeout(r, 1500));
      } else {
         await execAsync('/bin/systemctl start nanobot-gateway');
         await new Promise(r => setTimeout(r, 3000));
      }
      
      return NextResponse.json({ success: true, message: 'Start signal dispatched' });
    } 
    
    if (action === 'stop') {
      try {
        if (isWindows) {
          await execAsync('taskkill /IM nanobot.exe /F').catch(() => {});
          const psKill = `Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like "*nanobot gateway*" } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }`;
          await execAsync(`powershell.exe -NoProfile -Command "${psKill}"`).catch(() => {});
        } else {
          await execAsync('/bin/systemctl stop nanobot-gateway').catch(() => {});
        }
      } catch (e) {
        console.error("Stop error", e);
      }
      
      await new Promise(r => setTimeout(r, 1500));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
