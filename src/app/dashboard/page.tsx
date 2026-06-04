'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function Dashboard() {
  const router = useRouter();
  
  // Initialize Database Link Client
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Structural Application States
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({ display_name: 'Your Studio', account_type: 'Music Producer', bio: '' });
  const [mySounds, setMySounds] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Interactive Form States
  const [trackTitle, setTrackTitle] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [trackGenre, setTrackGenre] = useState<string>('#LoFi');
  const [publishing, setPublishing] = useState<boolean>(false);
  const [editingProfile, setEditingProfile] = useState<boolean>(false);

  useEffect(() => {
    async function loadDashboardData() {
      // 1. Verify User Authentication Session
      const { data: { user } } = await database.auth.getUser();
      if (!user) {
        router.push('/signin');
        return;
      }
      setUser(user);

      // 2. Fetch or Sync Profile Matrix Data
      let { data: profileRecord } = await database
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!profileRecord) {
        const fallBackHandle = user.email?.split('@')[0] || 'producer';
        const { data: generatedRecord } = await database
          .from('profiles')
          .insert([{ id: user.id, username: fallBackHandle, display_name: 'Your Studio', account_type: 'Music Producer' }])
          .select()
          .single();
        if (generatedRecord) profileRecord = generatedRecord;
      }
      if (profileRecord) setProfile(profileRecord);

      // 3. Populate Active User Track Feeds
      const { data: recordedSounds } = await database
        .from('sounds')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });
      if (recordedSounds) setMySounds(recordedSounds);

      setLoading(false);
    }
    loadDashboardData();
  }, [database, router]);

  // Handler: Register New Tracks Into Supabase Data Arrays
  const handlePublishTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackTitle.trim() || !audioUrl.trim()) return;
    setPublishing(true);

    const { data: soundEntry, error } = await database
      .from('sounds')
      .insert([
        {
          title: trackTitle,
          genre: trackGenre,
          audio_url: audioUrl.trim(),
          profile_id: user.id
        }
      ])
      .select();

    if (!error && soundEntry) {
      setMySounds([soundEntry[0], ...mySounds]);
      setTrackTitle('');
      setAudioUrl('');
    } else {
      console.error('Audio asset save rejection:', error);
    }
    setPublishing(false);
  };

  // Handler: Commit Updated Studio Settings
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await database
      .from('profiles')
      .update({
        display_name: profile.display_name,
        account_type: profile.account_type,
        bio: profile.bio
      })
      .eq('id', user.id);

    if (!error) {
      setEditingProfile(false);
    }
  };

  const handleLogOut = async () => {
    await database.auth.signOut();
    router.refresh();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F0E8] flex items-center justify-center font-sans">
        <div className="text-sm font-semibold text-gray-500 tracking-wider">Syncing Studio Control Panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F0E8] text-[#1C1B1A] font-sans antialiased">
      
      {/* HEADER SECTION NAVBAR */}
      <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-8 sticky top-0 z-50">
        <h1 className="text-xl font-black tracking-[0.15em] uppercase cursor-pointer" onClick={() => router.push('/')}>
          <span className="text-[#C89B6D] mr-1">川</span>ProducerSaab
        </h1>
        <button 
          onClick={handleLogOut}
          className="text-xs font-bold px-4 py-2 bg-gray-100 hover:bg-gray-200 transition rounded-full"
        >
          Sign Out
        </button>
      </header>

      {/* THREE-COLUMN INTERACTIVE CONTENT FEED */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 p-6">
        
        {/* LEFT COLUMN: INTERACTIVE PROFILE DISPLAY PANEL */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-orange-200 mb-3 flex items-center justify-center text-xl font-bold text-orange-700 uppercase">
              {String(profile.display_name || 'P').charAt(0)}
            </div>
            
            {!editingProfile ? (
              <div className="space-y-2">
                <h2 className="font-bold text-base tracking-tight">{profile.display_name}</h2>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{profile.account_type}</p>
                {profile.bio && <p className="text-xs text-gray-600 border-t pt-2 mt-2 leading-relaxed">{profile.bio}</p>}
                <button 
                  onClick={() => setEditingProfile(true)}
                  className="w-full mt-3 text-center text-[11px] font-bold text-[#C89B6D] hover:underline bg-amber-50/50 py-1.5 rounded-lg"
                >
                  Edit Studio Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleProfileUpdate} className="space-y-3 mt-2">
                <input 
                  type="text" 
                  className="w-full text-xs p-2 border rounded-lg" 
                  value={profile.display_name || ''} 
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} 
                  placeholder="Studio Name" 
                  required 
                />
                <input 
                  type="text" 
                  className="w-full text-xs p-2 border rounded-lg" 
                  value={profile.account_type || ''} 
                  onChange={(e) => setProfile({ ...profile, account_type: e.target.value })} 
                  placeholder="Role Title" 
                  required 
                />
                <textarea 
                  className="w-full text-xs p-2 border rounded-lg resize-none" 
                  rows={2}
                  value={profile.bio || ''} 
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })} 
                  placeholder="Add your bio info..." 
                />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-gray-900 text-white text-[10px] font-bold py-1.5 rounded-md">Save</button>
                  <button type="button" onClick={() => setEditingProfile(false)} className="flex-1 bg-gray-100 text-[10px] font-bold py-1.5 rounded-md">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </aside>

        {/* MIDDLE COLUMN: AUDIO PUBLISHING COMPONENT & DYNAMIC BROADCAST FEED */}
        <main className="flex-1">
          {/* TRACK SUBMISSION CONTAINER */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Publish To Network Stream</h3>
            <form onSubmit={handlePublishTrack} className="space-y-3">
              <input
                type="text"
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#C89B6D]"
                placeholder="Name your track title..."
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                required
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  className="flex-1 border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-[#C89B6D]"
                  placeholder="Direct link to audio file URL (e.g. storage bucket file.mp3)"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  required
                />
                <select 
                  className="p-3 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none"
                  value={trackGenre}
                  onChange={(e) => setTrackGenre(e.target.value)}
                >
                  <option value="#LoFi">#LoFi</option>
                  <option value="#AfroHouse">#AfroHouse</option>
                  <option value="#Drill">#Drill</option>
                  <option value="#Trap">#Trap</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={publishing}
                className="w-full sm:w-max px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl tracking-wide transition self-end disabled:opacity-50"
              >
                {publishing ? 'Publishing File...' : 'Share Session Link'}
              </button>
            </form>
          </div>

          {/* STREAM CONTENT ACCELERATOR LOOP */}
          <div className="space-y-4">
            {mySounds.length > 0 ? (
              mySounds.map((track) => (
                <div key={track.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between gap-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-base tracking-tight text-gray-900">{track.title}</h3>
                      <p className="text-[11px] font-semibold text-gray-400 mt-0.5">Uploaded by @{profile.username}</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#C89B6D] bg-amber-50 px-2 py-0.5 rounded uppercase tracking-wider">{track.genre}</span>
                  </div>
                  <audio controls src={track.audio_url} className="w-full h-8 mt-1 accent-gray-900" />
                </div>
              ))
            ) : (
              /* Fallback Placeholders when Catalog is Empty */
              <>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-900">New Lo-Fi Session</h3>
                    <span className="text-[10px] font-bold text-[#C89B6D] bg-amber-50 px-2 py-0.5 rounded">#LoFi</span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Looking for a vocalist for this track arrangement.
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-900">Studio Breakdown</h3>
                    <span className="text-[10px] font-bold text-[#C89B6D] bg-amber-50 px-2 py-0.5 rounded">#Mixing</span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Sharing my mixing chain configurations for analog vocals.
                  </p>
                </div>
              </>
            )}
          </div>
        </main>

        {/* RIGHT COLUMN: TRENDING INSIGHT MATRIX */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-4">
              Trending Studio Metrics
            </h3>
            <div className="space-y-3 font-semibold text-sm">
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition">
                <span className="text-gray-700">#AfroHouse</span>
                <span className="text-xs font-normal text-gray-400">🔥 high stream velocity</span>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition">
                <span className="text-gray-700">#Drill</span>
                <span className="text-xs font-normal text-gray-400">📈 rising query depth</span>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition">
                <span className="text-gray-700">#LoFi</span>
                <span className="text-xs font-normal text-gray-400">✨ stable distribution</span>
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
