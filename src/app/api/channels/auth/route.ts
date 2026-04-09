import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import WebSocket from 'ws';

// Store ongoing auth processes to clean them up if needed
const authProcesses: Record<string, any> = {};

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { channel } = await req.json();
    if (!channel) return NextResponse.json({ error: 'Channel name required' }, { status: 400 });

    // Prevent multiple auth requests for the same channel
    if (authProcesses[channel]) {
        try { authProcesses[channel].kill(); } catch (e) {}
    }

    return new Promise<NextResponse>((resolve) => {
        let urlFound = false;
        
        // Use a dynamic reference to prevent build-time static evaluation of process.platform
        const isWindows = typeof process !== 'undefined' && process.env.OS === 'Windows_NT';
        
        const child = isWindows 
            ? spawn('cmd.exe', ['/c', 'nanobot', 'channels', 'login', channel, '-f'])
            : spawn('nanobot', ['channels', 'login', channel, '-f'], { shell: true });

        authProcesses[channel] = child;

        // Clean up memory when process dies
        child.on('close', () => {
             delete authProcesses[channel];
        });

        // Set a timeout of 15 seconds. If no URL is emitted, return error.
        const timeoutId = setTimeout(() => {
            if (!urlFound) {
                child.kill();
                resolve(NextResponse.json({ error: 'Timeout waiting for QR URL' }, { status: 504 }));
            }
        }, 15000);

        child.on('error', (err: any) => {
            if (!urlFound) {
                clearTimeout(timeoutId);
                resolve(NextResponse.json({ error: `Failed to start process: ${err.message}` }, { status: 500 }));
            }
        });

        if (channel === 'whatsapp') {
            let ws: WebSocket | null = null;
            let retries = 0;

            const connectWs = () => {
                if (urlFound) return;
                ws = new WebSocket('ws://127.0.0.1:3001');

                ws.on('message', (data) => {
                    try {
                        const msg = JSON.parse(data.toString());
                        if (msg.type === 'qr' && msg.qr) {
                            urlFound = true;
                            clearTimeout(timeoutId);
                            ws?.close();
                            resolve(NextResponse.json({ success: true, url: msg.qr, type: 'raw' }));
                        }
                    } catch (e) {}
                });

                ws.on('error', () => {
                    if (retries < 10) {
                        retries++;
                        setTimeout(connectWs, 1000);
                    }
                });
            };

            // Wait 1 second for the bridge to start, then try connecting
            setTimeout(connectWs, 1000);
        } else {
            const handleOutput = (data: Buffer) => {
                if (urlFound) return; // Ignore output after we've sent the response

                const str = data.toString();
                // Look for "Login URL: https://..." or similar patterns
                const match = str.match(/(?:Login URL:\s*|QR code URL.*?:?\s*)(https?:\/\/[^\s\u001b]+)/i);
                
                if (match && match[1]) {
                    urlFound = true;
                    clearTimeout(timeoutId);
                    
                    // Extremely aggressive cleanup to remove ANY terminal color codes from the matched URL
                    // eslint-disable-next-line no-control-regex
                    const pureUrl = match[1].replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '').trim();
                    
                    resolve(NextResponse.json({ success: true, url: pureUrl, type: 'url' }));
                }
            };

            child.stdout.on('data', handleOutput);
            child.stderr.on('data', handleOutput); // Some frameworks print to stderr
        }
    });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
