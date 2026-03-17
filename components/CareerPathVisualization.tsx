'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PathStage {
  stage: number;
  description: string;
  progress: number;
}

interface CareerPathVisualizationProps {
  stages: PathStage[];
}

export default function CareerPathVisualization({ stages }: CareerPathVisualizationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Career Path Stages</CardTitle>
      </CardHeader>
      <CardContent>
        {stages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No career path data available yet.
          </div>
        ) : (
          <div className="space-y-6">
            {stages.map((stage, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Stage {stage.stage}: {stage.description}</span>
                  <span className="text-xs text-muted-foreground">{stage.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${stage.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
