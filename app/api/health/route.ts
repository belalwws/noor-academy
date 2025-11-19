/**
 * 🏥 Health Check API Route
 * Tests API connectivity and configuration
 */

import { NextResponse } from 'next/server';
import { getApiBaseUrl, getLiveKitUrl } from '../../../lib/config';

export async function GET() {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const livekitUrl = getLiveKitUrl();
    
    // Test external API connectivity
    let externalApiStatus = 'unknown';
    try {
      const response = await fetch(`${apiBaseUrl}/health/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(5000),
      });
      
      externalApiStatus = response.ok ? 'healthy' : `error-${response.status}`;
    } catch (error) {
      externalApiStatus = 'unreachable';
      console.error('❌ External API health check failed:', error);
    }
    
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      config: {
        apiBaseUrl: apiBaseUrl || 'not-set',
        livekitUrl: livekitUrl || 'not-set',
        hasApiUrl: !!apiBaseUrl,
        hasLivekitUrl: !!livekitUrl,
      },
      external: {
        apiStatus: externalApiStatus,
      },
      vercel: {
        env: process.env['VERCEL_ENV'] || 'not-vercel',
        url: process.env['VERCEL_URL'] || 'not-set',
        region: process.env['VERCEL_REGION'] || 'not-set',
      },
    };
    
    return NextResponse.json(healthData);
    
  } catch (error) {
    console.error('❌ Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
