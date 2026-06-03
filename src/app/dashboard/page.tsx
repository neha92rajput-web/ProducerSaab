'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  // Navigation State: false = Filling profile, true = inside the Studio Workspace
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 1. Profile Setup State variables
  const [producerRole, setProducerRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [showCustomRoleInput, setShowCustomRoleInput] = useState(false);
  const [instagramUrl, setInstagramUrl] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [soundcloudUrl, setSoundcloudUrl] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [customGenre, setCustomGenre] = useState('');
  const [customGenresList, setCustomGenresList] = useState<string[]>([]);

  // 2. Audio Upload State Variables (Inside @username Studio)
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [trackTitle, setTrackTitle] = useState('');
  const [selectedTrackGenre, setSelectedTrackGenre] = useState('');
  const [trackBpm, setTrackBpm] = useState('');
  const [trackKey, setTrackKey] = useState('');
  const [instrumentType, setInstrumentType] = useState('');
  const [uploadStatus, setUploadStatus] = useState('Idle'); // Idle, Progress, Success

  // Constants lists
  const DEFAULT_GENRES = [
    'Hip Hop', 'Trap', 'Drill', 'R&B', 'Electronic / EDM', 
    'Pop', 'Rock / Metal', 'Lo-Fi / Jazz', 'Boom Bap', 'Afrobeats', 'Ambient'
  ];

  // All 24 Major & Minor Scale Keys for your dropdown menu selector
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

  // Handlers for profile collection tags
  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleAddCustomGenre = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanGenre = customGenre.trim();
    if (cleanGenre && !customGenresList.includes(cleanGenre) && !DEFAULT_GENRES.includes(cleanGenre)) {
      setCustomGenresList([...customGenresList, cleanGenre]);
      setSelectedGenres([...selectedGenres, cleanGenre]);
      setCustomGenre('');
    }
  };

  // Mock Username extracted or built based on entries
  const cleanHandle = instagramUrl.includes('instagram.com/') 
    ? instagramUrl.split('instagram.com/')[1]?.split('/')[0] || 'Producer'
    : instagramUrl || 'Producer';

  const isProfileValid = 
    (producerRole === 'Other' ? customRole.trim() !== '' : producerRole !== '') &&
    (instagramUrl.trim() !== '' || spotifyUrl.trim() !== '' || soundcloudUrl.trim() !== '') &&
    selectedGenres.length > 0;

  const isUploadFormValid = audioFile && trackTitle.trim() && selectedTrackGenre && trackBpm && trackKey && instrumentType;

  const simulateAudioUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadStatus('Progress');
    setTimeout(() => {
      setUploadStatus('Success');
    }, 2000);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#FAF8F5', color: '#111111' }}>
      
      {/* Sidebar Navigation Panel */}
      <aside style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #E8E2D9', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'sticky', top: 0, height: '100vh', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          🎵 Producer Saab
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: !isSubmitted ? '#C5A880' : 'transparent', color: !isSubmitted ? '#ffffff' : '#444', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }} onClick={() => setIsSubmitted(false)}>
          🎛️ {isSubmitted ? 'Edit Profile' : 'Studio Profile Creator'}
        </button>
        <Link href="/feed" style={{ textDecoration: 'none', width: '100%' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: isSubmitted ? '#111111' : 'transparent', color: isSubmitted ? '#ffffff' : '#444', fontWeight: '500', cursor: 'pointer', textAlign: 'left' }}>
            🌐 Global Library
          </button>
        </Link>
      </aside>

      {/* Main Form/Workstation Viewport */}
      <main style={{ flex: 1, padding: '40px 60px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* PROFILE SETUP BUILDER PAGE (UNSUBMITTED STATE) */}
          {!isSubmitted ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <header style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', border: '1px solid #E8E2D9' }}>
                <span style={{ color: '#C5A880', fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Onboarding Launch</span>
                <h1 style={{ margin: '4px 0 8px 0', fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>Welcome Producer Saab</h1>
                <p style={{ margin: 0, color: '#777777', fontSize: '14px' }}>Fill out your profile layout below to spin up your personalized workstation station link.</p>
              </header>

              {/* SECTION 1: ROLES */}
              <section style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', border: '1px solid #E8E2D9' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '800' }}>1. Select Your Primary Trade Role</h3>
                <p style={{ margin: '0 0 20px 0', color: '#777777', fontSize: '13px' }}>Choose your specialty:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['Music Producer', 'Beatmaker', 'Lyricist / Songwriter', 'Audio Engineer', 'Vocalist'].map((role) => (
                    <label key={role} style={{ display: 'flex', alignItems: 'center', padding: '16px', border: producerRole === role ? '2px solid #C5A880' : '1px solid #E8E2D9', borderRadius: '12px', cursor: 'pointer', backgroundColor: producerRole === role ? '#FAF6F0' : 'transparent' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>{role}</span>
                      <input type="radio" name="role" checked={producerRole === role} onChange={() => { setProducerRole(role); setShowCustomRoleInput(false); }} style={{ marginLeft: 'auto', accentColor: '#C5A880' }} />
                    </label>
                  ))}
                  <label style={{ display: 'flex', alignItems: 'center', padding: '16px', border: producerRole === 'Other' ? '2px solid #C5A880' : '1px solid #E8E2D9', borderRadius: '12px', cursor: 'pointer', backgroundColor: producerRole === 'Other' ? '#FAF6F0' : 'transparent' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>Custom Trade Input Option</span>
                    <input type="radio" name="role" checked={producerRole === 'Other'} onChange={() => { setProducerRole('Other'); setShowCustomRoleInput(true); }} style={{ marginLeft: 'auto', accentColor: '#C5A880' }} />
                  </label>
                  {showCustomRoleInput && (
                    <input type="text" placeholder="Type custom role title..." value={customRole} onChange={(e) => setCustomRole(e.target.value)} style={{ width: '100%', marginTop: '4px', padding: '14px', border: '1px solid #C5A880', borderRadius: '8px', boxSizing: 'border-box' }} />
                  )}
                </div>
              </section>

              {/* SECTION 2: LINKS */}
              <section style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', border: '1px solid #E8E2D9' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '800' }}>2. Link Your Portfolios (Minimum 1 Required)</h3>
                <p style={{ margin: '0 0 20px 0', color: '#777777', fontSize: '13px' }}>Where can the platform find your music handles?</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <input type="url" placeholder="📸 Instagram profile handle or URL link" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box' }} />
                  <input type="url" placeholder="🎵 Spotify Artist URL" value={spotifyUrl} onChange={(e) => setSpotifyUrl(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box' }} />
                  <input type="url" placeholder="☁️ SoundCloud URL" value={soundcloudUrl} onChange={(e) => setSoundcloudUrl(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box' }} />
                </div>
              </section>

              {/* SECTION 3: GENRES */}
              <section style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', border: '1px solid #E8E2D9' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '800' }}>3. Profile Style Tags</h3>
                <p style={{ margin: '0 0 20px 0', color: '#777777', fontSize: '13px' }}>Select signature styles for your account view:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  {[...DEFAULT_GENRES, ...customGenresList].map((g) => {
                    const active = selectedGenres.includes(g);
                    return (
                      <button key={g} type="button" onClick={() => toggleGenre(g)} style={{ padding: '10px 18px', borderRadius: '30px', border: '1px solid', borderColor: active ? '#C5A880' : '#E8E2D9', backgroundColor: active ? '#C5A880' : '#ffffff', color: active ? '#ffffff' : '#555555', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}>
                        {g} {active ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="text" placeholder="Type and add unlisted styles manually..." value={customGenre} onChange={(e) => setCustomGenre(e.target.value)} style={{ flex: 1, padding: '12px', border: '1px solid #E8E2D9', borderRadius: '8px' }} />
                  <button type="button" onClick={handleAddCustomGenre} style={{ padding: '0 20px', borderRadius: '8px', border: 'none', backgroundColor: '#111111', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer' }}>+ Add</button>
                </div>
              </section>

              <button disabled={!isProfileValid} onClick={() => setIsSubmitted(true)} style={{ width: '100%', padding: '18px', borderRadius: '35px', border: 'none', backgroundColor: isProfileValid ? '#0f2416' : '#E8E2D9', color: '#ffffff', fontWeight: 'bold', cursor: isProfileValid ? 'pointer' : 'not-allowed', marginBottom: '40px' }}>
                Initialize Studio Workspace Dashboard →
              </button>
            </div>
          ) : (
            
            {/* LIVE ACTIVE WORKSPACE SECTION: @USERNAME STUDIO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* DASHBOARD HEADER */}
              <header style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', border: '1px solid #E8E2D9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 25px rgba(0,0,0,0.02)' }}>
                <div>
                  <span style={{ color: '#C5A880', fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Live Production Suite</span>
                  <h1 style={{ margin: '4px 0 4px 0', fontSize: '32px', fontWeight: '900', letterSpacing: '-0.5px' }}>@{cleanHandle} Studio</h1>
                  <p style={{ margin: 0, color: '#777777', fontSize: '14px' }}>Welcome back to your central audio drops processing terminal.</p>
                </div>
                <span style={{ backgroundColor: '#FAF6F0', border: '1px solid #C5A880', color: '#C5A880', fontSize: '11px', fontWeight: 'bold', padding: '8px 16px', borderRadius: '30px' }}>
                  ✨ {producerRole === 'Other' ? customRole : producerRole}
                </span>
              </header>

              {/* CORE UTILITY PANEL: UPLOAD AUDIO FORM */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', alignItems: 'start' }}>
                
                {/* FORM PANEL BOX */}
                <section style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', border: '1px solid #E8E2D9' }}>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800' }}>📤 Upload Audio Project Drop</h3>
                  <p style={{ margin: '0 0 24px 0', color: '#777777', fontSize: '13px' }}>Publish custom sound stems directly to the network feed database.</p>
                  
                  <form onSubmit={simulateAudioUpload} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* FILE SELECTOR CONTAINER */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px' }}>Audio file track (.mp3 or .wav) *</label>
                      <input type="file" accept=".mp3,.wav" onChange={(e) => setAudioFile(e.target.files ? e.target.files[0] : null)} style={{ width: '100%', padding: '14px', border: '2px dashed #E8E2D9', borderRadius: '8px', boxSizing: 'border-box', backgroundColor: '#FAF8F5' }} required />
                    </div>

                    {/* TRACK TITLE INPUT */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px' }}>Track / Sample Title *</label>
                      <input type="text" placeholder="e.g., Midnight Vibes Loop" value={trackTitle} onChange={(e) => setTrackTitle(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box', fontSize: '13px' }} required />
                    </div>

                    {/* DYNAMIC GENRE SELECTION DROPBOX */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px' }}>Audio Genre Classification *</label>
                      <select value={selectedTrackGenre} onChange={(e) => setSelectedTrackGenre(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', fontSize: '13px', backgroundColor: '#ffffff' }} required>
                        <option value="">-- Choose Target Track Genre --</option>
                        {selectedGenres.map((genre) => (
                          <option key={genre} value={genre}>{genre}</option>
                        ))}
                      </select>
                    </div>

                    {/* BPM & MUSICAL 24 KEYS FLEX GRID GRID */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px' }}>Tempo BPM *</label>
                        <input type="number" placeholder="e.g., 140" value={trackBpm} onChange={(e) => setTrackBpm(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box', fontSize: '13px' }} required />
                      </div>
                      
                      {/* COMPULSORY SELECT SYSTEM FOR ALL 24 ROOT SCALES */}
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px' }}>Signature Key Scale *</label>
                        <select value={trackKey} onChange={(e) => setTrackKey(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', fontSize: '13px', backgroundColor: '#ffffff' }} required>
                          <option value="">-- Select Dropdown Scale --</option>
                          {MUSICAL_KEYS.map((scale) => (
                            <option key={scale} value={scale}>{scale}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* INSTRUMENT CLASSIFICATION SYSTEM CONTAINER */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px' }}>Instrument Stem / Sample Layer Source *</label>
                      <select value={instrumentType} onChange={(e) => setInstrumentType(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', fontSize: '13px', backgroundColor: '#ffffff' }} required>
                        <option value="">-- Choose Loop Instrument Base Layer --</option>
                        {INSTRUMENTS.map((inst) => (
                          <option key={inst} value={inst}>{inst}</option>
                        ))}
                      </select>
                    </div>

                    {/* UPLOAD EXECUTION TRIGGERS */}
                    {uploadStatus === 'Idle' && (
                      <button type="submit" disabled={!isUploadFormValid} style={{ marginTop: '10px', width: '100%', padding: '16px', border: 'none', borderRadius: '30px', backgroundColor: isUploadFormValid ? '#C5A880' : '#E8E2D9', color: '#ffffff', fontWeight: 'bold', fontSize: '14px', cursor: isUploadFormValid ? 'pointer' : 'not-allowed' }}>
                        Publish Stems to Global Library Feed
                      </button>
                    )}

                    {uploadStatus === 'Progress' && (
                      <button type="button" style={{ marginTop: '10px', width: '100%', padding: '16px', border: 'none', borderRadius: '30px', backgroundColor: '#F0EBE3', color: '#C5A880', fontWeight: 'bold', fontSize: '14px', cursor: 'not-allowed' }}>
                        ⚡ Syncing audio array blocks to network storage node...
                      </button>
                    )}

                    {uploadStatus === 'Success' && (
                      <div style={{ marginTop: '10px', textAlign: 'center', backgroundColor: '#FAF6F0', border: '1px solid #C5A880', borderRadius: '12px', padding: '14px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#B8986E' }}>🎉 Project audio drop uploaded securely onto live library node successfully!</span>
                        <button type="button" onClick={() => { setUploadStatus('Idle'); setTrackTitle(''); setAudioFile(null); }} style={{ display: 'block', margin: '8px auto 0 auto', background: 'none', border: 'none', color: '#111111', fontSize: '12px', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer' }}>Upload Another stems file</button>
                      </div>
                    )}

                  </form>
                </section>

                {/* SIDEBAR RE-CAP SUMMARY BLOCK */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #E8E2D9' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#C5A880' }}>Studio Dashboard Profile</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                      {instagramUrl && <div style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}><strong>Insta:</strong> {instagramUrl}</div>}
                      {spotifyUrl && <div style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}><strong>Spotify:</strong> {spotifyUrl}</div>}
                      {soundcloudUrl && <div style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}><strong>SoundCloud:</strong> {soundcloudUrl}</div>}
                      <div style={{ borderTop: '1px dashed #E8E2D9', marginTop: '8px', paddingTop: '8px', color: '#666', fontSize: '12px' }}>
                        <strong>Authorized Styles:</strong><br /> {selectedGenres.join(', ')}
                      </div>
                    </div>
                  </section>

                  {/* NAVIGATIONAL OUTBOUND CARD */}
                  <Link href="/feed" style={{ textDecoration: 'none' }}>
                    <section style={{ backgroundColor: '#111111', color: '#ffffff', padding: '24px', borderRadius: '20px', textAlign: 'center', cursor: 'pointer' }}>
                      <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '15px' }}>Explore Network Feed 🌍</p>
                      <p style={{ margin: 0, color: '#999999', fontSize: '12px' }}>Enter the global public community workspace wall</p>
                    </section>
                  </Link>
                </div>

              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
