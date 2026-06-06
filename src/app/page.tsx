'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Helper: Fixes audio URLs by encoding special characters like #, (, )
const getSafeUrl = (url: string) => {
  if (!url) return '';
  return encodeURI(url).replace(/#/g, '%23').replace(/\(/g, '%28').replace(/\)/g, '%29');
};

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
          .select(`id, title, category, audio_url, profiles!inner (username, display_name)`)
          .order('created_at', { ascending: false })
          .limit(3);
        if (soundRecords) setRecentUploads(soundRecords);

        const { data: profileRecords } = await supabase
          .from('profiles')
          .select('id, username, display_name, account_type')
          .order('created_at', { ascending: false })
          .limit(2);
        if (profileRecords) setNetworkProfiles(profileRecords);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    loadNetworkData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F6F1EA] text-[#5A5550]">
      {/* Trending Sounds Section */}
      <section className="max-w-4xl mx-auto py-10 px-8">
        <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Trending Sounds</h3>
        {recentUploads.map((track) => (
          <div key={track.id} className="border p-4 mb-4">
            <h4>{track.title}</h4>
            {/* 🔥 FIXED: getSafeUrl ensures the player finds the file */}
            <audio controls src={getSafeUrl(track.audio_url)} className="w-full" />
          </div>
        ))}
      </section>

      {/* Featured Producers Section */}
      <section className="max-w-4xl mx-auto py-10 px-8">
        <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Featured Producers</h3>
        {networkProfiles.map((userCard) => (
          <div key={userCard.id} className="border p-5 flex justify-between items-center">
            <span>@{userCard.username}</span>
            {/* 🔥 FIXED: encodeURIComponent prevents browser navigation crashes */}
            <Link 
              href={`/${encodeURIComponent(userCard.username || '')}`} 
              className="px-4 py-2 bg-black text-white rounded-full text-xs"
            >
              Follow
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
}
