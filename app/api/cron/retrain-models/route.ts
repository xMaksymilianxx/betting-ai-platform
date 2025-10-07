import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🧠 Retraining models...');
    // Tutaj logika retreningu modeli
    
    return NextResponse.json({ success: true, models: 6 });
  } catch (error) {
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
  }
}
