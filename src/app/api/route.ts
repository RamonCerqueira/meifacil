import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ status: 'API MEI Fácil Online', timestamp: new Date().toISOString() })
}
