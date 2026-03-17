import { connectToDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

export async function getUserProfile(userId: string) {
  const { db } = await connectToDatabase();
  return await db.collection('users').findOne({ _id: new ObjectId(userId) });
}

export async function saveUserProfile(profile: any) {
  const { db } = await connectToDatabase();
  const { _id, ...rest } = profile;
  
  if (_id) {
    return await db.collection('users').updateOne(
      { _id: new ObjectId(_id) },
      { $set: { ...rest, updatedAt: new Date() } }
    );
  } else {
    return await db.collection('users').insertOne({
      ...rest,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

export async function getOrCreateAnalytics(userId: string) {
  const { db } = await connectToDatabase();
  
  let analytics = await db.collection('analytics').findOne({ userId });
  
  if (!analytics) {
    const result = await db.collection('analytics').insertOne({
      userId,
      skillProgression: [],
      careerPathStages: [],
      timeToGoal: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    analytics = await db.collection('analytics').findOne({ _id: result.insertedId });
  }
  
  return analytics;
}

export async function updateAnalytics(userId: string, updates: any) {
  const { db } = await connectToDatabase();
  return await db.collection('analytics').updateOne(
    { userId },
    { $set: { ...updates, updatedAt: new Date() } }
  );
}

export async function saveConversation(userId: string, conversation: any) {
  const { db } = await connectToDatabase();
  const { _id, ...rest } = conversation;
  
  if (_id) {
    return await db.collection('conversations').updateOne(
      { _id: new ObjectId(_id) },
      { $set: { ...rest, updatedAt: new Date() } }
    );
  } else {
    return await db.collection('conversations').insertOne({
      userId,
      ...rest,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

export async function getConversations(userId: string) {
  const { db } = await connectToDatabase();
  return await db.collection('conversations').find({ userId }).toArray();
}
