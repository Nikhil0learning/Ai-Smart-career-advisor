'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';

interface OnboardingFormProps {
  onComplete: (profile: any, userId: string) => void;
}

export function OnboardingForm({ onComplete }: OnboardingFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentRole: '',
    currentIndustry: '',
    yearsOfExperience: '',
    skills: '',
    careerGoal: '',
    learningHistory: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const profilePayload = {
        name: formData.name,
        email: formData.email,
        currentRole: formData.currentRole,
        currentIndustry: formData.currentIndustry,
        yearsOfExperience: parseInt(formData.yearsOfExperience, 10),
        skills: formData.skills.split(',').map((s) => s.trim()),
        careerGoal: formData.careerGoal,
        learningHistory: formData.learningHistory
          ? formData.learningHistory.split(';').map((item) => {
              const [course, date] = item.split(':');
              return { course: course.trim(), completionDate: date?.trim() || '', category: '' };
            })
          : [],
      };

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profilePayload),
      });

      const result = await response.json();
      if (result.success) {
        onComplete(profilePayload, result.id);
      }
    } catch (error) {
      console.error('[v0] Onboarding submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-2xl shadow-lg border border-border/50">
        <CardHeader className="space-y-2 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center text-background font-bold">
              AI
            </div>
            <h1 className="text-2xl font-bold text-foreground">Career Advisor</h1>
          </div>
          <CardTitle className="text-3xl">Let's Build Your Future</CardTitle>
          <CardDescription className="text-base">Step {step} of 3 — Tell us about your career journey</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            {step === 1 && (
              <div className="space-y-5">
                <FieldGroup>
                  <FieldLabel className="text-foreground font-medium">Full Name</FieldLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="bg-background border-border/50"
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel className="text-foreground font-medium">Email Address</FieldLabel>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className="bg-background border-border/50"
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel className="text-foreground font-medium">Current Role</FieldLabel>
                  <Input
                    name="currentRole"
                    value={formData.currentRole}
                    onChange={handleInputChange}
                    placeholder="e.g., Software Engineer, Product Manager"
                    className="bg-background border-border/50"
                  />
                </FieldGroup>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <FieldGroup>
                  <FieldLabel className="text-foreground font-medium">Industry</FieldLabel>
                  <Input
                    name="currentIndustry"
                    value={formData.currentIndustry}
                    onChange={handleInputChange}
                    placeholder="e.g., Technology, Finance, Healthcare"
                    className="bg-background border-border/50"
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel className="text-foreground font-medium">Years of Experience</FieldLabel>
                  <Input
                    name="yearsOfExperience"
                    type="number"
                    value={formData.yearsOfExperience}
                    onChange={handleInputChange}
                    placeholder="5"
                    className="bg-background border-border/50"
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel className="text-foreground font-medium">Key Skills (comma-separated)</FieldLabel>
                  <Input
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="Python, React, Node.js, Leadership"
                    className="bg-background border-border/50"
                  />
                </FieldGroup>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5">
                <FieldGroup>
                  <FieldLabel className="text-foreground font-medium">Career Goal</FieldLabel>
                  <Input
                    name="careerGoal"
                    value={formData.careerGoal}
                    onChange={handleInputChange}
                    placeholder="e.g., Senior Software Engineer, Tech Lead, CTO"
                    className="bg-background border-border/50"
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel className="text-foreground font-medium">Learning History</FieldLabel>
                  <Input
                    name="learningHistory"
                    value={formData.learningHistory}
                    onChange={handleInputChange}
                    placeholder="Format: Course: 2024-01-15; Another Course: 2023-06-20"
                    className="bg-background border-border/50"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Optional: Add courses and certifications you've completed</p>
                </FieldGroup>
              </div>
            )}

            <div className="flex gap-3 pt-8 border-t border-border/30">
              {step > 1 && (
                <Button variant="outline" onClick={handleBack} className="px-6">
                  Back
                </Button>
              )}
              {step < 3 && (
                <Button onClick={handleNext} className="ml-auto px-8 bg-foreground text-background hover:bg-foreground/90">
                  Next
                </Button>
              )}
              {step === 3 && (
                <Button onClick={handleSubmit} disabled={loading} className="ml-auto px-8 bg-foreground text-background hover:bg-foreground/90">
                  {loading ? <Spinner /> : 'Start Your Journey'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
