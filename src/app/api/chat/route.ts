import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import { stripAnsi } from '@/lib/sysUtils';

const execAsync = util.promisify(exec);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) return NextResponse.json({ error: 'Message is required' }, { status: 400 });

    // Escape quotes to safely pass to shell
    const safeMessage = message.replace(/"/g, '\\"');
    
    // Execute command with --no-markdown to get raw text (if supported by nanobot, otherwise just normal)
    const cmd = `nanobot agent -m "${safeMessage}"`;
    
    const { stdout, stderr } = await execAsync(cmd);
    
    // The CLI often outputs "↳ progress" and "nanobot logo". 
    // We strip ANSI to make it clean for the frontend markdown renderer.
    const cleanOutput = stripAnsi(stdout).trim();
    
    return NextResponse.json({
      response: cleanOutput,
      error: stripAnsi(stderr).trim() || null
    });
  } catch (e: any) {
    return NextResponse.json({ 
      error: e.message, 
      response: stripAnsi(e.stdout || '').trim() 
    }, { status: 500 });
  }
}
