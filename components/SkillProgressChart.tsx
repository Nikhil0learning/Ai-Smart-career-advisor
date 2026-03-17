'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SkillData {
  skill: string;
  level: number;
  date: Date;
}

interface SkillProgressChartProps {
  data: SkillData[];
}

export default function SkillProgressChart({ data }: SkillProgressChartProps) {
  // Transform data for chart
  const chartData = data
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((acc, item) => {
      const dateStr = new Date(item.date).toLocaleDateString();
      const existing = acc.find((d) => d.date === dateStr);
      if (existing) {
        existing[item.skill] = item.level;
      } else {
        acc.push({ date: dateStr, [item.skill]: item.level });
      }
      return acc;
    }, [] as any[]);

  const skills = [...new Set(data.map((d) => d.skill))];
  const colors = ['#000000', '#666666', '#999999', '#cccccc'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Skill Progression</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No skill progression data yet. Update your skills to see progress.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              {skills.map((skill, idx) => (
                <Line
                  key={skill}
                  type="monotone"
                  dataKey={skill}
                  stroke={colors[idx % colors.length]}
                  connectNulls
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
