import { MongoClient, Db } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  const client = new MongoClient(uri);

  await client.connect();
  const db = client.db('career-advisor');

  // Create collections if they don't exist
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map((c) => c.name);

  if (!collectionNames.includes('users')) {
    await db.createCollection('users');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
  }

  if (!collectionNames.includes('conversations')) {
    await db.createCollection('conversations');
    await db.collection('conversations').createIndex({ userId: 1 });
  }

  if (!collectionNames.includes('analytics')) {
    await db.createCollection('analytics');
    await db.collection('analytics').createIndex({ userId: 1 });
  }

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// TypeScript Interfaces for data models
export interface UserProfile {
  _id?: string;
  email: string;
  name: string;
  currentRole: string;
  yearsExperience: number;
  skills: Array<{
    name: string;
    level: number; // 1-5
    lastUpdated: Date;
  }>;
  careerGoal: string;
  learningHistory: Array<{
    course: string;
    date: Date;
    status: string;
  }>;
  industry: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  _id?: string;
  userId: string;
  messages: ConversationMessage[];
  careerPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CareerAnalytics {
  _id?: string;
  userId: string;
  skillProgression: Array<{
    skill: string;
    level: number;
    date: Date;
  }>;
  milestones: Array<{
    title: string;
    targetDate: Date;
    completed: boolean;
  }>;
  estimatedTimeToGoal: number; // months
  pathStages: Array<{
    stage: number;
    description: string;
    progress: number; // 0-100
  }>;
  createdAt: Date;
  updatedAt: Date;
}
