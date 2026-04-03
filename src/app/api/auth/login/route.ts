import { NextResponse } from 'next/server';
import { getAuthConfig, loginAction } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: "PASSWORD REQUIRED" }, { status: 400 });
    }

    const config = await getAuthConfig();
    if (!config) {
      return NextResponse.json({ error: "SYSTEM IS NOT SECURED YET" }, { status: 400 });
    }

    const res = await loginAction(password);
    
    if (res.success) {
      // loginAction sets the cookie in the cookieStore
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: res.message || "INVALID CREDENTIALS" }, { status: 401 });
    }
  } catch (e: any) {
    console.error("LOGIN API ERROR:", e);
    return NextResponse.json({ error: e.message || "SYSTEM ERROR" }, { status: 500 });
  }
}
