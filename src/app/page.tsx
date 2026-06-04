'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function Home() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Spotify-style upgrade: Auto-forward logged-in users directly to their workspace
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          router.push('/dashboard');
        } else {
          setCheckingAuth(false);
        }
      } catch (error) {
        console.error('Session verification exception:', error);
        setCheckingAuth(false);
      }
    };

    checkUser();
  }, [router, supabase]);

  // Loading screen prevents layout shifts while checking for a background session
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center font-sans">
        <div className="text-xs font-bold text-[#A49B91] tracking-widest uppercase">
          Verifying Session Signature...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#111111] font-sans antialiased flex flex-col justify-between">
      
      {/* TOP BRAND HEADER NAVIGATION */}
      <header className="max-w-6xl w-full mx-auto px-6 pt-6 flex items-center justify-between">
        <h1 className="text-xs font-black tracking-[0.25em] uppercase">
          <span className="text-[#C4A482] mr-1">川</span>Producer Saab
        </h1>
        <button 
          onClick={() => router.push('/dashboard')}
          className="text-[10px] font-bold tracking-wider uppercase px-5 py-2.5 bg-gray-900 text-white hover:bg-gray-800 transition rounded-full shadow-sm"
        >
          Studio Deck
        </button>
      </header>

      {/* HERO HERO TITLE SPLASH */}
      <main className="max-w-4xl mx-auto px-6 text-center py-20 my-auto space-y-8">
        <div className="inline-block px-3 py-1 bg-white border border-[#EFECE6] rounded-full text-[10px] font-bold tracking-widest text-[#C4A482] uppercase shadow-sm">
          Acoustic Architecture Room
        </div>
        
        <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.05] text-gray-950 max-w-2xl mx-auto">
          Deploy Your Stems. <br />
          <span className="text-[#C4A482]">Own Your Catalogue.</span>
        </h2>
        
        <p className="text-sm sm:text-base text-gray-500 max-w-lg mx-auto leading-relaxed font-medium">
          A minimalist portfolio platform constructed exclusively for music producers to drops instrumentals, curate real-time logs, and host custom sound architectures.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white hover:bg-gray-800 transition rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md"
          >
            Enter Music Studio
          </button>
          <button
            onClick={() => router.push('/signin')}
            className="w-full sm:w-auto px-8 py-4 bg-white border border-[#EFECE6] text-gray-800 hover:bg-gray-50 transition rounded-2xl text-xs font-bold uppercase tracking-wider shadow-sm"
          >
            Account Access
          </button>
        </div>
      </main>

      {/* FOOTER METRICS */}
      <footer className="max-w-6xl w-full mx-auto px-6 pb-8 border-t border-[#EFECE6]/60 pt-6 flex flex-col sm:flex-row gap-4 justify-between items-center text-[10px] font-bold tracking-widest uppercase text-gray-400">
        <div>© 2026 Producer Saab. All Rights Reserved.</div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-gray-600 transition">Terms</a>
          <a href="#" className="hover:text-gray-600 transition">Privacy</a>
          <a href="#" className="hover:text-gray-600 transition">Systems</a>
        </div>
      </footer>

    </div>
  );
}
