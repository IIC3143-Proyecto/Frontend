import { NextResponse } from 'next/server';
import metroData from '@/lib/msw/mocks/data/metro-stations.json';

export async function GET() {
  const stations = metroData.lines.flatMap((line) =>
    line.stations.map((name) => ({ name, line: line.number }))
  );
  return NextResponse.json(stations);
}
