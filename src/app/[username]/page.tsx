'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export default function ProfilePage({ params }: { params: { username: string } }) {
  const rawUsername = params?.username || 'Producer';
  const displayHandle = rawUsername.toLowerCase();

  // Initialize the browser-compatible Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Identity & View State Triggers
  const [isOwner, setIsOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Core Dynamic Profile States
  const [profileId, setProfileId] = useState('');
  const [producerRole, setProducerRole] = useState('Music Producer');
  const [profileBio, setProfileBio] = useState('Welcome to my verified audio drops portfolio space. Stream my latest sound stems, melody lines, and instrument layers below.');
  const [selectedGenres, setSelectedGenres] = useState(['Coke Studio', 'Hip Hop', 'Ambient']);

  // Featured Audio Track States
  const [trackTitle, setTrackTitle] = useState('midnight');
  const [trackGenre, setTrackGenre] = useState('Coke Studio');
  const [trackBpm, setTrackBpm] = useState('90');
  const [trackKey, setTrackKey] = useState('F# Minor');
  const [instrumentType, setInstrumentType] = useState('Guitar Loop / Sample');
  const [audioUrl, setAudioUrl] = useState('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');

  // Load profile data and verify visitor authentication state
  useEffect(() => {
    async function checkIdentityAndLoadData() {
      try {
        // 1. Pull the profile information matching the URL handle path
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', displayHandle)
          .maybeSingle();

        if (profileData) {
          setProfileId(profileData.id);
          if (profileData.role) setProducerRole(profileData.role);
          if (profileData.bio) setProfileBio(profileData.bio);
          if (profileData.genres) setSelectedGenres(profileData.genres);
          
          // Pull associated tracks if they exist
          if (profileData.track_title) setTrackTitle(profileData.track_title);
          if (profileData.track_genre) setTrackGenre(profileData.track_genre);
          if (profileData.track_bpm) setTrackBpm(profileData.track_bpm);
          if (profileData.track_key) setTrackKey(profileData.track_key);
          if (profileData.instrument_type) setInstrumentType(profileData.instrument_type);
          if (profileData.audio_url) setAudioUrl(profileData.audio_url);
        }

        // 2. Fetch active browser cookie session tokens
        const { data: { session } } = await supabase.auth.getSession();

        // 3. Match user ID to see if the visitor is the explicit account owner
        if (session?.user && profileData && session.user.id === profileData.id) {
          setIsOwner(true);
        }
      } catch (err) {
        console.error('Profile loading sequence failure:', err);
      } finally {
        setLoading(false);
      }
    }

    checkIdentityAndLoadData();
  }, [displayHandle]);

  // Handle saving data directly back to your Supabase tables
  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: profileId,
          username: displayHandle,
          role: producerRole,
          bio: profileBio,
          track_title: trackTitle,
          track_genre: trackGenre,
          track_bpm: trackBpm,
          track_key: trackKey,
          instrument_type: instrumentType,
          audio_url: audioUrl
        });

      if (error) throw error;
      setIsEditing(false);
    } catch (err: any) {
      alert(`⚠️ Could not save modifications: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF8F5', fontFamily: 'sans-serif' }}>
        <p style={{ fontWeight: '600', color: '#C5A880' }}>Loading Workstation Profile...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#FAF8F5', color: '#111111' }}>
      
      {/* NAVBAR SIDE PANEL */}
      <aside style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #E8E2D9', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'sticky', top: 0, height: '100vh', boxSizing: 'border-box' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>
            🎵 Producer Saab
          </div>
        </Link>
        
        <div style={{ padding: '14px 0', borderBottom: '1px solid #FAF8F5', marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#C5A880', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isOwner ? '⚡ Your Studio Active' : 'Browsing Profile'}
          </span>
        </div>

        <Link href="/" style={{ textDecoration: 'none', width: '100%' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: 'transparent', color: '#444', fontWeight: '500', cursor: 'pointer', textAlign: 'left' }}>
            🏠 Return Home
          </button>
        </Link>
        <Link href="/feed" style={{ textDecoration: 'none', width: '100%' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: 'transparent', color: '#444', fontWeight: '500', cursor: 'pointer', textAlign: 'left' }}>
            🌐 Global Library
          </button>
        </Link>

        {/* OWNER SIDEBAR CONTROL ANCHORS */}
        {isOwner && (
          <div style={{ marginTop: 'auto', borderTop: '1px solid #E8E2D9', paddingTop: '20px' }}>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #C5A880', backgroundColor: isEditing ? '#FAF6F0' : '#ffffff', color: '#A3855C', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
            >
              {isEditing ? '❌ Cancel Changes' : '⚙️ Studio Dashboard'}
            </button>
          </div>
        )}
      </aside>

      {/* CORE PROFILE INTERFACE */}
      <main style={{ flex: 1, padding: '40px 60px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '980px', display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '40px', alignItems: 'start' }}>
          
          {/* LEFT SECTION: HEADERS & AUDIO DRAG PORTS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* HERO PROFILE HEADER DESIGN */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #E8E2D9', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
              <div style={{ height: '140px', backgroundColor: '#C5A880', backgroundImage: 'linear-gradient(45deg, #C5A880, #E8E2D9)' }} />
              
              <div style={{ padding: '32px', position: 'relative', marginTop: '-60px' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50px', backgroundColor: '#111111', border: '4px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', color: '#ffffff' }}>
                  🎧
                </div>

                <div style={{ marginTop: '20px' }}>
                  <h1 style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px' }}>@{displayHandle} Studio</h1>
                  
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={producerRole} 
                      onChange={(e) => setProducerRole(e.target.value)} 
                      style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '6px', border: '1px solid #C5A880', width: '60%', margin: '6px 0' }} 
                    />
                  ) : (
                    <p style={{ margin: '0 0 12px 0', color: '#C5A880', fontWeight: '700', fontSize: '15px' }}>{producerRole} • Verified Creator</p>
                  )}
                </div>

                {isEditing ? (
                  <textarea 
                    value={profileBio} 
                    onChange={(e) => setProfileBio(e.target.value)} 
                    rows={3}
                    style={{ padding: '12px', fontSize: '14px', borderRadius: '6px', border: '1px solid #C5A880', width: '100%', boxSizing: 'border-box', margin: '10px 0' }}
                  />
                ) : (
                  <p style={{ margin: '12px 0 20px 0', color: '#666666', fontSize: '14px', lineHeight: '1.6' }}>{profileBio}</p>
                )}

                {/* Genre Badges Block */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid #FAF8F5', paddingTop: '20px' }}>
                  {selectedGenres.map((genre) => (
                    <span key={genre} style={{ backgroundColor: '#FAF6F0', color: '#C5A880', fontSize: '12px', fontWeight: 'bold', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(197, 168, 128, 0.2)' }}>
                      🎵 {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* LIVE STUDIO TRACK MANAGEMENT SUITE */}
            <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', border: '1px solid #E8E2D9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '800' }}>Featured Tracks & Audio Drops</h3>
                  <p style={{ margin: 0, color: '#777777', fontSize: '13px' }}>Listen to custom sound architectures directly inside the browser player.</p>
                </div>
                {isOwner && !isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', backgroundColor: '#FAF6F0', color: '#C5A880', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                  >
                    🔄 Update Audio Asset
                  </button>
                )}
              </div>

              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#FAF6F0', padding: '24px', borderRadius: '16px', border: '1px dashed #C5A880' }}>
                  <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#A3855C' }}>🎛️ Audio Suite Update Form</h5>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input type="text" placeholder="Track Name" value={trackTitle} onChange={(e) => setTrackTitle(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #E8E2D9' }} />
                    <input type="text" placeholder="Genre" value={trackGenre} onChange={(e) => setTrackGenre(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #E8E2D9' }} />
                    <input type="text" placeholder="BPM" value={trackBpm} onChange={(e) => setTrackBpm(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #E8E2D9' }} />
                    <input type="text" placeholder="Key Scala" value={trackKey} onChange={(e) => setTrackKey(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #E8E2D9' }} />
                  </div>
                  <input type="text" placeholder="Instrument/Stem Class" value={instrumentType} onChange={(e) => setInstrumentType(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #E8E2D9' }} />
                  <input type="text" placeholder="Direct Audio File URL (.mp3 Asset)" value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #E8E2D9' }} />
                  
                  <button 
                    onClick={handleProfileUpdate}
                    style={{ width: '100%', padding: '14px', borderRadius: '30px', border: 'none', backgroundColor: '#111111', color: '#ffffff', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', marginTop: '10px' }}
                  >
                    💾 Save & Publish Studio Configurations
                  </button>
                </div>
              ) : trackTitle ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', backgroundColor: '#FAF8F5', borderRadius: '16px', border: '1px solid #E8E2D9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: '#111111', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                      💿
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', textTransform: 'capitalize' }}>{trackTitle}</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{trackGenre} • {trackBpm} BPM • {trackKey} • {instrumentType}</p>
                    </div>
                    <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 'bold', backgroundColor: '#f0fdf4', padding: '4px 10px', borderRadius: '12px' }}>Live</span>
                  </div>

                  {audioUrl && (
                    <div style={{ width: '100%', marginTop: '4px', borderTop: '1px solid #E8E2D9', paddingTop: '12px' }}>
                      <audio controls src={audioUrl} style={{ width: '100%', accentColor: '#C5A880' }}>
                        Your browser does not support audio elements.
                      </audio>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999', border: '2px dashed #FAF8F5', borderRadius: '16px' }}>
                  <p style={{ margin: 0, fontWeight: '600' }}>This workspace has no active tracks published.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SECTION: METRIC BAR ACTIONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <section style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '24px', border: '1px solid #E8E2D9', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '800' }}>
                {isOwner ? 'Your Studio Actions' : 'Connect with Creator'}
              </h4>
              <p style={{ margin: '0 0 20px 0', color: '#666666', fontSize: '13px', lineHeight: '1.5' }}>
                {isOwner ? 'Manage how your audio network interacts with your active loops.' : 'Follow for network feed alerts when new loops or stems launch.'}
              </p>
              
              {isOwner ? (
                <button 
                  style={{ width: '100%', padding: '14px', borderRadius: '30px', border: 'none', backgroundColor: '#C5A880', color: '#ffffff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? '📁 Exit Form View' : '⚙️ Custom Editing Layout'}
                </button>
              ) : (
                <button 
                  style={{ width: '100%', padding: '14px', borderRadius: '30px', border: 'none', backgroundColor: '#111111', color: '#ffffff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }} 
                  onClick={() => alert('Connected safely!')}
                >
                  ＋ Follow Artist
                </button>
              )}
            </section>

            <section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #E8E2D9', fontSize: '13px' }}>
              <h5 style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#C5A880', letterSpacing: '0.05em' }}>Studio Credentials</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><strong>Handle:</strong> @{displayHandle}</div>
                <div><strong>Trade Spec:</strong> {producerRole}</div>
              </div>
            </section>

          </div>

        </div>
      </main>

    </div>
  );
}
