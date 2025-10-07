import { NextResponse } from 'next/server';
import { getPerformanceMetrics } from '@/lib/database/queries';

export async function GET() {
  try {
    const metrics = await getPerformanceMetrics();
    return NextResponse.json({ success: true, metrics });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get analytics' }, { status: 500 });
  }
}

export const runtime = 'edge';
