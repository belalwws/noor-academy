/**
 * 🎥 LiveKit Token Generation API Route
 * Server-side only - uses secret environment variables
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLiveKitCredentials, getLiveKitUrl } from '../../../../lib/config';

export async function GET(request: NextRequest) {
  try {
    // Get LiveKit credentials (server-side only)
    const { apiKey } = getLiveKitCredentials();
    const livekitUrl = getLiveKitUrl();
    
    // Get user info from query params or auth
    const { searchParams } = new URL(request.url);
    const roomName = searchParams.get('room');
    const userName = searchParams.get('user');
    
    if (!roomName || !userName) {
      return NextResponse.json(
        { error: 'Room name and user name are required' },
        { status: 400 }
      );
    }
    
    // Here you would generate the actual LiveKit token
    // This is just a placeholder - implement actual token generation
    const tokenData = {
      token: 'placeholder-token',
      url: livekitUrl,
      room: roomName,
      user: userName,
      apiKey, // This will be used for token generation
    };
    
    // Log for debugging (don't log secrets in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('🎥 LiveKit token generated for:', { roomName, userName });
    }
    
    return NextResponse.json({
      success: true,
      data: tokenData,
    });
    
  } catch (error) {
    console.error('❌ LiveKit token generation failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate LiveKit token',
        details: error instanceof Error ? error.message : 'Unknown error'
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
