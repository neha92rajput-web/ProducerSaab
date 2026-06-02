'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import OnboardingModal from '../components/OnboardingModal';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [runtimeError, setRuntimeError] = useState('');

  // Profile Onboarding Form State Properties
  const [prodName, setProdName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [instagram, setInstagram] = useState('');
  const [youtube, setYoutube] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Platform Dashboard Views Matrices
  const [activeTab, setActiveTab] = useState<'library' | 'dashboard' | 'onboarding' | 'edit-profile'>('library');
  const [isUploading, setIsUploading] = useState(false);
  const [sounds, setSounds] = useState<any[]>([]);
  const [mySounds, setMySounds] = useState<any[]>([]);

  // Filtering Parameters
  const [filterGenre, setFilterGenre] = useState('');
  const [filterBpm, setFilterBpm] = useState('');
  const [filterKey, setFilterKey] = useState('');

  // Audio Processing Forms State Properties
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [trackTitle, setTrackTitle] = useState('');
  const [trackGenre, setTrackGenre] = useState('');
  const [trackBpm, setTrackBpm] = useState('');
  const [trackKey, setTrackKey] = useState('');
  const [trackTimeSig, setTrackTimeSig] = useState('4/4');
  const [trackDesc, setTrackDesc] = useState('');
  const [trackTags, setTrackTags] = useState('');

  const genresList = ['Hip Hop', 'Trap', 'Boom Bap', 'R&B', 'House', 'Techno', 'Pop', 'Lo-Fi', 'Drill'];

  useEffect(() => {
    setMounted(true);
    
    const initializeSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          await evaluateProfileState(session.user.id);
        }
        await fetchGlobalLibrary();
      } catch (err: any) {
        setRuntimeError(err.message || 'Error configuring data arrays.');
        console.error('App init crash logs:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      if (session?.user) {
        setUser(session.user);
        await evaluateProfileState(session.user.id);
      } else {
        setUser(null);
        setHasProfile(false);
        setActiveTab('library');
      }
      setLoading(false);
    });

    return () => {
      if (authListener?.subscription) authListener.subscription.unsubscribe();
    };
  }, []);

  const evaluateProfileState = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (error) throw error;
      
      if (data) {
        setHasProfile(true);
        setProdName(data.producer_name);
        setUsername(data.username);
        setBio(data.bio || '');
        setCountry(data.country);
        setSelectedGenres(data.genres || []);
        setInstagram(data.instagram_url || '');
        setYoutube(data.youtube_url || '');
        setWebsite(data.website_url || '');
        setAvatarUrl(data.profile_photo_url || '');
        setActiveTab('dashboard');
        await fetchPersonalUploads(userId);
      } else {
        setHasProfile(false);
        setActiveTab('onboarding');
      }
    } catch (err: any) {
      console.error('Profile assertion tracking caught:', err);
      setRuntimeError('Could not verify profile context metadata.');
    }
  };

  const fetchGlobalLibrary = async () => {
    try {
      const { data: soundsData, error: soundsError } = await supabase.from('sounds').select('*').order('created_at', { ascending: false });
      if (soundsError) throw soundsError;

      const { data: profilesData, error: profilesError } = await supabase.from('profiles').select('id, producer_name');
      if (profilesError) throw profilesError;

      const structured = (soundsData || []).map((sound: any) => {
        const match = profilesData?.find(p => p.id === sound.user_id);
        return { ...sound, profiles: match ? { producer_name: match.producer_name } : null };
      });

      setSounds(structured);
    } catch (err: any) {
      console.error('Error fetching sounds directory:', err);
    }
  };

  const fetchPersonalUploads = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('sounds').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (error) throw error;
      setMySounds(data || []);
    } catch (err: any) {
      console.error('Error synchronizing core uploads list:', err);
    }
  };

  const executeProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !username.trim() || !country.trim() || selectedGenres.length === 0) {
      alert('Please fill out all required attributes marked (*).');
      return;
    }

    setLoading(true);
    const profilePayload = {
      id: user.id,
      producer_name: prodName,
      username: username.replace('@', '').trim(),
      bio,
      country,
      genres: selectedGenres,
      instagram_url: instagram,
      youtube_url: youtube,
      website_url: website,
      profile_photo_url: avatarUrl || 'https://via.placeholder.com/150',
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('profiles').upsert(profilePayload);
    if (error) {
      alert(`Profile processing rejected: ${error.message}`);
      setLoading(false);
    } else {
      setHasProfile(true);
      setActiveTab('dashboard');
      await fetchPersonalUploads(user.id);
      await fetchGlobalLibrary();
      setLoading(false);
    }
  };

  const executeAudioUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile || !trackTitle.trim() || !trackGenre.trim() || !trackBpm || !trackKey.trim()) {
      alert('All primary audio tracking fields are explicitly required.');
      return;
    }

    const typeVerification = audioFile.name.split('.').pop()?.toLowerCase();
    if (typeVerification !== 'mp3' && typeVerification !== 'wav') {
      alert('Only WAV and MP3 format types are allowed.');
      return;
    }

    setIsUploading(true);
    try {
      const hashName = `${user.id}-${Date.now()}.${typeVerification}`;
      const assetPath = `tracks/${hashName}`;

      const { error: storageError } = await supabase.storage.from('audio-tracks').upload(assetPath, audioFile);
      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage.from('audio-tracks').getPublicUrl(assetPath);

      const { error: databaseInsertError } = await supabase.from('sounds').insert({
        user_id: user.id,
        title: trackTitle,
        genre: trackGenre,
        bpm: parseInt(trackBpm),
        musical_key: trackKey,
        time_signature: trackTimeSig,
        description: trackDesc,
        tags: trackTags.split(',').map(tag => tag.trim()).filter(Boolean),
        file_url: publicUrl
      });

      if (databaseInsertError) throw databaseInsertError;

      alert('Audio file processed and cataloged live!');
      setTrackTitle('');
      setTrackBpm('');
      setTrackKey('');
      setTrackDesc('');
      setTrackTags('');
      setAudioFile(null);
      
      const fileInput = document.getElementById('audio-upload-field') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      await fetchPersonalUploads(user.id);
      await fetchGlobalLibrary();
    } catch (err: any) {
      alert(`Upload routing failure detected: ${err.message}`);
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F7] p-4 text-center">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-[#C5A880] rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-semibold text-gray-600">Syncing Engine Security Modules...</p>
      </div>
    );
  }

  // FLOW 1: Public Base Visitor Matrix Configuration View
  if (!user && activeTab === 'library') {
    return (
      <div className="min-h-screen bg-white text-[#111111]">
        {runtimeError && <div className="bg-red-500 text-white p-3 text-center text-xs font-bold">{runtimeError}</div>}
        <header className="p-6 flex justify-between items-center max-w-6xl mx-auto border-b border-gray-100">
          <h1 className="text-xl font-black uppercase tracking-wider text-[#C5A880]">Producer Saab</h1>
          <button onClick={() => setIsAuthModalOpen(true)} className="bg-[#111111] text-white font-bold text-sm px-6 py-2.5 rounded-xl cursor-pointer">
            Join Platform Center
          </button>
        </header>
        <main className="max-w-6xl mx-auto p-8">
          <div className="text-center py-12">
            <h2 className="text-4xl font-extrabold mb-3">Professional Sound Assets Gateway</h2>
            <p className="text-gray-400 max-w-xl mx-auto text-sm mb-6">Connect, upload samples, and audit production metadata live.</p>
          </div>
          {renderDirectoryInterface()}
        </main>
        <OnboardingModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  // FLOW 2: Force Profile Build Wizard 
  if (user && (!hasProfile || activeTab === 'onboarding')) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-6">
        <div className="bg-white max-w-xl w-full rounded-3xl p-8 shadow-xl border border-gray-100">
          <h2 className="text-2xl font-black mb-1">Onboarding Profile Architecture</h2>
          <p className="text-gray-400 text-xs mb-6">Complete configuration properties metadata before gaining dashboard clearance access.</p>
          <form onSubmit={executeProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Producer Name *</label>
                <input type="text" value={prodName} onChange={e => setProdName(e.target.value)} required className="w-full bg-[#F5F5F7] text-black text-xs p-3 rounded-xl border border-transparent focus:border-gray-300 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Unique Username *</label>
                <input type="text" placeholder="e.g. metro_boomin" value={username} onChange={e => setUsername(e.target.value)} required className="w-full bg-[#F5F5F7] text-black text-xs p-3 rounded-xl border border-transparent focus:border-gray-300 outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Country *</label>
                <input type="text" value={country} onChange={e => setCountry(e.target.value)} required className="w-full bg-[#F5F5F7] text-black text-xs p-3 rounded-xl border border-transparent focus:border-gray-300 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Profile Avatar URL</label>
                <input type="text" placeholder="https://..." value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} className="w-full bg-[#F5F5F7] text-black text-xs p-3 rounded-xl border border-transparent focus:border-gray-300 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Select Core Genres *</label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {genresList.map(g => (
                  <button type="button" key={g} onClick={() => setSelectedGenres(prev => prev.includes(g) ? prev.filter(item => item !== g) : [...prev, g])} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${selectedGenres.includes(g) ? 'bg-[#C5A880] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Bio Description</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2} className="w-full bg-[#F5F5F7] text-black text-xs p-3 rounded-xl border border-transparent focus:border-gray-300 outline-none resize-none" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input type="text" placeholder="Instagram URL" value={instagram} onChange={e => setInstagram(e.target.value)} className="w-full bg-[#F5F5F7] text-black text-[11px] p-2.5 rounded-lg outline-none" />
              <input type="text" placeholder="YouTube URL" value={youtube} onChange={e => setYoutube(e.target.value)} className="w-full bg-[#F5F5F7] text-black text-[11px] p-2.5 rounded-lg outline-none" />
              <input type="text" placeholder="Website URL" value={website} onChange={e => setWebsite(e.target.value)} className="w-full bg-[#F5F5F7] text-black text-[11px] p-2.5 rounded-lg outline-none" />
            </div>
            <button type="submit" className="w-full bg-black text-white font-bold p-3 rounded-xl text-xs tracking-wide cursor-pointer mt-2 hover:bg-gray-800">
              Finalize Infrastructure Profile Layout →
            </button>
          </form>
        </div>
      </div>
    );
  }

  // FLOW 3: Locked Consolidated Authenticated Terminal Layout View Controller
  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#111111] flex">
      <aside className="w-64 bg-white p-6 border-r border-gray-200 flex flex-col justify-between shadow-sm">
        <div className="space-y-6">
          <div className="pb-4 border-b border-gray-100">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#C5A880]">Saab Workstation</h2>
            <p className="text-[10px] text-gray-400 truncate mt-0.5">@{username || 'guest_producer'}</p>
          </div>
          <nav className="space-y-1">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left p-3 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer ${activeTab === 'dashboard' ? 'bg-[#111111] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              🎛️ Command Dashboard
            </button>
            <button onClick={() => setActiveTab('library')} className={`w-full text-left p-3 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer ${activeTab === 'library' ? 'bg-[#111111] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              🌍 Global Directory
            </button>
            <button onClick={() => setActiveTab('edit-profile')} className={`w-full text-left p-3 rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer ${activeTab === 'edit-profile' ? 'bg-[#111111] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              ✏️ Modify Profile Settings
            </button>
          </nav>
        </div>
        <button onClick={async () => await supabase.auth.signOut()} className="w-full bg-red-50 text-red-600 hover:bg-red-100 p-3 rounded-xl text-xs font-bold cursor-pointer transition-all">
          Sign Out Account Session
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {runtimeError && <div className="bg-red-500 text-white p-3 rounded-xl text-xs font-bold mb-4">{runtimeError}</div>}
        
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black">Welcome back, {prodName}</h2>
                <p className="text-gray-400 text-xs mt-0.5">Console logs fully operational. Manage and catalog your dynamic format assets.</p>
              </div>
              <span className="bg-gray-100 px-4 py-1.5 rounded-full text-xs font-extrabold text-gray-500">📍 {country}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4 h-fit">
                <h3 className="text-sm font-black uppercase tracking-wider text-gray-400">📤 Catalog New Sound</h3>
                <form onSubmit={executeAudioUpload} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase">File Node (WAV/MP3) *</label>
                    <input id="audio-upload-field" type="file" accept=".mp3,.wav" onChange={e => setAudioFile(e.target.files?.[0] || null)} required className="w-full text-xs mt-1" />
                  </div>
                  <input type="text" placeholder="Asset Title *" value={trackTitle} onChange={e => setTrackTitle(e.target.value)} required className="w-full bg-[#F5F5F7] text-black text-xs p-2.5 rounded-lg outline-none" />
                  <input type="text" placeholder="Genre * (e.g. Trap)" value={trackGenre} onChange={e => setTrackGenre(e.target.value)} required className="w-full bg-[#F5F5F7] text-black text-xs p-2.5 rounded-lg outline-none" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" placeholder="BPM *" value={trackBpm} onChange={e => setTrackBpm(e.target.value)} required className="w-full bg-[#F5F5F7] text-black text-xs p-2.5 rounded-lg outline-none" />
                    <input type="text" placeholder="Key * (e.g. G# Min)" value={trackKey} onChange={e => setTrackKey(e.target.value)} required className="w-full bg-[#F5F5F7] text-black text-xs p-2.5 rounded-lg outline-none" />
                  </div>
                  <input type="text" placeholder="Time Signature (e.g. 4/4)" value={trackTimeSig} onChange={e => setTrackTimeSig(e.target.value)} className="w-full bg-[#F5F5F7] text-black text-xs p-2.5 rounded-lg outline-none" />
                  <textarea placeholder="Description notes..." value={trackDesc} onChange={e => setTrackDesc(e.target.value)} rows={2} className="w-full bg-[#F5F5F7] text-black text-xs p-2.5 rounded-lg outline-none resize-none" />
                  <input type="text" placeholder="Tags (comma separated)" value={trackTags} onChange={e => setTrackTags(e.target.value)} className="w-full bg-[#F5F5F7] text-black text-xs p-2.5 rounded-lg outline-none" />
                  <button type="submit" disabled={isUploading} className="w-full bg-[#111111] text-white p-3 rounded-xl text-xs font-bold cursor-pointer transition-all hover:bg-black disabled:bg-gray-300">
                    {isUploading ? 'Compiling Server Allocation Buffer...' : 'Deploy Audio Node Asset'}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-gray-400">🗄️ Managed Portfolios Library</h3>
                {mySounds.length === 0 ? (
                  <p className="text-gray-400 text-xs">No local assets registered in profile database array pipeline instances.</p>
                ) : (
                  <div className="space-y-2">
                    {mySounds.map((s: any) => (
                      <div key={s.id} className="p-4 bg-[#F5F5F7] rounded-xl flex items-center justify-between gap-4 text-xs">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-black truncate">{s.title}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{s.genre} • {s.bpm} BPM • Key Matrix: {s.musical_key} • {s.time_signature}</p>
                        </div>
                        <audio src={s.file_url} controls className="h-8 max-w-xs" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black">Global Index Directory Module</h2>
              <p className="text-gray-400 text-xs">Read-only public array catalog stream pipeline feed interfaces.</p>
            </div>
            {renderDirectoryInterface()}
          </div>
        )}

        {activeTab === 'edit-profile' && (
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm max-w-xl">
            <h2 className="text-lg font-black mb-1">Update Core Metadata Information</h2>
            <p className="text-gray-400 text-xs mb-6">Modify system profile structural records assigned to user token nodes contextually.</p>
            <form onSubmit={executeProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Producer Name" value={prodName} onChange={e => setProdName(e.target.value)} required className="bg-[#F5F5F7] p-3 rounded-xl text-xs outline-none text-black" />
                <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required className="bg-[#F5F5F7] p-3 rounded-xl text-xs outline-none text-black" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} required className="bg-[#F5F5F7] p-3 rounded-xl text-xs outline-none text-black" />
                <input type="text" placeholder="Avatar photo image link" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} className="bg-[#F5F5F7] p-3 rounded-xl text-xs outline-none text-black" />
              </div>
              <textarea placeholder="Biography details..." value={bio} onChange={e => setBio(e.target.value)} rows={2} className="w-full bg-[#F5F5F7] p-3 rounded-xl text-xs outline-none resize-none text-black" />
              <button type="submit" className="bg-[#111111] text-white px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer hover:bg-black">
                Update Security Profile Nodes
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );

  function renderDirectoryInterface() {
    const parsedGridItems = sounds.filter(s => {
      const gMatch = filterGenre ? s.genre?.toLowerCase().includes(filterGenre.toLowerCase()) : true;
      const bMatch = filterBpm ? s.bpm?.toString() === filterBpm : true;
      const kMatch = filterKey ? s.musical_key?.toLowerCase().includes(filterKey.toLowerCase()) : true;
      return gMatch && bMatch && kMatch;
    });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <input type="text" placeholder="🔍 Genre Parameter Filter" value={filterGenre} onChange={e => setFilterGenre(e.target.value)} className="bg-[#F5F5F7] p-2.5 rounded-lg text-xs outline-none text-black" />
          <input type="text" placeholder="🔍 BPM Filter Index" value={filterBpm} onChange={e => setFilterBpm(e.target.value)} className="bg-[#F5F5F7] p-2.5 rounded-lg text-xs outline-none text-black" />
          <input type="text" placeholder="🔍 Musical Key Filter" value={filterKey} onChange={e => setFilterKey(e.target.value)} className="bg-[#F5F5F7] p-2.5 rounded-lg text-xs outline-none text-black" />
        </div>

        {parsedGridItems.length === 0 ? (
          <p className="text-gray-400 text-xs text-center py-6 bg-white rounded-xl border">No tracks found matching your active filter criteria.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parsedGridItems.map((s: any) => (
              <div key={s.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-sm text-black">{s.title}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">By {s.profiles?.producer_name || 'Verified Member'}</p>
                  </div>
                  <span className="bg-[#C5A880]/10 text-[#C5A880] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">{s.genre}</span>
                </div>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500 font-medium bg-gray-50 p-2.5 rounded-lg">
                  <span>🥁 {s.bpm} BPM</span>
                  <span>🎹 Key: {s.musical_key}</span>
                  <span>⏱️ Signature: {s.time_signature}</span>
                  <span className="ml-auto text-[10px] text-gray-400">📅 {s.created_at ? new Date(s.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>

                <audio src={s.file_url} controls className="w-full h-9 mt-1" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}
