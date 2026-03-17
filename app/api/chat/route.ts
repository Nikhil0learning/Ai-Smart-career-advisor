import { connectToDatabase, Conversation, ConversationMessage } from '@/lib/mongodb';
import { getCareerAdvice } from '@/lib/groq';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const body = await req.json();
    const { userId, message, conversationId } = body;

    if (!userId || !message || userId === 'undefined') {
      return NextResponse.json({ error: 'userId and message are required' }, { status: 400 });
    }

    // Fetch user profile for context
    const userProfile = await db.collection('users').findOne({ _id: new ObjectId(userId) });

    let conversation: Conversation | null = null;
    let conversationMessages: ConversationMessage[] = [];

    if (conversationId) {
      conversation = await db.collection('conversations').findOne({
        _id: new ObjectId(conversationId),
      });
      conversationMessages = conversation?.messages || [];
    }

    // Get AI response from Groq
    const aiResponse = await getCareerAdvice(
      message,
      conversationMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      userProfile ? {
        userName: userProfile.name,
        currentRole: userProfile.currentRole,
        yearsExperience: userProfile.yearsExperience,
        skills: userProfile.skills?.map((s) => s.name),
        careerGoal: userProfile.careerGoal,
        learningHistory: userProfile.learningHistory?.map((h) => h.course),
      } : undefined
    );

    // Create or update conversation
    const newMessages: ConversationMessage[] = [
      ...conversationMessages,
      {
        role: 'user',
        content: message,
        timestamp: new Date(),
      },
      {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      },
    ];

    let conversationResult;
    if (conversationId && conversation) {
      await db.collection('conversations').updateOne(
        { _id: new ObjectId(conversationId) },
        {
          $set: {
            messages: newMessages,
            updatedAt: new Date(),
          },
        }
      );
      conversationResult = { insertedId: new ObjectId(conversationId) };
    } else {
      const newConversation: Conversation = {
        userId,
        messages: newMessages,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      conversationResult = await db.collection('conversations').insertOne(newConversation);
    }

    return NextResponse.json(
      {
        success: true,
        conversationId: conversationId || conversationResult.insertedId?.toString(),
        message: {
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('conversationId');
    const userId = searchParams.get('userId');

    if (conversationId) {
      const conversation = await db.collection('conversations').findOne({
        _id: new ObjectId(conversationId),
      });

      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }

      return NextResponse.json({ conversation }, { status: 200 });
    }

    if (userId) {
      const conversations = await db
        .collection('conversations')
        .find({ userId })
        .sort({ createdAt: -1 })
        .toArray();

      return NextResponse.json({ conversations }, { status: 200 });
    }

    return NextResponse.json({ error: 'conversationId or userId is required' }, { status: 400 });
  } catch (error) {
    console.error('Chat GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}
