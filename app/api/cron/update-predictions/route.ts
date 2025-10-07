import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Updating predictions...');
    // Tutaj logika aktualizacji predykcji
    
    return NextResponse.json({ success: true, updated: 0 });
  } catch (error) {
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}
