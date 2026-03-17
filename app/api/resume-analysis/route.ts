import { analyzeResume } from '@/lib/groq';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeText, targetRole } = body;

    if (!resumeText) {
      return NextResponse.json({ error: 'resumeText is required' }, { status: 400 });
    }

    const analysis = await analyzeResume(resumeText, targetRole);

    return NextResponse.json(
      {
        success: true,
        analysis,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Resume analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze resume' }, { status: 500 });
  }
}
