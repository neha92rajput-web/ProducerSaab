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

  // Dynamic Profile States
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({
    display_name: '',
    username: '',
    headline: '',
    pronouns: '',
    company: '',
    location: '',
    banner_quote_one: '',
    banner_quote_two: ''
  });

  // Editing Panel States
  const [editForm, setEditForm] = useState<any>({});
  const [editingProfile, setEditingProfile] = useState<boolean>(false);

  // App Core Lists
  const [mySounds, setMySounds] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [postContent, setPostContent] = useState<string>('');

  // Track Form Inputs
  const [trackTitle, setTrackTitle] = useState<string>('');
  const [trackGenre, setTrackGenre] = useState<string>('Trap');
  const [trackBpm, setTrackBpm] = useState<string>('140');
  const [trackKey, setTrackKey] = useState<string>('F# Minor');
  const [trackMood, setTrackMood] = useState<string>('Dark');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [publishing, setPublishing] = useState<boolean>(false);
  const [publishingPost, setPublishingPost] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

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
            display_name: fallBackHandle,
            headline: 'Music Producer | Audio Architect', 
            pronouns: '(She/Her)',
            company: 'Independent Studio',
            location: 'Chandigarh, India',
            banner_quote_one: "Success isn't just about skill—",
            banner_quote_two: "it's also about being seen at the right place"
          }])
          .select()
          .single();
        if (generatedRecord) profileRecord = generatedRecord;
      }
      
      if (profileRecord) {
        setProfile(profileRecord);
        setEditForm(profileRecord); // Feed values to your editor form fields
      }

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

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await database
      .from('profiles')
      .update({
        display_name: editForm.display_name,
        headline: editForm.headline,
        pronouns: editForm.pronouns,
        company: editForm.company,
        location: editForm.location,
        banner_quote_one: editForm.banner_quote_one,
        banner_quote_two: editForm.banner_quote_two
      })
      .eq('id', user.id);

    if (!error) {
      setProfile(editForm);
      setEditingProfile(false);
    } else {
      alert("Failed to sync structural configurations.");
    }
  };

  const handleLogOut = async () => {
    await database.auth.signOut();
    router.refresh();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F2EF] flex items-center justify-center font-sans">
        <div className="text-xs font-semibold text-gray-500 tracking-wider">Loading Studio Profile Layout...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F2EF] text-[#191919] font-sans antialiased pb-12">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-2.5 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md relative flex items-center">
            <button onClick={() => router.push('/')} className="mr-3 text-gray-600 hover:text-black">←</button>
            <input type="text" placeholder="Search sounds, creators, tags..." className="w-full bg-[#EDF3F8] text-xs py-2 px-3 rounded focus:outline-none" disabled />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="text-xs font-semibold text-gray-600 hover:text-blue-700 px-3 py-1.5 border border-gray-300 rounded-full">Home</button>
            <button onClick={handleLogOut} className="text-xs font-semibold text-gray-600 hover:text-red-600 px-3 py-1.5 border border-gray-300 rounded-full">Disconnect</button>
          </div>
        </div>
      </header>

      {/* CORE GRID */}
      <div className="max-w-4xl mx-auto mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start px-2 sm:px-0">
        
        {/* MAIN ROW STACK */}
        <div className="lg:col-span-8 space-y-3 w-full">
          
          {/* PROFILE IDENTITY MODULE */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden relative shadow-sm">
            
            {/* Dynamic Banner Layer with custom overlays mapped to backend */}
            <div 
              className="h-36 sm:h-44 bg-cover bg-center flex items-center justify-end px-6 relative"
              style={{ backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1000&auto=format&fit=crop&q=80')` }}
            >
              <div className="text-right text-white max-w-xs space-y-0.5 drop-shadow-md hidden sm:block">
                <p className="text-sm font-serif italic">{profile.banner_quote_one}</p>
                <p className="text-xs font-sans font-semibold tracking-wide text-gray-200">{profile.banner_quote_two}</p>
              </div>
              <button onClick={() => setEditingProfile(true)} className="absolute top-3 right-3 bg-white/90 hover:bg-white p-1.5 rounded-full shadow text-xs">✏️ Edit</button>
            </div>

            <div className="px-6 pb-6 relative">
              {/* Profile Avatar Frame Container */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-300 rounded-full border-4 border-white overflow-hidden shadow-md absolute -top-12 left-6">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80" className="w-full h-full object-cover" />
              </div>

              {/* Dynamic Text Details mapping exactly to state parameters */}
              <div className="pt-14 sm:pt-18 space-y-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-xl font-bold text-gray-900">{profile.display_name || `@${profile.username}`}</h2>
                  <span className="text-blue-600 text-xs">🛡️</span>
                  <span className="text-xs text-gray-400 font-medium">{profile.pronouns}</span>
                </div>
                
                <p className="text-sm text-gray-800 leading-snug font-normal">
                  {profile.headline}
                </p>
                
                <div className="text-xs text-gray-500 font-medium flex flex-wrap gap-x-2 gap-y-0.5 items-center">
                  <span>{profile.company}</span>
                  <span className="text-gray-300">•</span>
                  <span>{profile.location}</span>
                </div>

                <div className="text-xs text-blue-600 font-bold pt-1">
                  Network Node Dashboard Matrix Hub
                </div>

                {/* Profile Controls trigger editing card below */}
                <div className="flex flex-wrap gap-2 pt-3">
                  <button onClick={() => setEditingProfile(true)} className="px-5 py-1.5 bg-blue-700 hover:bg-blue-800 transition text-white text-xs font-bold rounded-full shadow-sm">
                    Enhance profile
                  </button>
                  <button className="px-5 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-full">
                    Open to
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* EDIT FORM POPUP INLINE SECTION */}
          {editingProfile && (
            <div className="bg-white border-2 border-blue-600 rounded-lg p-5 shadow-md space-y-4">
              <div className="border-b pb-2"><h3 className="text-sm font-bold text-gray-900">Configure Profile Variables</h3></div>
              <form onSubmit={handleProfileSave} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Display/Full Name</label>
                  <input type="text" className="w-full text-xs p-2.5 border rounded bg-gray-50" value={editForm.display_name || ''} onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Pronouns</label>
                  <input type="text" placeholder="e.g. (She/Her)" className="w-full text-xs p-2.5 border rounded bg-gray-50" value={editForm.pronouns || ''} onChange={(e) => setEditForm({ ...editForm, pronouns: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Location</label>
                  <input type="text" className="w-full text-xs p-2.5 border rounded bg-gray-50" value={editForm.location || ''} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Professional Headline Tagline</label>
                  <input type="text" className="w-full text-xs p-2.5 border rounded bg-gray-50" value={editForm.headline || ''} onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })} required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Company / Studio Enterprise</label>
                  <input type="text" className="w-full text-xs p-2.5 border rounded bg-gray-50" value={editForm.company || ''} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cover Banner Text Line 1</label>
                  <input type="text" className="w-full text-xs p-2.5 border rounded bg-gray-50" value={editForm.banner_quote_one || ''} onChange={(e) => setEditForm({ ...editForm, banner_quote_one: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Cover Banner Text Line 2</label>
                  <input type="text" className="w-full text-xs p-2.5 border rounded bg-gray-50" value={editForm.banner_quote_two || ''} onChange={(e) => setEditForm({ ...editForm, banner_quote_two: e.target.value })} />
                </div>
                <div className="sm:col-span-2 flex gap-2 pt-2 border-t mt-2">
                  <button type="submit" className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-full">Save Structural Parameter Settings</button>
                  <button type="button" onClick={() => setEditingProfile(false)} className="px-5 py-2 bg-gray-200 text-gray-700 font-bold text-xs rounded-full">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* ANALYTICS BLOCK CONTAINER */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">Analytics</h3>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">👁️ Private to you</p>
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-4">
              <div className="flex gap-3 items-start">
                <span className="text-xl mt-0.5 text-gray-600">👥</span>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Profile Architecture Sync active</h4>
                  <p className="text-xs text-gray-500">Discover who's interacting with your network parameters.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start border-t border-gray-50 pt-3">
                <span className="text-xl mt-0.5 text-gray-600">📊</span>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{mySounds.length * 9 + 12} post impressions</h4>
                  <p className="text-xs text-gray-500">Check out user performance loops over the last 7 days.</p>
                </div>
              </div>
            </div>
          </div>

          {/* STUDIO BROADCAST POST BOX */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900">Share a Studio Update</h3>
            <div className="flex gap-3 items-start">
              <div className="w-9 h-9 bg-gray-200 rounded-full overflow-hidden shrink-0">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&auto=format&fit=crop&q=80" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-2">
                <textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder="What's on your mind? Share a beat link, sample pack info or collaboration request..." className="w-full min-h-[76px] border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-600 resize-none bg-gray-50" />
                <div className="flex justify-end">
                  <button onClick={handleCreatePost} disabled={publishingPost || !postContent.trim()} className="px-4 py-1.5 bg-blue-700 text-white rounded-full text-xs font-bold disabled:opacity-40 shadow-sm">
                    {publishingPost ? 'Posting...' : 'Post update'}
                  </button>
                </div>
              </div>
            </div>
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

          {/* AUDIO drops LIST DISPLAY CONTAINER */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Featured Tracks & Sound Architecture</h3>
              <p className="text-xs text-gray-400 mt-0.5">Stream live catalog entries synced out of your system workspace.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mySounds.map((track) => (
                <div key={track.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-sm">
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
              ))}
            </div>
          </div>

        </div>

        {/* SIDEBAR UPLOADER CARD */}
        <aside className="w-full lg:col-span-4 space-y-3 shrink-0">
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-2 mb-3">Upload Track Asset</h3>
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
                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Audio File</label>
                <input id="audio-file-picker" type="file" accept="audio/mp3, audio/mpeg, audio/wav, audio/x-wav" onChange={(e) => { if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]); }} className="w-full text-[11px] text-gray-500 file:mr-2 file:py-1.5 file:px-2.5 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer" required />
                {selectedFile && <p className="text-[10px] text-blue-600 font-semibold mt-1 truncate">Selected: {selectedFile.name}</p>}
              </div>
              <button type="submit" disabled={publishing} className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded transition disabled:opacity-50 tracking-wider uppercase shadow-sm">
                {publishing ? 'Uploading Sound Asset...' : 'Upload Track Drop'}
              </button>
            </form>
          </div>
        </aside>

      </div>
    </div>
  );
}
