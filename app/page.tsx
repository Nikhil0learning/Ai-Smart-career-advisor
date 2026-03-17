'use client';

import { useRouter } from 'next/navigation';
import OnboardingForm from '@/components/OnboardingForm';

export default function Home() {
  const router = useRouter();

  const handleOnboardingComplete = (userId: string) => {
    router.push(`/dashboard?userId=${userId}`);
  };

  return <OnboardingForm onComplete={handleOnboardingComplete} />;
}
