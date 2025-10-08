import { intelligentAPIManager } from '@/lib/api-clients/intelligent-api-manager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('📊 [API /api-status] Status check requested');

  try {
    const status = intelligentAPIManager.getAPIStatus();

    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      apis: status,
      summary: {
        total: Object.keys(status).length,
        available: Object.values(status).filter((api: any) => api.available).length,
        unavailable: Object.values(status).filter((api: any) => !api.available).length,
        circuitBreakerOpen: Object.values(status).filter((api: any) => api.circuitBreaker === 'OPEN').length
      }
    });

  } catch (error) {
    console.error('❌ [API /api-status] Error:', error);
    
    return Response.json({
      success: false,
      error: 'Failed to get API status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
