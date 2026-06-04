'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function StudioWorkspace() {
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

  // Studio Mode Status Switcher
  const [viewMode, setViewMode] = useState<'personal' | 'community'>('personal');

  // Creator Account States
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editingProfile, setEditingProfile] = useState<boolean>(false);
  
  // Custom Dynamic Drop Actions Controls
  const [shareType, setShareType] = useState<'none' | 'post' | 'audio'>('none');
  
  // Storage Catalog Lists
  const [mySounds, setMySounds] = useState<any[]>([]);
  const [communityFeed, setCommunityFeed] = useState<any[]>([]); 
  const [postContent, setPostContent] = useState<string>('');

  // Audio Drop Form Variables
  const [trackTitle, setTrackTitle] = useState<string>('');
  const [trackGenre, setTrackGenre] = useState<string>('Punjabi');
  const [trackBpm, setTrackBpm] = useState<string>('140');
  const [trackKey, setTrackKey] = useState<string>('F# Minor');
  const [trackMood, setTrackMood] = useState<string>('Dark');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [publishing, setPublishing] = useState<boolean>(false);
  const [publishingPost, setPublishingPost] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Chronological Network Feed Compiler Loop
  async function loadFeedAndProfiles() {
    try {
      const { data: postsData } = await database
        .from('posts')
        .select(`
          id, content, created_at, profile_id,
          profiles ( id, username, display_name, avatar_url, headline )
        `)
        .order('created_at', { ascending: false });

      const { data: soundsData } = await database
        .from('sounds')
        .select(`
          id, title, genre, audio_url, bpm, key, mood, created_at, profile_id,
          profiles ( id, username, display_name, avatar_url, headline )
        `)
        .order('created_at', { ascending: false });

      const aggregatedFeed: any[] = [];
      if (postsData) {
        postsData.forEach(item => aggregatedFeed.push({ ...item, itemType: 'post', dateObj: new Date(item.created_at) }));
      }
      if (soundsData) {
        soundsData.forEach(item => aggregatedFeed.push({ ...item, itemType: 'audio', dateObj: new Date(item.created_at) }));
      }

      aggregatedFeed.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
      setCommunityFeed(aggregatedFeed);
    } catch (error) {
      console.error("Failed assembling global community streams:", error);
    }
  }

  useEffect(() => {
    async function loadStudioData() {
      const { data: { user } } = await database.auth.getUser();
      if (!user) {
        router.replace('/signin');
        return;
      }
      setUser(user);

      // Extract your active profile database fields cleanly
      const { data: record } = await database.from('profiles').select('*').eq('id', user.id).maybeSingle();
      
      const userHandle = user.email?.split('@')[0] || 'producer';
      const parsedProfile = record || {
        username: userHandle,
        display_name: userHandle,
        headline: 'Music Producer | Audio Engineer & Mixer',
        pronouns: '',
        company: 'Independent Studio',
        location: 'Chandigarh, India',
        avatar_url: '',
        cover_url: ''
      };

      setProfile(parsedProfile);
      setEditForm(parsedProfile);

      const { data: sounds } = await database.from('sounds').select('*').eq('profile_id', user.id).order('created_at', { ascending: false });
      if (sounds) setMySounds(sounds);

      await loadFeedAndProfiles();
      setLoading(false);
    }
    loadStudioData();
  }, [router]);

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;
    setPublishingPost(true);
    const { error } = await database.from('posts').insert([{ profile_id: user.id, content: postContent }]);
    if (!error) {
      setPostContent('');
      setShareType('none');
      await loadFeedAndProfiles();
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
      const { error: uploadError } = await database.storage.from('audio-tracks').upload(fileName, selectedFile, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = database.storage.from('audio-tracks').getPublicUrl(fileName);
      const { error: tableError } = await database.from('sounds').insert([{ 
        title: trackTitle.trim(), 
        genre: trackGenre, 
        audio_url: publicUrl, 
        profile_id: user.id, 
        bpm: trackBpm, 
        key: trackKey, 
        mood: trackMood 
      }]);
      if (tableError) throw tableError;

      setTrackTitle('');
      setSelectedFile(null);
      setShareType('none');
      
      const { data: sounds } = await database.from('sounds').select('*').eq('profile_id', user.id).order('created_at', { ascending: false });
      if (sounds) setMySounds(sounds);
      
      await loadFeedAndProfiles();
    } catch (err: any) {
      alert(`Upload Failed: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await database.from('profiles').update({ 
      display_name: editForm.display_name, 
      username: editForm.username,
      headline: editForm.headline, 
      pronouns: editForm.pronouns, 
      company: editForm.company, 
      location: editForm.location, 
      avatar_url: editForm.avatar_url, 
      cover_url: editForm.cover_url 
    }).eq('id', user.id);
    
    if (!error) {
      setProfile(editForm);
      setEditingProfile(false);
      await loadFeedAndProfiles();
    }
  };

  if (loading || !profile) return <div className="min-h-screen bg-[#F3F2EF] flex items-center justify-center text-xs font-semibold text-gray-400">Opening Studio Control Center...</div>;

  const userInitial = String(profile.display_name || profile.username || 'P').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F3F2EF] text-[#191919] pb-12 font-sans antialiased">
      
      {/* 🛠️ NAVIGATION HEADER BLOCK */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-2.5 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex-1 max-w-xs relative flex items-center">
            <button onClick={() => { setViewMode('personal'); setEditingProfile(false); }} className="mr-3 text-gray-400 hover:text-black font-black text-sm">
              ←
            </button>
            <input type="text" placeholder="Search parameters..." className="w-full bg-[#EDF3F8] text-xs py-1.5 px-3 rounded focus:outline-none" disabled />
          </div>
          
          {/* NAVIGATION MODALS SWITCH PANEL */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setViewMode(viewMode === 'community' ? 'personal' : 'community'); setEditingProfile(false); }} 
              className={`text-xs font-bold px-4 py-1.5 rounded-full border transition-all ${viewMode === 'community' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
            >
              {viewMode === 'community' ? 'My Profile 👤' : 'Producer Community 👥'}
            </button>
            <button 
              onClick={async () => { await database.auth.signOut(); router.push('/'); }} 
              className="text-xs font-bold text-gray-500 hover:text-red-600 border border-gray-300 px-4 py-1.5 rounded-full bg-white hover:bg-red-50 transition"
            >
              Disconnect
            </button>
          </div>

        </div>
      </header>

      <div className="max-w-3xl mx-auto mt-4 space-y-4 px-2 sm:px-0">
        
        {/* =================================================================== */}
        {/* VIEW A: RESTRUCTURED DASHBOARD WORKSPACE */}
        {viewMode === 'personal' && (
          <>
            {/* PORTFOLIO ACCENT CARD FRAME */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden relative shadow-sm">
              <div className="h-36 sm:h-44 bg-[#A0B2C6] bg-cover bg-center flex items-end justify-end p-3" style={profile.cover_url ? { backgroundImage: `url('${profile.cover_url}')` } : {}}>
                <button onClick={() => setEditingProfile(true)} className="bg-white/95 hover:bg-white text-[11px] font-bold px-3 py-1 rounded shadow border transition">✏️ Edit Profile</button>
              </div>
              
              <div className="px-6 pb-6 relative">
                <div className="w-20 h-20 bg-black rounded-full border-4 border-white absolute -top-10 left-6 overflow-hidden flex items-center justify-center text-white font-bold text-2xl shadow-md">
                  {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="User Avatar" /> : <span>{userInitial}</span>}
                </div>
                
                <div className="pt-12 space-y-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    {profile.display_name || `@${profile.username}`} 
                    {profile.pronouns && <span className="text-xs text-gray-400 font-medium ml-2">{profile.pronouns}</span>}
                  </h2>
                  <p className="text-xs text-gray-700 font-medium">{profile.headline}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{profile.company} • {profile.location}</p>
                </div>

                <div className="pt-3">
                  <button onClick={() => setEditingProfile(true)} className="px-5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-full transition shadow-sm">
                    Enhance profile
                  </button>
                </div>
              </div>
            </div>

            {/* PROFILE MODAL FIELDS MANAGEMENT DRAWER */}
            {editingProfile && (
              <form onSubmit={handleProfileSave} className="bg-white border border-blue-200 rounded-lg p-5 space-y-3 shadow-sm animate-fadeIn">
                <h3 className="text-xs font-black uppercase tracking-wider border-b pb-2 text-blue-700">Update Profile Fields</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Full Display Name</label>
                    <input type="text" className="w-full border p-2.5 text-xs rounded bg-gray-50 focus:outline-none" value={editForm.display_name || ''} onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Username Handle</label>
                    <input type="text" className="w-full border p-2.5 text-xs rounded bg-gray-50 focus:outline-none" value={editForm.username || ''} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} required />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Headline Bio</label>
                    <input type="text" className="w-full border p-2.5 text-xs rounded bg-gray-50 focus:outline-none" value={editForm.headline || ''} onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })} />
                  </div>
                  <div className="col-span-2 grid grid-cols-3 gap-2">
                    <input type="text" className="border p-2 text-xs rounded bg-gray-50 focus:outline-none" placeholder="Pronouns" value={editForm.pronouns || ''} onChange={(e) => setEditForm({ ...editForm, pronouns: e.target.value })} />
                    <input type="text" className="border p-2 text-xs rounded bg-gray-50 focus:outline-none" placeholder="Studio Company" value={editForm.company || ''} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} />
                    <input type="text" className="border p-2 text-xs rounded bg-gray-50 focus:outline-none" placeholder="Location" value={editForm.location || ''} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
                  </div>
                  <input type="url" className="border p-2 text-xs rounded bg-gray-50 col-span-2 focus:outline-none" placeholder="Avatar Photo URL Link" value={editForm.avatar_url || ''} onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })} />
                  <input type="url" className="border p-2 text-xs rounded bg-gray-50 col-span-2 focus:outline-none" placeholder="Cover Banner URL Link" value={editForm.cover_url || ''} onChange={(e) => setEditForm({ ...editForm, cover_url: e.target.value })} />
                </div>
                <div className="flex gap-2 justify-end border-t pt-2 mt-2">
                  <button type="submit" className="px-5 py-1.5 bg-blue-700 text-white rounded-full text-xs font-bold">Save Settings</button>
                  <button type="button" onClick={() => setEditingProfile(false)} className="px-5 py-1.5 bg-gray-100 rounded-full text-xs font-bold">Cancel</button>
                </div>
              </form>
            )}

            {/* THE CENTRAL SHARING CONTAINER BAR */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Deploy Asset:</span>
                <button onClick={() => setShareType(shareType === 'post' ? 'none' : 'post')} className={`px-4 py-1.5 text-xs font-bold border rounded-full transition ${shareType === 'post' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-gray-50 hover:bg-gray-100 text-gray-600'}`}>✍️ Write Post</button>
                <button onClick={() => setShareType(shareType === 'audio' ? 'none' : 'audio')} className={`px-4 py-1.5 text-xs font-bold border rounded-full transition ${shareType === 'audio' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-gray-50 hover:bg-gray-100 text-gray-600'}`}>🎵 Upload Audio</button>
              </div>

              {/* Box Drop 1: Simple thought posts */}
              {shareType === 'post' && (
                <div className="border-t pt-3 space-y-2 animate-fadeIn">
                  <textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder="Share a loop link, collaboration request or update with your network..." className="w-full text-xs p-3 bg-gray-50 border rounded-xl focus:outline-none min-h-[70px] resize-none" />
                  <div className="flex justify-end"><button onClick={handleCreatePost} disabled={publishingPost || !postContent.trim()} className="px-4 py-1.5 bg-blue-700 text-white font-bold text-xs rounded-full shadow-sm">Post Update</button></div>
                </div>
              )}

              {/* Box Drop 2: Comprehensive Audio Form Structure */}
              {shareType === 'audio' && (
                <form onSubmit={handlePublishTrack} className="border-t pt-3 space-y-3 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Track Title</label>
                      <input required type="text" placeholder="Atmospheric Synth Loop" className="w-full border text-xs p-2.5 rounded bg-gray-50 focus:outline-none focus:border-blue-600" value={trackTitle} onChange={(e) => setTrackTitle(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Genre Class</label>
                      <select className="w-full border text-xs p-2.5 rounded bg-white cursor-pointer focus:outline-none" value={trackGenre} onChange={(e) => setTrackGenre(e.target.value)}>
                        <option value="Punjabi">Punjabi</option>
                        <option value="Trap Loop">Trap Loop</option>
                        <option value="LoFi Sample">LoFi Sample</option>
                        <option value="Full Track Beat">Full Track Beat</option>
                        <option value="Stem Track Layer">Stem Track Layer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tempo (BPM)</label>
                      <select className="w-full border text-xs p-2.5 rounded bg-white cursor-pointer focus:outline-none" value={trackBpm} onChange={(e) => setTrackBpm(e.target.value)}>
                        <option value="80">80 BPM</option>
                        <option value="90">90 BPM</option>
                        <option value="120">120 BPM</option>
                        <option value="140">140 BPM</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Key Signature</label>
                      <select className="w-full border text-xs p-2.5 rounded bg-white cursor-pointer focus:outline-none" value={trackKey} onChange={(e) => setTrackKey(e.target.value)}>
                        <option value="F# Minor">F# Minor</option>
                        <option value="C Major">C Major</option>
                        <option value="A Minor">A Minor</option>
                        <option value="E Minor">E Minor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Sonic Mood Vibe</label>
                      <select className="w-full border text-xs p-2.5 rounded bg-white cursor-pointer focus:outline-none" value={trackMood} onChange={(e) => setTrackMood(e.target.value)}>
                        <option value="Dark">Dark</option>
                        <option value="Chill">Chill</option>
                        <option value="Energetic">Energetic</option>
                        <option value="Hypnotic">Hypnotic</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Select Audio Source File</label>
                      <input type="file" accept="audio/*" onChange={(e) => { if(e.target.files?.[0]) setSelectedFile(e.target.files[0]); }} className="w-full text-xs file:mr-2 file:py-1.5 file:px-2.5 file:rounded file:border-0 file:bg-gray-100 cursor-pointer" required />
                    </div>
                  </div>
                  <div className="flex justify-end border-t pt-2"><button type="submit" disabled={publishing} className="px-5 py-2 bg-blue-700 text-white font-bold text-xs rounded-full shadow-sm uppercase tracking-wider">{publishing ? 'Uploading...' : 'Publish Audio Drop'}</button></div>
                </form>
              )}
            </div>

            {/* PERSONAL REPOSITORY TRACK LIST MODULE */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">📊 Personal Audio Catalog</h3>
              <div className="space-y-2">
                {mySounds.length > 0 ? (
                  mySounds.map((track) => (
                    <div key={track.id} className="bg-gray-50 p-3 rounded-xl border flex justify-between items-center text-xs shadow-inner">
                      <div>
                        <span className="font-bold text-gray-900">{track.title}</span>
                        <span className="text-[10px] text-gray-400 uppercase font-semibold ml-2">({track.genre} • {track.bpm} BPM)</span>
                      </div>
                      <audio controls src={track.audio_url} className="h-7 w-48 accent-blue-700" />
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-400 italic py-2">Your audio track index is currently empty.</div>
                )}
              </div>
            </div>
          </>
        )}

        {/* =================================================================== */}
        {/* VIEW B: INTEGRATED COMMUNITY TIMELINE CHRONOLOGICAL FEED */}
        {viewMode === 'community' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-blue-700 mb-0.5">🌐 Producer Community Timeline</h3>
              <p className="text-[11px] text-gray-400 font-medium">Real-time update streams and newly dropped audio assets compiled across all registered creators.</p>
            </div>

            {communityFeed.length > 0 ? (
              <div className="space-y-3.5">
                {communityFeed.map((feedItem, index) => {
                  const itemCreator = feedItem.profiles || {};
                  const creatorInitials = String(itemCreator.display_name || itemCreator.username || 'P').charAt(0).toUpperCase();

                  return (
                    <div key={`${feedItem.id}-${index}`} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 hover:border-gray-300 transition duration-200">
                      
                      {/* Publisher Header Info row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-900 text-white rounded-full overflow-hidden border border-gray-100 flex items-center justify-center text-xs font-bold shadow-sm">
                            {itemCreator.avatar_url ? (
                              <img src={itemCreator.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
                            ) : (
                              <span>{creatorInitials}</span>
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-black text-gray-900 hover:text-blue-700 cursor-pointer" onClick={() => router.push(`/profile/${itemCreator.id}`)}>
                              {itemCreator.display_name || `@${itemCreator.username}`}
                            </div>
                            <div className="text-[10px] text-gray-400 font-medium line-clamp-1 truncate max-w-sm">
                              {itemCreator.headline || 'Verified Audio Creator'}
                            </div>
                          </div>
                        </div>

                        {/* Drop classification badge indicators */}
                        <span className={`text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded border ${
                          feedItem.itemType === 'audio' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {feedItem.itemType === 'audio' ? '🎵 Audio Drop' : '✍️ Thought Update'}
                        </span>
                      </div>

                      {/* Content block element selectors */}
                      <div className="pt-1 text-xs leading-relaxed text-gray-800">
                        {feedItem.itemType === 'post' ? (
                          <p className="whitespace-pre-wrap font-medium">{feedItem.content}</p>
                        ) : (
                          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-inner">
                            <div className="space-y-1">
                              <h4 className="font-bold text-gray-900 text-sm">💿 {feedItem.title}</h4>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                <span className="bg-white px-2 py-0.5 rounded text-[8px] font-bold border border-gray-200 text-blue-700">{feedItem.genre}</span>
                                {feedItem.bpm && <span className="bg-white px-2 py-0.5 rounded text-[8px] font-bold border border-gray-200 text-gray-500">{feedItem.bpm} BPM</span>}
                                {feedItem.key && <span className="bg-white px-1.5 py-0.5 rounded text-[8px] font-medium border border-gray-200 text-gray-400">{feedItem.key} • {feedItem.mood}</span>}
                              </div>
                            </div>
                            <audio controls src={feedItem.audio_url} className="w-full sm:w-56 h-8 accent-blue-700 shrink-0" />
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-white text-xs text-gray-400 italic font-medium">
                The community feed is empty. Drop an update or track asset above to populate the timeline.
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
