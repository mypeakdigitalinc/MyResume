import { NextResponse } from 'next/server';
import { resumeData } from '@/lib/resumeData';

export async function GET() {
  return NextResponse.json(resumeData);
}
