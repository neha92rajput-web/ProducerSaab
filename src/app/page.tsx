'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function HomeLandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { user } } = await database.auth.getUser();
        if (user) {
          // PERMANENT FIX: Send directly to studio, not dashboard
          router.replace('/studio');
        } else {
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
      }
    }
    checkSession();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-xs font-bold text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-8 text-black">
      <div className="max-w-6xl w-full mx-auto flex justify-between items-center">
        <div className="text-sm font-black tracking-widest uppercase italic">
          PRODUCER SAAB
        </div>
        <button 
          onClick={() => router.push('/signin')} 
          className="text-xs font-black uppercase tracking-widest border border-black px-6 py-2 rounded-full hover:bg-black hover:text-white transition-all"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
