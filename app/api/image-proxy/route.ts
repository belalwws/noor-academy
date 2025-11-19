import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    
    console.log('=== Image Proxy Debug ===');
    console.log('1. Request URL:', request.url);
    console.log('2. Image URL param:', imageUrl);
    
    if (!imageUrl) {
      console.log('3. No URL provided');
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    // Decode the URL
    let decodedUrl: string;
    try {
      decodedUrl = decodeURIComponent(imageUrl);
      console.log('3. Decoded URL:', decodedUrl);
    } catch (decodeError) {
      console.log('3. URL decode failed, using original:', imageUrl);
      decodedUrl = imageUrl;
    }

    // Prevent infinite loops - if URL already contains our proxy path, reject it
    if (decodedUrl.includes('/api/image-proxy')) {
      console.log('4. Infinite loop detected - URL already contains proxy path');
      return NextResponse.json({ 
        error: 'Invalid URL - cannot proxy proxy URLs',
        provided: decodedUrl
      }, { status: 400 });
    }

    // Validate that it's a Wasabi URL for security
    const allowedDomains = [
      's3.wasabisys.com',
      's3.eu-central-1.wasabisys.com',
      's3.us-east-1.wasabisys.com',
      's3.ap-northeast-1.wasabisys.com',
      'lisanalhekma.s3.wasabisys.com',
      'lisanalhekma.s3.eu-central-1.wasabisys.com',
      'lisan-alhekma.s3.wasabisys.com',
      'lisan-alhekma.s3.eu-central-1.wasabisys.com',
      'rushd-system.s3.wasabisys.com',
      'rushd-system.s3.eu-central-1.wasabisys.com',
      'via.placeholder.com', // For testing
      'picsum.photos' // For testing
    ];
    
    let urlObject: URL;
    try {
      urlObject = new URL(decodedUrl);
      console.log('5. Parsed URL details:', {
        hostname: urlObject.hostname,
        protocol: urlObject.protocol,
        pathname: urlObject.pathname
      });
    } catch (urlError) {
      console.log('5. Invalid URL format:', urlError);
      return NextResponse.json({ 
        error: 'Invalid URL format',
        provided: decodedUrl
      }, { status: 400 });
    }
    
    // Check if hostname matches any allowed domain (supports both subdomain and path-based buckets)
    const isAllowed = allowedDomains.some(domain => {
      // Check if hostname contains the domain (for subdomain-based buckets like rushd-system.s3.wasabisys.com)
      if (urlObject.hostname.includes(domain)) {
        return true;
      }
      // Check if pathname contains the domain (for path-based buckets like s3.wasabisys.com/rushd-system/...)
      if (urlObject.pathname.includes(domain.split('.')[0])) {
        return true;
      }
      return false;
    }) || urlObject.hostname.includes('wasabisys.com'); // Allow any wasabisys.com subdomain
    
    console.log('6. Domain check result:', {
      hostname: urlObject.hostname,
      pathname: urlObject.pathname,
      allowedDomains,
      isAllowed
    });
    
    if (!isAllowed) {
      console.log('7. Domain not allowed - returning 403');
      return NextResponse.json({ 
        error: 'Unauthorized domain',
        hostname: urlObject.hostname,
        pathname: urlObject.pathname,
        allowedDomains 
      }, { status: 403 });
    }

    console.log('8. Domain allowed - fetching image from Wasabi...');
    
    // Enhanced fetch with multiple Wasabi endpoints fallback and better 403 handling
    const wasabiEndpoints = [
      decodedUrl, // Original URL first
      decodedUrl.replace('s3.wasabisys.com', 's3.eu-central-1.wasabisys.com'),
      decodedUrl.replace('s3.wasabisys.com', 's3.us-east-1.wasabisys.com'),
      decodedUrl.replace('s3.eu-central-1.wasabisys.com', 's3.wasabisys.com'),
      decodedUrl.replace('s3.us-east-1.wasabisys.com', 's3.wasabisys.com')
    ];
    
    // Remove duplicates
    const uniqueEndpoints = [...new Set(wasabiEndpoints)];
    console.log('8a. Trying endpoints for 403 Forbidden handling:', uniqueEndpoints);
    console.log('8b. Note: Will handle 403 Forbidden errors with detailed logging');
    
    let lastError: Error | null = null;
    
    for (let i = 0; i < uniqueEndpoints.length; i++) {
      const endpoint = uniqueEndpoints[i];
      console.log(`9.${i + 1}. Trying endpoint: ${endpoint}`);
      
      try {
        // Add timeout to fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout per endpoint
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'image/*,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Referer': 'https://lisan-alhekma.com',
            'Origin': 'https://lisan-alhekma.com'
          },
          signal: controller.signal,
          // Add redirect handling
          redirect: 'follow'
        });
        
        clearTimeout(timeoutId);
        
        console.log(`9.${i + 1}c. Response received:`, {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          endpoint: endpoint
        });
        
        if (!response.ok) {
          console.log(`9.${i + 1}d. HTTP Error Details:`, {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            endpoint: endpoint
          });
          
          if (response.status === 403) {
            console.log(`9.${i + 1}e. 403 Forbidden - This image may require authentication or be private`);
          } else if (response.status === 404) {
            console.log(`9.${i + 1}e. 404 Not Found - This image may not exist at this endpoint`);
          }
          
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        console.log(`10.${i + 1}. Fetch successful, getting image buffer...`);
        let imageBuffer;
        try {
          imageBuffer = await response.arrayBuffer();
        } catch (bufferError) {
          console.log(`10.${i + 1}. Buffer conversion failed:`, bufferError);
          throw new Error(`Buffer conversion failed: ${bufferError instanceof Error ? bufferError.message : 'Unknown error'}`);
        }
        
        const contentType = response.headers.get('Content-Type') || 'image/jpeg';
        
        console.log(`11.${i + 1}. Success! Image details:`, {
          bufferSize: imageBuffer.byteLength,
          contentType,
          successfulEndpoint: endpoint
        });

        // Return the image with proper CORS headers
        return new NextResponse(imageBuffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Accept',
            'Content-Length': imageBuffer.byteLength.toString(),
            'X-Proxy-URL': endpoint, // Debug header
            'X-Original-URL': decodedUrl,
          },
        });
        
      } catch (fetchError) {
        console.log(`9.${i + 1}. Endpoint ${endpoint} failed:`, fetchError);
        lastError = fetchError instanceof Error ? fetchError : new Error('Unknown fetch error');
        
        // If this is the last endpoint, we'll throw the error below
        if (i === uniqueEndpoints.length - 1) {
          break;
        }
        
        // Continue to next endpoint
        continue;
      }
    }
    
    // If we reach here, all endpoints failed
    console.log('9. All endpoints failed, checking if we should return default image');
    
    // Check if all errors were 403/404 (image not accessible/not found)
    const wasImageNotFound = lastError && 
      (lastError.message.includes('403') || lastError.message.includes('404'));
    
    if (wasImageNotFound) {
      console.log('9a. Image not accessible (403/404), returning default avatar response');
      return NextResponse.json(
        { 
          error: 'Image not accessible',
          details: 'The requested image is not publicly accessible or does not exist',
          useDefault: true,
          originalUrl: decodedUrl
        },
        { 
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Accept',
          }
        }
      );
    }
    
    // For other errors, throw the last error
    if (lastError) {
      throw lastError;
    } else {
      throw new Error('All Wasabi endpoints failed');
    }
      
  } catch (error) {
    console.error('=== Image Proxy Error ===');
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Request timed out');
      return NextResponse.json(
        { error: 'Request timeout', details: 'Image request timed out' },
        { 
          status: 408,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Accept',
          }
        }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Accept',
        }
      }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
    },
  });
}
