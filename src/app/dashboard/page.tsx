'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function Dashboard() {
  const router = useRouter();
  
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Core Data States
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({ display_name: 'Studio Workspace', account_type: 'Music Producer', username: 'username', bio: '' });
  const [mySounds, setMySounds] = useState<any[]>([]);
  
  // 1. Add states snippet
  const [posts, setPosts] = useState<any[]>([]);
  const [postContent, setPostContent] = useState<string>('');

  // Audio Upload Form Input States
  const [trackTitle, setTrackTitle] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [trackGenre, setTrackGenre] = useState<string>('Guitar Loop / Sample');
  const [publishing, setPublishing] = useState<boolean>(false);
  const [editingProfile, setEditingProfile] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboardData() {
      const { data: { user } } = await database.auth.getUser();
      if (!user) {
        router.push('/signin');
        return;
      }
      setUser(user);

      let { data: profileRecord } = await database
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!profileRecord) {
        const fallBackHandle = user.email?.split('@')[0] || 'producer';
        const { data: generatedRecord } = await database
          .from('profiles')
          .insert([{ id: user.id, username: fallBackHandle, display_name: `${fallBackHandle} Studio`, account_type: 'Music Producer', bio: 'Welcome to my verified audio drops portfolio space.' }])
          .select()
          .single();
        if (generatedRecord) profileRecord = generatedRecord;
      }
      if (profileRecord) setProfile(profileRecord);

      const { data: recordedSounds } = await database
        .from('sounds')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });
      if (recordedSounds) setMySounds(recordedSounds);

      // 2. Load posts snippet
      const { data: feedPosts } = await database
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (feedPosts) {
        setPosts(feedPosts);
      }

      setLoading(false);
    }
    loadDashboardData();
  }, [database, router]);

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
    }
    setPublishing(false);
  };

  // 3. Add create post function snippet
  const handleCreatePost = async () => {
    if (!postContent.trim()) return;

    const { data, error } = await database
      .from('posts')
      .insert([
        {
          profile_id: user.id,
          content: postContent
        }
      ])
      .select();

    if (!error && data) {
      setPosts([data[0], ...posts]);
      setPostContent('');
    }
  };

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
      <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center font-sans">
        <div className="text-xs font-bold text-[#A49B91] tracking-widest uppercase">Initializing Studio Deck...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-[#111111] font-sans antialiased pb-20">
      
      {/* BRAND HEADER */}
      <header className="max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between">
        <h1 className="text-xs font-black tracking-[0.25em] uppercase cursor-pointer" onClick={() => router.push('/')}>
          <span className="text-[#C4A482] mr-1">川</span>Producer Saab
        </h1>
        <button onClick={handleLogOut} className="text-[10px] font-bold tracking-wider uppercase px-4 py-2 bg-white border border-[#EFECE6] hover:bg-gray-50 transition rounded-full shadow-sm">
          Disconnect
        </button>
      </header>

      {/* CORE CONTROL ROW DASHBOARD */}
      <div className="max-w-6xl mx-auto px-4 mt-8 flex flex-col md:flex-row gap-6 items-start">
        
        {/* LEFT COLUMN PANEL: PROFILE PROFILE & TIMELINE DROPS */}
        <div className="flex-1 w-full space-y-6">
          
          {/* USER BIO IDENTITY DISPLAY CARD */}
          <div className="bg-white rounded-[28px] border border-[#EFECE6] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
            <div className="h-32 bg-gradient-to-b from-[#DECBB7] to-[#EFECE6]" />
            <div className="px-8 pb-8 relative">
              <div className="w-[84px] h-[84px] bg-[#111111] rounded-full flex items-center justify-center text-white text-3xl shadow-md border-4 border-white absolute -top-12 left-8">
                🎧
              </div>
              <div className="pt-16 space-y-4">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-gray-900">{profile.display_name}</h2>
                  <p className="text-xs font-bold text-[#C4A482] uppercase tracking-wide mt-1">
                    {profile.account_type} • Verified Creator
                  </p>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xl font-medium">
                  {profile.bio || "Welcome to my verified audio drops portfolio space. Stream my latest sound stems, melody lines, and instrument layers below."}
                </p>
              </div>
            </div>
          </div>

          {/* 4. Add a feed card above your tracks section snippet */}
          <div className="bg-white rounded-[28px] border border-[#EFECE6] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
            <h3 className="text-lg font-black mb-4">Studio Feed</h3>

            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Share a beat, sample pack, collaboration request..."
              className="w-full min-h-[100px] border border-[#EFECE6] rounded-2xl p-4 text-sm resize-none focus:outline-none"
            />

            <button
              onClick={handleCreatePost}
              className="mt-3 px-5 py-3 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Publish Update
            </button>

            <div className="mt-6 space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-[#FAF8F4] border border-[#EFECE6] rounded-2xl p-4"
                >
                  <div className="text-xs font-bold text-[#C4A482] uppercase mb-2">
                    Studio Update
                  </div>

                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* AUDIO TRACK DISPLAY DECK */}
          <div className="bg-white rounded-[28px] border border-[#EFECE6] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
            <div className="mb-6">
              <h3 className="text-lg font-black tracking-tight">Featured Tracks & Audio Drops</h3>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">Listen to custom sound architectures directly inside the browser player.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mySounds.length > 0 ? (
                mySounds.map((track) => (
                  <div key={track.id} className="bg-[#FAF8F4] border border-[#EFECE6] rounded-2xl p-5 flex flex-col justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-sm">🎚️</div>
                      <div className="truncate">
                        <h4 className="font-bold text-sm text-gray-900 truncate">{track.title}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{track.genre}</p>
                      </div>
                      <span className="ml-auto text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase shrink-0">Live</span>
                    </div>
                    <audio controls src={track.audio_url} className="w-full h-8 accent-gray-900 mt-1" />
                  </div>
                ))
              ) : (
                /* Static Default Matching Layout Placeholder Aesthetics Precisely */
                <div className="bg-[#FAF8F4] border border-[#EFECE6] rounded-2xl p-5 flex flex-col justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm text-sm">💿</div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">Midnight</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">90 BPM • F# Minor • Guitar Loop</p>
                    </div>
                    <span className="ml-auto text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Live</span>
                  </div>
                  <div className="w-8 h-8 bg-gray-200/60 hover:bg-gray-200 rounded-full flex items-center justify-center cursor-pointer transition">
                    <span className="text-gray-600 text-xs pl-0.5">▶</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN SIDEBAR: AUDIO PUBLISHING MANAGEMENT TOOLS */}
        <aside className="w-full md:w-72 space-y-6 shrink-0">
          
          {/* TRACK DROPS MANAGER TOOL */}
          <div className="bg-white rounded-[24px] border border-[#EFECE6] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">Add Audio Drop</h3>
            <form onSubmit={handlePublishTrack} className="space-y-4">
              <input
                type="text"
                placeholder="Track Name"
                className="w-full text-xs p-3 border border-[#EFECE6] rounded-xl focus:outline-none focus:border-[#C4A482]"
                value={trackTitle}
                onChange={(e) => setTrackTitle(e.target.value)}
                required
              />
              <input
                type="url"
                placeholder="Audio File Resource URL (.mp3)"
                className="w-full text-xs p-3 border border-[#EFECE6] rounded-xl focus:outline-none focus:border-[#C4A482]"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                required
              />
              <select
                className="w-full text-xs p-3 border border-[#EFECE6] rounded-xl bg-white focus:outline-none"
                value={trackGenre}
                onChange={(e) => setTrackGenre(e.target.value)}
              >
                <option value="Guitar Loop / Sample">Guitar Loop</option>
                <option value="Drum Stems Pack">Drum Stems Pack</option>
                <option value="Vocal Layer Patch">Vocal Layer</option>
                <option value="Synth Arrangement Master">Full Beat Master</option>
              </select>
              <button type="submit" disabled={publishing} className="w-full py-3 bg-gray-900 text-white font-bold text-xs rounded-xl tracking-wider uppercase transition hover:bg-gray-800 disabled:opacity-50">
                {publishing ? 'Publishing...' : 'Deploy Sound File'}
              </button>
            </form>
          </div>

          {/* STUDIO METRIC CREDENTIAL DETAILS FOR PANELS */}
          <div className="bg-white rounded-[24px] border border-[#EFECE6] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
            <h3 className="text-xs font-bold text-[#C4A482] uppercase tracking-widest mb-4">Studio Credentials</h3>
            
            {!editingProfile ? (
              <div className="space-y-4 text-xs font-semibold">
                <div className="flex justify-between border-b pb-2 border-gray-50">
                  <span className="text-gray-400">Handle ID:</span>
                  <span className="text-gray-800">@{profile.username}</span>
                </div>
                <div className="flex justify-between border-b pb-2 border-gray-50">
                  <span className="text-gray-400">Trade Spec:</span>
                  <span className="text-gray-800">{profile.account_type}</span>
                </div>
                <button onClick={() => setEditingProfile(true)} className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 transition border border-[#EFECE6] text-gray-700 rounded-xl text-[11px] font-bold uppercase tracking-wider">
                  Update Spec Parameters
                </button>
              </div>
            ) : (
              <form onSubmit={handleProfileUpdate} className="space-y-3">
                <input type="text" className="w-full text-xs p-2.5 border rounded-xl" value={profile.display_name || ''} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} placeholder="Studio Display Title" required />
                <input type="text" className="w-full text-xs p-2.5 border rounded-xl" value={profile.account_type || ''} onChange={(e) => setProfile({ ...profile, account_type: e.target.value })} placeholder="Trade Specialty" required />
                <textarea className="w-full text-xs p-2.5 border rounded-xl resize-none" rows={2} value={profile.bio || ''} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Custom portfolio statement..." />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-gray-900 text-white text-[10px] font-bold py-2 rounded-lg">Save</button>
                  <button type="button" onClick={() => setEditingProfile(false)} className="flex-1 bg-gray-100 text-[10px] font-bold py-2 rounded-lg">Cancel</button>
                </div>
              </form>
            )}
          </div>
        </aside>

      </div>
    </div>
  );
}
