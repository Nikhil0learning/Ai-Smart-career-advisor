'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Spinner } from '@/components/ui/spinner';

interface AnalyticsDashboardProps {
  userId: string;
  userProfile: any;
}

export function AnalyticsDashboard({ userId, userProfile }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/analytics?userId=${userId}`);
        const data = await response.json();
        
        // If no analytics exist, generate sample data
        if (!data.skillProgression || data.skillProgression.length === 0) {
          const sampleData = generateSampleAnalytics(userProfile);
          await fetch('/api/analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, ...sampleData }),
          });
          setAnalytics(sampleData);
        } else {
          setAnalytics(data);
        }
      } catch (error) {
        console.error('[v0] Fetch analytics error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [userId, userProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  if (!analytics) {
    return <div>Failed to load analytics</div>;
  }

  const skillData = (analytics.skillProgression || []).map((skill: any) => ({
    name: skill.skill,
    current: skill.currentLevel,
    target: skill.targetLevel,
  }));

  const pathData = (analytics.careerPathStages || []).map((stage: any, idx: number) => ({
    stage: idx + 1,
    name: stage.stage,
    timeline: stage.estimatedTimeline,
  }));

  const colors = ['#1f2937', '#6b7280', '#d1d5db'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Your Career Analytics</h2>
        <p className="text-muted-foreground mt-1">Track your progress toward {userProfile?.careerGoal}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Progression */}
        <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="border-b border-border/30 pb-4">
            <CardTitle className="text-xl">Skill Progression</CardTitle>
            <CardDescription>Current vs Target Level</CardDescription>
          </CardHeader>
          <CardContent>
            {skillData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={skillData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }} />
                  <Legend />
                  <Bar dataKey="current" fill="#1f2937" name="Current Level" />
                  <Bar dataKey="target" fill="#d1d5db" name="Target Level" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-300 text-muted-foreground">
                No skill data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Time to Goal */}
        <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="border-b border-border/30 pb-4">
            <CardTitle className="text-xl">Timeline to Goal</CardTitle>
            <CardDescription>{analytics.timeToGoal || 0} months estimated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-foreground bg-muted">
                      Progress
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-foreground">
                      {Math.min(100, Math.round((pathData.length / Math.max(pathData.length, 5)) * 100))}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-muted">
                  <div
                    style={{
                      width: `${Math.min(100, Math.round((pathData.length / Math.max(pathData.length, 5)) * 100))}%`,
                    }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-foreground"
                  />
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Estimated time to achieve your goal: <strong>{analytics.timeToGoal || 12} months</strong></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Career Path Stages */}
      <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="border-b border-border/30 pb-4">
          <CardTitle className="text-xl">Your Career Path</CardTitle>
          <CardDescription>Stages to reach your goal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pathData.length > 0 ? (
              pathData.map((path: any, idx: number) => (
                <div key={idx} className="flex items-start gap-4 pb-4 border-b border-border last:border-b-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-foreground font-semibold text-sm flex-shrink-0">
                    {path.stage}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{path.name}</p>
                    <p className="text-sm text-muted-foreground">{path.timeline} months</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p>No career path stages defined yet. Ask your AI advisor to create one!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function generateSampleAnalytics(userProfile: any) {
  const skills = userProfile?.skills || ['Communication', 'Leadership', 'Technical Skills'];
  
  return {
    skillProgression: skills.slice(0, 4).map((skill: string) => ({
      skill,
      currentLevel: Math.floor(Math.random() * 3) + 2,
      targetLevel: 5,
      learningStartDate: '2024-01-01',
      lastUpdated: new Date().toISOString().split('T')[0],
    })),
    careerPathStages: [
      {
        stage: 'Build Foundation Skills',
        role: userProfile?.currentRole || 'Current Role',
        requiredSkills: skills.slice(0, 2),
        estimatedTimeline: 3,
        completed: true,
      },
      {
        stage: 'Gain Advanced Experience',
        role: 'Mid-Level ' + (userProfile?.careerGoal || 'Professional'),
        requiredSkills: skills,
        estimatedTimeline: 6,
        completed: false,
      },
      {
        stage: 'Achieve Goal Role',
        role: userProfile?.careerGoal || 'Target Role',
        requiredSkills: [...skills, 'Strategic Thinking'],
        estimatedTimeline: 3,
        completed: false,
      },
    ],
    timeToGoal: 12,
  };
}
