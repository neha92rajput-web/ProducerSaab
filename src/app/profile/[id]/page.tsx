'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function PublicShowcase() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const targetId = params?.id;

  const [profile, setProfile] = useState<any>(null);
  const [sounds, setSounds] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    if (!targetId) return;

    async function loadShowcaseData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) setIsLoggedIn(true);

        // Fetch profile metrics matching dynamic URL route
        const { data: targetProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetId)
          .maybeSingle();

        let activeProfile = targetProfile;
        if (!activeProfile) {
          const { data: handleProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', targetId)
            .maybeSingle();
          if (handleProfile) activeProfile = handleProfile;
        }

        if (activeProfile) {
          setProfile(activeProfile);
          
          // Fetch linked tracks
          const { data: catalog } = await supabase
            .from('sounds')
            .select('*')
            .eq('profile_id', activeProfile.id)
            .order('created_at', { ascending: false });
          if (catalog) setSounds(catalog);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadShowcaseData();
  }, [targetId, supabase]);

  if (loading) return <div className="min-h-screen bg-[#0F0E0D] text-gray-500 flex items-center justify-center text-xs">Streaming Showcase...</div>;
  if (!profile) return <div className="min-h-screen bg-[#0F0E0D] text-white flex items-center justify-center text-xs">Profile Offline.</div>;

  return (
    <div className="min-h-screen bg-[#0F0E0D] text-[#E5E1DB] pb-24 font-sans">
      
      {/* GLASS BANNER BACKGROUND */}
      <div className="h-48 sm:h-60 bg-gradient-to-b from-[#2B2724] to-[#0F0E0D] relative flex items-end p-8 border-b border-white/5">
        <button onClick={() => router.push('/')} className="absolute top-4 left-4 bg-black/40 text-xs font-bold text-gray-300 px-4 py-2 rounded-full border border-white/5">
          ← Back to Global Feed
        </button>

        <div className="flex items-center gap-4 max-w-4xl w-full mx-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#C89B6D] text-black font-black rounded-xl flex items-center justify-center text-2xl overflow-hidden shrink-0">
            {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : profile.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-black text-white">{profile.display_name || `@${profile.username}`}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{profile.headline || 'Music Producer'}</p>
          </div>
          
          {/* FOLLOW ACTION: Active vs Disabled Guest state controller */}
          <div className="ml-auto">
            {isLoggedIn ? (
              <button className="px-5 py-2 bg-blue-700 text-white text-xs font-bold rounded-full transition hover:bg-blue-800">
                Follow Creator
              </button>
            ) : (
              <button onClick={() => router.push('/signin')} className="px-5 py-2 bg-white/5 text-gray-500 text-xs font-bold rounded-full border border-white/5 hover:text-white transition">
                Sign in to Follow
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PURE SOUND DISPLAY CARDS LIST */}
      <div className="max-w-4xl mx-auto px-6 mt-8 space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#C89B6D]">🎵 Audio Catalog</h3>
        
        <div className="grid grid-cols-1 gap-2">
          {sounds.map((track) => (
            <div key={track.id} className="bg-[#141312] border border-white/[0.03] rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="font-bold text-sm text-white">{track.title}</h4>
                <div className="flex items-center gap-2 mt-1.5 text-[9px] text-gray-400 uppercase tracking-wider font-semibold">
                  <span className="text-[#C89B6D]">{track.genre}</span>
                  {track.bpm && <span>• {track.bpm} BPM</span>}
                  {track.key && <span>• {track.key}</span>}
                </div>
              </div>
              <audio controls src={track.audio_url} className="w-full sm:w-64 h-8 accent-[#C89B6D]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
