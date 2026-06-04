'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function GlobalFeed() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [recentUploads, setRecentUploads] = useState<any[]>([]);
  const [networkProfiles, setNetworkProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSession, setUserSession] = useState<any>(null);

  useEffect(() => {
    async function loadGlobalFeedData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) setUserSession(session.user);

        // Fetch trending track entries from public sounds
        const { data: soundRecords } = await supabase
          .from('sounds')
          .select(`
            id, title, genre, audio_url, bpm, key, mood, profile_id,
            profiles!inner ( username, display_name )
          `)
          .order('created_at', { ascending: false })
          .limit(6);
        if (soundRecords) setRecentUploads(soundRecords);

        // Fetch public community creators
        const { data: profileRecords } = await supabase
          .from('profiles')
          .select('id, username, display_name, account_type, avatar_url')
          .order('created_at', { ascending: false })
          .limit(4);
        if (profileRecords) setNetworkProfiles(profileRecords);

      } catch (err) {
        console.error('Global data pull mismatch:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGlobalFeedData();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-[#F6F1EA] text-[#1C1B1A] font-sans antialiased pb-16">
      
      {/* GLOBAL DISCOVERY HEADER */}
      <header className="sticky top-0 z-50 bg-[#F6F1EA]/90 backdrop-blur-md border-b border-[#E7DED3] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-black tracking-[0.2em] text-xs uppercase flex items-center gap-1">
            <span className="text-[#C89B6D] text-lg">川</span> Producer Saab
          </Link>
          
          <div className="flex items-center gap-4">
            {userSession ? (
              <Link href="/studio" className="px-4 py-2 bg-blue-700 text-white hover:bg-blue-800 text-xs font-bold rounded-full transition shadow-sm">
                Enter Studio Mode 💼
              </Link>
            ) : (
              <>
                <Link href="/signin" className="text-xs font-bold text-gray-600 hover:text-black">Sign In</Link>
                <Link href="/signin?view=signup" className="px-4 py-2 bg-black text-white text-xs font-bold rounded-full transition hover:bg-gray-800">
                  Join Studio
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* DISCOVERY CORE MATRIX */}
      <main className="max-w-5xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: THE TRENDING MUSIC PLAYER STREAM */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b pb-2 border-gray-200">
            <h2 className="text-xs font-black uppercase tracking-widest text-[#C89B6D]">🎧 Global Sound Stream</h2>
            <span className="text-[10px] text-gray-400 font-bold uppercase">Explore Mode (Public)</span>
          </div>

          {loading ? (
            <div className="text-xs font-semibold text-gray-400">Streaming catalog assets...</div>
          ) : recentUploads.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {recentUploads.map((track) => (
                <div key={track.id} className="bg-white border border-[#E7DED3] rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm hover:border-gray-300 transition">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-gray-900 text-white font-bold rounded-xl flex items-center justify-center shrink-0">🎚️</div>
                    <div className="truncate">
                      <h4 className="font-bold text-xs text-gray-900 truncate">{track.title}</h4>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                        By <Link href={`/profile/${track.profile_id}`} className="text-blue-600 hover:underline">@{track.profiles?.username || 'producer'}</Link>
                      </p>
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        {track.bpm && <span className="text-[8px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{track.bpm} BPM</span>}
                        <span className="text-[8px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">{track.genre}</span>
                        {track.key && <span className="text-[8px] font-medium bg-gray-50 text-gray-400 px-1 py-0.5 rounded">{track.key}</span>}
                      </div>
                    </div>
                  </div>
                  <audio controls src={track.audio_url} className="w-full sm:w-60 h-8 accent-gray-900 shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl text-xs text-gray-400">No sounds dropped yet.</div>
          )}
        </div>

        {/* RIGHT COLUMN: DISCOVER PRODUCERS SIDEBAR */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b pb-2">✨ Featured Producers</h3>
          
          <div className="grid grid-cols-1 gap-2.5">
            {networkProfiles.map((creator) => (
              <div key={creator.id} className="bg-white border border-[#E7DED3] rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-black rounded-full shrink-0 flex items-center justify-center text-white font-bold overflow-hidden text-xs">
                    {creator.avatar_url ? <img src={creator.avatar_url} className="w-full h-full object-cover" /> : <span>{String(creator.display_name || creator.username || 'P').charAt(0).toUpperCase()}</span>}
                  </div>
                  <div className="truncate">
                    <h4 className="font-bold text-xs text-gray-900 truncate">@{creator.username}</h4>
                    <p className="text-[9px] font-bold tracking-wide uppercase text-[#C89B6D]">{creator.account_type || 'Producer'}</p>
                  </div>
                </div>
                <Link href={`/profile/${creator.id}`} className="px-3 py-1 bg-gray-100 hover:bg-[#E7DED3] transition text-gray-800 text-[10px] font-bold rounded-lg shadow-sm">
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
