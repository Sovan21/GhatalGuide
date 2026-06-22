import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');

  if (!origin || !destination) {
    return NextResponse.json({ error: 'Missing origin or destination parameters' }, { status: 400 });
  }

  // Use server-side OLA_MAPS_API_KEY, fallback to NEXT_PUBLIC_OLA_MAPS_API_KEY if not migrated yet.
  const apiKey = process.env.OLA_MAPS_API_KEY || process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY;
  if (!apiKey) {
    console.error('OLA_MAPS_API_KEY is not defined in environment variables');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const url = `https://api.olamaps.io/routing/v1/directions?origin=${origin}&destination=${destination}&api_key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Ola Maps API responded with status ${res.status}:`, errorText);
      return NextResponse.json({ error: 'Failed to fetch directions from Ola Maps' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching directions from Ola Maps:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
