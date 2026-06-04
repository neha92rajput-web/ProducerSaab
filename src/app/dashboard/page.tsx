'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function Dashboard() {
  const router = useRouter();
  
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
  const [profile, setProfile] = useState<any>({ 
    display_name: 'Neha Thakur', 
    account_type: 'Music Producer | Sound Designer & Mix Engineer', 
    username: 'nthakur', 
    bio: 'Chandigarh, India' 
  });
  const [mySounds, setMySounds] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [postContent, setPostContent] = useState<string>('');

  // Audio Drop Inputs
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
  const [activeTab, setActiveTab] = useState<string>('home'); // Mobile bottom nav state

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      const { data: { user } } = await database.auth.getUser();

      if (!user) {
        router.replace('/signin');
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
          .insert([{ 
            id: user.id, 
            username: fallBackHandle, 
            display_name: 'Neha Thakur', 
            account_type: 'Music Producer | Sound Designer & Mix Engineer', 
            bio: 'Chandigarh, India' 
          }])
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

      const { data: feedPosts } = await database
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (feedPosts) setPosts(feedPosts);

      setLoading(false);
    }
    loadDashboardData();
  }, []);

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
        .upload(filePath, selectedFile, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = database.storage
        .from('audio-tracks')
        .getPublicUrl(filePath);

      const { data: soundEntry, error: tableError } = await database
        .from('sounds')
        .insert([{
          title: trackTitle.trim(),
          genre: trackGenre,
          audio_url: publicUrl,
          profile_id: user.id,
          bpm: trackBpm,
          key: trackKey,
          mood: trackMood
        }])
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
      alert(`Upload Failed: ${err.message}`);
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
      <div className="min-h-screen bg-[#F3F2EF] flex items-center justify-center font-sans">
        <div className="text-xs font-semibold text-gray-500 tracking-wider">Loading Studio Profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F2EF] text-[#191919] font-sans antialiased pb-24 md:pb-12">
      
      {/* LINKEDIN STYLE TOP HEADER BAR */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-2.5 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          
          {/* Top Fake Search Input mimic */}
          <div className="flex-1 max-w-md relative flex items-center">
            <button onClick={() => router.push('/')} className="mr-3 text-gray-600 hover:text-black">
              ←
            </button>
            <input 
              type="text" 
              placeholder="Search sounds, creators, tags..." 
              className="w-full bg-[#EDF3F8] text-xs py-2 pl-3 pr-10 rounded focus:outline-none placeholder-gray-500"
              disabled
            />
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/')} 
              className="text-xs font-semibold text-gray-600 hover:text-blue-700 px-3 py-1.5 border border-gray-300 hover:border-blue-700 transition rounded-full"
            >
              Home
            </button>
            <button 
              onClick={handleLogOut} 
              className="text-xs font-semibold text-gray-600 hover:text-red-600 px-3 py-1.5 border border-gray-300 hover:border-red-200 transition rounded-full"
            >
              Disconnect
            </button>
          </div>
        </div>
      </header>

      {/* CORE WRAPPER */}
      <div className="max-w-4xl mx-auto px-0 md:px-4 mt-0 md:mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* MAIN COLUMN AREA */}
        <div className="lg:col-span-8 space-y-3 w-full">
          
          {/* IDENTITY CARD - PROFILE HEADER */}
          <div className="bg-white border-b md:border border-gray-200 md:rounded-lg overflow-hidden relative shadow-sm">
            {/* Cover Banner Graphic Image With Text overlay */}
            <div 
              className="h-36 sm:h-44 bg-cover bg-center flex items-center justify-end px-6 relative"
              style={{ backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1000&auto=format&fit=crop&q=80')` }}
            >
              <div className="text-right text-white max-w-xs space-y-1 drop-shadow-md hidden sm:block">
                <p className="text-sm font-serif italic">Success isn't just about skill—</p>
                <p className="text-xs font-sans font-semibold tracking-wide">it's also about being seen at the right place</p>
              </div>
              <button 
                onClick={() => setEditingProfile(!editingProfile)} 
                className="absolute top-3 right-3 bg-white/80 hover:bg-white p-1.5 rounded-full shadow transition text-xs"
              >
                ✏️
              </button>
            </div>

            {/* Profile Picture Box Breaking up vertically into cover */}
            <div className="px-6 pb-6 relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-200 rounded-full border-4 border-white overflow-hidden shadow-md absolute -top-12 left-6">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80" 
                  alt="Profile picture"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Identity Row Text Elements */}
              <div className="pt-14 sm:pt-18 space-y-2">
                {editingProfile ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200 mt-2">
                    <input type="text" className="w-full text-xs p-2 border rounded" value={profile.display_name} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} placeholder="Full Name" required />
                    <input type="text" className="w-full text-xs p-2 border rounded" value={profile.account_type} onChange={(e) => setProfile({ ...profile, account_type: e.target.value })} placeholder="Professional Headline" required />
                    <input type="text" className="w-full text-xs p-2 border rounded" value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Location (e.g. Chandigarh, India)" required />
                    <div className="flex gap-2">
                      <button type="submit" className="bg-blue-700 text-white text-xs px-4 py-1.5 rounded-full font-bold">Save</button>
                      <button type="button" onClick={() => setEditingProfile(false)} className="bg-gray-200 text-xs px-4 py-1.5 rounded-full font-bold">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-xl font-bold text-gray-900">{profile.display_name}</h2>
                      <span className="text-blue-600 text-xs">🛡️</span>
                      <span className="text-xs text-gray-400 font-medium">(She/Her)</span>
                    </div>
                    <p className="text-sm text-gray-800 leading-snug max-w-xl font-normal">
                      {profile.account_type}
                    </p>
                    <div className="text-xs text-gray-500 font-medium flex flex-wrap gap-x-2 gap-y-0.5 items-center">
                      <span>DY Teleprojects Inc</span>
                      <span className="text-gray-300">•</span>
                      <span>{profile.bio}</span>
                    </div>
                    <div className="text-xs text-blue-600 font-bold hover:underline cursor-pointer pt-1">
                      2,973 followers • 500+ connections
                    </div>
                  </>
                )}

                {/* Primary Action Button Bar */}
                <div className="flex flex-wrap gap-2 pt-3">
                  <button className="px-5 py-1.5 bg-blue-700 hover:bg-blue-800 transition text-white text-xs font-bold rounded-full shadow-sm">
                    Open to
                  </button>
                  <button className="px-5 py-1.5 bg-white hover:bg-gray-50 transition text-blue-700 border border-blue-700 text-xs font-bold rounded-full shadow-sm">
                    Add section
                  </button>
                  <button className="px-4 py-1.5 bg-white hover:bg-gray-50 transition text-gray-600 border border-gray-400 text-xs font-bold rounded-full shadow-sm">
                    Enhance profile
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* ANALYTICS SECTION CONTAINER MATCHING IMAGE_15 */}
          <div className="bg-white border-b md:border border-gray-200 md:rounded-lg p-5 shadow-sm space-y-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">Analytics</h3>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">👁️ Private to you</p>
            </div>
            
            <div className="border-t border-gray-100 pt-3 space-y-4">
              {/* Analytics Row Item 1 */}
              <div className="flex gap-3 items-start">
                <span className="text-xl mt-0.5 text-gray-600">👥</span>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 hover:text-blue-700 cursor-pointer">1,382 profile views</h4>
                  <p className="text-xs text-gray-500">Discover who's viewed your profile.</p>
                </div>
              </div>
              
              {/* Analytics Row Item 2 */}
              <div className="flex gap-3 items-start border-t border-gray-50 pt-3">
                <span className="text-xl mt-0.5 text-gray-600">📊</span>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 hover:text-blue-700 cursor-pointer">{mySounds.length * 14 + 52} post impressions</h4>
                  <p className="text-xs text-gray-500">Check out who's engaging with your posts over the past 7 days.</p>
                </div>
              </div>

              {/* Analytics Row Item 3 */}
              <div className="flex gap-3 items-start border-t border-gray-50 pt-3">
                <span className="text-xl mt-0.5 text-gray-600">🎵</span>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{mySounds.length || 0} active audio catalog drops</h4>
                  <p className="text-xs text-gray-500">Live streams sync dynamically via audio-tracks storage repository link pointers.</p>
                </div>
              </div>
            </div>
          </div>

          {/* LINKEDIN FEED POST BOX MODULE */}
          <div className="bg-white border-b md:border border-gray-200 md:rounded-lg p-4 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900">Share a Studio Update</h3>
            <div className="flex gap-3 items-start">
              <div className="w-9 h-9 bg-gray-200 rounded-full overflow-hidden shrink-0">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&auto=format&fit=crop&q=80" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-2">
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="What's on your mind? Share a beat description, sample pack update or request link..."
                  className="w-full min-h-[76px] border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-600 resize-none bg-gray-50"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleCreatePost}
                    disabled={publishingPost || !postContent.trim()}
                    className="px-4 py-1.5 bg-blue-700 text-white rounded-full text-xs font-bold disabled:opacity-40 shadow-sm"
                  >
                    {publishingPost ? 'Posting...' : 'Post update'}
                  </button>
                </div>
              </div>
            </div>

            {/* FEED RENDERING TIMELINE LIST */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              {posts.map((post) => (
                <div key={post.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-black rounded-full flex items-center justify-center text-white text-xs">🎧</div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">{profile.display_name}</div>
                      <div className="text-[10px] text-gray-400">Studio Broadcast Node</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* DYNAMIC FEATURED MUSIC DROPS DECK CONTAINER */}
          <div className="bg-white border-b md:border border-gray-200 md:rounded-lg p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Featured Tracks & Sound Architecture</h3>
              <p className="text-xs text-gray-400 mt-0.5">Stream live masters compiled straight out of your browser interface.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mySounds.length > 0 ? (
                mySounds.map((track) => (
                  <div key={track.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-sm hover:shadow-inner transition">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold shrink-0 text-sm">🎚️</div>
                      <div className="truncate">
                        <h4 className="font-bold text-xs text-gray-900 truncate">{track.title}</h4>
                        <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mt-0.5 space-y-0.5">
                          <div>{track.bpm ? `${track.bpm} BPM` : ''} • {track.genre}</div>
                          <div className="text-blue-700">{track.key || 'C Major'} • {track.mood || 'Chill'}</div>
                        </div>
                      </div>
                      <span className="ml-auto text-[8px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full uppercase shrink-0">Live</span>
                    </div>
                    <audio controls src={track.audio_url} className="w-full h-8 accent-blue-700 mt-1" />
                  </div>
                ))
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white shrink-0 text-xs">💿</div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">Midnight</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">140 BPM • F# Minor • Dark • Trap</p>
                    </div>
                    <span className="ml-auto text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Live Dummy</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* SIDEBAR UPLOADER COMPARTMENT */}
        <aside className="w-full lg:col-span-4 space-y-3 shrink-0 pb-12">
          
          <div className="bg-white border md:border border-gray-200 md:rounded-lg p-5 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2 mb-3">Upload Asset Stream</h3>
            
            <form onSubmit={handlePublishTrack} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Title</label>
                <input type="text" placeholder="e.g. Midnight Drive" className="w-full text-xs p-2.5 border border-gray-200 rounded bg-gray-50 focus:outline-none focus:border-blue-600" value={trackTitle} onChange={(e) => setTrackTitle(e.target.value)} required />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Genre</label>
                <select className="w-full text-xs p-2.5 border border-gray-200 rounded bg-white focus:outline-none cursor-pointer" value={trackGenre} onChange={(e) => setTrackGenre(e.target.value)}>
                  <option value="Trap">Trap</option>
                  <option value="LoFi">LoFi</option>
                  <option value="AfroHouse">AfroHouse</option>
                  <option value="Drill">Drill</option>
                  <option value="Melody Loop">Melody Loop</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">BPM</label>
                  <select className="w-full text-xs p-2.5 border border-gray-200 rounded bg-white focus:outline-none cursor-pointer" value={trackBpm} onChange={(e) => setTrackBpm(e.target.value)}>
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
                  <select className="w-full text-xs p-2.5 border border-gray-200 rounded bg-white focus:outline-none cursor-pointer" value={trackKey} onChange={(e) => setTrackKey(e.target.value)}>
                    <option value="F# Minor">F# Minor</option>
                    <option value="A Minor">A Minor</option>
                    <option value="C Major">C Major</option>
                    <option value="E Minor">E Minor</option>
                    <option value="G# Major">G# Major</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Mood</label>
                <select className="w-full text-xs p-2.5 border border-gray-200 rounded bg-white focus:outline-none cursor-pointer" value={trackMood} onChange={(e) => setTrackMood(e.target.value)}>
                  <option value="Dark">Dark</option>
                  <option value="Chill">Chill</option>
                  <option value="Energetic">Energetic</option>
                  <option value="Emotional">Emotional</option>
                  <option value="Hypnotic">Hypnotic</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Audio File binary</label>
                <input id="audio-file-picker" type="file" accept="audio/mp3, audio/mpeg, audio/wav, audio/x-wav" onChange={(e) => { if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]); }} className="w-full text-[11px] text-gray-500 file:mr-2 file:py-1.5 file:px-2.5 file:rounded file:border-0 file:text-[11px] file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer" required />
                {selectedFile && <p className="text-[10px] text-blue-600 font-semibold mt-1 truncate">Selected: {selectedFile.name}</p>}
              </div>

              <button
                type="submit"
                disabled={publishing}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded transition disabled:opacity-50 tracking-wider uppercase shadow-sm"
              >
                {publishing ? 'Uploading Sound asset...' : 'Upload Track Drop'}
              </button>
            </form>
          </div>

        </aside>

      </div>

      {/* MOBILE BOTTOM NAVIGATION DOCK COMPONENT (Matching image_15.png layout footer row) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-6 py-2 flex md:hidden items-center justify-between text-center">
        <button onClick={() => { setActiveTab('home'); router.push('/') }} className={`flex flex-col items-center flex-1 ${activeTab === 'home' ? 'text-black font-bold' : 'text-gray-400'}`}>
          <span className="text-lg">🏠</span>
          <span className="text-[9px] mt-0.5">Home</span>
        </button>
        <button onClick={() => setActiveTab('network')} className={`flex flex-col items-center flex-1 relative ${activeTab === 'network' ? 'text-black font-bold' : 'text-gray-400'}`}>
          <span className="text-lg">👥</span>
          <span className="absolute top-0 right-6 bg-red-600 text-white font-bold text-[8px] px-1 rounded-full scale-90">1</span>
          <span className="text-[9px] mt-0.5">My Network</span>
        </button>
        <button onClick={() => { setActiveTab('post'); window.scrollTo({ top: 400, behavior: 'smooth' }) }} className={`flex flex-col items-center flex-1 ${activeTab === 'post' ? 'text-black font-bold' : 'text-gray-400'}`}>
          <span className="text-lg">➕</span>
          <span className="text-[9px] mt-0.5">Post</span>
        </button>
        <button onClick={() => setActiveTab('notif')} className={`flex flex-col items-center flex-1 relative ${activeTab === 'notif' ? 'text-black font-bold' : 'text-gray-400'}`}>
          <span className="text-lg">🔔</span>
          <span className="absolute top-0 right-6 bg-red-600 text-white font-bold text-[8px] px-1 rounded-full scale-90">3</span>
          <span className="text-[9px] mt-0.5">Notifications</span>
        </button>
        <button onClick={() => { setActiveTab('studio'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className={`flex flex-col items-center flex-1 ${activeTab === 'studio' ? 'text-black font-bold' : 'text-gray-400'}`}>
          <span className="text-lg">💼</span>
          <span className="text-[9px] mt-0.5">Studio</span>
        </button>
      </div>

    </div>
  );
}
