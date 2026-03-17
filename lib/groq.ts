import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface CareerAdvisorContext {
  userName?: string;
  currentRole?: string;
  yearsExperience?: number;
  skills?: string[];
  careerGoal?: string;
  learningHistory?: string[];
}

const CAREER_ADVISOR_SYSTEM_PROMPT = `You are an expert AI career advisor with deep knowledge of career development, skill gaps, and professional growth paths. Your role is to:

1. Provide personalized career recommendations based on the user's background
2. Identify skill gaps between their current state and target role
3. Suggest actionable steps to advance their career
4. Analyze skills and experience to guide growth
5. Provide encouragement and realistic timelines for career transitions
6. Ask clarifying questions to better understand their aspirations

Always be encouraging, realistic, and data-driven in your recommendations. Consider industry trends and market demand. Provide specific, actionable advice rather than generic career coaching.`;

export async function getCareerAdvice(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  context?: CareerAdvisorContext
): Promise<string> {
  const contextString = context
    ? `
User Context:
- Name: ${context.userName || 'Not provided'}
- Current Role: ${context.currentRole || 'Not provided'}
- Years of Experience: ${context.yearsExperience || 'Not provided'}
- Skills: ${context.skills?.join(', ') || 'Not provided'}
- Career Goal: ${context.careerGoal || 'Not provided'}
- Learning History: ${context.learningHistory?.join(', ') || 'Not provided'}
`
    : '';

  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    { role: 'user', content: CAREER_ADVISOR_SYSTEM_PROMPT + contextString },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const assistantMessage =
      response.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response.';
    return assistantMessage;
  } catch (error) {
    console.error('Groq API error:', error);
    throw error;
  }
}

export async function analyzeResume(
  resumeText: string,
  targetRole?: string
): Promise<{
  strengths: string[];
  weaknesses: string[];
  skillGaps: string[];
  recommendations: string[];
  score: number;
}> {
  const analysisPrompt = `Analyze this resume/profile and provide career guidance:

Resume/Profile:
${resumeText}

${targetRole ? `Target Role: ${targetRole}` : ''}

Please provide:
1. Top 3-4 strengths
2. Top 3-4 areas for improvement
3. Key skill gaps (if target role provided)
4. Specific, actionable recommendations
5. Overall career readiness score (0-100)

Format your response as JSON with keys: strengths, weaknesses, skillGaps, recommendations, score`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'user',
          content: analysisPrompt,
        },
      ] as any,
      temperature: 0.5,
      max_tokens: 1024,
    });

    const content = response.choices[0]?.message?.content || '{}';
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      strengths: [],
      weaknesses: [],
      skillGaps: [],
      recommendations: [],
      score: 0,
    };
  } catch (error) {
    console.error('Resume analysis error:', error);
    throw error;
  }
}

export async function generateCareerPath(
  currentRole: string,
  targetRole: string,
  yearsExperience: number,
  skills: string[]
): Promise<{
  stages: Array<{
    stage: number;
    title: string;
    description: string;
    estimatedMonths: number;
    requiredSkills: string[];
  }>;
  estimatedTotalMonths: number;
  keyMilestones: string[];
}> {
  const pathPrompt = `Generate a realistic career progression path:

Current Role: ${currentRole}
Target Role: ${targetRole}
Current Experience: ${yearsExperience} years
Current Skills: ${skills.join(', ')}

Create a step-by-step career path with:
1. Intermediate roles/transitions
2. Timeline for each stage (in months)
3. Key skills to develop at each stage
4. Overall timeline to reach target role
5. Major milestones

Format as JSON with: stages (array of {stage, title, description, estimatedMonths, requiredSkills}), estimatedTotalMonths, keyMilestones`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'user',
          content: pathPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      stages: [],
      estimatedTotalMonths: 12,
      keyMilestones: [],
    };
  } catch (error) {
    console.error('Career path generation error:', error);
    throw error;
  }
}
