'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function HomeLandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userSession, setUserSession] = useState<any>(null);

  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { user } } = await database.auth.getUser();
        if (user) {
          setUserSession(user);
          // PERMANENT FIX: Pushes active sessions directly to studio
          router.replace('/studio');
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Session evaluation failure:", err);
        setLoading(false);
      }
    }
    checkSession();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-xs font-bold text-gray-400 font-mono tracking-widest uppercase">
        Evaluating Sync Session State...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between p-8 text-black">
      {/* Header */}
      <div className="max-w-6xl w-full mx-auto flex justify-between items-center">
        <div className="text-sm font-black tracking-widest uppercase italic font-serif">
          🎵 Producer Saab
        </div>
        <button 
          onClick={() => router.push('/signin')} 
          className="text-xs font-black uppercase tracking-widest border border-black px-6 py-2 rounded-full hover:bg-black hover:text-white transition-all"
        >
          Enter Studio
        </button>
      </div>

      {/* Main Branding Section */}
      <div className="max-w-2xl mx-auto text-center space-y-6 my-auto">
        <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter text-[#191919] leading-none">
          The Workspace Architecture for Audio Creators.
        </h1>
        <p className="text-xs md:text-sm text-[#4B3B2F] font-semibold max-w-md mx-auto leading-relaxed">
          Catalog loops, log stem track variables, and distribute asset libraries with complete metadata tracking structures smoothly.
        </p>
        <div className="pt-4">
          <button 
            onClick={() => router.push('/signin')} 
            className="bg-[#191919] text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-[#4B3B2F] transition-all"
          >
            Claim Your Producer Workspace →
          </button>
        </div>
      </div>

      {/* Footer Meta Row */}
      <div className="max-w-6xl w-full mx-auto text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
        © {new Date().getFullYear()} PRODUCERSAAB NETWORK LABS INC. ALL WORKSPACE ASSETS PROTECTED.
      </div>
    </div>
  );
}
