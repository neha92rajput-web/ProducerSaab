'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await database.auth.getUser();
      if (!user) {
        router.push('/signin');
      } else {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  if (loading) return <div className="p-10">Loading setup...</div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-10">
      <h1 className="text-3xl font-black">Studio Setup</h1>
      <p>This is your onboarding gateway.</p>
      {/* Add your setup form here */}
    </div>
  );
}
