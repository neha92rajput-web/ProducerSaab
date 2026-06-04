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
  const [myPosts, setMyPosts] = useState<any[]>([]); 
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
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [bannerOffset, setBannerOffset] = useState({ x: 50, y: 50 });

  const coverInputRef = useRef<HTMLInputElement>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const registerAudioPlayback = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const currentAudio = e.currentTarget;
    if (activeAudioRef.current && activeAudioRef.current !== currentAudio) {
      activeAudioRef.current.pause();
    }
    activeAudioRef.current = currentAudio;
  };

  const formatExactDateTime = (dateString: string) => {
    if (!dateString) return '';
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const resizeAndConvertToBase64 = (file: File, targetWidth: number, targetHeight: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error("Canvas context error"));
            return;
          }

          const imgRatio = img.width / img.height;
          const targetRatio = targetWidth / targetHeight;
          let sx = 0, sy = 0, sw = img.width, sh = img.height;

          if (imgRatio > targetRatio) {
            sw = img.height * targetRatio;
            sx = (img.width - sw) / 2;
          } else {
            sh = img.width / targetRatio;
            sy = (img.height - sh) / 2;
          }

          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => reject(new Error("Image compilation failed"));
      };
      reader.onerror = () => reject(new Error("File conversion failed"));
    });
  };

  const handleBannerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!profile?.cover_url) return;
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('label')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    e.preventDefault();
  };

  const handleBannerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setBannerOffset(prev => ({
      x: Math.max(0, Math.min(100, prev.x - deltaX * 0.15)),
      y: Math.max(0, Math.min(100, prev.y - deltaY * 0.25))
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleBannerMouseUpOrLeave = async () => {
    if (!isDragging || !user) return;
    setIsDragging(false);
    try {
      await database
        .from('profiles')
        .update({
          banner_position_x: bannerOffset.x,
          banner_position_y: bannerOffset.y
        })
        .eq('id', user.id);
    } catch (err) {
      console.error("Failed saving coordinates:", err);
    }
  };

  async function loadFeedAndProfiles() {
    try {
      const { data: postsData } = await database
        .from('posts')
        .select(`
          id, content, created_at, profile_id,
          profiles ( id, username, display_name, avatar_url, headline, banner_position_x, banner_position_y )
        `)
        .order('created_at', { ascending: false });

      const { data: soundsData } = await database
        .from('sounds')
        .select(`
          id, title, genre, audio_url, bpm, key, mood, created_at, profile_id,
          profiles ( id, username, display_name, avatar_url, headline, banner_position_x, banner_position_y )
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
      console.error("Failed compiling feeds:", error);
    }
  }

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
        cover_url: '',
        banner_position_x: 50,
        banner_position_y: 50
      };

      setProfile(parsedProfile);
      setEditForm(parsedProfile);
      setBannerOffset({
        x: parsedProfile.banner_position_x ?? 50,
        y: parsedProfile.banner_position_y ?? 50
      });

      await loadUserPersonalContent(user.id);
      await loadFeedAndProfiles();
      setLoading(false);
    }
    loadStudioData();
  }, [router]);

  const handleDirectImageUpload = async (file: File, targetField: 'avatar_url' | 'cover_url') => {
    if (!file || !user) return;
    setUploadingImage(true);

    try {
      const targetWidth = targetField === 'avatar_url' ? 300 : 1600; 
      const targetHeight = targetField === 'avatar_url' ? 300 : 600;
      const compressedBase64 = await resizeAndConvertToBase64(file, targetWidth, targetHeight);

      const updatePayload: any = { [targetField]: compressedBase64 };
      if (targetField === 'cover_url') {
        updatePayload.banner_position_x = 50;
        updatePayload.banner_position_y = 50;
        setBannerOffset({ x: 50, y: 50 });
      }

      const { error: updateError } = await database
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id);

      if (updateError) throw updateError;

      const updatedProfile = { ...profile, ...updatePayload };
      setProfile(updatedProfile);
      setEditForm(updatedProfile);
      await loadFeedAndProfiles();
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImageMedia = async (targetField: 'avatar_url' | 'cover_url') => {
    if (!window.confirm(`Are you sure you want to remove your profile ${targetField === 'avatar_url' ? 'picture' : 'banner'}?`)) return;
    setUploadingImage(true);

    try {
      const { error: updateError } = await database
        .from('profiles')
        .update({ [targetField]: '' })
        .eq('id', user.id);

      if (updateError) throw updateError;

      const updatedProfile = { ...profile, [targetField]: '' };
      setProfile(updatedProfile);
      setEditForm(updatedProfile);
      await loadFeedAndProfiles();
    } catch (err: any) {
      alert(`Failed removing picture: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

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
      location: editForm.location
    }).eq('id', user.id);
    
    if (!error) {
      setProfile(editForm);
      setEditingProfile(false);
      await loadFeedAndProfiles();
    }
  };

  if (loading || !profile) {
    return <div className="min-h-screen bg-[#F4F0EA] flex items-center justify-center text-xs font-bold text-[#8C7E6B] tracking-widest uppercase animate-pulse">Acoustic Logic Booting Up...</div>;
  }

  const userInitial = String(profile.display_name || profile.username || 'P').charAt(0).toUpperCase();

  return (
    // 🎨 LUXURY ACOUSTIC BEIGE STUDIO THEME
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C251E] pb-16 font-sans antialiased relative overflow-x-hidden">
      
      {/* FLOATING AMBIENT MUSIC INSTRUMENT OVERLAYS */}
      <div className="absolute top-24 left-[-100px] w-96 h-96 opacity-[0.03] text-[#2C251E] pointer-events-none transform -rotate-12 select-none">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 2A2 2 0 0 0 10 4v3.38l-4.5-1.5a1 1 0 0 0-1.27.64l-1.5 4.5A1 1 0 0 0 3.38 12.3l2.84.95-1.37 4.1a1 1 0 0 0 .64 1.27l4.5 1.5A1 1 0 0 0 11.27 19.5l1.37-4.1 2.84.95a1 1 0 0 0 1.27-.64l1.5-4.5a1 1 0 0 0-.64-1.27l-4.5-1.5V4a2 2 0 0 0-2-2z" /></svg>
      </div>
      <div className="absolute bottom-10 right-[-120px] w-[500px] h-[500px] opacity-[0.03] text-[#2C251E] pointer-events-none transform rotate-45 select-none">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 2A2 2 0 0 0 10 4v3.38l-4.5-1.5a1 1 0 0 0-1.27.64l-1.5 4.5A1 1 0 0 0 3.38 12.3l2.84.95-1.37 4.1a1 1 0 0 0 .64 1.27l4.5 1.5A1 1 0 0 0 11.27 19.5l1.37-4.1 2.84.95a1 1 0 0 0 1.27-.64l1.5-4.5a1 1 0 0 0-.64-1.27l-4.5-1.5V4a2 2 0 0 0-2-2z" /></svg>
      </div>

      <input type="file" id="avatarFileSelector" accept="image/*" className="hidden" onChange={(e) => { if(e.target.files?.[0]) handleDirectImageUpload(e.target.files[0], 'avatar_url'); }} />
      <input type="file" id="coverFileSelector" accept="image/*" className="hidden" onChange={(e) => { if(e.target.files?.[0]) handleDirectImageUpload(e.target.files[0], 'cover_url'); }} />

      {/* GLASSMORPHIC HEADER CONSOLE */}
      <header className="sticky top-0 z-50 bg-[#F7F3EC]/95 backdrop-blur-md border-b border-[#EADFCF] px-6 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <button onClick={() => router.push('/')} className="text-[#8C7E6B] hover:text-[#2C251E] font-black text-base pr-1 transition">
              ←
            </button>
            <input type="text" placeholder="Search inside console..." className="w-full bg-[#EFECE3] text-xs py-2 px-3 rounded-lg border border-[#E1D9CC] text-[#2C251E] focus:outline-none placeholder-[#A09380]" disabled />
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setViewMode('personal'); setEditingProfile(false); setEditingTrack(null); }} 
              className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all border ${viewMode === 'personal' ? 'bg-[#4A3E31] text-white border-[#4A3E31] shadow-md' : 'bg-white text-[#5C4F41] border-[#DFD8CC] hover:bg-[#EFECE3]'}`}
            >
              My Profile 👤
            </button>
            
            <button 
              onClick={() => { setViewMode('community'); setEditingProfile(false); setEditingTrack(null); }} 
              className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all border ${viewMode === 'community' ? 'bg-[#4A3E31] text-white border-[#4A3E31] shadow-md' : 'bg-white text-[#5C4F41] border-[#DFD8CC] hover:bg-[#EFECE3]'}`}
            >
              Producer Community 👥
            </button>

            <button 
              onClick={async () => { await database.auth.signOut(); router.push('/'); }} 
              className="text-xs font-bold uppercase tracking-wider text-red-700 border border-red-200 px-4 py-2 rounded-full bg-red-50 hover:bg-red-100 transition ml-2"
            >
              Disconnect
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto mt-8 space-y-6 px-4 sm:px-0 relative z-10">
        {viewMode === 'personal' && (
          <>
            {/* DRAGGABLE ACOUSTIC PROFILE HERO BOX */}
            <div className="bg-[#FAF8F5] border border-[#EADFCF] rounded-2xl overflow-hidden relative shadow-xl">
              
              <div 
                onMouseDown={handleBannerMouseDown}
                onMouseMove={handleBannerMouseMove}
                onMouseUp={handleBannerMouseUpOrLeave}
                onMouseLeave={handleBannerMouseUpOrLeave}
                className={`h-44 sm:h-52 bg-[#D9D1C4] bg-cover flex items-start justify-start p-4 relative group transition-all duration-300 ${profile.cover_url ? 'cursor-move' : ''}`} 
                style={{
                  backgroundImage: profile.cover_url ? `url('${profile.cover_url}')` : 'none',
                  backgroundPosition: `${bannerOffset.x}% ${bannerOffset.y}%`
                }}
              >
                {uploadingImage && (
                  <div className="absolute inset-0 bg-[#3A3229]/60 flex items-center justify-center text-[#FDFBF7] text-xs font-bold tracking-widest animate-pulse z-30 backdrop-blur-sm">
                    🎛️ RE-COMPILING STUDIO MATRIX VIEWPORT...
                  </div>
                )}

                <div className="flex gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <label 
                    htmlFor="coverFileSelector"
                    className="bg-[#2C251E]/80 hover:bg-[#2C251E] text-white font-bold px-3 py-2 rounded-lg text-[10px] border border-white/20 uppercase tracking-widest cursor-pointer shadow-lg transition"
                  >
                    {profile.cover_url ? '📷 Change Banner' : '📷 Upload Banner'}
                  </label>
                  {profile.cover_url && (
                    <button 
                      type="button" 
                      onClick={() => handleDeleteImageMedia('cover_url')} 
                      className="bg-red-700 text-white font-bold px-3 py-2 rounded-lg text-[10px] hover:bg-red-800 shadow-lg transition"
                    >
                      ✕ Remove
                    </button>
                  )}
                  {profile.cover_url && (
                    <div className="bg-[#FAF8F5]/95 text-[#4A3E31] text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg border border-[#EADFCF] shadow-lg pointer-events-none">
                      ↕ Drag Frame
                    </div>
                  )}
                </div>
              </div>
              
              <div className="px-8 pb-8 relative bg-white">
                
                {/* Profile Circle Accent */}
                <label 
                  htmlFor="avatarFileSelector"
                  className="w-32 h-32 bg-[#2C251E] border-4 border-white rounded-full absolute -top-16 left-8 overflow-hidden flex items-center justify-center text-white font-bold text-5xl shadow-xl cursor-pointer group/avatar block z-20 transition transform hover:scale-105"
                >
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
                  ) : (
                    <span className="font-serif italic text-[#FAF8F5]">{userInitial}</span>
                  )}

                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/avatar:opacity-100 flex flex-col justify-center items-center transition duration-200 select-none text-center">
                    <span className="text-[10px] uppercase font-black tracking-widest text-white">📷 Change</span>
                    {profile.avatar_url && (
                      <span 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteImageMedia('avatar_url'); }} 
                        className="text-[9px] uppercase text-red-400 font-bold hover:text-red-300 block mt-1.5 hover:underline"
                      >
                        Delete
                      </span>
                    )}
                  </div>
                </label>
                
                <div className="pt-20 space-y-2">
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-2xl font-black text-[#2C251E] tracking-tight font-serif">
                      {profile.display_name || profile.username}
                    </h2>
                    {profile.pronouns && (
                      <span className="text-xs text-[#8C7E6B] font-bold">({profile.pronouns})</span>
                    )}
                  </div>
                  <p className="text-sm text-[#5C4F41] font-medium max-w-xl">{profile.headline || 'Music Producer | Mixer'}</p>
                  <p className="text-xs text-[#A09380] font-bold uppercase tracking-widest">{profile.company || 'Independent Studio'} • <span className="text-[#8C7E6B]">{profile.location || 'Chandigarh, India'}</span></p>
                </div>

                <div className="pt-5">
                  <button onClick={() => setEditingProfile(!editingProfile)} className="px-6 py-2 bg-[#4A3E31] hover:bg-[#3A3025] text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all shadow-md transform hover:-translate-y-0.5">
                    Enhance Bio Details
                  </button>
                </div>
              </div>
            </div>

            {editingProfile && (
              <form onSubmit={handleProfileSave} className="bg-white border border-[#EADFCF] rounded-2xl p-6 space-y-4 shadow-lg animate-fadeIn">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#4A3E31] border-b pb-2">Modify Console Metadata</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-[#8C7E6B] font-bold uppercase tracking-wider mb-1">Full Display Name</label>
                    <input type="text" className="w-full border border-[#DFD8CC] p-3 text-xs rounded-xl bg-[#FDFBF7] text-[#2C251E] focus:outline-none focus:border-[#4A3E31]" value={editForm.display_name || ''} onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#8C7E6B] font-bold uppercase tracking-wider mb-1">Username Handle</label>
                    <input type="text" className="w-full border border-[#DFD8CC] p-3 text-xs rounded-xl bg-[#FDFBF7] text-[#2C251E] focus:outline-none focus:border-[#4A3E31]" value={editForm.username || ''} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} required />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-[#8C7E6B] font-bold uppercase tracking-wider mb-1">Headline Bio</label>
                    <input type="text" className="w-full border border-[#DFD8CC] p-3 text-xs rounded-xl bg-[#FDFBF7] text-[#2C251E] focus:outline-none focus:border-[#4A3E31]" value={editForm.headline || ''} onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })} />
                  </div>
                  <div className="col-span-2 grid grid-cols-3 gap-3">
                    <input type="text" className="border border-[#DFD8CC] p-3 text-xs rounded-xl bg-[#FDFBF7] focus:outline-none focus:border-[#4A3E31]" placeholder="Pronouns" value={editForm.pronouns || ''} onChange={(e) => setEditForm({ ...editForm, pronouns: e.target.value })} />
                    <input type="text" className="border border-[#DFD8CC] p-3 text-xs rounded-xl bg-[#FDFBF7] focus:outline-none focus:border-[#4A3E31]" placeholder="Studio / Label" value={editForm.company || ''} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} />
                    <input type="text" className="border border-[#DFD8CC] p-3 text-xs rounded-xl bg-[#FDFBF7] focus:outline-none focus:border-[#4A3E31]" placeholder="Location" value={editForm.location || ''} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-2 justify-end border-t border-[#EADFCF] pt-3">
                  <button type="submit" className="px-6 py-2 bg-[#4A3E31] text-white rounded-full text-xs font-bold uppercase tracking-widest shadow">Save Records</button>
                  <button type="button" onClick={() => { setEditForm(profile); setEditingProfile(false); }} className="px-6 py-2 bg-[#EFECE3] rounded-full text-xs font-bold text-[#5C4F41] uppercase tracking-widest">Cancel</button>
                </div>
              </form>
            )}

            {editingTrack && (
              <form onSubmit={handleUpdateTrackMetadata} className="bg-white border-2 border-[#D9C4A9] rounded-2xl p-6 space-y-4 shadow-xl animate-fadeIn">
                <div className="flex items-center justify-between border-b border-[#EADFCF] pb-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#8A6F4E]">✏️ Edit Track Attributes</h3>
                  <button type="button" onClick={() => setEditingTrack(null)} className="text-xs text-[#A09380] hover:text-black font-black">✕</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-[#8C7E6B] uppercase mb-1">Track Title</label>
                    <input required type="text" className="w-full border border-[#DFD8CC] text-xs p-3 rounded-xl bg-[#FDFBF7] focus:outline-none focus:border-[#4A3E31]" value={editTrackForm.title} onChange={(e) => setEditTrackForm({...editTrackForm, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#8C7E6B] uppercase mb-1">Genre</label>
                    <select className="w-full border border-[#DFD8CC] text-xs p-3 rounded-xl bg-white focus:outline-none" value={editTrackForm.genre} onChange={(e) => setEditTrackForm({...editTrackForm, genre: e.target.value})}>
                      <option value="Punjabi">Punjabi</option>
                      <option value="Trap Loop">Trap Loop</option>
                      <option value="LoFi Sample">LoFi Sample</option>
                      <option value="Full Track Beat">Full Track Beat</option>
                      <option value="Stem Track Layer">Stem Track Layer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#8C7E6B] uppercase mb-1">Tempo (BPM)</label>
                    <select className="w-full border border-[#DFD8CC] text-xs p-3 rounded-xl bg-white focus:outline-none" value={editTrackForm.bpm} onChange={(e) => setEditTrackForm({...editTrackForm, bpm: e.target.value})}>
                      <option value="80">80 BPM</option>
                      <option value="90">90 BPM</option>
                      <option value="120">120 BPM</option>
                      <option value="140">140 BPM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#8C7E6B] uppercase mb-1">Scale Key</label>
                    <select className="w-full border border-[#DFD8CC] text-xs p-3 rounded-xl bg-white focus:outline-none" value={editTrackForm.key} onChange={(e) => setEditTrackForm({...editTrackForm, key: e.target.value})}>
                      <option value="F# Minor">F# Minor</option>
                      <option value="C Major">C Major</option>
                      <option value="A Minor">A Minor</option>
                      <option value="E Minor">E Minor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#8C7E6B] uppercase mb-1">Vibe Mood</label>
                    <select className="w-full border border-[#DFD8CC] text-xs p-3 rounded-xl bg-white focus:outline-none" value={editTrackForm.mood} onChange={(e) => setEditTrackForm({...editTrackForm, mood: e.target.value})}>
                      <option value="Dark">Dark</option>
                      <option value="Chill">Chill</option>
                      <option value="Energetic">Energetic</option>
                      <option value="Hypnotic">Hypnotic</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end border-t border-[#EADFCF] pt-3">
                  <button type="submit" disabled={updatingTrack} className="px-6 py-2 bg-[#8A6F4E] hover:bg-[#725B3F] text-white rounded-full text-xs font-bold uppercase tracking-widest shadow">{updatingTrack ? 'Saving...' : 'Update Meta'}</button>
                  <button type="button" onClick={() => setEditingTrack(null)} className="px-6 py-2 bg-[#EFECE3] rounded-full text-xs font-bold text-[#5C4F41] uppercase tracking-widest">Cancel</button>
                </div>
              </form>
            )}

            {/* HIGH-END CONTROL DECK INPUT BAY */}
            <div className="bg-[#FAF6F0] border border-[#EADFCF] rounded-2xl p-5 shadow-md space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-[#8C7E6B] uppercase tracking-widest">Master Console:</span>
                <button onClick={() => setShareType(shareType === 'post' ? 'none' : 'post')} className={`px-5 py-2 text-xs font-bold uppercase tracking-wider border rounded-full transition-all duration-200 ${shareType === 'post' ? 'bg-[#4A3E31] text-white border-[#4A3E31] shadow-sm' : 'bg-white text-[#5C4F41] border-[#DFD8CC] hover:bg-[#EFECE3]'}`}>✍️ Log Thought</button>
                <button onClick={() => setShareType(shareType === 'audio' ? 'none' : 'audio')} className={`px-5 py-2 text-xs font-bold uppercase tracking-wider border rounded-full transition-all duration-200 ${shareType === 'audio' ? 'bg-[#4A3E31] text-white border-[#4A3E31] shadow-sm' : 'bg-white text-[#5C4F41] border-[#DFD8CC] hover:bg-[#EFECE3]'}`}>🎵 Bounce Audio</button>
              </div>

              {shareType === 'post' && (
                <div className="border-t border-[#EADFCF] pt-4 space-y-3 animate-fadeIn">
                  <textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder="Type micro-logs or dynamic text updates into the platform network..." className="w-full text-xs p-4 bg-[#FDFBF7] border border-[#DFD8CC] rounded-xl focus:outline-none focus:border-[#4A3E31] min-h-[80px] resize-none text-[#2C251E]" />
                  <div className="flex justify-end"><button onClick={handleCreatePost} disabled={publishingPost || !postContent.trim()} className="px-5 py-2 bg-[#4A3E31] text-white font-bold text-xs uppercase tracking-widest rounded-full shadow">Commit Broadcast</button></div>
                </div>
              )}

              {shareType === 'audio' && (
                <form onSubmit={handlePublishTrack} className="border-t border-[#EADFCF] pt-4 space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-[#8C7E6B] uppercase mb-1">Track Master Title</label>
                      <input required type="text" placeholder="e.g., Heavy Melodic Drill Blueprint" className="w-full border border-[#DFD8CC] text-xs p-3 rounded-xl bg-[#FDFBF7] focus:outline-none focus:border-[#4A3E31]" value={trackTitle} onChange={(e) => setTrackTitle(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#8C7E6B] uppercase mb-1">Genre</label>
                      <select className="w-full border border-[#DFD8CC] text-xs p-3 rounded-xl bg-white focus:outline-none" value={trackGenre} onChange={(e) => setTrackGenre(e.target.value)}>
                        <option value="Punjabi">Punjabi</option>
                        <option value="Trap Loop">Trap Loop</option>
                        <option value="LoFi Sample">LoFi Sample</option>
                        <option value="Full Track Beat">Full Track Beat</option>
                        <option value="Stem Track Layer">Stem Track Layer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#8C7E6B] uppercase mb-1">BPM</label>
                      <select className="w-full border border-[#DFD8CC] text-xs p-3 rounded-xl bg-white focus:outline-none" value={trackBpm} onChange={(e) => setTrackBpm(e.target.value)}>
                        <option value="80">80 BPM</option>
                        <option value="90">90 BPM</option>
                        <option value="120">120 BPM</option>
                        <option value="140">140 BPM</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#8C7E6B] uppercase mb-1">Musical Scale</label>
                      <select className="w-full border border-[#DFD8CC] text-xs p-3 rounded-xl bg-white focus:outline-none" value={trackKey} onChange={(e) => setTrackKey(e.target.value)}>
                        <option value="F# Minor">F# Minor</option>
                        <option value="C Major">C Major</option>
                        <option value="A Minor">A Minor</option>
                        <option value="E Minor">E Minor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#8C7E6B] uppercase mb-1">Mood</label>
                      <select className="w-full border border-[#DFD8CC] text-xs p-3 rounded-xl bg-white focus:outline-none" value={trackMood} onChange={(e) => setTrackMood(e.target.value)}>
                        <option value="Dark">Dark</option>
                        <option value="Chill">Chill</option>
                        <option value="Energetic">Energetic</option>
                        <option value="Hypnotic">Hypnotic</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-[#8C7E6B] uppercase mb-1">Select Stem/Mixdown File</label>
                      <input type="file" accept="audio/*" onChange={(e) => { if(e.target.files?.[0]) setSelectedFile(e.target.files[0]); }} className="w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-[#EFECE3] file:text-[#4A3E31] file:text-[10px] file:font-bold file:uppercase file:tracking-widest cursor-pointer text-gray-500" required />
                    </div>
                  </div>
                  <div className="flex justify-end border-t border-[#EADFCF] pt-3"><button type="submit" disabled={publishing} className="px-6 py-2.5 bg-[#4A3E31] text-white font-bold text-xs uppercase tracking-widest rounded-full shadow">{publishing ? 'Bouncing Track...' : 'Deploy Audio Drop'}</button></div>
                </form>
              )}
            </div>

            {/* STUDIO PROFILE CATALOG DECK */}
            <div className="bg-white border border-[#EADFCF] rounded-2xl p-6 shadow-md space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#8C7E6B]">📊 Personal Audio Index</h3>
              <div className="space-y-3">
                {mySounds.length > 0 ? (
                  mySounds.map((track) => (
                    <div key={track.id} className="bg-[#FAF8F5] p-4 rounded-xl border border-[#ECE6DC] flex flex-col md:flex-row gap-4 justify-between items-start md:items-center text-xs shadow-sm hover:border-[#DFD8CC] transition">
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-[#2C251E] text-sm block md:inline font-serif">{track.title}</span>
                        <div className="flex gap-2 mt-1 md:mt-0 md:inline-flex items-center">
                          <span className="bg-[#EFECE3] text-[#5C4F41] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-[#DFD8CC]">{track.genre}</span>
                          <span className="text-[10px] text-[#A09380] font-bold uppercase tracking-tight">{track.bpm} BPM • {track.key || 'No Key'} • {track.mood}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end shrink-0">
                        <audio controls src={track.audio_url} onPlay={registerAudioPlayback} className="h-7 w-40 sm:w-48 accent-[#4A3E31]" />
                        
                        <div className="flex gap-1.5">
                          <button 
                            type="button"
                            onClick={() => {
                              setEditingTrack(track);
                              setEditTrackForm({ title: track.title, genre: track.genre, bpm: track.bpm || '140', key: track.key || 'F# Minor', mood: track.mood || 'Dark' });
                              window.scrollTo({ top: 350, behavior: 'smooth' });
                            }}
                            className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider bg-white text-[#5C4F41] hover:bg-[#EFECE3] rounded-lg border border-[#DFD8CC] shadow-sm transition"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDeleteTrack(track.id, track.audio_url)}
                            className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-700 hover:bg-red-100 rounded-lg border border-red-100 transition shadow-sm"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-[#A09380] italic py-3 text-center border-2 border-dashed border-[#DFD8CC] rounded-xl">Your personal sound bank indices are currently empty.</div>
                )}
              </div>
            </div>

            {/* PERSONAL THOUGHTS LOGGER */}
            <div className="bg-white border border-[#EADFCF] rounded-2xl p-6 shadow-md space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#8C7E6B]">📝 Micro-Log Updates</h3>
              <div className="space-y-3">
                {myPosts.length > 0 ? (
                  myPosts.map((post) => (
                    <div key={post.id} className="bg-[#FAF8F5] border border-[#ECE6DC] p-5 rounded-xl text-xs flex flex-col sm:flex-row justify-between items-start gap-4 relative shadow-sm hover:border-[#DFD8CC] transition">
                      <div className="space-y-2 flex-1 min-w-0">
                        <p className="font-medium text-[#4A3E31] whitespace-pre-wrap leading-relaxed text-sm">{post.content}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#A09380] select-none bg-[#EFECE3] px-2 py-1 rounded w-max border border-[#E1D9CC]">
                          🗓️ Console Sync: {formatExactDateTime(post.created_at)}
                        </p>
                      </div>
                      
                      <button 
                        type="button"
                        onClick={() => handleDeletePost(post.id)}
                        className="text-[#A09380] hover:text-red-700 transition font-black text-base sm:static absolute top-4 right-4"
                        title="Delete entry node"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-[#A09380] italic py-3 text-center border-2 border-dashed border-[#DFD8CC] rounded-xl">No active micro-logs configured inside this portfolio cell.</div>
                )}
              </div>
            </div>
          </>
        )}

        {/* =================================================================== */}
        {/* VIEW MODE B: LUXURY PRODUCER COMMUNITY TIMELINE FEED */}
        {viewMode === 'community' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-gradient-to-r from-[#4A3E31] to-[#635342] border border-[#4A3E31] rounded-2xl p-6 shadow-lg text-white">
              <h3 className="text-sm font-black uppercase tracking-widest text-[#F7F3EC] mb-1">🌐 Shared Producer Master-Feed</h3>
              <p className="text-xs text-[#DFD8CC] font-medium">Monitoring real-time audio bounces, stem uploads, and platform broadcast metrics worldwide.</p>
            </div>

            {communityFeed.length > 0 ? (
              <div className="space-y-4">
                {communityFeed.map((feedItem, index) => {
                  const itemCreator = feedItem.profiles || {};
                  const creatorInitials = String(itemCreator.display_name || itemCreator.username || 'P').charAt(0).toUpperCase();
                  const isMyAsset = user && feedItem.profile_id === user.id;

                  return (
                    <div key={`${feedItem.id}-${index}`} className="bg-white border border-[#EADFCF] rounded-2xl p-6 shadow-md space-y-4 hover:shadow-lg transition duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-[#2C251E] text-white rounded-full overflow-hidden border-2 border-[#FAF8F5] flex items-center justify-center text-base font-bold shadow-md shrink-0">
                            {itemCreator.avatar_url ? <img src={itemCreator.avatar_url} className="w-full h-full object-cover" alt="Avatar" /> : <span className="font-serif italic">{creatorInitials}</span>}
                          </div>
                          <div>
                            <div className="text-sm font-black text-[#2C251E] hover:text-[#8A6F4E] cursor-pointer font-serif" onClick={() => router.push(`/profile/${itemCreator.id}`)}>
                              {itemCreator.display_name || `@${itemCreator.username}`}
                            </div>
                            <div className="text-[10px] text-[#A09380] font-black uppercase tracking-wider mt-0.5 select-none">
                              🛰️ Sync: {formatExactDateTime(feedItem.created_at)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-black tracking-widest uppercase px-2.5 py-1 rounded-md border ${feedItem.itemType === 'audio' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-blue-50 text-blue-800 border-blue-200'}`}>
                            {feedItem.itemType === 'audio' ? '🎵 Audio Drop' : '✍️ Broadcast'}
                          </span>
                          
                          {isMyAsset && feedItem.itemType === 'post' && (
                            <button 
                              type="button"
                              onClick={() => handleDeletePost(feedItem.id)}
                              className="text-[#A09380] hover:text-red-600 transition ml-1 font-black text-sm"
                              title="Delete Broadcast Node"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="text-xs leading-relaxed text-[#2C251E]">
                        {feedItem.itemType === 'post' ? (
                          <p className="whitespace-pre-wrap font-medium text-[#4A3E31] text-sm bg-[#FAF8F5] p-4 rounded-xl border border-[#ECE6DC] shadow-inner">{feedItem.content}</p>
                        ) : (
                          <div className="bg-[#FAF8F5] border border-[#ECE6DC] rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-inner">
                            <div className="space-y-1 flex-1 min-w-0">
                              <h4 className="font-bold text-[#2C251E] text-base font-serif">💿 {feedItem.title}</h4>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                <span className="bg-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border border-[#DFD8CC] text-[#8A6F4E]">{feedItem.genre}</span>
                                {feedItem.bpm && <span className="bg-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border border-[#DFD8CC] text-gray-500">{feedItem.bpm} BPM</span>}
                                {feedItem.key && <span className="bg-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border border-[#DFD8CC] text-gray-400">{feedItem.key} • {feedItem.mood}</span>}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end shrink-0">
                              <audio controls src={feedItem.audio_url} onPlay={registerAudioPlayback} className="w-40 sm:w-48 h-8 accent-[#4A3E31]" />
                              
                              {isMyAsset && (
                                <div className="flex gap-1 shrink-0">
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      setViewMode('personal');
                                      setEditingTrack(feedItem);
                                      setEditTrackForm({ title: feedItem.title, genre: feedItem.genre, bpm: feedItem.bpm || '140', key: feedItem.key || 'F# Minor', mood: feedItem.mood || 'Dark' });
                                      window.scrollTo({ top: 350, behavior: 'smooth' });
                                    }}
                                    className="p-1.5 bg-white text-[#5C4F41] hover:bg-[#EFECE3] rounded-lg border border-[#DFD8CC] transition text-xs shadow-sm"
                                    title="Edit Meta Node"
                                  >
                                    ✏️
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => handleDeleteTrack(feedItem.id, feedItem.audio_url)}
                                    className="p-1.5 bg-white text-red-600 hover:text-red-700 rounded-lg border border-red-100 hover:border-red-200 transition text-xs shadow-sm"
                                    title="Delete Audio Node"
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
              <div className="text-center py-16 border-2 border-dashed border-[#DFD8CC] rounded-2xl bg-white text-xs text-[#A09380] italic font-bold uppercase tracking-wider">
                The global master-feed matrix is currently empty.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
