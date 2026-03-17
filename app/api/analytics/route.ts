import { connectToDatabase, CareerAnalytics } from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const analytics = await db.collection('analytics').findOne({ userId });

    if (!analytics) {
      return NextResponse.json(
        {
          userId,
          skillProgression: [],
          milestones: [],
          estimatedTimeToGoal: 12,
          pathStages: [],
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ analytics }, { status: 200 });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await req.json();
    const { userId, skillProgression, milestones, estimatedTimeToGoal, pathStages } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const analytics: CareerAnalytics = {
      userId,
      skillProgression: skillProgression || [],
      milestones: milestones || [],
      estimatedTimeToGoal: estimatedTimeToGoal || 12,
      pathStages: pathStages || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('analytics').updateOne({ userId }, { $set: analytics }, { upsert: true });

    return NextResponse.json({ success: true, analytics }, { status: 200 });
  } catch (error) {
    console.error('Analytics POST error:', error);
    return NextResponse.json({ error: 'Failed to save analytics' }, { status: 500 });
  }
}
