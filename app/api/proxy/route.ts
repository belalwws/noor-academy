import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return handleRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return handleRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return handleRequest(request, 'PUT');
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request, 'DELETE');
}

export async function PATCH(request: NextRequest) {
  return handleRequest(request, 'PATCH');
}

export async function OPTIONS(request: NextRequest) {
  return handleRequest(request, 'OPTIONS');
}

async function handleRequest(request: NextRequest, method: string) {
  try {
    // Extract the path from the request URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/proxy/');
    
    if (pathSegments.length < 2) {
      return NextResponse.json({ error: 'Invalid proxy path' }, { status: 400 });
    }
    
    // Get the path after /api/proxy/
    const path = pathSegments[1];
    
    // Construct the target URL
    const targetUrl = `${process.env['NEXT_PUBLIC_API_URL']}/${path}`;
    
    // Forward the search params
    const searchParams = url.search;
    const fullUrl = `${targetUrl}${searchParams}`;
    
    console.log(`Proxying ${method} request to: ${fullUrl}`);
    
    // Clone the request headers
    const headers = new Headers(request.headers);
    
    // Remove host header to avoid conflicts
    headers.delete('host');
    
    // Get request body if it exists
    let body = null;
    if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
      body = await request.blob();
    }
    
    // Forward the request to the target URL
    const response = await fetch(fullUrl, {
      method,
      headers,
      body,
      credentials: 'include',
    });
    
    // Clone the response headers
    const responseHeaders = new Headers(response.headers);
    
    // Create a new response with the same status, headers, and body
    const proxyResponse = new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
    
    return proxyResponse;
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Proxy request failed' }, { status: 500 });
  }
}
