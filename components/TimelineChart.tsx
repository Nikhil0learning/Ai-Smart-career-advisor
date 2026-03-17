'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TimelineChartProps {
  estimatedMonths: number;
  milestones: Array<{
    title: string;
    targetDate: Date;
    completed: boolean;
  }>;
}

export default function TimelineChart({ estimatedMonths, milestones }: TimelineChartProps) {
  // Create a simple timeline visualization
  const timelineData = [
    {
      period: 'Now',
      progress: 0,
    },
    {
      period: `${Math.round(estimatedMonths / 2)} months`,
      progress: 50,
    },
    {
      period: `${estimatedMonths} months`,
      progress: 100,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Time to Goal</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Estimated timeline: <strong>{estimatedMonths} months</strong>
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="progress" fill="#000000" />
            </BarChart>
          </ResponsiveContainer>

          {milestones.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-sm mb-3">Key Milestones</h4>
              <div className="space-y-2">
                {milestones.map((milestone, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div
                      className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${
                        milestone.completed ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{milestone.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(milestone.targetDate).toLocaleDateString()}
                      </p>
                    </div>
                    {milestone.completed && (
                      <span className="text-xs font-semibold text-primary">Completed</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
