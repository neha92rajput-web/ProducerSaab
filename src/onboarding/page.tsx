'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await database.auth.getUser();
      if (!user) {
        router.push('/signin');
      } else {
        setUser(user);
        setLoading(false);
      }
    }
    checkUser();
  }, [router]);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to your Studio Setup</h1>
      <p>Let's get your profile ready so you can join the community.</p>
      {/* Your Onboarding form code goes here */}
    </div>
  );
}
