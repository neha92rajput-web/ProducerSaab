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

  // Layout State Switcher: 'personal' -> Your Profile Dashboard | 'community' -> The LinkedIn/Insta Feed Matrix
  const [activeTab, setActiveTab] = useState<'personal' | 'community'>('personal');

  // Dynamic Profile States
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({ 
    display_name: '', username: '', headline: '', pronouns: '', company: '', location: '', avatar_url: '', cover_url: '' 
  });
  const [editForm, setEditForm] = useState<any>({});
  const [editingProfile, setEditingProfile] = useState<boolean>(false);
  
  // Feed Toggle State
  const [shareType, setShareType] = useState<'none' | 'post' | 'audio'>('none');
  
  // Database Array Repositories
  const [mySounds, setMySounds] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [allProducers, setAllProducers] = useState<any[]>([]); 
  const [postContent, setPostContent] = useState<string>('');

  // Track Form Controls
  const [trackTitle, setTrackTitle] = useState<string>('');
  const [trackGenre, setTrackGenre] = useState<string>('Trap Loop');
  const [trackBpm, setTrackBpm] = useState<string>('140');
  const [trackKey, setTrackKey] = useState<string>('F# Minor');
  const [trackMood, setTrackMood] = useState<string>('Dark');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [publishing, setPublishing] = useState<boolean>(false);
  const [publishingPost, setPublishingPost] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadStudioData() {
      const { data: { user } } = await database.auth.getUser();
      if (!user) {
        router.replace('/signin');
        return;
      }
      setUser(user);

      // Fetch your real profile metrics
      const { data: record } = await database.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (record) {
        setProfile(record);
        setEditForm(record);
      } else {
        const freshHandle = user.email?.split('@')[0] || 'producer';
        const fallback = { display_name: freshHandle, username: freshHandle, headline: 'Music Producer | Audio Engineer', pronouns: '', company: 'Independent Studio', location: 'Chandigarh, India' };
        setProfile(fallback);
        setEditForm(fallback);
      }

      // Fetch personal tracks
      const { data: sounds } = await database.from('sounds').select('*').eq('profile_id', user.id).order('created_at', { ascending: false });
      if (sounds) setMySounds(sounds);

      // Fetch community broadcast updates
      const { data: updates } = await database.from('posts').select('*').order('created_at', { ascending: false });
      if (updates) setPosts(updates);

      // Fetch all creators registered in the database for your network view
      const { data: globalProfiles } = await database.from('profiles').select('*').limit(24);
      if (globalProfiles) setAllProducers(globalProfiles);

      setLoading(false);
    }
    loadStudioData();
  }, [router]);

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;
    setPublishingPost(true);
    const { data, error } = await database.from('posts').insert([{ profile_id: user.id, content: postContent }]).select();
    if (!error && data) {
      setPosts([data[0], ...posts]);
      setPostContent('');
      setShareType('none');
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
      const { data: soundEntry, error: tableError } = await database.from('sounds').insert([{ title: trackTitle.trim(), genre: trackGenre, audio_url: publicUrl, profile_id: user.id, bpm: trackBpm, key: trackKey, mood: trackMood }]).select();
      if (tableError) throw tableError;

      if (soundEntry) {
        setMySounds([soundEntry[0], ...mySounds]);
        setTrackTitle('');
        setSelectedFile(null);
        setShareType('none');
      }
    } catch (err: any) {
      alert(`Upload Error: ${err.message}`);
    } bits: {
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
    }
  };

  if (loading) return <div className="min-h-screen bg-[#F3F2EF] flex items-center justify-center text-xs">Opening Creator Studio...</div>;

  const userInitial = String(profile.display_name || profile.username || 'P').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F3F2EF] text-[#191919] pb-12 font-sans antialiased">
      
      {/* 🛠️ TOP SUB-DASHBOARD NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/')} className="text-gray-500 hover:text-black text-xs font-bold">← Homepage</button>
            <span className="text-gray-300">|</span>
            <span className="text-xs font-black uppercase tracking-wider text-blue-700">Studio Core 💼</span>
          </div>
          
          {/* THE 2 LAYOUT MODES SWITCHER */}
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-full border border-gray-200">
            <button 
              onClick={() => { setActiveTab('personal'); setEditingProfile(false); }} 
              className={`text-[11px] font-bold px-4 py-1.5 rounded-full transition ${activeTab === 'personal' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-black'}`}
            >
              👤 My Profile
            </button>
            <button 
              onClick={() => { setActiveTab('community'); setEditingProfile(false); }} 
              className={`text-[11px] font-bold px-4 py-1.5 rounded-full transition ${activeTab === 'community' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-black'}`}
            >
              👥 Producer Community
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto mt-4 space-y-4 px-2 sm:px-0">
        
        {/* ------------------------------------------------------------- */}
        {/* LAYOUT A: PERSONAL PROFILE DASHBOARD */}
        {activeTab === 'personal' && (
          <>
            {/* WORKSPACE USER HEADER CARD */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden relative shadow-sm">
              <div className="h-32 bg-[#A0B2C6] bg-cover bg-center flex items-end justify-end p-3" style={profile.cover_url ? { backgroundImage: `url('${profile.cover_url}')` } : {}}>
                <button onClick={() => setEditingProfile(true)} className="bg-white/90 hover:bg-white text-[11px] font-bold px-3 py-1 rounded shadow">✏️ Edit Profile</button>
              </div>
              
              <div className="px-6 pb-6 relative">
                <div className="w-20 h-20 bg-black rounded-full border-4 border-white absolute -top-10 left-6 overflow-hidden flex items-center justify-center text-white font-bold text-2xl">
                  {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="User avatar" /> : <span>{userInitial}</span>}
                </div>
                
                <div className="pt-12 space-y-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    {profile.display_name || `@${profile.username}`} 
                    {profile.pronouns && <span className="text-xs text-gray-400 font-medium ml-2">{profile.pronouns}</span>}
                  </h2>
                  <p className="text-xs text-gray-700 font-medium">{profile.headline || 'Music Producer | Audio Engineer'}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{profile.company || 'Independent Studio'} • {profile.location || 'Chandigarh, India'}</p>
                </div>

                <div className="pt-3">
                  <button onClick={() => setEditingProfile(true)} className="px-5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-full transition shadow-sm">
                    Enhance profile
                  </button>
                </div>
              </div>
            </div>

            {/* EDIT PARAMETERS PANEL */}
            {editingProfile && (
              <form onSubmit={handleProfileSave} className="bg-white border border-blue-200 rounded-lg p-5 space-y-3 shadow-sm animate-fadeIn">
                <h3 className="text-xs font-black uppercase tracking-wider border-b pb-2 text-blue-700">Configure Identity parameters</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Display/Full Name</label>
                    <input type="text" className="w-full border p-2.5 text-xs rounded bg-gray-50" placeholder="Display Name" value={editForm.display_name || ''} onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Username Handle</label>
                    <input type="text" className="w-full border p-2.5 text-xs rounded bg-gray-50" placeholder="Username" value={editForm.username || ''} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} required />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Professional Tagline Headline</label>
                    <input type="text" className="w-full border p-2.5 text-xs rounded bg-gray-50" placeholder="Headline" value={editForm.headline || ''} onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })} />
                  </div>
                  <div className="col-span-2 grid grid-cols-3 gap-2">
                    <input type="text" className="border p-2 text-xs rounded bg-gray-50" placeholder="Pronouns" value={editForm.pronouns || ''} onChange={(e) => setEditForm({ ...editForm, pronouns: e.target.value })} />
                    <input type="text" className="border p-2 text-xs rounded bg-gray-50" placeholder="Studio / Label" value={editForm.company || ''} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} />
                    <input type="text" className="border p-2 text-xs rounded bg-gray-50" placeholder="Location" value={editForm.location || ''} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
                  </div>
                  <input type="url" className="border p-2 text-xs rounded bg-gray-50 col-span-2" placeholder="Avatar picture direct URL link" value={editForm.avatar_url || ''} onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })} />
                  <input type="url" className="border p-2 text-xs rounded bg-gray-50 col-span-2" placeholder="Cover banner direct URL link" value={editForm.cover_url || ''} onChange={(e) => setEditForm({ ...editForm, cover_url: e.target.value })} />
                </div>
                <div className="flex gap-2 justify-end border-t pt-2 mt-2">
                  <button type="submit" className="px-4 py-1.5 bg-blue-700 text-white rounded-full text-xs font-bold">Save Settings</button>
                  <button type="button" onClick={() => setEditingProfile(false)} className="px-4 py-1.5 bg-gray-100 rounded-full text-xs font-bold">Cancel</button>
                </div>
              </form>
            )}

            {/* SHARING HUB COMPONENT CONTAINER */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Deploy Tools:</span>
                <button onClick={() => setShareType(shareType === 'post' ? 'none' : 'post')} className={`px-4 py-1.5 text-xs font-bold border rounded-full transition ${shareType === 'post' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-gray-50 hover:bg-gray-100 text-gray-600'}`}>✍️ Write Post</button>
                <button onClick={() => setShareType(shareType === 'audio' ? 'none' : 'audio')} className={`px-4 py-1.5 text-xs font-bold border rounded-full transition ${shareType === 'audio' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-gray-50 hover:bg-gray-100 text-gray-600'}`}>🎵 Upload Audio</button>
              </div>

              {shareType === 'post' && (
                <div className="border-t pt-3 space-y-2 animate-fadeIn">
                  <textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder="Broadcast a new dynamic update or thought to the community..." className="w-full text-xs p-3 bg-gray-50 border rounded-xl focus:outline-none min-h-[70px] resize-none" />
                  <div className="flex justify-end"><button onClick={handleCreatePost} disabled={publishingPost || !postContent.trim()} className="px-4 py-1.5 bg-blue-700 text-white font-bold text-xs rounded-full">Publish post</button></div>
                </div>
              )}

              {shareType === 'audio' && (
                <form onSubmit={handlePublishTrack} className="border-t pt-3 space-y-3 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" placeholder="Track Title" className="border text-xs p-2.5 rounded bg-gray-50 col-span-2 focus:outline-none" value={trackTitle} onChange={(e) => setTrackTitle(e.target.value)} required />
                    <select className="border text-xs p-2.5 rounded bg-white cursor-pointer" value={trackGenre} onChange={(e) => setTrackGenre(e.target.value)}>
                      <option value="Trap Loop">Trap Loop</option>
                      <option value="LoFi Sample">LoFi Sample</option>
                      <option value="Full Track Beat">Full Track Beat</option>
                      <option value="Stem Track Layer">Stem Track Layer</option>
                    </select>
                    <select className="border text-xs p-2.5 rounded bg-white cursor-pointer" value={trackBpm} onChange={(e) => setTrackBpm(e.target.value)}>
                      <option value="90">90 BPM</option>
                      <option value="120">120 BPM</option>
                      <option value="140">140 BPM</option>
                    </select>
                    <select className="border text-xs p-2.5 rounded bg-white cursor-pointer" value={trackKey} onChange={(e) => setTrackKey(e.target.value)}>
                      <option value="F# Minor">F# Minor</option>
                      <option value="C Major">C Major</option>
                      <option value="A Minor">A Minor</option>
                    </select>
                    <select className="border text-xs p-2.5 rounded bg-white cursor-pointer" value={trackMood} onChange={(e) => setTrackMood(e.target.value)}>
                      <option value="Dark">Dark</option>
                      <option value="Chill">Chill</option>
                      <option value="Energetic">Energetic</option>
                    </select>
                    <input type="file" accept="audio/*" onChange={(e) => { if(e.target.files?.[0]) setSelectedFile(e.target.files[0]); }} className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-gray-100 col-span-2 cursor-pointer" required />
                  </div>
                  <div className="flex justify-end border-t pt-2"><button type="submit" disabled={publishing} className="px-5 py-2 bg-blue-700 text-white font-bold text-xs rounded-full uppercase tracking-wider">{publishing ? 'Uploading...' : 'Publish Drop'}</button></div>
                </form>
              )}
            </div>

            {/* PERSONAL TRACK CATALOG DISPLAY */}
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
                  <div className="text-xs text-gray-400 italic py-2">No audio tracks uploaded to your studio deck line yet.</div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ------------------------------------------------------------- */}
        {/* LAYOUT B: LINKEDIN/INSTA STYLE PRODUCER COMMUNITY FEED */}
        {activeTab === 'community' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-blue-700 mb-0.5">👥 Global Networks Dashboard</h3>
              <p className="text-[11px] text-gray-400 font-medium">Browse, follow, and interface with other producers logged on the platform network.</p>
            </div>

            {/* Network Timeline Card Grid Array */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allProducers.map((creator) => {
                const initials = String(creator.display_name || creator.username || 'P').charAt(0).toUpperCase();
                return (
                  <div key={creator.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-gray-300 transition">
                    <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-100" style={creator.cover_url ? { backgroundImage: `url('${creator.cover_url}')`, backgroundSize: 'cover' } : {}} />
                    <div className="p-4 pt-0 relative flex-1 flex flex-col justify-between">
                      <div className="w-12 h-12 bg-black border-2 border-white rounded-full absolute -top-6 left-4 overflow-hidden flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        {creator.avatar_url ? <img src={creator.avatar_url} className="w-full h-full object-cover" alt="Profile" /> : <span>{initials}</span>}
                      </div>
                      
                      <div className="pt-8 space-y-1">
                        <h4 className="text-sm font-bold text-gray-900 truncate">{creator.display_name || `@${creator.username}`}</h4>
                        <p className="text-[11px] text-gray-500 leading-snug line-clamp-2 min-h-[32px]">{creator.headline || 'Audio Engineer | Producer'}</p>
                        <p className="text-[9px] text-gray-400 font-semibold uppercase">{creator.location || 'Global Hub'}</p>
                      </div>

                      <div className="pt-4 border-t mt-3 flex gap-2">
                        <button 
                          onClick={() => router.push(`/profile/${creator.id}`)} 
                          className="flex-1 text-center py-1.5 bg-gray-50 hover:bg-gray-100 border text-[10px] font-bold text-gray-700 rounded-lg transition"
                        >
                          View Portfolio
                        </button>
                        <button className="flex-1 text-center py-1.5 bg-blue-700 hover:bg-blue-800 text-[10px] font-bold text-white rounded-lg transition">
                          Connect +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
