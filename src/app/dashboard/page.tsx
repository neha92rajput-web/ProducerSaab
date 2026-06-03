'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const database = createClient(supabaseUrl, supabaseAnonKey);

export default function DashboardPage() {
  // Application Framework Sync State
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Profile Specific State Variables
  const [userHandle, setUserHandle] = useState('producer');
  const [producerRole, setProducerRole] = useState('Music Producer');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Hip Hop', 'Ambient']);
  const [instagramUrl, setInstagramUrl] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [soundcloudUrl, setSoundcloudUrl] = useState('');

  // Audio Upload Control State Variables
  const [trackTitle, setTrackTitle] = useState('');
  const [selectedTrackGenre, setSelectedTrackGenre] = useState('');
  const [trackBpm, setTrackBpm] = useState('');
  const [trackKey, setTrackKey] = useState('');
  const [instrumentType, setInstrumentType] = useState('');
  const [uploadStatus, setUploadStatus] = useState('Idle');
  const [audioUrl, setAudioUrl] = useState('');

  // Onboarding Setup Input States
  const [formRole, setFormRole] = useState('Music Producer');
  const [customRole, setCustomRole] = useState('');
  const [showCustomRole, setShowCustomRole] = useState(false);
  const [formInstagram, setFormInstagram] = useState('');
  const [formSpotify, setFormSpotify] = useState('');
  const [formSoundcloud, setFormSoundcloud] = useState('');
  const [formGenres, setFormGenres] = useState<string[]>([]);
  const [customGenreInput, setCustomGenreInput] = useState('');
  const [customGenresList, setCustomGenresList] = useState<string[]>([]);

  const DEFAULT_GENRES = [
    'Hip Hop', 'Trap', 'Drill', 'R&B', 'Electronic / EDM', 
    'Pop', 'Rock / Metal', 'Lo-Fi / Jazz', 'Boom Bap', 'Afrobeats', 'Ambient'
  ];

  useEffect(() => {
    async function fetchStudioProfile() {
      try {
        const { data: { user } } = await database.auth.getUser();
        if (!user) {
          setAppLoading(false);
          return;
        }
        setUserHandle(user.user_metadata?.username || 'saab');
        
        const { data: profile } = await database
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (profile && profile.onboarded) {
          setIsOnboarded(true);
          setProducerRole(profile.role || 'Music Producer');
          setSelectedGenres(profile.genres || ['Hip Hop']);
          setInstagramUrl(profile.instagram || '');
          setSpotifyUrl(profile.spotify || '');
          setSoundcloudUrl(profile.soundcloud || '');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setAppLoading(false);
      }
    }
    fetchStudioProfile();
  }, []);

  const toggleFormGenre = (genreName: string) => {
    if (formGenres.includes(genreName)) {
      setFormGenres(formGenres.filter((g) => g !== genreName));
    } else {
      setFormGenres([...formGenres, genreName]);
    }
  };

  const handleAddCustomGenre = (event: React.MouseEvent) => {
    event.preventDefault();
    const clean = customGenreInput.trim();
    if (clean && !customGenresList.includes(clean) && !DEFAULT_GENRES.includes(clean)) {
      setCustomGenresList([...customGenresList, clean]);
      setFormGenres([...formGenres, clean]);
      setCustomGenreInput('');
    }
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppLoading(true);
    try {
      const { data: { user } } = await database.auth.getUser();
      if (user) {
        const finalRole = showCustomRole ? customRole.trim() : formRole;
        
        await database.from('profiles').upsert({
          id: user.id,
          role: finalRole,
          genres: formGenres,
          instagram: formInstagram.trim(),
          spotify: formSpotify.trim(),
          soundcloud: formSoundcloud.trim(),
          onboarded: true
        });

        setProducerRole(finalRole);
        setSelectedGenres(formGenres);
        setInstagramUrl(formInstagram.trim());
        setSpotifyUrl(formSpotify.trim());
        setSoundcloudUrl(formSoundcloud.trim());
        setIsOnboarded(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAppLoading(false);
    }
  };

  const handleLocalAudioFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setAudioUrl(URL.createObjectURL(file));
    }
  };

  const executeAudioDropPublish = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadStatus('Progress');
    setTimeout(() => {
      setUploadStatus('Success');
    }, 1500);
  };

  const isFormValid = 
    (showCustomRole ? customRole.trim() !== '' : formRole !== '') &&
    (formInstagram.trim() !== '' || formSpotify.trim() !== '' || formSoundcloud.trim() !== '') &&
    formGenres.length > 0;

  if (appLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF8F5', fontFamily: 'sans-serif', fontWeight: 'bold', color: '#C5A880' }}>
        📡 Connecting workspace parameters...
      </div>
    );
  }

  // --- INTEGRATED ONBOARDING FLOW CARD VIEW ---
  if (!isOnboarded) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#FAF8F5', color: '#111111', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          <header style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', border: '1px solid #E8E2D9', textAlign: 'center' }}>
            <span style={{ color: '#C5A880', fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Onboarding Suite</span>
            <h1 style={{ margin: '6px 0 8px 0', fontSize: '30px', fontWeight: '800', letterSpacing: '-0.5px' }}>Setup Your Music Profile</h1>
            <p style={{ margin: 0, color: '#777777', fontSize: '14px' }}>Customize your professional trade details to activate your LinkedIn-style dashboard.</p>
          </header>

          {/* Specialty Trade Role Form Block */}
          <div style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '24px', border: '1px solid #E8E2D9' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800' }}>1. Select Your Primary Specialty Trade</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Music Producer', 'Beatmaker', 'Audio Engineer', 'Vocalist'].map((role) => (
                <label key={role} style={{ display: 'flex', alignItems: 'center', padding: '14px', border: formRole === role && !showCustomRole ? '2px solid #C5A880' : '1px solid #E8E2D9', borderRadius: '12px', cursor: 'pointer', backgroundColor: formRole === role && !showCustomRole ? '#FAF6F0' : 'transparent' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>{role}</span>
                  <input type="radio" name="role" checked={formRole === role && !showCustomRole} onChange={() => { setFormRole(role); setShowCustomRole(false); }} style={{ marginLeft: 'auto', accentColor: '#C5A880' }} />
                </label>
              ))}
              <label style={{ display: 'flex', alignItems: 'center', padding: '14px', border: showCustomRole ? '2px solid #C5A880' : '1px solid #E8E2D9', borderRadius: '12px', cursor: 'pointer', backgroundColor: showCustomRole ? '#FAF6F0' : 'transparent' }}>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>Custom Specialty Trade</span>
                <input type="radio" name="role" checked={showCustomRole} onChange={() => setShowCustomRole(true)} style={{ marginLeft: 'auto', accentColor: '#C5A880' }} />
              </label>
              {showCustomRole && (
                <input type="text" placeholder="Type custom role title..." value={customRole} onChange={(e) => setCustomRole(e.target.value)} style={{ width: '100%', marginTop: '4px', padding: '12px', border: '1px solid #C5A880', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }} />
              )}
            </div>
          </div>

          {/* Social Portfolios Links Grid */}
          <div style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '24px', border: '1px solid #E8E2D9' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '800' }}>2. Link Your Portfolios (Minimum 1 Required)</h3>
            <p style={{ margin: '0 0 16px 0', color: '#777777', fontSize: '13px' }}>Where can the network find your active tracks?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="url" placeholder="📸 Instagram URL Link" value={formInstagram} onChange={(e) => setFormInstagram(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }} />
              <input type="url" placeholder="🎵 Spotify Artist Profile URL" value={form
