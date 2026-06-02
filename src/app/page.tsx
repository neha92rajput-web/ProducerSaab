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
    if (!prodName.trim() || !country.trim() || selectedGenres.length === 0) {
      alert('Please fill out all required attributes marked (*).');
      return;
    }

    setLoading(true);

    // Bypassing Fallback: Generates a username automatically if state string is missing
    const guaranteedUsername = username.trim() 
      ? username.replace('@', '').trim() 
      : `${prodName.toLowerCase().replace(/\s+/g, '_')}_${Math.floor(1000 + Math.random() * 9000)}`;

    const profilePayload = {
      id: user.id,
      producer_name: prodName,
      username: guaranteedUsername,
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
          <h2 className="text-2xl font
