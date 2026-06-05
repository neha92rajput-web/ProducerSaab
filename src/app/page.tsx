'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Home() {
  const supabase = createClientComponentClient();

  const [recentUploads, setRecentUploads] = useState<any[]>([]);
  const [networkProfiles, setNetworkProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNetworkData() {
      try {
        const { data: soundRecords } = await supabase
          .from('sounds')
          .select(`
            id, title, genre, audio_url,
            profiles(username, display_name)
          `)
          .order('created_at', { ascending: false })
          .limit(3);
        if (soundRecords) setRecentUploads(soundRecords);

        const { data: profileRecords } = await supabase
          .from('profiles')
          .select('id, username, display_name, account_type')
          .order('created_at', { ascending: false })
          .limit(2);
        if (profileRecords) setNetworkProfiles(profileRecords);

      } catch (err) {
        console.error('Data stream failure:', err);
      } finally {
        setLoading(false);
      }
    }
    loadNetworkData();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-[#F6F1EA] text-[#5A5550] font-sans antialiased">
      {/* 1. NAVIGATION */}
      <header className="sticky top-0 z-50 bg-[#F6F1EA]/80 backdrop-blur-md border-b border-[#E7DED3] px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black tracking-[0.2em] text-sm text-[#1C1B1A] uppercase">
            <span className="text-xl font-light text-[#C89B6D]">川</span> Producer Saab
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/signin" className="text-xs font-bold text-[#1C1B1A]">Sign In</Link>
            {/* UPDATED LINK: Points directly to the dedicated signup page */}
            <Link href="/signup" className="px-5 py-2 bg-[#111111] text-[#FFFFFF] text-xs font-semibold rounded-full">
              Join the Community
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO */}
      <main className="relative min-h-[500px] flex items-center bg-[#E7DED3] p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl font-serif font-bold text-[#1C1B1A]">The Home for Music Producers</h1>
            <p className="text-sm text-[#1C1B1A]/80">Join a community of music creators sharing tracks, loops, and beats.</p>
            {/* UPDATED LINK: Points directly to the dedicated signup page */}
            <Link href="/signup" className="inline-block px-8 py-4 bg-[#1C1B1A] text-white rounded-full text-xs font-black uppercase">
              Get Started — It's Free
            </Link>
          </div>
        </div>
      </main>

      {/* 3. TRENDING SOUNDS */}
      <section className="max-w-4xl mx-auto py-16 px-8">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#1C1B1A] mb-8">Trending Sounds</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentUploads.map((track) => (
            <div key={track.id} className="border border-[#E7DED3] rounded-xl p-4 space-y-4">
              <h4 className="font-bold text-xs">{track.title}</h4>
              <audio controls src={track.audio_url} className="w-full h-7" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
