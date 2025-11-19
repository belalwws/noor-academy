import { NextRequest, NextResponse } from 'next/server';

// Proxy this Next.js route to the Django backend to avoid conflicts
// Configure via NEXT_PUBLIC_CONN_DETAILS_ENDPOINT or fallback to localhost:8000
const DJANGO_CONN_DETAILS_ENDPOINT =
  process.env['NEXT_PUBLIC_CONN_DETAILS_ENDPOINT'] || 'http://localhost:8000/api/connection-details';

export async function GET(req: NextRequest) {
  try {
    const incomingUrl = new URL(req.url);
    const backendUrl = new URL(DJANGO_CONN_DETAILS_ENDPOINT);
    backendUrl.search = incomingUrl.search; // forward query params (roomName, participantName, region)

    const resp = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        // Forward content-type expectations; Django returns JSON
        'accept': 'application/json',
      },
    });

    const contentType = resp.headers.get('content-type') || 'application/json';
    const bodyText = await resp.text();
    return new NextResponse(bodyText, {
      status: resp.status,
      headers: {
        'content-type': contentType,
      },
    });
  } catch (e: any) {
    return new NextResponse(`Proxy error: ${e.message}`, { status: 500 });
  }
}
