'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

// Forces Next.js to bypass static optimization at build time to safely serialize complex database join arrays
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

  // Tab State Switcher (Personal Workspace vs Shared Timeline matrix)
  const [viewMode, setViewMode] = useState<'personal' | 'community'>('personal');

  // Dynamic Profile Layer Parameters
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editingProfile, setEditingProfile] = useState<boolean>(false);
  
  // Custom Publish Share Form Toggles
  const [shareType, setShareType] = useState<'none' | 'post' | 'audio'>('none');
  
  // Synchronized Application Repositories
  const [mySounds, setMySounds] = useState<any[]>([]);
  const [communityFeed, setCommunityFeed] = useState<any[]>([]); 
  const [postContent, setPostContent] = useState<string>('');

  // Audio Drop Interactive State Variables
  const [trackTitle, setTrackTitle] = useState<string>('');
  const [trackGenre, setTrackGenre] = useState<string>('Punjabi');
  const [trackBpm, setTrackBpm] = useState<string>('140');
  const [trackKey, setTrackKey] = useState<string>('F# Minor');
  const [trackMood, setTrackMood] = useState<string>('Dark');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [publishing, setPublishing] = useState<boolean>(false);
  const [publishingPost, setPublishingPost] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Unified Chronological Network Timeline Compiler Loop
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
      
      // Map posts layout primitives securely
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
      
      // Map audio layout drops parameters smoothly
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

      // Chronological sorting logic execution
      aggregatedFeed.sort((a, b) => b.dateValue - a.dateValue);
      setCommunityFeed(aggregatedFeed);
    } catch (error) {
      console.error("Failed compiling application live grid pipelines:", error);
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

      // Pull current signed-in user's data layer fields
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

      const { data: sounds } = await database.from('sounds').select('*').eq('profile_id', user.id).order('created_at', { ascending: false });
      if (sounds) setMySounds(sounds);

      await loadFeedAndProfiles();
      setLoading(false);
    }
    loadStudioData();
  }, [router]);

  // CORE DELETION CONTROLLER ENGINE
  const handleDeleteTrack = async (trackId: string, fileUrl: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this audio track master?")) return;

    try {
      // 1. Terminate targeted unique row entry out of Supabase sounds database table
      const { error: dbDeleteError } = await database
        .from('sounds')
        .delete()
        .eq('id', trackId);

      if (dbDeleteError) throw dbDeleteError;

      // 2. Clear out underlying audio asset object from Supabase cloud buckets storage
      if (fileUrl && fileUrl.includes('/audio-tracks/')) {
        const urlSegments = fileUrl.split('/audio-tracks/');
        const storageFilePath = urlSegments[urlSegments.length - 1];
        
        if (storageFilePath) {
          await database.storage
            .from('audio-tracks')
            .remove([decodeURIComponent(storageFilePath)]);
        }
      }

      // 3. Hot-swap UI array data elements on-the-fly to reflect deletions without refreshing
      setMySounds(prevSounds => prevSounds.filter(track => track.id !== trackId));
      setCommunityFeed(prevFeed => prevFeed.filter(item => item.id !== trackId));

    } catch (err: any) {
      alert(`Deletion Failed: ${err.message}`);
    }
  };

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
        musical_key: trackKey,
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

  if (loading || !profile) return <div className="min-h-screen bg-[#F3F2EF] flex items-center justify-center text-xs font-semibold text-gray-400">Opening Studio Control Center...</div>;

  const userInitial = String(profile.display_name || profile.username || 'P').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F3F2EF] text-[#191919] pb-12 font-sans antialiased">
      
      {/* HEADER NAVIGATION SECTION */}
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
              onClick={() => { setViewMode('personal'); setEditingProfile(false); }} 
              className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all border ${viewMode === 'personal' ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-150'}`}
            >
              My Profile 👤
            </button>
            
            <button 
              onClick={() => { setViewMode('community'); setEditingProfile(false); }} 
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
        
        {/* VIEW MODE A: MY PERSONAL STUDIO PORTFOLIO CARD LAYOUT */}
        {viewMode === 'personal' && (
          <>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden relative shadow-sm">
              <div className="h-40 sm:h-48 bg-[#A0B2C6] bg-cover bg-center flex items-start justify-end p-4" style={profile.cover_url ? { backgroundImage: `url('${profile.cover_url}')` } : {}}>
                <button onClick={() => setEditingProfile(true)} className="bg-white hover:bg-gray-50 text-xs font-bold px-4 py-1.5 rounded-full shadow border transition text-gray-700">✏️ Edit Profile</button>
              </div>
              
              <div className="px-6 pb-6 relative">
                <div className="w
