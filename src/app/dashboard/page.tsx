'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  // Navigation & UI States
  const [isProfileSetupSubmitted, setIsProfileSetupSubmitted] = useState(true); // Default to true since you already built your profile!
  const [showUploadModal, setShowUploadModal] = useState(false); // Controls the upload form overlay

  // Profile Setup Mock Data (Pulled from your entries)
  const [producerRole, setProducerRole] = useState('Music Producer');
  const [instagramUrl, setInstagramUrl] = useState('https://instagram.com/chaotic_stone');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [soundcloudUrl, setSoundcloudUrl] = useState('');
  const [selectedGenres, setSelectedGenres] = useState(['Coke Studio', 'Hip Hop', 'Ambient']);
  const [customGenre, setCustomGenre] = useState('');
  const [customGenresList, setCustomGenresList] = useState(['Coke Studio']);

  // Audio Upload Form State Variables
  const [audioFile, setAudioFile] = useState(null);
  const [trackTitle, setTrackTitle] = useState('');
  const [selectedTrackGenre, setSelectedTrackGenre] = useState('');
  const [trackBpm, setTrackBpm] = useState('');
  const [trackKey, setTrackKey] = useState('');
  const [instrumentType, setInstrumentType] = useState('');
  const [uploadStatus, setUploadStatus] = useState('Idle'); // Idle, Progress, Success

  // Static Configuration Lists
  const DEFAULT_GENRES = [
    'Hip Hop', 'Trap', 'Drill', 'R&B', 'Electronic / EDM', 
    'Pop', 'Rock / Metal', 'Lo-Fi / Jazz', 'Boom Bap', 'Afrobeats', 'Ambient'
  ];

  const MUSICAL_KEYS = [
    'C Major', 'C Minor', 'C# Major', 'C# Minor', 'D Major', 'D Minor',
    'D# Major', 'D# Minor', 'E Major', 'E Minor', 'F Major', 'F Minor',
    'F# Major', 'F# Minor', 'G Major', 'G Minor', 'G# Major', 'G# Minor',
    'A Major', 'A Minor', 'A# Major', 'A# Minor', 'B Major', 'B Minor'
  ];

  const INSTRUMENTS = [
    'Guitar Loop / Sample', 'Piano / Keys Loop', 'Synth Loop', 
    'Drum Kit / Percussion Loop', 'Vocal Chop / Phrase', 'Bass / Sub Loop', 'Full Composition Melody'
  ];

  // Helper Functions
  function toggleGenre(genreName) {
    if (selectedGenres.includes(genreName)) {
      setSelectedGenres(selectedGenres.filter(function(g) { return g !== genreName; }));
    } else {
      setSelectedGenres([...selectedGenres, genreName]);
    }
  }

  function handleAddCustomGenre(event) {
    event.preventDefault();
    const cleanGenre = customGenre.trim();
    if (cleanGenre && !customGenresList.includes(cleanGenre)) {
      setCustomGenresList([...customGenresList, cleanGenre]);
      setSelectedGenres([...selectedGenres, cleanGenre]);
      setCustomGenre('');
    }
  }

  const cleanHandle = instagramUrl.includes('instagram.com/') 
    ? instagramUrl.split('instagram.com/')[1]?.split('/')[0] || 'chaotic_stone'
    : instagramUrl || 'chaotic_stone';

  const isUploadFormValid = trackTitle.trim() && selectedTrackGenre && trackBpm && trackKey && instrumentType;

  function simulateAudioUpload(event) {
    event.preventDefault();
    setUploadStatus('Progress');
    setTimeout(function() {
      setUploadStatus('Success');
    }, 2000);
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#FAF8F5', color: '#111111' }}>
      
      {/* SIDEBAR NAVIGATION */}
      <aside style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #E8E2D9', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'sticky', top: 0, height: '100vh', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          🎵 Producer Saab
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: '#C5A880', color: '#ffffff', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }} onClick={function() { setIsProfileSetupSubmitted(true); }}>
          🎛️ Studio Hub
        </button>
        <Link href="/feed" style={{ textDecoration: 'none', width: '100%' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: 'transparent', color: '#444', fontWeight: '500', cursor: 'pointer', textAlign: 'left' }}>
            🌐 Global Library
          </button>
        </Link>
      </aside>

      {/* MAIN HUB INTERFACE */}
      <main style={{ flex: 1, padding: '40px 60px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '980px', display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '40px', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: LINKEDIN STYLE PROFILE AREA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* LINKEDIN HERO COVER & CARD PACK */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #E8E2D9', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
              {/* Cover Banner */}
              <div style={{ height: '140px', backgroundColor: '#C5A880', backgroundImage: 'linear-gradient(45deg, #C5A880, #E8E2D9)' }} />
              
              {/* Profile Details Container */}
              <div style={{ padding: '32px', position: 'relative', marginTop: '-60px' }}>
                {/* Profile Picture Avatar Avatar */}
                <div style={{ width: '100px', height: '100px', borderRadius: '50px', backgroundColor: '#111111', border: '4px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', color: '#ffffff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                  👑
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h1 style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px' }}>@{cleanHandle}</h1>
                    <p style={{ margin: '0 0 12px 0', color: '#C5A880', fontWeight: '700', fontSize: '15px' }}>{producerRole} • Verified Creator</p>
                  </div>
                  <button style={{ padding: '8px 20px', borderRadius: '20px', border: '1px solid #E8E2D9', backgroundColor: '#ffffff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }} onClick={function() { alert('Profile editing module unlocked!'); }}>
                    Edit Info
                  </button>
                </div>

                <p style={{ margin: '12px 0 20px 0', color: '#666666', fontSize: '14px', lineHeight: '1.6' }}>
                  Welcome back to your central audio node interface. Here you can track, manage, and distribute your sonic assets across the Producer Saab ecosystem.
                </p>

                {/* Sub-Badges style links layout */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid #FAF8F5', paddingTop: '20px' }}>
                  {selectedGenres.map(function(genre) {
                    return (
                      <span key={genre} style={{ backgroundColor: '#FAF6F0', color: '#C5A880', fontSize: '12px', fontWeight: 'bold', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(197, 168, 128, 0.2)' }}>
                        🎵 {genre}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ARTIST PORTFOLIO GRID (LINKEDIN EXPERIENCE SECTION) */}
            <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', border: '1px solid #E8E2D9' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '800' }}>Featured Tracks & Audio Drops</h3>
              <p style={{ margin: '0 0 24px 0', color: '#777777', fontSize: '13px' }}>Your published sounds appearing on the community feed panel.</p>

              {trackTitle ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', backgroundColor: '#FAF8F5', borderRadius: '16px', border: '1px solid #E8E2D9' }}>
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#111111', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>💿</div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '700' }}>{trackTitle}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{selectedTrackGenre} • {trackBpm} BPM • {trackKey} • {instrumentType}</p>
                  </div>
                  <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 'bold', backgroundColor: '#f0fdf4', padding: '4px 10px', borderRadius: '12px' }}>Live</span>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999', border: '2px dashed #FAF8F5', borderRadius: '16px' }}>
                  <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#555' }}>No active audio files cataloged</p>
                  <p style={{ margin: 0, fontSize: '13px' }}>Click the launch controller button on the right to place your first drop track file.</p>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: LINKEDIN ACTION CONTROL CONTROLLERS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '40px' }}>
            
            {/* ACTION CARD TRIGGER PANEL */}
            <section style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '24px', border: '1px solid #E8E2D9', boxShadow: '0 4px 20px rgba(197, 168, 128, 0.03)' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '800' }}>Studio Control Rack</h4>
              <p style={{ margin: '0 0 20px 0', color: '#666666', fontSize: '13px', lineHeight: '1.5' }}>Ready to send a loop layer or master sample block to the community pool?</p>
              
              <button style={{ width: '100%', padding: '16px', borderRadius: '30px', border: 'none', backgroundColor: '#111111', color: '#ffffff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} onClick={function() { setShowUploadModal(true); setUploadStatus('Idle'); }}>
                <span>📤</span> Upload Audio File
              </button>
            </section>

            {/* QUICK STATS INSIGHTS BADGE */}
            <section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #E8E2D9', fontSize: '13px' }}>
              <h5 style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#C5A880', letterSpacing: '0.05em' }}>Studio Metrics</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Profile Views:</span><strong>124</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Feed Sync Drops:</span><strong>{trackTitle ? '1' : '0'}</strong></div>
              </div>
            </section>

          </div>

        </div>
      </main>

      {/* INTERACTIVE MODAL OVERLAY (THE AUDIO INTAKE DRAWERS CONTROLLER) */}
      {showUploadModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 12, 10, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '540px', borderRadius: '24px', padding: '36px', border: '1px solid #E8E2D9', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', position: 'relative', boxSizing: 'border-box', maxHeight: '90vh', overflowY: 'auto' }}>
            
            {/* Close Button Anchor */}
            <button style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999' }} onClick={
