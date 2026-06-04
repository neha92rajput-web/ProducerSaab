'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function Dashboard() {
  const router = useRouter();
  
  // Fix 1: Ensure Supabase auth persists session beautifully in browser storage
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );

  // Core Data States
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({ display_name: 'Studio Workspace', account_type: 'Music Producer', username: 'username', bio: '' });
  const [mySounds, setMySounds] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [postContent, setPostContent] = useState<string>('');

  // Form Input States
  const [trackTitle, setTrackTitle] = useState<string>('');
  const [trackGenre, setTrackGenre] = useState<string>('Trap');
  const [trackBpm, setTrackBpm] = useState<string>('140');
  const [trackKey, setTrackKey] = useState<string>('F# Minor');
  const [trackMood, setTrackMood] = useState<string>('Dark');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // UI States
  const [publishing, setPublishing] = useState<boolean>(false);
  const [publishingPost, setPublishingPost] = useState<boolean>(false);
  const [editingProfile, setEditingProfile] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Fix 2: Clean layout dependency constraints to stop redirect flickers
  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);

      const { data: { user } } = await database.auth.getUser();

      if (!user) {
        router.replace('/signin');
        return;
      }

      setUser(user);

      // Fetch User Profiles
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

      // Fetch real tracks from your verified public.sounds table
      const { data: recordedSounds } = await database
        .from('sounds')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });
      if (recordedSounds) setMySounds(recordedSounds);

      // Fetch feed posts
      const { data: feedPosts } = await database
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (feedPosts) setPosts(feedPosts);

      setLoading(false);
    }
    loadDashboardData();
  }, []); // Empty dependency locks it down to run cleanly on mount instance

  // Handle Text Feed Post Creation
  const handleCreatePost = async () => {
    if (!postContent.trim()) return;
    setPublishingPost(true);

    const { data, error } = await database
      .from('posts')
      .insert([{ profile_id: user.id, content: postContent }])
      .select();

    if (!error && data) {
      setPosts([data[0], ...posts]);
      setPostContent('');
    }
    setPublishingPost(false);
  };

  // Handle file uploading to 'audio-tracks' bucket
  const handlePublishTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackTitle.trim() || !selectedFile) return;
    setPublishing(true);

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await database.storage
        .from('audio-tracks')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = database.storage
        .from('audio-tracks')
        .getPublicUrl(filePath);

      const { data: soundEntry, error: tableError } = await database
        .from('sounds')
        .insert([
          {
            title: trackTitle.trim(),
            genre: trackGenre,
            audio_url: publicUrl,
            profile_id: user.id,
            bpm: trackBpm,
            key: trackKey,
            mood: trackMood
          }
        ])
        .select();

      if (tableError) throw tableError;

      if (soundEntry) {
        setMySounds([soundEntry[0], ...mySounds]);
        setTrackTitle('');
        setSelectedFile(null);
        const fileInput = document.getElementById('audio-file-picker') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (err: any) {
      console.error(err);
      alert(`Upload Flow Error: ${err.message || 'Check storage infrastructure configs.'}`);
    } finally {
      setPublishing(false);
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

    if (!error) setEditingProfile(false);
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
      
      {/* 1. UPDATED HEADER NAVBAR with integrated Home navigation flex array */}
      <header className="max-w-6xl mx-auto px-6 pt-6 flex items-center justify-between">
        <h1 className="text-xs font-black tracking-[0.25em] uppercase cursor-pointer" onClick={() => router.push('/')}>
          <span className="text-[#C4A482] mr-1">川</span>Producer Saab
        </h1>
        
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/')}
            className="text-[10px] font-bold tracking-wider uppercase px-4 py-2 bg-white border border-[#EFECE6] hover:bg-gray-50 transition rounded-full shadow-sm"
          >
            Home
          </button>
          <button 
            onClick={handleLogOut} 
            className="text-[10px] font-bold tracking-wider uppercase px-4 py-2 bg-white border border-[#EFECE6] hover:bg-gray-50 transition rounded-full shadow-sm"
          >
            Disconnect
          </button>
        </div>
      </header>

      {/* CORE CONTROL HUB GRID */}
      <div className="max-w-6xl mx-auto px-4 mt-8 flex flex-col md:flex-row gap-6 items-start">
        
        {/* LEFT PANEL COLUMN */}
        <div className="flex-1 w-full space-y-6">
          
          {/* PROFILE SUMMARY CARD */}
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
                <p className="text-sm text-gray-500 leading-relaxed max-w-xl font-medium">{profile.bio}</p>
              </div>
            </div>
          </div>

          {/* STUDIO FEED SCROLL */}
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
              disabled={publishingPost}
              className="mt-3 px-5 py-3 bg-gray-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-50"
            >
              {publishingPost ? 'Publishing...' : 'Publish Update'}
            </button>

            <div className="mt-6 space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-[#FAF8F4] border border-[#EFECE6] rounded-2xl p-4">
                  <div className="text-xs font-bold text-[#C4A482] uppercase mb-2">Studio Update</div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* PLAYBACK AUDIO TRACK BLOCKS */}
          <div className="bg-white rounded-[28px] border border-[#EFECE6] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
            <h3 className="text-lg font-black tracking-tight mb-4">Featured Tracks & Audio Drops</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mySounds.map((track) => (
                <div key={track.id} className="bg-[#FAF8F4] border border-[#EFECE6] rounded-2xl p-5 flex flex-col justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-sm">🎚️</div>
                    <div className="truncate">
                      <h4 className="font-bold text-sm text-gray-900 truncate">{track.title}</h4>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1 space-y-0.5">
                        <div>{track.bpm ? `${track.bpm} BPM` : ''} • {track.genre}</div>
                        <div className="text-[#C4A482]">{track.key || 'C Major'} • {track.mood || 'Chill'}</div>
                      </div>
                    </div>
                    <span className="ml-auto text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase shrink-0">Live</span>
                  </div>
                  <audio controls src={track.audio_url} className="w-full h-8 accent-gray-900 mt-1" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN SIDEBAR */}
        <aside className="w-full md:w-72 space-y-6 shrink-0">
          
          {/* TRACK SUBMISSION DECK */}
          <div className="bg-white rounded-[24px] border border-[#EFECE6] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
            <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 mb-4">Upload New Track</h3>
            <form onSubmit={handlePublishTrack} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Title</label>
                <input type="text" placeholder="Midnight Drive" className="w-full text-xs p-3 border border-[#EFECE6] rounded-xl focus:outline-none focus:border-[#C4A482]" value={trackTitle} onChange={(e) => setTrackTitle(e.target.value)} required />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Genre</label>
                <select className="w-full text-xs p-3 border border-[#EFECE6] rounded-xl bg-white focus:outline-none cursor-pointer" value={trackGenre} onChange={(e) => setTrackGenre(e.target.value)}>
                  <option value="Trap">Trap</option>
                  <option value="LoFi">LoFi</option>
                  <option value="AfroHouse">AfroHouse</option>
                  <option value="Drill">Drill</option>
                  <option value="Melody Loop">Melody Loop</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">BPM</label>
                <select className="w-full text-xs p-3 border border-[#EFECE6] rounded-xl bg-white focus:outline-none cursor-pointer" value={trackBpm} onChange={(e) => setTrackBpm(e.target.value)}>
                  <option value="80">80</option>
                  <option value="90">90</option>
                  <option value="100">100</option>
                  <option value="120">120</option>
                  <option value="140">140</option>
                  <option value="150">150</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Key</label>
                <select className="w-full text-xs p-3 border border-[#EFECE6] rounded-xl bg-white focus:outline-none cursor-pointer" value={trackKey} onChange={(e) => setTrackKey(e.target.value)}>
                  <option value="F# Minor">F# Minor</option>
                  <option value="A Minor">A Minor</option>
                  <option value="C Major">C Major</option>
                  <option value="E Minor">E Minor</option>
                  <option value="G# Major">G# Major</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Mood</label>
                <select className="w-full text-xs p-3 border border-[#EFECE6] rounded-xl bg-white focus:outline-none cursor-pointer" value={trackMood} onChange={(e) => setTrackMood(e.target.value)}>
                  <option value="Dark">Dark</option>
                  <option value="Chill">Chill</option>
                  <option value="Energetic">Energetic</option>
                  <option value="Emotional">Emotional</option>
                  <option value="Hypnotic">Hypnotic</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Audio File</label>
                <input id="audio-file-picker" type="file" accept="audio/mp3, audio/mpeg, audio/wav, audio/x-wav" onChange={(e) => { if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]); }} className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-[11px] file:font-bold file:bg-[#FAF8F4] file:text-gray-700 hover:file:bg-gray-100 cursor-pointer" required />
                {selectedFile && <p className="text-[10px] text-gray-400 font-semibold mt-1.5 truncate">Selected: {selectedFile.name}</p>}
              </div>
              <button type="submit" disabled={publishing} className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl tracking-wider uppercase transition disabled:opacity-50">
                {publishing ? 'Uploading Track...' : 'Upload Track'}
              </button>
            </form>
          </div>

          {/* CREDENTIAL COMPONENT */}
          <div className="bg-white rounded-[24px] border border-[#EFECE6] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)]">
            <h3 className="text-xs font-bold text-[#C4A482] uppercase tracking-widest mb-4">Studio Credentials</h3>
            {!editingProfile ? (
              <div className="space-y-4 text-xs font-semibold">
                <div className="flex justify-between border-b pb-2 border-gray-50"><span className="text-gray-400">Handle ID:</span><span className="text-gray-800">@{profile.username}</span></div>
                <div className="flex justify-between border-b pb-2 border-gray-50"><span className="text-gray-400">Trade Spec:</span><span className="text-gray-800">{profile.account_type}</span></div>
                <button onClick={() => setEditingProfile(true)} className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 transition border border-[#EFECE6] text-gray-700 rounded-xl text-[11px] font-bold uppercase tracking-wider">Update Spec Parameters</button>
              </div>
            ) : (
              <form onSubmit={handleProfileUpdate} className="space-y-3">
                <input type="text" className="w-full text-xs p-2.5 border rounded-xl" value={profile.display_name || ''} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} placeholder="Display Name" required />
                <input type="text" className="w-full text-xs p-2.5 border rounded-xl" value={profile.account_type || ''} onChange={(e) => setProfile({ ...profile, account_type: e.target.value })} placeholder="Role" required />
                <textarea className="w-full text-xs p-2.5 border rounded-xl resize-none" rows={2} value={profile.bio || ''} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Bio info..." />
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
