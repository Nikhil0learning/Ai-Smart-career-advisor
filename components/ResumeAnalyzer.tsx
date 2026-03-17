'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

interface ResumeAnalysis {
  strengths: string[];
  weaknesses: string[];
  skillGaps: string[];
  recommendations: string[];
  score: number;
}

interface ResumeAnalyzerProps {
  targetRole?: string;
}

export default function ResumeAnalyzer({ targetRole }: ResumeAnalyzerProps) {
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(true);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!resumeText.trim()) {
      setError('Please paste or enter your resume text');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/resume-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          targetRole,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!showForm && analysis) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Resume Analysis</h2>
          <Button variant="outline" onClick={() => setShowForm(true)}>
            Analyze Another
          </Button>
        </div>

        {/* Score Card */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">Overall Career Readiness Score</p>
              <p className="text-5xl font-bold">{analysis.score}/100</p>
              <p className="text-sm text-muted-foreground mt-2">
                {analysis.score >= 80
                  ? 'Excellent! You are well-prepared for your career goal.'
                  : analysis.score >= 60
                  ? 'Good! With some improvements, you can reach your goal.'
                  : 'You have potential. Focus on the recommendations below.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Strengths */}
        {analysis.strengths.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.strengths.map((strength, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-primary font-bold">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Areas for Improvement */}
        {analysis.weaknesses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Areas for Improvement</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.weaknesses.map((weakness, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-orange-500 font-bold">⚠</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Skill Gaps */}
        {analysis.skillGaps.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Skill Gaps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analysis.skillGaps.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-red-100 text-red-900 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {analysis.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {analysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="font-semibold text-primary flex-shrink-0">
                      {idx + 1}.
                    </span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume Analysis</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Get AI-powered insights on your resume and personalized recommendations
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAnalyze} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-900 rounded-md text-sm">
              {error}
            </div>
          )}

          <FieldGroup>
            <FieldLabel>Your Resume or Profile</FieldLabel>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume, cover letter, or professional summary here..."
              className="w-full px-4 py-3 min-h-64 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </FieldGroup>

          {targetRole && (
            <FieldGroup>
              <FieldLabel>Target Role</FieldLabel>
              <Input value={targetRole} disabled className="bg-muted" />
            </FieldGroup>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Spinner className="mr-2" />
                Analyzing your resume...
              </>
            ) : (
              'Analyze Resume'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
