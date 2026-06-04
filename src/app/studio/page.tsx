'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

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

  const [viewMode, setViewMode] = useState<'personal' | 'community'>('personal');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editingProfile, setEditingProfile] = useState<boolean>(false);
  const [shareType, setShareType] = useState<'none' | 'post' | 'audio'>('none');
  const [mySounds, setMySounds] = useState<any[]>([]);
  const [myPosts, setMyPosts] = useState<any[]>([]); // 👈 New state hook for your personal text updates
  const [communityFeed, setCommunityFeed] = useState<any[]>([]); 
  const [postContent, setPostContent] = useState<string>('');

  const [trackTitle, setTrackTitle] = useState<string>('');
  const [trackGenre, setTrackGenre] = useState<string>('Punjabi');
  const [trackBpm, setTrackBpm] = useState<string>('140');
  const [trackKey, setTrackKey] = useState<string>('F# Minor');
  const [trackMood, setTrackMood] = useState<string>('Dark');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [editingTrack, setEditingTrack] = useState<any>(null);
  const [editTrackForm, setEditTrackForm] = useState({ title: '', genre: 'Punjabi', bpm: '', key: '', mood: '' });

  const [publishing, setPublishing] = useState<boolean>(false);
  const [publishingPost, setPublishingPost] = useState<boolean>(false);
  const [updatingTrack, setUpdatingTrack] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const registerAudioPlayback = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const currentAudio = e.currentTarget;
    if (activeAudioRef.current && activeAudioRef.current !== currentAudio) {
      activeAudioRef.current.pause();
    }
    activeAudioRef.current = currentAudio;
  };

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
      
      if (postsData && Array.isArray(postsData)) {
        postsData.forEach(item => {
          aggregatedFeed.push({
            id: item.id,
            content: item.content,
            created_at: item.created_at,
            profile_id: item.profile_id,
            profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
            itemType: 'post',
            dateValue: new Date(item.created_at).getTime()
          });
        });
      }
      
      if (soundsData && Array.isArray(soundsData)) {
        soundsData.forEach(item => {
          aggregatedFeed.push({
            id: item.id,
            title: item.title,
            genre: item.genre,
            audio_url: item.audio_url,
            bpm: item.bpm,
            key: item.key,
            mood: item.mood,
            created_at: item.created_at,
            profile_id: item.profile_id,
            profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
            itemType: 'audio',
            dateValue: new Date(item.created_at).getTime()
          });
        });
      }

      aggregatedFeed.sort((a, b) => b.dateValue - a.dateValue);
      setCommunityFeed(aggregatedFeed);
    } catch (error) {
      console.error("Failed compiling application live feeds:", error);
    }
  }

  // Helper loop to load local user content indices cleanly
  async function loadUserPersonalContent(userId: string) {
    const { data: sounds } = await database
      .from('sounds')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false });
    if (sounds) setMySounds(sounds);

    const { data: posts } = await database
      .from('posts')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false });
    if (posts) setMyPosts(posts);
  }

  useEffect(() => {
    async function loadStudioData() {
      const { data: { user } } = await database.auth.getUser();
      if (!user) {
        router.replace('/signin');
        return;
      }
      setUser(user);

      const { data: record } = await database.from('profiles').select('*').eq('id', user.id).maybeSingle();
      
      const userHandle = user.email?.split('@')[0] || 'producer';
      const parsedProfile = record || {
        username: userHandle,
        display_name: userHandle,
        headline: 'Music Producer | Mixer',
        pronouns: '',
        company: 'Independent Studio',
        location: 'Chandigarh, India',
        avatar_url: '',
        cover_url: ''
      };

      setProfile(parsedProfile);
      setEditForm(parsedProfile);

      await loadUserPersonalContent(user.id);
      await loadFeedAndProfiles();
      setLoading(false);
    }
    loadStudioData();
  }, [router]);

  const handleDeleteTrack = async (trackId: string, fileUrl: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this audio track?")) return;

    try {
      const { error: dbDeleteError } = await database
        .from('sounds')
        .delete()
        .eq('id', trackId);

      if (dbDeleteError) throw dbDeleteError;

      if (fileUrl && fileUrl.includes('/audio-tracks/')) {
        const urlSegments = fileUrl.split('/audio-tracks/');
        const storageFilePath = urlSegments[urlSegments.length - 1];
        
        if (storageFilePath) {
          await database.storage
            .from('audio-tracks')
            .remove([decodeURIComponent(storageFilePath)]);
        }
      }

      setMySounds(prevSounds => prevSounds.filter(track => track.id !== trackId));
      setCommunityFeed(prevFeed => prevFeed.filter(item => item.id !== trackId));
    } catch (err: any) {
      alert(`Deletion Failed: ${err.message}`);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Are you sure you want to delete this post update?")) return;

    try {
      const { error } = await database
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setMyPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      setCommunityFeed(prevFeed => prevFeed.filter(item => item.id !== postId));
    } catch (err: any) {
      alert(`Could not complete deletion: ${err.message}`);
    }
  };

  const handleUpdateTrackMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrack) return;
    setUpdatingTrack(true);

    try {
      const { error } = await database
        .from('sounds')
        .update({
          title: editTrackForm.title.trim(),
          genre: editTrackForm.genre,
          bpm: editTrackForm.bpm,
          key: editTrackForm.key,
          musical_key: editTrackForm.key,
          mood: editTrackForm.mood
        })
        .eq('id', editingTrack.id);

      if (error) throw error;

      setEditingTrack(null);
      await loadUserPersonalContent(user.id);
      await loadFeedAndProfiles();
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setUpdatingTrack(false);
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;
    setPublishingPost(true);
    const { error } = await database.from('posts').insert([{ profile_id: user.id, content: postContent }]);
    if (!error) {
      setPostContent('');
      setShareType('none');
      await loadUserPersonalContent(user.id);
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
      const { error: uploadError = null } = await database.storage.from('audio-tracks').upload(fileName, selectedFile, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = database.storage.from('audio-tracks').getPublicUrl(fileName);
      
      const { error: tableError } = await database.from('sounds').insert([{ 
        title: trackTitle.trim(), 
        genre: trackGenre, 
        audio_url: publicUrl, 
        profile_id: user.id, 
        bpm: trackBpm, 
        key: trackKey,
        musical_key: trackKey,
        mood: trackMood 
      }]);
      if (tableError) throw tableError;

      setTrackTitle('');
      setSelectedFile(null);
      setShareType('none');
      
      await loadUserPersonalContent(user.id);
      await loadFeedAndProfiles();
    } catch (err: any) {
      alert(`Upload Failed: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error = null } = await database.from('profiles').update({ 
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

  if (loading || !profile) {
    return <div className="min-h-screen bg-[#F3F2EF] flex items-center justify-center text-xs font-semibold text-gray-400">Opening Studio Control Center...</div>;
  }

  const userInitial = String(profile.display_name || profile.username || 'P').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F3F2EF] text-[#191919] pb-12 font-sans antialiased">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <button onClick={() => router.push('/')} className="text-gray-400 hover:text-black font-black text-sm pr-1">
              ←
            </button>
            <input type="text" placeholder="Search..." className="w-full bg-[#EDF3F8] text-xs py-1.5 px-3 rounded focus:outline-none placeholder-gray-500" disabled />
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setViewMode('personal'); setEditingProfile(false); setEditingTrack(null); }} 
              className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all border ${viewMode === 'personal' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-150'}`}
            >
              My Profile 👤
            </button>
            
            <button 
              onClick={() => { setViewMode('community'); setEditingProfile(false); setEditingTrack(null); }} 
              className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all border ${viewMode === 'community' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-150'}`}
            >
              Producer Community 👥
            </button>

            <button 
              onClick={async () => { await database.auth.signOut(); router.push('/'); }} 
              className="text-xs font-bold text-gray-500 hover:text-red-600 border border-gray-300 px-4 py-1.5 rounded-full bg-white hover:bg-red-50 transition ml-2"
            >
              Disconnect
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto mt-6 space-y-4 px-4 sm:px-0">
        {viewMode === 'personal' && (
          <>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden relative shadow-sm">
              <div className="h-40 sm:h-48 bg-[#A0B2C6] bg-cover bg-center flex items-start justify-end p-4" style={profile.cover_url ? { backgroundImage: `url('${profile.cover_url}')` } : {}}>
                <button onClick={() => setEditingProfile(true)} className="bg-white hover:bg-gray-50 text-xs font-bold px-4 py-1.5 rounded-full shadow border transition text-gray-700">✏️ Edit Profile</button>
              </div>
              
              <div className="px-6 pb-6 relative">
                <div className="w-28 h-28 bg-gray-900 border-4 border-white rounded-full absolute -top-14 left-6 overflow-hidden flex items-center justify-center text-white font-bold text-4xl shadow-sm">
                  {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Profile Avatar" /> : <span>{userInitial}</span>}
                </div>
                
                <div className="pt-16 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">{profile.display_name || profile.username}</h2>
                    {profile.pronouns && <span className="text-xs text-gray-400 font-medium font-sans">({profile.pronouns})</span>}
                  </div>
                  <p className="text-sm text-gray-800 font-normal">{profile.headline || 'Music Producer | Mixer'}</p>
                  <p className="text-xs text-gray-500 font-medium">{profile.company || 'Independent Studio'} • <span className="text-gray-400">{profile.location || 'Chandigarh, India'}</span></p>
                </div>

                <div className="pt-4">
                  <button onClick={() => setEditingProfile(true)} className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full transition shadow-sm">Enhance profile</button>
                </div>
              </div>
            </div>

            {editingProfile && (
              <form onSubmit={handleProfileSave} className="bg-white border border-blue-200 rounded-lg p-5 space-y-3 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider border-b pb-2 text-blue-600">Update Profile Fields</h3>
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
                  <button type="submit" className="px-5 py-1.5 bg-blue-600 text-white rounded-full text-xs font-bold">Save Settings</button>
                  <button type="button" onClick={() => setEditingProfile(false)} className="px-5 py-1.5 bg-gray-100 rounded-full text-xs font-bold">Cancel</button>
                </div>
              </form>
            )}

            {editingTrack && (
              <form onSubmit={handleUpdateTrackMetadata} className="bg-white border border-emerald-300 rounded-lg p-5 space-y-3 shadow-md animate-fadeIn">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-emerald-700">✏️ Modify Audio Metadata parameters</h3>
                  <button type="button" onClick={() => setEditingTrack(null)} className="text-xs text-gray-400 hover:text-black font-bold">✕ Close</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Track Title</label>
                    <input required type="text" className="w-full border text-xs p-2.5 rounded bg-gray-50 focus:outline-none focus:border-emerald-600" value={editTrackForm.title} onChange={(e) => setEditTrackForm({...editTrackForm, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Genre Class</label>
                    <select className="w-full border text-xs p-2.5 rounded bg-white cursor-pointer focus:outline-none font-medium text-gray-700" value={editTrackForm.genre} onChange={(e) => setEditTrackForm({...editTrackForm, genre: e.target.value})}>
                      <option value="Punjabi">Punjabi</option>
                      <option value="Trap Loop">Trap Loop</option>
                      <option value="LoFi Sample">LoFi Sample</option>
                      <option value="Full Track Beat">Full Track Beat</option>
                      <option value="Stem Track Layer">Stem Track Layer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tempo (BPM)</label>
                    <select className="w-full border text-xs p-2.5 rounded bg-white cursor-pointer focus:outline-none font-medium text-gray-700" value={editTrackForm.bpm} onChange={(e) => setEditTrackForm({...editTrackForm, bpm: e.target.value})}>
                      <option value="80">80 BPM</option>
                      <option value="90">90 BPM</option>
                      <option value="120">120 BPM</option>
                      <option value="140">140 BPM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Key Signature</label>
                    <select className="w-full border text-xs p-2.5 rounded bg-white cursor-pointer focus:outline-none font-medium text-gray-700" value={editTrackForm.key} onChange={(e) => setEditTrackForm({...editTrackForm, key: e.target.value})}>
                      <option value="F# Minor">F# Minor</option>
                      <option value="C Major">C Major</option>
                      <option value="A Minor">A Minor</option>
                      <option value="E Minor">E Minor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Sonic Mood Vibe</label>
                    <select className="w-full border text-xs p-2.5 rounded bg-white cursor-pointer focus:outline-none font-medium text-gray-700" value={editTrackForm.mood} onChange={(e) => setEditTrackForm({...editTrackForm, mood: e.target.value})}>
                      <option value="Dark">Dark</option>
                      <option value="Chill">Chill</option>
                      <option value="Energetic">Energetic</option>
                      <option value="Hypnotic">Hypnotic</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end border-t pt-2 mt-2">
                  <button type="submit" disabled={updatingTrack} className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold shadow-sm">{updatingTrack ? 'Saving...' : 'Save Meta Records'}</button>
                  <button type="button" onClick={() => setEditingTrack(null)} className="px-5 py-1.5 bg-gray-100 rounded-full text-xs font-bold text-gray-600">Cancel</button>
                </div>
              </form>
            )}

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Publish Asset:</span>
                <button onClick={() => setShareType(shareType === 'post' ? 'none' : 'post')} className={`px-4 py-1.5 text-xs font-bold border rounded-full transition ${shareType === 'post' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-gray-50 hover:bg-gray-100 text-gray-600'}`}>✍️ Write Post</button>
                <button onClick={() => setShareType(shareType === 'audio' ? 'none' : 'audio')} className={`px-4 py-1.5 text-xs font-bold border rounded-full transition ${shareType === 'audio' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-gray-50 hover:bg-gray-100 text-gray-600'}`}>🎵 Upload Audio</button>
              </div>

              {shareType === 'post' && (
                <div className="border-t pt-3 space-y-2">
                  <textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder="Share an update or idea with your network..." className="w-full text-xs p-3 bg-gray-50 border rounded-xl focus:outline-none min-h-[70px] resize-none" />
                  <div className="flex justify-end"><button onClick={handleCreatePost} disabled={publishingPost || !postContent.trim()} className="px-4 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-full shadow-sm">Post Update</button></div>
                </div>
              )}

              {shareType === 'audio' && (
                <form onSubmit={handlePublishTrack} className="border-t pt-3 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Track Title</label>
                      <input required type="text" placeholder="Atmospheric Synth Loop" className="w-full border text-xs p-2.5 rounded bg-gray-50 focus:outline-none focus:border-blue-600" value={trackTitle} onChange={(e) => setTrackTitle(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Genre Class</label>
                      <select className="w-full border text-xs p-2.5 rounded bg-white cursor-pointer focus:outline-none font-medium text-gray-700" value={trackGenre} onChange={(e) => setTrackGenre(e.target.value)}>
                        <option value="Punjabi">Punjabi</option>
                        <option value="Trap Loop">Trap Loop</option>
                        <option value="LoFi Sample">LoFi Sample</option>
                        <option value="Full Track Beat">Full Track Beat</option>
                        <option value="Stem Track Layer">Stem Track Layer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tempo (BPM)</label>
                      <select className="w-full border text-xs p-2.5 rounded bg-white cursor-pointer focus:outline-none font-medium text-gray-700" value={trackBpm} onChange={(e) => setTrackBpm(e.target.value)}>
                        <option value="80">80 BPM</option>
                        <option value="90">90 BPM</option>
                        <option value="120">120 BPM</option>
                        <option value="140">140 BPM</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Key Signature</label>
                      <select className="w-full border text-xs p-2.5 rounded bg-white cursor-pointer focus:outline-none font-medium text-gray-700" value={trackKey} onChange={(e) => setTrackKey(e.target.value)}>
                        <option value="F# Minor">F# Minor</option>
                        <option value="C Major">C Major</option>
                        <option value="A Minor">A Minor</option>
                        <option value="E Minor">E Minor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Sonic Mood Vibe</label>
                      <select className="w-full border text-xs p-2.5 rounded bg-white cursor-pointer focus:outline-none font-medium text-gray-700" value={trackMood} onChange={(e) => setTrackMood(e.target.value)}>
                        <option value="Dark">Dark</option>
                        <option value="Chill">Chill</option>
                        <option value="Energetic">Energetic</option>
                        <option value="Hypnotic">Hypnotic</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Select Audio Source File</label>
                      <input type="file" accept="audio/*" onChange={(e) => { if(e.target.files?.[0]) setSelectedFile(e.target.files[0]); }} className="w-full text-xs file:mr-2 file:py-1.5 file:px-2.5 file:rounded file:border-0 file:bg-gray-100 cursor-pointer text-gray-600" required />
                    </div>
                  </div>
                  <div className="flex justify-end border-t pt-2"><button type="submit" disabled={publishing} className="px-5 py-2 bg-blue-600 text-white font-bold text-xs rounded-full shadow-sm uppercase tracking-wider">{publishing ? 'Uploading...' : 'Publish Audio Drop'}</button></div>
                </form>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">📊 Personal Audio Catalog</h3>
              <div className="space-y-2.5">
                {mySounds.length > 0 ? (
                  mySounds.map((track) => (
                    <div key={track.id} className="bg-gray-50 p-3 rounded-xl border flex flex-col md:flex-row gap-3 justify-between items-start md:items-center text-xs shadow-inner">
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-gray-900 truncate block sm:inline">{track.title}</span>
                        <span className="text-[10px] text-gray-400 uppercase font-semibold sm:ml-2">({track.genre} • {track.bpm} BPM • {track.key || 'No Key'})</span>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end shrink-0">
                        <audio controls src={track.audio_url} onPlay={registerAudioPlayback} className="h-7 w-40 sm:w-44 accent-blue-600" />
                        
                        <div className="flex gap-1">
                          <button 
                            onClick={() => {
                              setEditingTrack(track);
                              setEditTrackForm({ title: track.title, genre: track.genre, bpm: track.bpm || '140', key: track.key || 'F# Minor', mood: track.mood || 'Dark' });
                              window.scrollTo({ top: 400, behavior: 'smooth' });
                            }}
                            className="px-2 py-1 text-[10px] font-bold bg-white text-gray-700 hover:bg-gray-150 rounded border transition shrink-0 shadow-sm"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteTrack(track.id, track.audio_url)}
                            className="px-2 py-1 text-[10px] font-bold bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded border border-red-200 transition shrink-0 shadow-sm"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-400 italic py-2">Your audio track index is currently empty.</div>
                )}
              </div>
            </div>

            {/* 👤 NEW TIMELINE ROW MODULE: PERSONAL THOUGHTS TRACKER INDEX LIST */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">📝 My Updates & Thoughts</h3>
              <div className="space-y-2">
                {myPosts.length > 0 ? (
                  myPosts.map((post) => (
                    <div key={post.id} className="bg-gray-50 border p-4 rounded-xl text-xs flex justify-between items-start gap-4">
                      <p className="font-medium text-gray-700 whitespace-pre-wrap leading-relaxed flex-1">{post.content}</p>
                      <button 
                        onClick={() => handleDeletePost(post.id)}
                        className="text-gray-400 hover:text-red-600 transition font-bold text-sm px-1"
                        title="Delete thought post"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-400 italic py-2">You haven't written any thoughts or text posts yet.</div>
                )}
              </div>
            </div>
          </>
        )}

        {viewMode === 'community' && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 mb-0.5">🌐 Producer Community Timeline</h3>
              <p className="text-[11px] text-gray-400 font-medium">Real-time update logs and brand-new tracks dropped across all community creators.</p>
            </div>

            {communityFeed.length > 0 ? (
              <div className="space-y-4">
                {communityFeed.map((feedItem, index) => {
                  const itemCreator = feedItem.profiles || {};
                  const creatorInitials = String(itemCreator.display_name || itemCreator.username || 'P').charAt(0).toUpperCase();
                  const isMyAsset = user && feedItem.profile_id === user.id;

                  return (
                    <div key={`${feedItem.id}-${index}`} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 hover:border-gray-300 transition duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-900 text-white rounded-full overflow-hidden border border-gray-100 flex items-center justify-center text-sm font-bold shadow-sm shrink-0">
                            {itemCreator.avatar_url ? <img src={itemCreator.avatar_url} className="w-full h-full object-cover" alt="Avatar" /> : <span>{creatorInitials}</span>}
                          </div>
                          <div>
                            <div className="text-xs font-black text-gray-900 hover:text-blue-600 cursor-pointer" onClick={() => router.push(`/profile/${itemCreator.id}`)}>
                              {itemCreator.display_name || `@${itemCreator.username}`}
                            </div>
                            <div className="text-[10px] text-gray-400 font-medium line-clamp-1 truncate max-w-sm">
                              {itemCreator.headline || 'Verified Platform Creator'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded border ${feedItem.itemType === 'audio' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                            {feedItem.itemType === 'audio' ? '🎵 Audio Drop' : '✍️ Thought'}
                          </span>
                          
                          {isMyAsset && feedItem.itemType === 'post' && (
                            <button 
                              onClick={() => handleDeletePost(feedItem.id)}
                              className="text-xs text-gray-400 hover:text-red-600 transition ml-1 font-bold"
                              title="Delete Post"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="pt-1 text-xs leading-relaxed text-gray-800">
                        {feedItem.itemType === 'post' ? (
                          <p className="whitespace-pre-wrap font-medium text-gray-700">{feedItem.content}</p>
                        ) : (
                          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-inner">
                            <div className="space-y-1 flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 text-sm truncate">💿 {feedItem.title}</h4>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                <span className="bg-white px-2 py-0.5 rounded text-[8px] font-bold border border-gray-200 text-blue-600">{feedItem.genre}</span>
                                {feedItem.bpm && <span className="bg-white px-2 py-0.5 rounded text-[8px] font-bold border border-gray-200 text-gray-500">{feedItem.bpm} BPM</span>}
                                {feedItem.key && <span className="bg-white px-1.5 py-0.5 rounded text-[8px] font-medium border border-gray-200 text-gray-400">{feedItem.key} • {feedItem.mood}</span>}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                              <audio controls src={feedItem.audio_url} onPlay={registerAudioPlayback} className="w-44 sm:w-48 h-8 accent-blue-600" />
                              
                              {isMyAsset && (
                                <div className="flex gap-1 shrink-0">
                                  <button 
                                    onClick={() => {
                                      setViewMode('personal');
                                      setEditingTrack(feedItem);
                                      setEditTrackForm({ title: feedItem.title, genre: feedItem.genre, bpm: feedItem.bpm || '140', key: feedItem.key || 'F# Minor', mood: feedItem.mood || 'Dark' });
                                      window.scrollTo({ top: 400, behavior: 'smooth' });
                                    }}
                                    className="p-1.5 bg-white text-gray-700 hover:bg-gray-150 rounded border transition text-[11px]"
                                    title="Edit meta"
                                  >
                                    ✏️
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteTrack(feedItem.id, feedItem.audio_url)}
                                    className="p-1.5 bg-white text-red-500 hover:text-red-700 rounded border hover:border-red-200 transition text-[11px]"
                                    title="Delete audio drop"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-white text-xs text-gray-400 italic font-medium">
                The community feed is currently empty. Drop an update or track asset above to populate the timeline.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
