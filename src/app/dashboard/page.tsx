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

  // Audio Upload Control State Variables (From your Screenshot)
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

  function toggleFormGenre(genreName: string) {
    if (formGenres.includes(genreName)) {
      setFormGenres(formGenres.filter((g) => g !== genreName));
    } else {
      setFormGenres([...formGenres, genreName]);
    }
  }

  function handleAddCustomGenre(event: React.MouseEvent) {
    event.preventDefault();
    const clean = customGenreInput.trim();
    if (clean && !customGenresList.includes(clean) && !DEFAULT_GENRES.includes(clean)) {
      setCustomGenresList([...customGenresList, clean]);
      setFormGenres([...formGenres, clean]);
      setCustomGenreInput('');
    }
  }

  async function handleOnboardingSubmit(e: React.FormEvent) {
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
  }

  function handleLocalAudioFile(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setAudioUrl(URL.createObjectURL(file));
    }
  }

  function executeAudioDropPublish(e: React.FormEvent) {
    e.preventDefault();
    setUploadStatus('Progress');
    setTimeout(() => {
      setUploadStatus('Success');
    }, 1500);
  }

  const isFormValid = 
    (showCustomRole ? customRole.trim() !== '' : formRole !== '') &&
    (formInstagram.trim() !== '' || formSpotify.trim() !== '' || formSoundcloud.trim() !== '') &&
    formGenres.length > 0;

  if (appLoading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF8F5', fontFamily: 'sans-serif', fontWeight: 'bold', color: '#C5A880' }}>📡 Connecting workspace parameters...</div>;
  }

  // --- INTEGRATED ONBOARDING FLOW CARD ---
  if (!isOnboarded) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#FAF8F5', color: '#111111', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          <header style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', border: '1px solid #E8E2D9', textAlign: 'center' }}>
            <span style={{ color: '#C5A880', fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Onboarding Suite</span>
            <h1 style={{ margin: '6px 0 8px 0', fontSize: '30px', fontWeight: '800', letterSpacing: '-0.5px' }}>Setup Your Music Profile</h1>
            <p style={{ margin: 0, color: '#777777', fontSize: '14px' }}>Customize your professional trade details to activate your LinkedIn-style dashboard.</p>
          </header>

          {/* Specialty Trade Role Option Row */}
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
              <input type="url" placeholder="🎵 Spotify Artist Profile URL" value={formSpotify} onChange={(e) => setFormSpotify(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }} />
              <input type="url" placeholder="☁️ SoundCloud URL Link" value={formSoundcloud} onChange={(e) => setFormSoundcloud(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px' }} />
            </div>
          </div>

          {/* Style Signature Genres Tags Row */}
          <div style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '24px', border: '1px solid #E8E2D9' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800' }}>3. Select Signature Style Genres</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {DEFAULT_GENRES.concat(customGenresList).map((g) => {
                const active = formGenres.includes(g);
                return (
                  <button key={g} type="button" onClick={() => toggleFormGenre(g)} style={{ padding: '8px 16px', borderRadius: '30px', border: '1px solid', borderColor: active ? '#C5A880' : '#E8E2D9', backgroundColor: active ? '#C5A880' : '#ffffff', color: active ? '#ffffff' : '#555555', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}>
                    {g} {active ? '✓' : '+'}
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" placeholder="Add custom style tag..." value={customGenreInput} onChange={(e) => setCustomGenreInput(e.target.value)} style={{ flex: 1, padding: '12px', border: '1px solid #E8E2D9', borderRadius: '8px', fontSize: '14px' }} />
              <button type="button" onClick={handleAddCustomGenre} style={{ padding: '0 20px', borderRadius: '8px', border: 'none', backgroundColor: '#111111', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>+ Add</button>
            </div>
          </div>

          <button onClick={handleOnboardingSubmit} disabled={!isFormValid} style={{ width: '100%', padding: '16px', borderRadius: '35px', border: 'none', backgroundColor: isFormValid ? '#111111' : '#E8E2D9', color: '#ffffff', fontWeight: 'bold', fontSize: '14px', cursor: isFormValid ? 'pointer' : 'not-allowed', marginBottom: '20px' }}>
            Initialize Dashboard Profile Portfolio
          </button>

        </div>
      </div>
    );
  }

  // --- PREMIUM LINKEDIN-STYLE STUDIO DASHBOARD HUB VIEW ---
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#FAF8F5', color: '#111111' }}>
      
      {/* SIDEBAR NAVIGATION PANEL */}
      <aside style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #E8E2D9', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>🎵 Producer Saab</div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: '#C5A880', color: '#ffffff', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>🎛️ Studio Hub</button>
        <Link href="/feed" style={{ textDecoration: 'none', width: '100%' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: 'transparent', color: '#444', fontWeight: '500', cursor: 'pointer', textAlign: 'left' }}>🌐 Global Library</button>
        </Link>
      </aside>

      {/* REEL GRID DASHBOARD INTERFACE */}
      <main style={{ flex: 1, padding: '40px 60px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '980px', display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '40px', alignItems: 'start' }}>
          
          {/* PROFILE LEFT CANVAS HOVER BOX */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #E8E2D9', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
              <div style={{ height: '140px', backgroundColor: '#C5A880', backgroundImage: 'linear-gradient(45deg, #C5A880, #E8E2D9)' }} />
              <div style={{ padding: '32px', position: 'relative', marginTop: '-60px' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50px', backgroundColor: '#111111', border: '4px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', color: '#ffffff' }}>👑</div>
                <div style={{ marginTop: '20px' }}>
                  <h1 style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px' }}>@{userHandle} Studio</h1>
                  <p style={{ margin: '0 0 12px 0', color: '#C5A880', fontWeight: '700', fontSize: '15px' }}>{producerRole} • Verified Creator</p>
                </div>
                <p style={{ margin: '12px 0 20px 0', color: '#666666', fontSize: '14px', lineHeight: '1.6' }}>Welcome back to your central audio drops processing terminal. Here you can showcase your bio details, distribute samples, and catalog dynamic loop layers.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid #FAF8F5', paddingTop: '20px' }}>
                  {selectedGenres.map((genre) => (
                    <span key={genre} style={{ backgroundColor: '#FAF6F0', color: '#C5A880', fontSize: '12px', fontWeight: 'bold', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(197, 168, 128, 0.2)' }}>🎵 {genre}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* LIVE STREAMABLE REEL RECORD BLOCK */}
            <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', border: '1px solid #E8E2D9' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '800' }}>Featured Tracks & Audio Drops</h3>
              <p style={{ margin: '0 0 24px 0', color: '#777777', fontSize: '13px' }}>Your published sound stems appearing on the global public wall layout.</p>

              {trackTitle ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', backgroundColor: '#FAF8F5', borderRadius: '16px', border: '1px solid #E8E2D9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: '#111111', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>💿</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700' }}>{trackTitle}</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{selectedTrackGenre} • {trackBpm} BPM • {trackKey} • {instrumentType}</p>
                    </div>
                    <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 'bold', backgroundColor: '#f0fdf4', padding: '4px 10px', borderRadius: '12px' }}>Live</span>
                  </div>
                  {audioUrl && (
                    <div style={{ width: '100%', marginTop: '4px', borderTop: '1px solid #E8E2D9', paddingTop: '12px' }}>
                      <audio controls src={audioUrl} style={{ width: '100%', accentColor: '#C5A880' }}>Your browser does not support audio element.</audio>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999', border: '2px dashed #FAF8F5', borderRadius: '16px' }}>
                  <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#555' }}>No active audio assets cataloged yet.</p>
                  <p style={{ margin: 0, fontSize: '13px' }}>Click the action control card on the right row to deploy your first loop file.</p>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT ACTION CONTROL CARD BAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <section style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '24px', border: '1px solid #E8E2D9' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '800' }}>Studio Control Rack</h4>
              <p style={{ margin: '0 0 20px 0', color: '#666666', fontSize: '13px', lineHeight: '1.5' }}>Ready to distribute an instrument layer or loop block straight to the community pipeline?</p>
              <button style={{ width: '100%', padding: '16px', borderRadius: '30px', border: 'none', backgroundColor: '#111111', color: '#ffffff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }} onClick={() => { setShowUploadModal(true); setUploadStatus('Idle'); }}>📤 Upload Audio File</button>
            </section>
          </div>

        </div>
      </main>

      {/* POP-OUT MODAL FOR LIVE UPLOADING INTERFACE */}
      {showUploadModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '520px', borderRadius: '24px', padding: '36px', border: '1px solid #E8E2D9', position: 'relative', boxSizing: 'border-box', maxHeight: '90vh', overflowY: 'auto
