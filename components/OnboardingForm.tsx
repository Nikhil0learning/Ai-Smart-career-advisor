'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

interface OnboardingFormProps {
  onComplete: (userId: string) => void;
}

export default function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    currentRole: '',
    yearsExperience: '',
    skills: '',
    careerGoal: '',
    learningHistory: '',
    industry: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Parse array fields
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s);
      const learningHistoryArray = formData.learningHistory
        .split(',')
        .map((l) => l.trim())
        .filter((l) => l);

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          currentRole: formData.currentRole,
          yearsExperience: parseInt(formData.yearsExperience),
          skills: skillsArray,
          careerGoal: formData.careerGoal,
          learningHistory: learningHistoryArray,
          industry: formData.industry,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      const data = await response.json();
      console.log('API Response:', data);
      const userId = data.profile._id.toString();
      console.log('Extracted userId:', userId);
      onComplete(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl">Welcome to AI Career Advisor</CardTitle>
          <p className="text-muted-foreground mt-2">
            Tell us about yourself to get personalized career guidance
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 text-red-900 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FieldGroup>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel>Full Name</FieldLabel>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel>Current Role</FieldLabel>
                <Input
                  type="text"
                  name="currentRole"
                  value={formData.currentRole}
                  onChange={handleChange}
                  placeholder="e.g., Software Engineer"
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel>Years of Experience</FieldLabel>
                <Input
                  type="number"
                  name="yearsExperience"
                  value={formData.yearsExperience}
                  onChange={handleChange}
                  placeholder="5"
                />
              </FieldGroup>

              <FieldGroup className="md:col-span-2">
                <FieldLabel>Industry</FieldLabel>
                <Input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  placeholder="e.g., Technology, Finance"
                />
              </FieldGroup>

              <FieldGroup className="md:col-span-2">
                <FieldLabel>Current Skills (comma-separated)</FieldLabel>
                <Input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="React, TypeScript, Node.js"
                />
              </FieldGroup>

              <FieldGroup className="md:col-span-2">
                <FieldLabel>Career Goal</FieldLabel>
                <Input
                  type="text"
                  name="careerGoal"
                  value={formData.careerGoal}
                  onChange={handleChange}
                  placeholder="Where do you want to be in 5 years?"
                />
              </FieldGroup>

              <FieldGroup className="md:col-span-2">
                <FieldLabel>Learning History (comma-separated)</FieldLabel>
                <Input
                  type="text"
                  name="learningHistory"
                  value={formData.learningHistory}
                  onChange={handleChange}
                  placeholder="AWS Certification, Machine Learning Course"
                />
              </FieldGroup>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-2" />
                  Setting up your profile...
                </>
              ) : (
                'Start Your Career Journey'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
