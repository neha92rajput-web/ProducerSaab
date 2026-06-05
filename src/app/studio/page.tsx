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

  // Tracking simulated likes in local state to make the cards interactive
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});

  const coverInputRef = useRef<HTMLInputElement>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const registerAudioPlayback = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    const currentAudio = e.currentTarget;
    if (activeAudioRef.current && activeAudioRef.current !== currentAudio) {
      activeAudioRef.current.pause();
    }
    activeAudioRef.current = currentAudio;
  };

  const toggleLocalLike = (id: string) => {
    setLikedItems(prev => ({ ...prev, [id]: !prev[id] }));
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
      const targetWidth = targetField === 'avatar_url' ? 300 : 1920; 
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
      
      const { error: tableError = null } = await database.from('sounds').insert([{ 
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
    return <div className="min-h-screen bg-[#F5EFEB] flex items-center justify-center text-xs font-black text-[#967655] tracking-widest uppercase animate-pulse">Initializing Console Views...</div>;
  }

  const userInitial = String(profile.display_name || profile.username || 'P').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5EFEB] via-[#EFE5DC] to-[#E5D7CB] text-[#3D3126] pb-16 font-sans antialiased relative overflow-x-hidden selection:bg-[#A37B55] selection:text-white">
      
      {/* FLOATING MUSIC BACKGROUND ELEMENTS */}
      <div className="absolute top-36 left-[-60px] w-96 h-96 opacity-[0.03] text-[#4A3319] pointer-events-none transform -rotate-12 select-none z-0">
        <svg viewBox="0 0 512 512" fill="currentColor" className="w-full h-full"><path d="M495.2 16.8a48 48 0 0 0-67.9 0L381.5 62.6a145 145 0 0 1 31.7 43l42-42a48 48 0 0 0 0-66.8zm-113 77.2L42.6 433.6a48 48 0 0 0 0 67.9 48 48 0 0 0 67.9 0l339.6-339.6c-24-28.7-43-43-67.9-67.9z"/></svg>
      </div>

      <input type="file" id="avatarFileSelector" accept="image/*" className="hidden" onChange={(e) => { if(e.target.files?.[0]) handleDirectImageUpload(e.target.files[0], 'avatar_url'); }} />
      <input type="file" id="coverFileSelector" accept="image/*" className="hidden" onChange={(e) => { if(e.target.files?.[0]) handleDirectImageUpload(e.target.files[0], 'cover_url'); }} />

      {/* RACK PANEL CONSOLE NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#FCFAF7]/90 backdrop-blur-xl border-b-2 border-[#E3D4C1] px-6 py-3.5 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <button onClick={() => router.push('/')} className="text-[#967655] hover:text-[#523B24] font-black text-lg pr-1 transition">←</button>
            <input type="text" placeholder="Search parameters..." className="w-full bg-[#FAF5EE] text-xs py-2 px-3.5 rounded-xl border border-[#D9C6AF] text-[#3D3126] focus:outline-none placeholder-[#A69580] shadow-inner" disabled />
          </div>
          
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => { setViewMode('personal'); setEditingProfile(false); setEditingTrack(null); }} 
              className={`text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all border ${viewMode === 'personal' ? 'bg-[#5C4531] text-[#FFF9F2] border-[#5C4531] shadow-lg' : 'bg-[#FFFDFB] text-[#5C4531] border-[#D9CBAF] hover:bg-[#FAF5EE]'}`}
            >
              My Profile 👤
            </button>
            
            <button 
              onClick={() => { setViewMode('community'); setEditingProfile(false); setEditingTrack(null); }} 
              className={`text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all border ${viewMode === 'community' ? 'bg-[#5C4531] text-[#FFF9F2] border-[#5C4531] shadow-lg' : 'bg-[#FFFDFB] text-[#5C4531] border-[#D9CBAF] hover:bg-[#FAF5EE]'}`}
            >
              Producer Community 👥
            </button>

            <button 
              onClick={async () => { await database.auth.signOut(); router.push('/'); }} 
              className="text-xs font-black uppercase tracking-widest text-red-700 border border-red-200 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 transition ml-1"
            >
              Disconnect
            </button>
          </div>
        </div>
      </header>

      {/* FIXED ASYMMETRIC COVER VIEWPORT */}
      {viewMode === 'personal' && (
        <div className="w-full bg-transparent border-b border-[#DCD0BE] mb-6">
          <div 
            onMouseDown={handleBannerMouseDown}
            onMouseMove={handleBannerMouseMove}
            onMouseUp={handleBannerMouseUpOrLeave}
            onMouseLeave={handleBannerMouseUpOrLeave}
            className={`w-full h-64 sm:h-80 bg-gradient-to-r from-[#C2B29D] to-[#A3917B] bg-cover flex items-start justify-start p-6 relative group transition-all duration-300 ${profile.cover_url ? 'cursor-move' : ''}`} 
            style={{
              backgroundImage: profile.cover_url ? `url('${profile.cover_url}')` : 'none',
              backgroundPosition: `${bannerOffset.x}% ${bannerOffset.y}%`
            }}
          >
            {uploadingImage && (
              <div className="absolute inset-0 bg-[#291F16]/70 flex items-center justify-center text-[#FFF9F2] text-xs font-black tracking-widest animate-pulse z-30 backdrop-blur-sm">
                🎛️ ADJUSTING DRAG COORDINATES MATRIX...
              </div>
            )}

            <div className="max-w-4xl w-full mx-auto relative h-full flex items-start justify-start">
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <label 
                  htmlFor="coverFileSelector"
                  className="bg-[#3D2C1E]/90 hover:bg-[#3D2C1E] text-[#FFF9F2] font-black px-4 py-2 rounded-xl text-[10px] border border-white/20 uppercase tracking-widest cursor-pointer shadow-xl transition"
                >
                  {profile.cover_url ? '📷 Change Banner' : '📷 Upload Banner'}
                </label>
                {profile.cover_url && (
                  <button 
                    type="button" 
                    onClick={() => handleDeleteImageMedia('cover_url')} 
                    className="bg-red-700 text-white font-black px-3 py-2 rounded-xl text-[10px] hover:bg-red-800 shadow-xl transition uppercase tracking-wider"
                  >
                    ✕ Remove
                  </button>
                )}
                {profile.cover_url && (
                  <div className="bg-[#FFFDFB]/95 text-[#5C4531] text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl border border-[#DCD0BE] shadow-xl pointer-events-none">
                    ↕ Drag Frame
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-0 relative pb-6">
            <label 
              htmlFor="avatarFileSelector"
              className="w-32 h-32 bg-[#3D2C1E] border-4 border-white rounded-2xl absolute -top-16 left-4 sm:left-0 overflow-hidden flex items-center justify-center text-white font-bold text-5xl shadow-2xl cursor-pointer group/avatar block z-20 transition transform hover:scale-105"
            >
              {profile.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                <span className="font-serif italic text-[#FFFDFB] tracking-wide">{userInitial}</span>
              )}

              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/avatar:opacity-100 flex flex-col justify-center items-center transition duration-200 select-none text-center">
                <span className="text-[10px] uppercase font-black tracking-widest text-white">📷 Change</span>
                {profile.avatar_url && (
                  <span 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteImageMedia('avatar_url'); }} 
                    className="text-[9px] uppercase text-red-400 font-bold hover:text-red-300 block mt-2 hover:underline"
                  >
                    Delete
                  </span>
                )}
              </div>
            </label>
            
            <div className="pt-20 space-y-2">
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl font-black text-[#261E17] tracking-tight font-serif">
                  {profile.display_name || profile.username}
                </h2>
                {profile.pronouns && (
                  <span className="text-xs text-[#967655] font-black tracking-wider">({profile.pronouns})</span>
                )}
              </div>
              <p className="text-sm text-[#523B24] font-semibold max-w-xl">{profile.headline || 'Music Producer | Mixer'}</p>
              <p className="text-xs text-[#A6917A] font-black uppercase tracking-widest bg-[#FFFDFB] px-3 py-1.5 rounded-xl border border-[#E3D4C1] w-max shadow-sm">
                {profile.company || 'Independent Studio'} • <span className="text-[#967655]">{profile.location || 'Chandigarh, India'}</span>
              </p>
            </div>

            <div className="pt-5">
              <button onClick={() => setEditingProfile(!editingProfile)} className="px-6 py-2.5 bg-[#5C4531] hover:bg-[#453324] text-[#FFF9F2] text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md transform hover:-translate-y-0.5">
                Enhance Bio Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CORE CONTENT SWITCH-BOX */}
      <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-0 relative z-10">
        
        {viewMode === 'personal' && (
          <>
            {editingProfile && (
              <form onSubmit={handleProfileSave} className="bg-[#FFFDFB] border border-[#DCD0BE] rounded-2xl p-6 space-y-4 shadow-xl animate-fadeIn">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#5C4531] border-b border-[#E3D4C1] pb-2">Modify Console Metadata</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-[#967655] font-black uppercase tracking-wider mb-1">Full Display Name</label>
                    <input type="text" className="w-full border border-[#D9C6AF] p-3 text-xs rounded-xl bg-[#FFFDFB] text-[#3D3126] focus:outline-none focus:border-[#5C4531]" value={editForm.display_name || ''} onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#967655] font-black uppercase tracking-wider mb-1">Username Handle</label>
                    <input type="text" className="w-full border border-[#D9C6AF] p-3 text-xs rounded-xl bg-[#FFFDFB] text-[#3D3126] focus:outline-none focus:border-[#5C4531]" value={editForm.username || ''} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} required />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-[#967655] font-black uppercase tracking-wider mb-1">Headline Bio</label>
                    <input type="text" className="w-full border border-[#D9C6AF] p-3 text-xs rounded-xl bg-[#FFFDFB] text-[#3D3126] focus:outline-none focus:border-[#5C4531]" value={editForm.headline || ''} onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })} />
                  </div>
                  <div className="col-span-2 grid grid-cols-3 gap-3">
                    <input type="text" className="border border-[#D9C6AF] p-3 text-xs rounded-xl bg-[#FFFDFB] focus:outline-none focus:border-[#5C4531]" placeholder="Pronouns" value={editForm.pronouns || ''} onChange={(e) => setEditForm({ ...editForm, pronouns: e.target.value })} />
                    <input type="text" className="border border-[#D9C6AF] p-3 text-xs rounded-xl bg-[#FFFDFB] focus:outline-none focus:border-[#5C4531]" placeholder="Studio / Label" value={editForm.company || ''} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} />
                    <input type="text" className="border border-[#D9C6AF] p-3 text-xs rounded-xl bg-[#FFFDFB] focus:outline-none focus:border-[#4A3E31]" placeholder="Location" value={editForm.location || ''} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-2 justify-end border-t border-[#E3D4C1] pt-3">
                  <button type="submit" className="px-6 py-2 bg-[#5C4531] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow">Save Records</button>
                  <button type="button" onClick={() => { setEditForm(profile); setEditingProfile(false); }} className="px-6 py-2 bg-[#FAF5EE] rounded-xl text-xs font-black text-[#523B24] uppercase tracking-widest">Cancel</button>
                </div>
              </form>
            )}

            {editingTrack && (
              <form onSubmit={handleUpdateTrackMetadata} className="bg-white border-2 border-[#C2A383] rounded-2xl p-6 space-y-4 shadow-2xl animate-fadeIn">
                <div className="flex items-center justify-between border-b border-[#E3D4C1] pb-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#A37B55]">✏️ Edit Track Attributes</h3>
                  <button type="button" onClick={() => setEditingTrack(null)} className="text-xs text-[#A69580] hover:text-black font-black">✕</button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-[#967655] uppercase mb-1">Track Title</label>
                    <input required type="text" className="w-full border border-[#D9C6AF] text-xs p-3 rounded-xl bg-[#FFFDFB] focus:outline-none focus:border-[#5C4531]" value={editTrackForm.title} onChange={(e) => setEditTrackForm({...editTrackForm, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#967655] uppercase mb-1">Genre</label>
                    <select className="w-full border border-[#D9C6AF] text-xs p-3 rounded-xl bg-white focus:outline-none" value={editTrackForm.genre} onChange={(e) => setEditTrackForm({...editTrackForm, genre: e.target.value})}>
                      <option value="Punjabi">Punjabi</option>
                      <option value="Trap Loop">Trap Loop</option>
                      <option value="LoFi Sample">LoFi Sample</option>
                      <option value="Full Track Beat">Full Track Beat</option>
                      <option value="Stem Track Layer">Stem Track Layer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#967655] uppercase mb-1">Tempo (BPM)</label>
                    <select className="w-full border border-[#D9C6AF] text-xs p-3 rounded-xl bg-white focus:outline-none" value={editTrackForm.bpm} onChange={(e) => setEditTrackForm({...editTrackForm, bpm: e.target.value})}>
                      <option value="80">80 BPM</option>
                      <option value="90">90 BPM</option>
                      <option value="120">120 BPM</option>
                      <option value="140">140 BPM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#967655] uppercase mb-1">Scale Key</label>
                    <select className="w-full border border-[#D9C6AF] text-xs p-3 rounded-xl bg-white focus:outline-none" value={editTrackForm.key} onChange={(e) => setEditTrackForm({...editTrackForm, key: e.target.value})}>
                      <option value="F# Minor">F# Minor</option>
                      <option value="C Major">C Major</option>
                      <option value="A Minor">A Minor</option>
                      <option value="E Minor">E Minor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[#967655] uppercase mb-1">Vibe Mood</label>
                    <select className="w-full border border-[#D9C6AF] text-xs p-3 rounded-xl bg-white focus:outline-none" value={editTrackForm.mood} onChange={(e) => setEditTrackForm({...editTrackForm, mood: e.target.value})}>
                      <option value="Dark">Dark</option>
                      <option value="Chill">Chill</option>
                      <option value="Energetic">Energetic</option>
                      <option value="Hypnotic">Hypnotic</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end border-t border-[#E3D4C1] pt-3">
                  <button type="submit" disabled={updatingTrack} className="px-6 py-2 bg-[#A37B55] hover:bg-[#85603F] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow">{updatingTrack ? 'Saving...' : 'Update Meta'}</button>
                  <button type="button" onClick={() => setEditingTrack(null)} className="px-6 py-2 bg-[#FAF5EE] rounded-xl text-xs font-black text-[#523B24] uppercase tracking-widest">Cancel</button>
                </div>
              </form>
            )}

            <div className="bg-[#FAF5EE] border border-[#DCD0BE] rounded-3xl p-5 shadow-lg space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-[#967655] uppercase tracking-widest">Studio Engine:</span>
                <button onClick={() => setShareType(shareType === 'post' ? 'none' : 'post')} className={`px-5 py-2 text-xs font-black uppercase tracking-widest border rounded-xl transition-all duration-200 ${shareType === 'post' ? 'bg-[#5C4531] text-white border-[#5C4531] shadow-md' : 'bg-white text-[#523B24] border-[#D9C6AF] hover:bg-[#F5EFEB]'}`}>✍️ Broadcast Thought</button>
                <button onClick={() => setShareType(shareType === 'audio' ? 'none' : 'audio')} className={`px-5 py-2 text-xs font-black uppercase tracking-widest border rounded-xl transition-all duration-200 ${shareType === 'audio' ? 'bg-[#5C4531] text-white border-[#5C4531] shadow-md' : 'bg-white text-[#523B24] border-[#D9C6AF] hover:bg-[#F5EFEB]'}`}>🎵 Bounce Track</button>
              </div>

              {shareType === 'post' && (
                <div className="border-t border-[#E3D4C1] pt-4 space-y-3 animate-fadeIn">
                  <textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder="Publish structural notes or track updates directly into the network pipeline..." className="w-full text-xs p-4 bg-white border border-[#D9C6AF] rounded-2xl focus:outline-none focus:border-[#5C4531] min-h-[85px] resize-none text-[#3D3126] font-medium shadow-inner" />
                  <div className="flex justify-end"><button onClick={handleCreatePost} disabled={publishingPost || !postContent.trim()} className="px-5 py-2 bg-[#5C4531] text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-md">Commit Broadcast</button></div>
                </div>
              )}

              {shareType === 'audio' && (
                <form onSubmit={handlePublishTrack} className="border-t border-[#E3D4C1] pt-4 space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-[#967655] uppercase mb-1">Track Master Title</label>
                      <input required type="text" placeholder="e.g., Acoustic Punjabi Trap Arrangement" className="w-full border border-[#D9C6AF] text-xs p-3 rounded-xl bg-white focus:outline-none focus:border-[#5C4531] font-semibold" value={trackTitle} onChange={(e) => setTrackTitle(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-[#967655] uppercase mb-1">Genre</label>
                      <select className="w-full border border-[#D9C6AF] text-xs p-3 rounded-xl bg-white focus:outline-none font-semibold text-[#3D3126]" value={trackGenre} onChange={(e) => setTrackGenre(e.target.value)}>
                        <option value="Punjabi">Punjabi</option>
                        <option value="Trap Loop">Trap Loop</option>
                        <option value="LoFi Sample">LoFi Sample</option>
                        <option value="Full Track Beat">Full Track Beat</option>
                        <option value="Stem Track Layer">Stem Track Layer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-[#967655] uppercase mb-1">BPM</label>
                      <select className="w-full border border-[#D9C6AF] text-xs p-3 rounded-xl bg-white focus:outline-none font-semibold text-[#3D3126]" value={trackBpm} onChange={(e) => setTrackBpm(e.target.value)}>
                        <option value="80">80 BPM</option>
                        <option value="90">90 BPM</option>
                        <option value="120">120 BPM</option>
                        <option value="140">140 BPM</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-[#967655] uppercase mb-1">Scale Key</label>
                      <select className="w-full border border-[#D9C6AF] text-xs p-3 rounded-xl bg-white focus:outline-none font-semibold text-[#3D3126]" value={trackKey} onChange={(e) => setTrackKey(e.target.value)}>
                        <option value="F# Minor">F# Minor</option>
                        <option value="C Major">C Major</option>
                        <option value="A Minor">A Minor</option>
                        <option value="E Minor">E Minor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-[#967655] uppercase mb-1">Mood</label>
                      <select className="w-full border border-[#D9C6AF] text-xs p-3 rounded-xl bg-white focus:outline-none font-semibold text-[#3D3126]" value={trackMood} onChange={(e) => setTrackMood(e.target.value)}>
                        <option value="Dark">Dark</option>
                        <option value="Chill">Chill</option>
                        <option value="Energetic">Energetic</option>
                        <option value="Hypnotic">Hypnotic</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black text-[#967655] uppercase mb-1">Select Master Audio Source</label>
                      <input type="file" accept="audio/*" onChange={(e) => { if(e.target.files?.[0]) setSelectedFile(e.target.files[0]); }} className="w-full text-xs file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-[#F5EFEB] file:text-[#5C4531] file:text-[10px] file:font-black file:uppercase file:tracking-widest cursor-pointer text-gray-500" required />
                    </div>
                  </div>
                  <div className="flex justify-end border-t border-[#E3D4C1] pt-3"><button type="submit" disabled={publishing} className="px-6 py-2.5 bg-[#5C4531] text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg">{publishing ? 'Bouncing Masters...' : 'Publish Audio Drop'}</button></div>
                </form>
              )}
            </div>

            {/* 👑 PREMIUM LOOP-PORTAL STYLED PERSONAL AUDIO CATALOG TRACKS */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#967655] pl-1">🎸 Audio Vault Catalog</h3>
              
              {mySounds.length > 0 ? (
                mySounds.map((track) => {
                  const isLiked = !!likedItems[track.id];
                  return (
                    <div key={track.id} className="bg-[#1C1A17] text-[#FAF6F0] rounded-2xl border border-[#38332B] p-5 shadow-xl flex flex-col gap-4 transition hover:border-[#52493E] animate-fadeIn">
                      
                      {/* Top Meta Layout Layer */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 min-w-0">
                          <h4 className="font-black text-lg tracking-tight font-serif truncate text-amber-50">
                            {track.title}
                          </h4>
                          <div className="flex flex-wrap gap-2 pt-1 text-[10px] font-black uppercase tracking-wider">
                            <span className="bg-[#A37B55] text-white px-2 py-0.5 rounded-md shadow-sm">{track.genre}</span>
                            <span className="bg-[#2E2922] text-amber-400 px-2 py-0.5 rounded-md border border-[#423C32]">{track.bpm} BPM</span>
                            <span className="text-[#A69580] pt-0.5">{track.key || 'No Key'} • {track.mood}</span>
                          </div>
                        </div>

                        {/* Right side operations actions deck */}
                        <div className="flex gap-1">
                          <button 
                            type="button"
                            onClick={() => {
                              setEditingTrack(track);
                              setEditTrackForm({ title: track.title, genre: track.genre, bpm: track.bpm || '140', key: track.key || 'F# Minor', mood: track.mood || 'Dark' });
                              window.scrollTo({ top: 350, behavior: 'smooth' });
                            }}
                            className="bg-[#2E2922] hover:bg-[#3D372E] text-amber-300 font-bold px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider border border-[#423C32] transition shadow"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDeleteTrack(track.id, track.audio_url)}
                            className="bg-red-950/40 hover:bg-red-900 text-red-400 font-bold px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider border border-red-900/30 transition shadow"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>

                      {/* Waveform graphic visualization simulator mapping strip */}
                      <div className="h-14 w-full bg-gradient-to-r from-[#29231D] via-[#120F0D] to-[#29231D] rounded-xl flex items-center justify-between px-3 relative border border-[#2E2922] overflow-hidden group/wave select-none">
                        <div className="absolute inset-0 opacity-[0.25] flex items-center justify-around px-2 gap-0.5 pointer-events-none">
                          <div className="h-6 w-1 bg-amber-500 rounded"></div><div className="h-10 w-1 bg-amber-500 rounded"></div><div className="h-4 w-1 bg-amber-500 rounded"></div><div className="h-12 w-1 bg-amber-400 rounded"></div><div className="h-8 w-1 bg-amber-400 rounded"></div><div className="h-5 w-1 bg-amber-400 rounded"></div><div className="h-9 w-1 bg-amber-500 rounded"></div><div className="h-3 w-1 bg-amber-500 rounded"></div><div className="h-11 w-1 bg-amber-500 rounded"></div><div className="h-7 w-1 bg-amber-400 rounded"></div><div className="h-10 w-1 bg-amber-400 rounded"></div><div className="h-4 w-1 bg-amber-500 rounded"></div><div className="h-6 w-1 bg-amber-500 rounded"></div>
                        </div>
                        <audio controls src={track.audio_url} onPlay={registerAudioPlayback} className="w-full h-8 accent-amber-500 relative z-10 invert opacity-90 group-hover/wave:opacity-100 transition" />
                      </div>

                      {/* Footer interaction blocks */}
                      <div className="flex items-center gap-4 pt-1 text-[11px] font-black uppercase tracking-wider text-[#A69580] select-none border-t border-[#2E2922]">
                        <button 
                          type="button" 
                          onClick={() => toggleLocalLike(track.id)}
                          className={`flex items-center gap-1.5 transition ${isLiked ? 'text-red-500 scale-105' : 'hover:text-[#FAF6F0]'}`}
                        >
                          {isLiked ? '❤️ Liked' : '🤍 Like'} <span className="bg-[#2E2922] px-1.5 py-0.5 rounded text-[10px] text-gray-400">{isLiked ? 1 : 0}</span>
                        </button>
                        <div>💬 Comments <span className="bg-[#2E2922] px-1.5 py-0.5 rounded text-[10px] text-gray-400">0</span></div>
                        <div className="ml-auto text-[10px] text-gray-500 font-bold">📦 Stems Included</div>
                      </div>

                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-[#A69580] italic py-5 text-center border-2 border-dashed border-[#D9CBAF] rounded-2xl bg-[#FFFDFB]">Your sound channels are empty.</div>
              )}
            </div>

            <div className="bg-[#FFFDFB] border border-[#DCD0BE] rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#967655]">📝 Workspace Micro-Logs</h3>
              <div className="space-y-3">
                {myPosts.length > 0 ? (
                  myPosts.map((post) => (
                    <div key={post.id} className="bg-gradient-to-r from-white to-[#FAF6F0] border border-[#EBE3D5] p-5 rounded-2xl text-xs flex flex-col sm:flex-row justify-between items-start gap-4 relative shadow-sm hover:border-[#D9CBAF] transition">
                      <div className="space-y-2.5 flex-1 min-w-0">
                        <p className="font-semibold text-[#3D3126] whitespace-pre-wrap leading-relaxed text-sm font-sans">{post.content}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#967655] select-none bg-[#F5EFEB] px-2.5 py-1 rounded-md border border-[#D9C6AF] w-max shadow-inner">
                          🗓️ Broadcast Sync: {formatExactDateTime(post.created_at)}
                        </p>
                      </div>
                      
                      <button 
                        type="button"
                        onClick={() => handleDeletePost(post.id)}
                        className="text-[#A69580] hover:text-red-700 transition font-black text-lg sm:static absolute top-4 right-4"
                        title="Delete broadcast block"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-[#A69580] italic py-4 text-center border-2 border-dashed border-[#D9CBAF] rounded-2xl bg-[#FFFDFB]">No active timeline updates published yet.</div>
                )}
              </div>
            </div>
          </>
        )}

        {/* =================================================================== */}
        {/* VIEW MODE B: GLOBAL TIMELINE LOOP-PORTAL MATRIX TIMELINE FEED */}
        {viewMode === 'community' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-gradient-to-r from-[#423122] via-[#5C4531] to-[#735943] border border-[#423122] rounded-3xl p-6 shadow-2xl text-[#FFF9F2] relative overflow-hidden">
              <h3 className="text-base font-black uppercase tracking-widest text-[#FFFDFB] mb-1 font-serif">🌐 Communal Network Stream</h3>
              <p className="text-xs text-[#EBE3D5] font-semibold tracking-wide">Monitoring incoming audio drops, arrangement stencils, and telemetry records.</p>
            </div>

            {communityFeed.length > 0 ? (
              <div className="space-y-4">
                {communityFeed.map((feedItem, index) => {
                  const itemCreator = feedItem.profiles || {};
                  const creatorInitials = String(itemCreator.display_name || itemCreator.username || 'P').charAt(0).toUpperCase();
                  const isMyAsset = user && feedItem.profile_id === user.id;
                  const isLiked = !!likedItems[feedItem.id];

                  return (
                    <div key={`${feedItem.id}-${index}`} className="bg-[#FFFDFB] border border-[#DCD0BE] rounded-3xl p-6 shadow-xl space-y-4 hover:shadow-2xl transition duration-200">
                      
                      {/* Profile Context Bar */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-[#3D2C1E] text-white rounded-xl overflow-hidden border-2 border-[#FFFDFB] flex items-center justify-center text-base font-bold shadow-lg shrink-0">
                            {itemCreator.avatar_url ? <img src={itemCreator.avatar_url} className="w-full h-full object-cover" alt="Avatar" /> : <span className="font-serif italic text-amber-50">{creatorInitials}</span>}
                          </div>
                          <div>
                            <div className="text-sm font-black text-[#261E17] hover:text-[#A37B55] cursor-pointer font-serif" onClick={() => router.push(`/profile/${itemCreator.id}`)}>
                              {itemCreator.display_name || `@${itemCreator.username}`}
                            </div>
                            <div className="text-[10px] text-[#A69580] font-black uppercase tracking-widest mt-0.5 select-none">
                              🛰️ Telemetry Sync: {formatExactDateTime(feedItem.created_at)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-black tracking-widest uppercase px-2.5 py-1 rounded-md border ${feedItem.itemType === 'audio' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                            {feedItem.itemType === 'audio' ? '🎵 Audio Bounce' : '✍️ Broadcast'}
                          </span>
                          
                          {isMyAsset && feedItem.itemType === 'post' && (
                            <button 
                              type="button"
                              onClick={() => handleDeletePost(feedItem.id)}
                              className="text-[#A69580] hover:text-red-600 transition ml-1 font-black text-sm"
                              title="Delete Entry Node"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Loop Content Block */}
                      <div className="text-xs leading-relaxed text-[#3D3126]">
                        {feedItem.itemType === 'post' ? (
                          <p className="whitespace-pre-wrap font-semibold text-[#4A3929] text-sm bg-gradient-to-r from-[#FAF8F5] to-white p-4 rounded-2xl border border-[#ECE3D5] shadow-inner">{feedItem.content}</p>
                        ) : (
                          
                          /* Loop Portal Dark Architecture Row Card Card Layout */
                          <div className="bg-[#1C1A17] text-[#FAF6F0] rounded-2xl border border-[#38332B] p-5 shadow-2xl space-y-4">
                            
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <div className="space-y-1">
                                <h4 className="font-black text-base font-serif text-amber-50">💿 {feedItem.title}</h4>
                                <div className="flex flex-wrap gap-1.5 pt-1 text-[9px] font-black uppercase tracking-wider">
                                  <span className="bg-[#A37B55] text-white px-2 py-0.5 rounded-md">{feedItem.genre}</span>
                                  <span className="bg-[#2E2922] text-amber-400 px-2 py-0.5 rounded-md border border-[#423C32]">{feedItem.bpm} BPM</span>
                                  <span className="text-[#A69580] pt-0.5">{feedItem.key} • {feedItem.mood}</span>
                                </div>
                              </div>
                              
                              {isMyAsset && (
                                <div className="flex gap-1 shrink-0 self-end sm:self-auto">
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      setViewMode('personal');
                                      setEditingTrack(feedItem);
                                      setEditTrackForm({ title: feedItem.title, genre: feedItem.genre, bpm: feedItem.bpm || '140', key: feedItem.key || 'F# Minor', mood: feedItem.mood || 'Dark' });
                                      window.scrollTo({ top: 350, behavior: 'smooth' });
                                    }}
                                    className="p-1.5 bg-[#2E2922] text-amber-300 rounded-lg border border-[#423C32] text-xs font-bold transition hover:bg-[#3D372E]"
                                    title="Edit Attributes"
                                  >
                                    ✏️
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => handleDeleteTrack(feedItem.id, feedItem.audio_url)}
                                    className="p-1.5 bg-red-950/40 text-red-400 rounded-lg border border-red-900/30 text-xs font-bold transition hover:bg-red-900/60"
                                    title="Delete Master Track"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Waveform graphic visualization simulator mapping strip inside feed */}
                            <div className="h-14 w-full bg-gradient-to-r from-[#29231D] via-[#120F0D] to-[#29231D] rounded-xl flex items-center justify-between px-3 relative border border-[#2E2922] overflow-hidden group/wave select-none">
                              <div className="absolute inset-0 opacity-[0.25] flex items-center justify-around px-2 gap-0.5 pointer-events-none">
                                <div className="h-4 w-1 bg-amber-500 rounded"></div><div className="h-8 w-1 bg-amber-500 rounded"></div><div className="h-11 w-1 bg-amber-400 rounded"></div><div className="h-6 w-1 bg-amber-400 rounded"></div><div className="h-9 w-1 bg-amber-500 rounded"></div><div className="h-3 w-1 bg-amber-500 rounded"></div><div className="h-10 w-1 bg-amber-400 rounded"></div>
                              </div>
                              <audio controls src={feedItem.audio_url} onPlay={registerAudioPlayback} className="w-full h-8 accent-amber-500 relative z-10 invert opacity-90 group-hover/wave:opacity-100 transition" />
                            </div>

                            {/* Interactions footer split */}
                            <div className="flex items-center gap-4 pt-1 text-[11px] font-black uppercase tracking-wider text-[#A69580] select-none border-t border-[#2E2922]">
                              <button 
                                type="button" 
                                onClick={() => toggleLocalLike(feedItem.id)}
                                className={`flex items-center gap-1.5 transition ${isLiked ? 'text-red-500 scale-105' : 'hover:text-[#FAF6F0]'}`}
                              >
                                {isLiked ? '❤️ Liked' : '🤍 Like'} <span className="bg-[#2E2922] px-1.5 py-0.5 rounded text-[10px] text-gray-400">{isLiked ? 24 : 23}</span>
                              </button>
                              <div>💬 Comments <span className="bg-[#2E2922] px-1.5 py-0.5 rounded text-[10px] text-gray-400">2</span></div>
                              <div className="ml-auto text-[9px] text-[#A69580] bg-[#2E2922] border border-[#423C32] px-2 py-0.5 rounded font-bold uppercase tracking-widest shadow-inner">⚡ Download Loop</div>
                            </div>

                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-[#D9CBAF] rounded-3xl bg-white text-xs text-[#A69580] italic font-black uppercase tracking-widest">
                The timeline streaming channels are currently offline.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
