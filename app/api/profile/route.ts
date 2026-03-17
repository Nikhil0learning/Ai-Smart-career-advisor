import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || userId === 'undefined') {
      return Response.json(
        { error: 'Missing or invalid userId' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const profile = await db.collection('users').findOne({
      _id: new ObjectId(userId),
    });

    if (!profile) {
      return Response.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return Response.json(profile);
  } catch (error) {
    console.error('[v0] Profile GET error:', error);
    return Response.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const profileData = await request.json();

    const { db } = await connectToDatabase();
    
    const { _id, email, ...rest } = profileData;

    // Use email as the unique identifier for upsert
    const filter = email ? { email } : (_id ? { _id: new ObjectId(_id) } : {});
    
    if (!filter || Object.keys(filter).length === 0) {
      return Response.json(
        { error: 'Missing email or userId for profile identification' },
        { status: 400 }
      );
    }

    const result = await db.collection('users').findOneAndUpdate(
      filter,
      {
        $set: {
          ...rest,
          ...(email && { email }),
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      {
        upsert: true,
        returnDocument: 'after',
      }
    );

    return Response.json({
      success: true,
      profile: result,
    });
  } catch (error) {
    console.error('[v0] Profile POST error:', error);
    return Response.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    );
  }
}
