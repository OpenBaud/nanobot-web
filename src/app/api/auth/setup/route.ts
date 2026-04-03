import { NextResponse } from 'next/server';
import { setupSystemAuth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  try {
    const { password, email } = await req.json();

    if (!password || password.length < 8) {
      return NextResponse.json({ error: "PASSWORD MUST BE AT LEAST 8 CHARACTERS" }, { status: 400 });
    }

    await setupSystemAuth(password, email || "");
    
    // Clear any client caches
    revalidatePath('/', 'layout');
    
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("SETUP API ERROR:", e);
    return NextResponse.json({ error: e.message || "FAILED TO SECURE SYSTEM" }, { status: 500 });
  }
}
