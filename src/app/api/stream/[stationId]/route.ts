import { NextRequest, NextResponse } from 'next/server';
import { getStationById } from '@/components/secureplayer/radio-stations';

// Edge runtime for better streaming performance
export const runtime = 'edge';

// Rate limiting map (simple in-memory, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 50; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute in ms

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ stationId: string }> }
) {
  try {
    const { stationId } = await params;

    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return new NextResponse('Rate limit exceeded', {
        status: 429,
        headers: {
          'Retry-After': '60'
        }
      });
    }

    // Get station configuration
    const station = getStationById(stationId);
    if (!station) {
      return new NextResponse('Station not found', { status: 404 });
    }

    // Fetch the actual stream
    const streamResponse = await fetch(station.url, {
      headers: {
        'User-Agent': 'UntelevizedRadio/1.0',
      },
    });

    if (!streamResponse.ok) {
      return new NextResponse('Stream unavailable', { status: 502 });
    }

    // Stream the response to the client
    return new NextResponse(streamResponse.body, {
      headers: {
        'Content-Type': streamResponse.headers.get('Content-Type') || 'audio/mpeg',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
      },
    });

  } catch (error) {
    console.error('Stream proxy error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
