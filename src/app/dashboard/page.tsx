'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  // Current step tracking: 1 = Welcome/Role, 2 = Social Links, 3 = Genres, 4 = Success Profile View
  const [step, setStep] = useState(1);
  
  // Profile Form States
  const [producerRole, setProducerRole] = useState('');
  const [primaryPlatform, setPrimaryPlatform] = useState('instagram');
  const [primaryUrl, setPrimaryUrl] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [soundcloudUrl, setSoundcloudUrl] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const isStep2Valid = primaryUrl.trim() !== '';
  const isStep3Valid = selectedGenres.length > 0;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#FAF8F5', color: '#111111' }}>
      
      {/* Sidebar Navigation */}
      <aside style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #E8E2D9', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px', tracking: '0.15em', textTransform: 'uppercase' }}>
          🎵 Producer Saab
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: step === 4 ? 'transparent' : '#C5A880', color: step === 4 ? '#444' : '#ffffff', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }} onClick={() => setStep(1)}>
          🎛️ Setup Profile
        </button>
        <Link href="/feed" style={{ textDecoration: 'none', width: '100%' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: step === 4 ? '#111111' : 'transparent', color: step === 4 ? '#ffffff' : '#444', fontWeight: '500', cursor: 'pointer', textAlign: 'left' }}>
            🌐 Global Library
          </button>
        </Link>
      </aside>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '60px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
        <div style={{ width: '100%', maxWidth: '640px', backgroundColor: '#ffffff', border: '1px solid #E8E2D9', borderRadius: '24px', padding: '40px', boxShadow: '0 4px 20px rgba(197, 168, 128, 0.05)' }}>
          
          {/* Progress Indicator */}
          {step < 4 && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
              {[1, 2, 3].map((s) => (
                <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', backgroundColor: step >= s ? '#C5A880' : '#E8E2D9', transition: 'all 0.3s ease' }} />
              ))}
            </div>
          )}

          {/* STEP 1: WELCOME & IDENTITY ROLE */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <span style={{ color: '#C5A880', fontSize: '11px', fontWeight: 'bold', tracking: '0.2em', textTransform: 'uppercase' }}>Onboarding</span>
                <h1 style={{ margin: '4px 0 8px 0', fontSize: '32px', fontWeight: '800', letterSpacing: '-0.5px' }}>Welcome Producer Saab</h1>
                <p style={{ margin: 0, color: '#777777', fontSize: '14px' }}>Let's build your custom musical profile grid. What is your primary trade?</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                {['Music Producer', 'Beatmaker', 'Lyricist / Songwriter', 'Audio Engineer', 'Vocalist'].map((role) => (
                  <label key={role} style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', padding: '18px', border: producerRole === role ? '2px solid #C5A880' : '1px solid #E8E2D9', borderRadius: '14px', cursor: 'pointer', backgroundColor: producerRole === role ? '#FAF6F0' : 'transparent', transition: 'all 0.2s ease' }}>
                    <span style={{ fontSize: '15px', fontWeight: '600' }}>{role}</span>
                    <input type="radio" name="role" value={role} checked={producerRole === role} onChange={() => setProducerRole(role)} style={{ marginLeft: 'auto', accentColor: '#C5A880', width: '18px', height: '18px' }} />
                  </label>
                ))}
              </div>

              <button disabled={!producerRole} onClick={() => setStep(2)} style={{ marginTop: '12px', padding: '16px', borderRadius: '30px', border: 'none', backgroundColor: producerRole ? '#111111' : '#E8E2D9', color: '#ffffff', fontWeight: 'bold', cursor: producerRole ? 'pointer' : 'not-allowed', transition: 'background-color 0.2s' }}>
                Continue to Social Links →
              </button>
            </div>
          )}

          {/* STEP 2: SOCIAL HANDLES (1 COMPULSORY) */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: '800' }}>Link Your Studio Profiles</h2>
                <p style={{ margin: 0, color: '#777777', fontSize: '14px' }}>You must provide at least 1 primary platform link so creators can discover you.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Compulsory Block */}
                <div style={{ padding: '20px', border: '1px solid #C5A880', borderRadius: '16px', backgroundColor: '#FAF6F0' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#C5A880', marginBottom: '8px' }}>🎯 Primary Platform (Compulsory)</label>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                    {['instagram', 'spotify', 'soundcloud'].map((plat) => (
                      <button key={plat} onClick={() => setPrimaryPlatform(plat)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid', borderColor: primaryPlatform === plat ? '#C5A880' : '#E8E2D9', backgroundColor: primaryPlatform === plat ? '#C5A880' : '#ffffff', color: primaryPlatform === plat ? '#ffffff' : '#111111', fontWeight: '600', textTransform: 'capitalize', cursor: 'pointer' }}>
                        {plat}
                      </button>
                    ))}
                  </div>
                  <input type="url" placeholder={`Enter your ${primaryPlatform} URL link...`} value={primaryUrl} onChange={(e) => setPrimaryUrl(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box' }} required />
                </div>

                {/* Optional Entries */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#777777', marginBottom: '8px' }}>Additional Profiles (Optional)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {primaryPlatform !== 'spotify' && (
                      <input type="url" placeholder="Spotify URL" value={spotifyUrl} onChange={(e) => setSpotifyUrl(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box' }} />
                    )}
                    {primaryPlatform !== 'soundcloud' && (
                      <input type="url" placeholder="SoundCloud URL" value={soundcloudUrl} onChange={(e) => setSoundcloudUrl(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box' }} />
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '16px', borderRadius: '30px', border: '1px solid #E8E2D9', backgroundColor: 'transparent', fontWeight: 'bold', cursor: 'pointer' }}>
                  Back
                </button>
                <button disabled={!isStep2Valid} onClick={() => setStep(3)} style={{ flex: 2, padding: '16px', borderRadius: '30px', border: 'none', backgroundColor: isStep2Valid ? '#111111' : '#E8E2D9', color: '#ffffff', fontWeight: 'bold', cursor: isStep2Valid ? 'pointer' : 'not-allowed' }}>
                  Select Styles & Genres →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: GENRE & STYLE SELECTION */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '24px', fontWeight: '800' }}>Select Your Sonic Style</h2>
                <p style={{ margin: 0, color: '#777777', fontSize: '14px' }}>Choose at least one core genre option that defines your signature tracks.</p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', margin: '8px 0' }}>
                {['Hip Hop', 'Trap', 'Drill', 'R&B', 'Electronic / EDM', 'Pop', 'Rock / Metal', 'Lo-Fi / Jazz', 'Boom Bap', 'Afrobeats', 'Ambient'].map((genre) => {
                  const selected = selectedGenres.includes(genre);
                  return (
                    <button key={genre} onClick={() => toggleGenre(genre)} style={{ padding: '12px 20px', borderRadius: '30px', border: '1px solid', borderColor: selected ? '#C5A880' : '#E8E2D9', backgroundColor: selected ? '#C5A880' : '#ffffff', color: selected ? '#ffffff' : '#555555', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}>
                      {genre} {selected ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, padding: '16px', borderRadius: '30px', border: '1px solid #E8E2D9', backgroundColor: 'transparent', fontWeight: 'bold', cursor: 'pointer' }}>
                  Back
                </button>
                <button disabled={!isStep3Valid} onClick={() => setStep(4)} style={{ flex: 2, padding: '16px', borderRadius: '30px', border: 'none', backgroundColor: isStep3Valid ? '#0f2416' : '#E8E2D9', color: '#ffffff', fontWeight: 'bold', cursor: isStep3Valid ? 'pointer' : 'not-allowed' }}>
                  Complete Profile Launch ✨
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PROFILE SUCCESS / COMPLETION VIEW */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '40px', backgroundColor: '#FAF6F0', display: 'flex', alignItems: 'center', justifyCented: 'center', fontSize: '36px', border: '2px dashed #C5A880', lineHeight: '80px', justifyContent: 'center' }}>👑</div>
              
              <div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '800' }}>Your Profile is Active!</h2>
                <p style={{ margin: 0, color: '#777777', fontSize: '15px' }}>Welcome to the inner circle, Producer Saab.</p>
              </div>

              {/* Summary Showcase Badge Card */}
              <div style={{ width: '100%', backgroundColor: '#FAF8F5', border: '1px solid #E8E2D9', borderRadius: '16px', padding: '20px', boxSizing: 'border-box', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '11px', color: '#C5A880' }}>Creator Status</span>
                  <span style={{ backgroundColor: '#111111', color: '#ffffff', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{producerRole}</span>
                </div>
                <p style={{ margin: '0 0 8px 0', fontSize: '13px' }}><strong>Verified Links:</strong> {primaryUrl}</p>
                <p style={{ margin: 0, fontSize: '13px' }}><strong>Styles Selected:</strong> {selectedGenres.join(', ')}</p>
              </div>

              <Link href="/feed" style={{ width: '100%', textDecoration: 'none', marginTop: '12px' }}>
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
