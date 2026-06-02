'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import OnboardingModal from '../components/OnboardingModal';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Profile Form State
  const [prodName, setProdName] = useState('');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [instagram, setInstagram] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Dashboard View State
  const [activeTab, setActiveTab] = useState<'library' | 'dashboard'>('library');
  const [isUploading, setIsUploading] = useState(false);
  const [sounds, setSounds] = useState<any[]>([]);
  const [mySounds, setMySounds] = useState<any[]>([]);

  // Sound Library Filters
  const [filterGenre, setFilterGenre] = useState('');
  const [filterBpm, setFilterBpm] = useState('');
  const [filterKey, setFilterKey] = useState('');

  // Audio Upload Form State
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
    const initializeApp = async () => {
      try {
        await checkUser();
        await fetchLibrary();
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          setUser(session.user);
          await checkProfile(session.user.id);
        } else {
          setUser(null);
          setHasProfile(false);
        }
      } catch (err) {
        console.error("Auth state change error:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      await checkProfile(session.user.id);
    }
  };

  const checkProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (data) {
        setHasProfile(true);
        setActiveTab('dashboard');
        await fetchMySounds(userId);
      } else {
        setHasProfile(false);
      }
    } catch (e) {
      console.error(e);
      setHasProfile(false);
    }
  };

  const fetchLibrary = async () => {
    try {
      const { data: soundsData, error: soundsError } = await supabase
        .from('sounds')
        .select('*');
        
      if (soundsError || !soundsData) {
        setSounds([]);
        return;
      }

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, producer_name');

      const joinedSounds = soundsData.map((sound: any) => {
        const matchProf = profilesData?.find(p => p.id === sound.user_id);
        return {
          ...sound,
          profiles: matchProf ? { producer_name: matchProf.producer_name } : null
        };
      });

      setSounds(joinedSounds);
    } catch (err) {
      console.error(err);
      setSounds([]);
    }
  };

  const fetchMySounds = async (userId: string) => {
    const { data } = await supabase.from('sounds').select('*').eq('user_id', userId);
    if (data) setMySounds(data);
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !country || selectedGenres.length === 0) {
      alert('Please fill out all required fields');
      return;
    }

    const { error } = await supabase.from('profiles').insert({
      id: user.id,
      producer_name: prodName,
      bio,
      country,
      genres: selectedGenres,
      instagram_url: instagram,
      profile_photo_url: avatarUrl || 'https://via.placeholder.com/150'
    });

    if (error) {
      alert(error.message);
    } else {
      setHasProfile(true);
      setActiveTab('dashboard');
      fetchMySounds(user.id);
    }
  };

  const handleAudioUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile || !trackTitle || !trackGenre) {
      alert('File, Title, and Genre are required.');
      return;
    }

    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave'];
    if (!allowedTypes.includes(audioFile.type)) {
      alert('Invalid format! Please upload a valid MP3 or WAV file.');
      return;
    }

    setIsUploading(true);
    const fileExt = audioFile.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('audio-tracks')
      .upload(filePath, audioFile);

    if (uploadError) {
      alert(uploadError.message);
      setIsUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('audio-tracks').getPublicUrl(filePath);

    const { error: dbError } = await supabase.from('sounds').insert({
      user_id: user.id,
      title: trackTitle,
      genre: trackGenre,
      bpm: trackBpm ? parseInt(trackBpm) : null,
      key: trackKey,
      time_signature: trackTimeSig,
      description: trackDesc,
      tags: trackTags.split(',').map(t => t.trim()),
      file_url: publicUrl
    });

    setIsUploading(false);
    if (dbError) {
      alert(dbError.message);
    } else {
      alert('Track uploaded successfully!');
      setTrackTitle('');
      setAudioFile(null);
      fetchLibrary();
      fetchMySounds(user.id);
    }
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-[#F5F5F7]">Loading Producer Saab...</div>;
  }

  // FLOW 1: Unauthenticated Visitor -> Render Landing Page with Sound Library
  if (!user) {
    return (
      <div className="min-h-screen bg-white text-[#111111]">
        <header className="p-6 flex justify-between items-center max-w-6xl mx-auto border-b border-gray-100">
          <h1 className="text-xl font-black uppercase tracking-wider text-[#C5A880]">Producer Saab</h1>
          <button onClick={() => setIsAuthModalOpen(true)} className="bg-[#111111] text-white font-bold text-sm px-6 py-2.5 rounded-xl">
            Join Community / Log In
          </button>
        </header>

        <main className="max-w-6xl mx-auto p-8">
          <div className="text-center py-12">
            <h2 className="text-4xl font-extrabold mb-4">The Ultimate Hub for Music Producers</h2>
            <p className="text-gray-500 max-w-xl mx-auto mb-8">Share beats, find custom project assets, and network with creators across the globe.</p>
          </div>

          <h3 className="text-2xl font-bold mb-4">🎵 Public Sound Library</h3>
          {renderLibraryFilter()}
          {renderLibraryGrid(sounds)}
        </main>
        <OnboardingModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </div>
    );
  }

  // FLOW 2: Authenticated but has NO profile -> Force Create Profile Page
  if (user && !hasProfile) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-6">
        <div className="bg-white max-w-lg w-full rounded-3xl p-8 shadow-xl">
          <h2 className="text-2xl font-black text-center mb-1">Create Your Producer Profile</h2>
          <p className="text-gray-400 text-sm text-center mb-6">Complete your onboarding profile setup to access your producer command center.</p>
          
          <form onSubmit={handleCreateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Producer Name *</label>
              <input type="text" value={prodName} onChange={e => setProdName(e.target.value)} required className="w-full bg-[#F5F5F7] p-3 rounded-xl border border-transparent focus:border-gray-300 outline-none text-sm text-black" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Profile Image URL</label>
              <input type="text" placeholder="https://..." value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} className="w-full bg-[#F5F5F7] p-3 rounded-xl border border-transparent focus:border-gray-300 outline-none text-sm text-black" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="w-full bg-[#F5F5F7] p-3 rounded-xl border border-transparent focus:border-gray-300 outline-none text-sm text-black" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Country *</label>
              <input type="text" value={country} onChange={e => setCountry(e.target.value)} required className="w-full bg-[#F5F5F7] p-3 rounded-xl border border-transparent focus:border-gray-300 outline-none text-sm text-black" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Genres (Select Multiple) *</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {genresList.map(g => (
                  <button type="button" key={g} onClick={() => toggleGenre(g)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selectedGenres.includes(g) ? 'bg-[#C5A880] text-white border-transparent' : 'bg-gray-100 text-gray-600 border-transparent'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instagram Link (Optional)</label>
              <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} className="w-full bg-[#F5F5F7] p-3 rounded-xl border border-transparent focus:border-gray-300 outline-none text-sm text-black" />
            </div>
            <button type="submit" className="w-full bg-black text-white font-bold p-3.5 rounded-xl text-sm transition-all hover:bg-gray-800">
              Save Profile & Launch Dashboard →
            </button>
          </form>
        </div>
      </div>
    );
  }

  // FLOW 3: Authenticated AND Has Profile -> Load Live Dashboard Platform
  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#111111] flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white p-6 border-r border-gray-200 flex flex-col justify-between">
        <div>
          <h2 className="text-lg font-black uppercase text-[#C5A880] mb-8">Producer Center</h2>
          <nav className="space-y-2">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left p-3 rounded-xl text-sm font-bold flex items-center ${activeTab === 'dashboard' ? 'bg-[#111111] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              🎛️ Producer Dashboard
            </button>
            <button onClick={() => setActiveTab('library')} className={`w-full text-left p-3 rounded-xl text-sm font-bold flex items-center ${activeTab === 'library' ? 'bg-[#111111] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              🌍 Global Library
            </button>
          </nav>
        </div>
        <button onClick={() => supabase.auth.signOut()} className="w-full bg-red-50 hover:bg-red-100 text-red-600 p-3 rounded-xl text-xs font-bold">
          Sign Out Account
        </button>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'dashboard' ? (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black">Welcome back, {prodName || 'Producer'}</h2>
                <p className="text-gray-400 text-xs">With your dashboard configured, your layout is locked down.</p>
              </div>
              <span className="bg-gray-100 px-4 py-1.5 rounded-full text-xs font-bold text-gray-500">📍 {country}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upload Form View */}
              <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-black mb-4">📤 Upload New Audio</h3>
                <form onSubmit={handleAudioUpload} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase">Audio File (MP3/WAV) *</label>
                    <input type="file" accept="audio/*" onChange={e => setAudioFile(e.target.files?.[0] || null)} required className="w-full text-xs mt-1" />
                  </div>
                  <input type="text" placeholder="Title *" value={trackTitle} onChange={e => setTrackTitle(e.target.value)} required className="w-full bg-[#F5F5F7] p-2.5 rounded-lg text-xs outline-none text-black" />
                  <input type="text" placeholder="Genre *" value={trackGenre} onChange={e => setTrackGenre(e.target.value)} required className="w-full bg-[#F5F5F7] p-2.5 rounded-lg text-xs outline-none text-black" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" placeholder="BPM" value={trackBpm} onChange={e => setTrackBpm(e.target.value)} className="w-full bg-[#F5F5F7] p-2.5 rounded-lg text-xs outline-none text-black" />
                    <input type="text" placeholder="Key (e.g., C Min)" value={trackKey} onChange={e => setTrackKey(e.target.value)} className="w-full bg-[#F5F5F7] p-2.5 rounded-lg text-xs outline-none text-black" />
                  </div>
                  <input type="text" placeholder="Time Signature (e.g. 4/4)" value={trackTimeSig} onChange={e => setTrackTimeSig(e.target.value)} className="w-full bg-[#F5F5F7] p-2.5 rounded-lg text-xs outline-none text-black" />
                  <textarea placeholder="Description" value={trackDesc} onChange={e => setTrackDesc(e.target.value)} rows={2} className="w-full bg-[#F5F5F7] p-2.5 rounded-lg text-xs outline-none text-black" />
                  <input type="text" placeholder="Tags (comma separated)" value={trackTags} onChange={e => setTrackTags(e.target.value)} className="w-full bg-[#F5F5F7] p-2.5 rounded-lg text-xs outline-none text-black" />
                  <button type="submit" disabled={isUploading} className="w-full bg-black text-white p-3 rounded-xl text-xs font-bold transition-all hover:bg-gray-800 disabled:bg-gray-400">
                    {isUploading ? 'Uploading Engine Active...' : 'Upload Audio Track'}
                  </button>
                </form>
              </div>

              {/* My Uploads Inventory List */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-black mb-4">🗄️ My Uploaded Portfolio</h3>
                {mySounds.length === 0 ? (
                  <p className="text-gray-400 text-xs">No audio files tracked yet. Submit your first one to populate your dashboard.</p>
                ) : (
                  <div className="space-y-2">
                    {mySounds.map((s: any) => (
                      <div key={s.id} className="p-3 bg-[#F5F5F7] rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold">{s.title}</p>
                          <p className="text-[10px] text-gray-400">{s.genre} • {s.bpm || 'No'} BPM • Key: {s.key || 'N/A'}</p>
                        </div>
                        <audio src={s.file_url} controls className="h-8 max-w-xs" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-black mb-1">Global Music Directory</h2>
            <p className="text-gray-400 text-xs mb-6">Discover music, listen directly to preview uploads, and filter parameters natively.</p>
            {renderLibraryFilter()}
            {renderLibraryGrid(sounds)}
          </div>
        )}
      </main>
    </div>
  );

  function renderLibraryFilter() {
    return (
      <div className="grid grid-cols-3 gap-3 bg-white p-4 rounded-xl mb-6 border border-gray-200">
        <input type="text" placeholder="Filter by Genre" value={filterGenre} onChange={e => setFilterGenre(e.target.value)} className="bg-[#F5F5F7] p-2 rounded-lg text-xs outline-none text-black" />
        <input type="text" placeholder="Filter by BPM" value={filterBpm} onChange={e => setFilterBpm(e.target.value)} className="bg-[#F5F5F7] p-2 rounded-lg text-xs outline-none text-black" />
        <input type="text" placeholder="Filter by Key" value={filterKey} onChange={e => setFilterKey(e.target.value)} className="bg-[#F5F5F7] p-2 rounded-lg text-xs outline-none text-black" />
      </div>
    );
  }

  function renderLibraryGrid(itemsToRender: any[]) {
    const filtered = itemsToRender.filter(s => {
      const matchGenre = filterGenre ? s.genre.toLowerCase().includes(filterGenre.toLowerCase()) : true;
      const matchBpm = filterBpm ? s.bpm?.toString() === filterBpm : true;
      const matchKey = filterKey ? s.key?.toLowerCase().includes(filterKey.toLowerCase()) : true;
      return matchGenre && matchBpm && matchKey;
    });

    if (filtered.length === 0) {
      return <p className="text-gray-400 text-xs">No audio resources match your active search filters.</p>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((s: any) => (
          <div key={s.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-extrabold text-sm text-black">{s.title}</h4>
                <p className="text-xs text-gray-400">By {s.profiles?.producer_name || 'Verified Producer'}</p>
              </div>
              <span className="bg-[#C5A880]/10 text-[#C5A880] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">{s.genre}</span>
            </div>
            
            <div className="flex gap-4 text-[11px] text-gray-500 font-medium">
              <span>🥁 {s.bpm ? `${s.bpm} BPM` : 'Variable BPM'}</span>
              <span>🎹 Key: {s.key || 'N/A'}</span>
              <span>⏱️ {s.time_signature}</span>
            </div>

            <audio src={s.file_url} controls className="w-full h-9 mt-2" />
          </div>
        ))}
      </div>
    );
  }
}
