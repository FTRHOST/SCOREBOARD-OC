import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse('This API route is deprecated. Please use Firebase Realtime Database.', { status: 410 });
}

export async function POST() {
  return new NextResponse('This API route is deprecated. Please use Firebase Realtime Database.', { status: 410 });
}