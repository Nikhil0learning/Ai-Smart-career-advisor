'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ChatInterface from '@/components/ChatInterface';
import SkillProgressChart from '@/components/SkillProgressChart';
import CareerPathVisualization from '@/components/CareerPathVisualization';
import TimelineChart from '@/components/TimelineChart';
import { Spinner } from '@/components/ui/spinner';
import { LogOut } from 'lucide-react';

export default function Dashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get('userId');
  
  console.log('Dashboard userId from URL:', userId);

  const [userProfile, setUserProfile] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [conversationId, setConversationId] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) {
      router.push('/');
      return;
    }

    const loadData = async () => {
      try {
        // Load user profile
        const profileRes = await fetch(`/api/profile?userId=${userId}`);
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUserProfile(profileData);
        }

        // Load analytics
        const analyticsRes = await fetch(`/api/analytics?userId=${userId}`);
        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          setAnalytics(analyticsData.analytics || analyticsData);
        }

        // Load conversations
        const convRes = await fetch(`/api/chat?userId=${userId}`);
        if (convRes.ok) {
          const convData = await convRes.json();
          if (convData.conversations && convData.conversations.length > 0) {
            setConversationId(convData.conversations[0]._id);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userId, router]);

  if (!userId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const handleLogout = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Career Advisor</h1>
            {userProfile && (
              <p className="text-sm text-muted-foreground">
                Welcome, {userProfile.name}
              </p>
            )}
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Start Over
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-900 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Analytics */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {userProfile && (
                  <>
                    <div>
                      <p className="text-xs text-muted-foreground">Current Role</p>
                      <p className="font-semibold">{userProfile.currentRole || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Experience</p>
                      <p className="font-semibold">{userProfile.yearsExperience} years</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Career Goal</p>
                      <p className="font-semibold text-sm">{userProfile.careerGoal || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Industry</p>
                      <p className="font-semibold">{userProfile.industry || 'Not specified'}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Analytics Charts */}
            {analytics && (
              <>
                <SkillProgressChart data={analytics.skillProgression || []} />
                <TimelineChart
                  estimatedMonths={analytics.estimatedTimeToGoal || 12}
                  milestones={analytics.milestones || []}
                />
                <CareerPathVisualization stages={analytics.pathStages || []} />
              </>
            )}
          </div>

          {/* Main - Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <ChatInterface userId={userId} conversationId={conversationId} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
