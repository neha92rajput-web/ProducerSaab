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
    banner_quote_two: '',
    avatar_url: '',
    cover_url: ''
  });

  // Editing Form Panel States
  const [editForm, setEditForm] = useState<any>({});
  const [editingProfile, setEditingProfile] = useState<boolean>(false);

  // UX Toggle State for the Share Box
  const [shareType, setShareType] = useState<'none' | 'post' | 'audio'>('none');

  // Application Core Lists
  const [mySounds, setMySounds] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [postContent, setPostContent] = useState<string>('');

  // Track Form Inputs
  const [trackTitle, setTrackTitle] = useState<string>('');
  const [trackGenre, setTrackGenre] = useState<string>('Trap');
  const [trackType, setTrackType] = useState<string>('Full Track'); // Loop, Sample, Stem, etc.
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
            display_name: '',
            headline: '', 
            pronouns: '',
            company: '',
            location: '',
            banner_quote_one: '',
            banner_quote_two: '',
            avatar_url: '',
            cover_url: ''
          }])
          .select()
          .single();
        if (generatedRecord) profileRecord = generatedRecord;
      }
      
      if (profileRecord) {
        setProfile(profileRecord);
        setEditForm(profileRecord);
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
      setShareType('none'); // Collapse box on success
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

      // We append the selected Track Type (Sample/Loop) into the layout data block smoothly
      const combinedGenreInfo = `${trackGenre} (${trackType})`;

      const { data: soundEntry, error: tableError } = await database
        .from('sounds')
        .insert([{
          title: trackTitle.trim(),
          genre: combinedGenreInfo,
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
        setShareType('none'); // Collapse uploader panel on success
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
        banner_quote_two: editForm.banner_quote_two,
        avatar_url: editForm.avatar_url,
        cover_url: editForm.cover_url
      })
      .eq('id', user.id);

    if (!error) {
      setProfile(editForm);
      setEditingProfile(false);
    } else {
      alert("Failed to save structural profile settings.");
    }
  };

  const handleLogOut = async () => {
    await database.auth.signOut();
    router.refresh();
    router.push('/');
  };

  const userInitial = String(profile.display_name || profile.username || 'P').charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F2EF] flex items-center justify-center font-sans">
        <div className="text-xs font-semibold text-gray-500 tracking-wider">Loading Workspace Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F2EF] text-[#191919] font-sans antialiased pb-12">
      
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-2.5 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1 max-w-xs relative flex items-center">
            <button onClick={() => router.push('/')} className="mr-3 text-gray-600 hover:text-black">←</button>
            <input type="text" placeholder="Search..." className="w-full bg-[#EDF3F8] text-xs py-1.5 px-3 rounded focus:outline-none" disabled />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="text-xs font-semibold text-gray-600 hover:text-blue-700 px-3 py-1.5 border border-gray-300 rounded-full">Home</button>
            <button onClick={handleLogOut} className="text-xs font-semibold text-gray-600 hover:text-red-600 px-3 py-1.5 border border-gray-300 rounded-full">Disconnect</button>
          </div>
        </div>
      </header>

      {/* SINGLE CENTRAL FLOW COLUMN */}
      <div className="max-w-3xl mx-auto mt-4 space-y-4 px-2 sm:px-0">
        
        {/* PROFILE IDENTITY CARD */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden relative shadow-sm">
          
          {/* Cover Banner Box */}
          <div 
            className="h-36 sm:h-44 bg-[#A0B2C6] bg-cover bg-center flex items-center justify-end px-6 relative"
            style={profile.cover_url ? { backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1), rgba(0,0,0,0.5)), url('${profile.cover_url}')` } : {}}
          >
            {profile.banner_quote_one && (
              <div className="text-right text-white max-w-xs space-y-0.5 drop-shadow-md hidden sm:block">
                <p className="text-sm font-serif italic">{profile.banner_quote_one}</p>
                <p className="text-xs font-sans font-semibold tracking-wide text-gray-200">{profile.banner_quote_two}</p>
              </div>
            )}
            <button onClick={() => setEditingProfile(true)} className="absolute top-3 right-3 bg-white/90 hover:bg-white p-1.5 rounded-full shadow text-xs font-bold">✏️ Edit Profile</button>
          </div>

          <div className="px-6 pb-6 relative">
            {/* Profile Avatar Container */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#111111] rounded-full border-4 border-white overflow-hidden shadow-md absolute -top-12 left-6  flex items-center justify-center text-white text-3xl font-bold">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="User avatar" />
              ) : (
                <span>{userInitial}</span>
              )}
            </div>

            {/* Meta Text details rows */}
            <div className="pt-14 sm:pt-18 space-y-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900">{profile.display_name || `@${profile.username}`}</h2>
                <span className="text-blue-600 text-xs">🛡️</span>
                {profile.pronouns && <span className="text-xs text-gray-400 font-medium">{profile.pronouns}</span>}
              </div>
              
              {profile.headline ? (
                <p className="text-sm text-gray-800 leading-snug font-normal">{profile.headline}</p>
              ) : (
                <p className="text-xs italic text-gray-400">No headline specified yet. Click 'Enhance profile' to update your workspace parameters.</p>
              )}
              
              <div className="text-xs text-gray-500 font-medium flex flex-wrap gap-x-2 gap-y-0.5 items-center">
                {profile.company && <span>{profile.company}</span>}
                {profile.company && profile.location && <span className="text-gray-300">•</span>}
                {profile.location && <span>{profile.location}</span>}
              </div>

              <div className="flex flex-wrap gap-2 pt-3">
                <button onClick={() => setEditingProfile(true)} className="px-5 py-1.5 bg-blue-700 hover:bg-blue-800 transition text-white text-xs font-bold rounded-full shadow-sm">
                  Enhance profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* EDIT PROFILE DIALOG CONTAINER */}
        {editingProfile && (
          <div className="bg-white border-2 border-blue-600 rounded-lg p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b pb-2">Edit Dynamic Credentials</h3>
            <form onSubmit={handleProfileSave} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Display Name</label>
                <input type="text" className="w-full text-xs p-2.5 border rounded bg-gray-50" value={editForm.display_name || ''} onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Pronouns</label>
                <input type="text" placeholder="e.g. (She/Her)" className="w-full text-xs p-2.5 border rounded bg-gray-50" value={editForm.pronouns || ''} onChange={(e) => setEditForm({ ...editForm, pronouns: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Headline</label>
                <input type="text" className="w-full text-xs p-2.5 border rounded bg-gray-50" value={editForm.headline || ''} onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Company/Affiliation</label>
                <input type="text" className="w-full text-xs p-2.5 border rounded bg-gray-50" value={editForm.company || ''} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Location</label>
                <input type="text" className="w-full text-xs p-2.5 border rounded bg-gray-50" value={editForm.location || ''} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
              </div>
              <div className="sm:col-span-2 border-t pt-2">
                <label className="block text-[10px] font-bold text-blue-600 uppercase mb-1">Avatar Photo URL</label>
                <input type="url" placeholder="https://..." className="w-full text-xs p-2.5 border rounded bg-gray-50" value={editForm.avatar_url || ''} onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-blue-600 uppercase mb-1">Cover Banner URL</label>
                <input type="url" placeholder="https://..." className="w-full text-xs p-2.5 border rounded bg-gray-50" value={editForm.cover_url || ''} onChange={(e) => setEditForm({ ...editForm, cover_url: e.target.value })} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Banner Quote 1</label>
                <input type="text" className="w-full text-xs p-2.5 border rounded bg-gray-50" value={editForm.banner_quote_one || ''} onChange={(e) => setEditForm({ ...editForm, banner_quote_one: e.target.value })} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Banner Quote 2</label>
                <input type="text" className="w-full text-xs p-2.5 border rounded bg-gray-50" value={editForm.banner_quote_two || ''} onChange={(e) => setEditForm({ ...editForm, banner_quote_two: e.target.value })} />
              </div>
              <div className="sm:col-span-2 flex gap-2 pt-2 border-t">
                <button type="submit" className="px-5 py-2 bg-blue-700 text-white text-xs font-bold rounded-full">Save Profile Settings</button>
                <button type="button" onClick={() => setEditingProfile(false)} className="px-5 py-2 bg-gray-200 text-xs font-bold rounded-full">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* ANALYTICS CONTAINER */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-3">
          <div>
            <h3 className="text-base font-bold text-gray-900">Analytics</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">👁️ Private to you</p>
          </div>
          <div className="border-t border-gray-100 pt-3 flex gap-8">
            <div>
              <div className="text-xl font-bold text-gray-900">Dynamic Sync</div>
              <div className="text-xs text-gray-500">Profile Parameter Connections</div>
            </div>
            <div className="border-l border-gray-200 pl-8">
              <div className="text-xl font-bold text-gray-900">{mySounds.length * 7 + 12}</div>
              <div className="text-xs text-gray-500">Audio catalog impressions</div>
            </div>
          </div>
        </div>

        {/* ⚡ COMBINED LINKEDIN-STYLE SHARE HUB COMPONENT ⚡ */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-4">
          
          {/* Incline Choice Selectors Bar */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
              {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <span>{userInitial}</span>}
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2">
              <button 
                type="button"
                onClick={() => setShareType(shareType === 'post' ? 'none' : 'post')}
                className={`py-2 px-3 text-xs font-bold rounded-full border transition flex items-center justify-center gap-1.5 ${shareType === 'post' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600'}`}
              >
                ✍️ Write Post
              </button>
              <button 
                type="button"
                onClick={() => setShareType(shareType === 'audio' ? 'none' : 'audio')}
                className={`py-2 px-3 text-xs font-bold rounded-full border transition flex items-center justify-center gap-1.5 ${shareType === 'audio' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600'}`}
              >
                🎵 Upload Audio
              </button>
            </div>
          </div>

          {/* Conditional Dropdown Segment A: Simple Text Post Form */}
          {shareType === 'post' && (
            <div className="space-y-2 border-t pt-3 animate-fadeIn">
              <textarea 
                value={postContent} 
                onChange={(e) => setPostContent(e.target.value)} 
                placeholder="Share a beat link, sample pack info, or update with your network..." 
                className="w-full min-h-[80px] border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-600 bg-gray-50 resize-none" 
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShareType('none')} className="px-4 py-1.5 text-xs font-medium text-gray-500 rounded-full hover:bg-gray-50">Cancel</button>
                <button onClick={handleCreatePost} disabled={publishingPost || !postContent.trim()} className="px-5 py-1.5 bg-blue-700 text-white rounded-full text-xs font-bold disabled:opacity-40 shadow-sm">
                  {publishingPost ? 'Posting...' : 'Post update'}
                </button>
              </div>
            </div>
          )}

          {/* Conditional Dropdown Segment B: Comprehensive Audio Drop Form */}
          {shareType === 'audio' && (
            <form onSubmit={handlePublishTrack} className="space-y-4 border-t pt-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Track Title</label>
                  <input type="text" placeholder="e.g. Midnight Drive" className="w-full text-xs p-2.5 border border-gray-200 rounded bg-gray-50 focus:outline-none focus:border-blue-600" value={trackTitle} onChange={(e) => setTrackTitle(e.target.value)} required />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Genre Class</label>
                  <select className="w-full text-xs p-2.5 border border-gray-200 rounded bg-white cursor-pointer" value={trackGenre} onChange={(e) => setTrackGenre(e.target.value)}>
                    <option value="Trap">Trap</option>
                    <option value="LoFi">LoFi</option>
                    <option value="AfroHouse">AfroHouse</option>
                    <option value="Drill">Drill</option>
                    <option value="BoomBap">BoomBap</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Track Type Structure</label>
                  <select className="w-full text-xs p-2.5 border border-gray-200 rounded bg-white cursor-pointer" value={trackType} onChange={(e) => setTrackType(e.target.value)}>
                    <option value="Full Track">Full Track Master</option>
                    <option value="Loop">Melody / Drum Loop</option>
                    <option value="One-Shot Sample">One-Shot Sample</option>
                    <option value="Stems File Layer">Track Stem Component</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Tempo (BPM)</label>
                  <select className="w-full text-xs p-2.5 border border-gray-200 rounded bg-white cursor-pointer" value={trackBpm} onChange={(e) => setTrackBpm(e.target.value)}>
                    <option value="80">80 BPM</option>
                    <option value="90">90 BPM</option>
                    <option value="100">100 BPM</option>
                    <option value="120">120 BPM</option>
                    <option value="140">140 BPM</option>
                    <option value="150">150 BPM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Key Signature</label>
                  <select className="w-full text-xs p-2.5 border border-gray-200 rounded bg-white cursor-pointer" value={trackKey} onChange={(e) => setTrackKey(e.target.value)}>
                    <option value="F# Minor">F# Minor</option>
                    <option value="A Minor">A Minor</option>
                    <option value="C Major">C Major</option>
                    <option value="E Minor">E Minor</option>
                    <option value="G# Major">G# Major</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Sonic Mood Vibe</label>
                  <select className="w-full text-xs p-2.5 border border-gray-200 rounded bg-white cursor-pointer" value={trackMood} onChange={(e) => setTrackMood(e.target.value)}>
                    <option value="Dark">Dark</option>
                    <option value="Chill">Chill</option>
                    <option value="Energetic">Energetic</option>
                    <option value="Emotional">Emotional</option>
                    <option value="Hypnotic">Hypnotic</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1">Select Audio Source File</label>
                  <input id="audio-file-picker" type="file" accept="audio/mp3, audio/mpeg, audio/wav, audio/x-wav" onChange={(e) => { if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]); }} className="w-full text-[11px] text-gray-500 file:mr-2 file:py-1.5 file:px-2.5 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer" required />
                  {selectedFile && <p className="text-[10px] text-blue-600 font-semibold mt-1 truncate">Selected asset: {selectedFile.name}</p>}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShareType('none')} className="px-4 py-1.5 text-xs font-medium text-gray-500 rounded-full hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={publishing} className="px-5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-full shadow-sm">
                  {publishing ? 'Uploading audio...' : 'Publish Audio Drop'}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* FEED TIMELINE DISPLAY ROW PANELS */}
        <div className="space-y-3">
          
          {/* COMBINED INTERFACE LOG VIEW LISTINGS */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900">Featured Tracks & Sound Architecture</h3>
            
            <div className="space-y-3">
              {mySounds.map((track) => (
                <div key={track.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center text-white font-bold shrink-0 text-sm">🎚️</div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">{track.title}</h4>
                      <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>{track.bpm ? `${track.bpm} BPM` : ''}</span>
                        <span>•</span>
                        <span className="text-blue-700">{track.genre}</span>
                        <span>•</span>
                        <span className="text-gray-400">{track.key} • {track.mood}</span>
                      </div>
                    </div>
                  </div>
                  <audio controls src={track.audio_url} className="w-full sm:w-64 h-8 accent-blue-700" />
                </div>
              ))}
            </div>
          </div>

          {/* STUDIO BROADCAST POST UPDATE ELEMENT STACKS */}
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 overflow-hidden">
                    {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <span>{userInitial}</span>}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">{profile.display_name || `@${profile.username}`}</div>
                    <div className="text-[10px] text-gray-400">Studio Broadcast Node Update</div>
                  </div>
                </div>
                <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
