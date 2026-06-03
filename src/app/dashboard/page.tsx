'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  // Form State Configurations
  const [producerRole, setProducerRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [showCustomRoleInput, setShowCustomRoleInput] = useState(false);

  const [instagramUrl, setInstagramUrl] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [soundcloudUrl, setSoundcloudUrl] = useState('');

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [customGenre, setCustomGenre] = useState('');
  const [customGenresList, setCustomGenresList] = useState<string[]>([]);

  const [isSubmitted, setIsSubmitted] = useState(false);

  // Core Genres List Array
  const DEFAULT_GENRES = [
    'Hip Hop', 'Trap', 'Drill', 'R&B', 'Electronic / EDM', 
    'Pop', 'Rock / Metal', 'Lo-Fi / Jazz', 'Boom Bap', 'Afrobeats', 'Ambient'
  ];

  // Helper logic to add/remove preset genres
  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  // Helper logic to add custom user genres
  const handleAddCustomGenre = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanGenre = customGenre.trim();
    if (cleanGenre && !customGenresList.includes(cleanGenre) && !DEFAULT_GENRES.includes(cleanGenre)) {
      setCustomGenresList([...customGenresList, cleanGenre]);
      setSelectedGenres([...selectedGenres, cleanGenre]);
      setCustomGenre('');
    }
  };

  // Validation Rule: Must have a role, at least 1 URL link, and at least 1 genre selected
  const hasValidRole = producerRole === 'Other' ? customRole.trim() !== '' : producerRole !== '';
  const hasAtLeastOneUrl = instagramUrl.trim() !== '' || spotifyUrl.trim() !== '' || soundcloudUrl.trim() !== '';
  const hasAtLeastOneGenre = selectedGenres.length > 0;
  const isFormValid = hasValidRole && hasAtLeastOneUrl && hasAtLeastOneGenre;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#FAF8F5', color: '#111111' }}>
      
      {/* Sidebar Navigation Panel */}
      <aside style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #E8E2D9', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'sticky', top: 0, height: '100vh', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px', tracking: '0.15em', textTransform: 'uppercase' }}>
          🎵 Producer Saab
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: isSubmitted ? 'transparent' : '#C5A880', color: isSubmitted ? '#444' : '#ffffff', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>
          🎛️ Studio Profile Creator
        </button>
        <Link href="/feed" style={{ textDecoration: 'none', width: '100%' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: isSubmitted ? '#111111' : 'transparent', color: isSubmitted ? '#ffffff' : '#444', fontWeight: '500', cursor: 'pointer', textAlign: 'left' }}>
            🌐 Global Library
          </button>
        </Link>
      </aside>

      {/* Main Single Page Viewport Wrapper */}
      <main style={{ flex: 1, padding: '40px 60px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* HEADER SECTION */}
          <header style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', border: '1px solid #E8E2D9', boxShadow: '0 4px 20px rgba(197, 168, 128, 0.03)' }}>
            <span style={{ color: '#C5A880', fontSize: '10px', fontWeight: 'bold', tracking: '0.2em', textTransform: 'uppercase' }}>Creator Hub Deployment</span>
            <h1 style={{ margin: '4px 0 8px 0', fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>Welcome Producer Saab</h1>
            <p style={{ margin: 0, color: '#777777', fontSize: '14px', lineHeight: '1.5' }}>Complete your registration settings directly on this single profile page layout to lock down your network identity badge.</p>
          </header>

          {!isSubmitted ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* COMPONENT SECTION 1: ROLE SELECTION */}
              <section style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', border: '1px solid #E8E2D9' }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800' }}>1. Select Your Primary Trade Role</h3>
                <p style={{ margin: '0 0 20px 0', color: '#777777', fontSize: '13px' }}>How do you contribute to studio projects?</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {['Music Producer', 'Beatmaker', 'Lyricist / Songwriter', 'Audio Engineer', 'Vocalist'].map((role) => (
                    <label key={role} style={{ display: 'flex', alignItems: 'center', padding: '16px', border: producerRole === role ? '2px solid #C5A880' : '1px solid #E8E2D9', borderRadius: '12px', cursor: 'pointer', backgroundColor: producerRole === role ? '#FAF6F0' : 'transparent', transition: 'all 0.15s ease' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>{role}</span>
                      <input type="radio" name="role" value={role} checked={producerRole === role} onChange={() => { setProducerRole(role); setShowCustomRoleInput(false); }} style={{ marginLeft: 'auto', accentColor: '#C5A880', width: '16px', height: '16px' }} />
                    </label>
                  ))}

                  {/* Manual 'Other' Option */}
                  <label style={{ display: 'flex', alignItems: 'center', padding: '16px', border: producerRole === 'Other' ? '2px solid #C5A880' : '1px solid #E8E2D9', borderRadius: '12px', cursor: 'pointer', backgroundColor: producerRole === 'Other' ? '#FAF6F0' : 'transparent' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>Something Else (Type Custom Trade)</span>
                    <input type="radio" name="role" value="Other" checked={producerRole === 'Other'} onChange={() => { setProducerRole('Other'); setShowCustomRoleInput(true); }} style={{ marginLeft: 'auto', accentColor: '#C5A880', width: '16px', height: '16px' }} />
                  </label>

                  {showCustomRoleInput && (
                    <input type="text" placeholder="Type your specific trade role (e.g., Guitarist, Manager, DJ)..." value={customRole} onChange={(e) => setCustomRole(e.target.value)} style={{ width: '100%', marginTop: '4px', padding: '14px', border: '1px solid #C5A880', borderRadius: '8px', boxSizing: 'border-box', fontSize: '13px', backgroundColor: '#ffffff' }} />
                  )}
                </div>
              </section>

              {/* COMPONENT SECTION 2: SOCIAL ARCHIVE ARCHITECTURE */}
              <section style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', border: '1px solid #E8E2D9' }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800' }}>2. Link Your Studio Portfolios</h3>
                <p style={{ margin: '0 0 20px 0', color: '#777777', fontSize: '13px' }}>You must fill out <strong>at least one</strong> link configuration box below.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px' }}>📸 Instagram Link URL</label>
                    <input type="url" placeholder="https://instagram.com/username" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box', fontSize: '13px' }} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px' }}>🎵 Spotify Artist profile URL</label>
                    <input type="url" placeholder="https://open.spotify.com/artist/..." value={spotifyUrl} onChange={(e) => setSpotifyUrl(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box', fontSize: '13px' }} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px' }}>☁️ SoundCloud profile URL</label>
                    <input type="url" placeholder="https://soundcloud.com/username" value={soundcloudUrl} onChange={(e) => setSoundcloudUrl(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box', fontSize: '13px' }} />
                  </div>
                </div>
              </section>

              {/* COMPONENT SECTION 3: GENRES + MANUAL ADDITIONS */}
              <section style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', border: '1px solid #E8E2D9' }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800' }}>3. Define Your Signature Sounds</h3>
                <p style={{ margin: '0 0 20px 0', color: '#777777', fontSize: '13px' }}>Select from our preset tags, or type your own sub-genres directly below.</p>
                
                {/* Preset List Clouds */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                  {[...DEFAULT_GENRES, ...customGenresList].map((genre) => {
                    const isSelected = selectedGenres.includes(genre);
                    return (
                      <button key={genre} type="button" onClick={() => toggleGenre(genre)} style={{ padding: '10px 18px', borderRadius: '30px', border: '1px solid', borderColor: isSelected ? '#C5A880' : '#E8E2D9', backgroundColor: isSelected ? '#C5A880' : '#ffffff', color: isSelected ? '#ffffff' : '#555555', fontWeight: '600', fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                        {genre} {isSelected ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>

                {/* Manual Add Custom Genre Sub-Form Input */}
                <div style={{ display: 'flex', gap: '10px', borderTop: '1px dashed #E8E2D9', paddingTop: '20px' }}>
                  <input type="text" placeholder="Can't find your sub-genre? Type custom style here (e.g., Synthwave, Phonk)..." value={customGenre} onChange={(e) => setCustomGenre(e.target.value)} style={{ flex: 1, padding: '12px 14px', border: '1px solid #E8E2D9', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }} />
                  <button type="button" onClick={handleAddCustomGenre} style={{ padding: '0 20px', borderRadius: '8px', border: 'none', backgroundColor: '#111111', color: '#ffffff', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                    + Add Style
                  </button>
                </div>
              </section>

              {/* ACTION GRAND BUTTON FOR SUBMISSION */}
              <button disabled={!isFormValid} onClick={() => setIsSubmitted(true)} style={{ width: '100%', padding: '18px', borderRadius: '35px', border: 'none', backgroundColor: isFormValid ? '#0f2416' : '#E8E2D9', color: '#ffffff', fontWeight: 'bold', fontSize: '15px', cursor: isFormValid ? 'pointer' : 'not-allowed', transition: 'background-color 0.2s', boxShadow: isFormValid ? '0 4px 15px rgba(15, 36, 22, 0.15)' : 'none', marginBottom: '40px' }}>
                {isFormValid ? 'Publish Official Creator Profile ✨' : 'Complete All Compulsory Sections Above to Launch'}
              </button>

            </div>
          ) : (
            
            {/* COMPLETED ACCREDITED ACCOUNT DASHBOARD VIEW CARD */}
            <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '24px', border: '1px solid #E8E2D9', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '40px', backgroundColor: '#FAF6F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', border: '2px dashed #C5A880', lineHeight: '80px' }}>👑</div>
              
              <div>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '26px', fontWeight: '800' }}>Studio Network Active!</h2>
                <p style={{ margin: 0, color: '#777777', fontSize: '14px' }}>Your profile database record has been published, Producer Saab.</p>
              </div>

              <div style={{ width: '100%', backgroundColor: '#FAF8F5', border: '1px solid #E8E2D9', borderRadius: '16px', padding: '24px', boxSizing: 'border-box', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '10px', color: '#C5A880', tracking: '0.1em' }}>Accredited Identity</span>
                  <span style={{ backgroundColor: '#111111', color: '#ffffff', fontSize: '11px', padding: '4px 12px', borderRadius: '6px', fontWeight: 'bold' }}>
                    {producerRole === 'Other' ? customRole : producerRole}
                  </span>
                </div>
                
                <div style={{ borderTop: '1px solid #E8E2D9', paddingTop: '12px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {instagramUrl && <div><strong>📸 Instagram:</strong> {instagramUrl}</div>}
                  {spotifyUrl && <div><strong>🎵 Spotify URL:</strong> {spotifyUrl}</div>}
                  {soundcloudUrl && <div><strong>☁️ SoundCloud:</strong> {soundcloudUrl}</div>}
                  <div style={{ marginTop: '4px', lineHeight: '1.4' }}><strong>🎸 Signature Styles:</strong> {selectedGenres.join(', ')}</div>
                </div>
              </div>

              <Link href="/feed" style={{ width: '100%', textDecoration: 'none' }}>
                <button style={{ width: '100%', padding: '16px', borderRadius: '30px', border: 'none', backgroundColor: '#111111', color: '#ffffff', fontWeight: 'bold', cursor: 'pointer' }}>
                  Enter Global Community Feed →
                </button>
              </Link>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
