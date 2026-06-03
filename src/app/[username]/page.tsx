'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function PublicProfilePage({ params }) {
  // Safe extraction of the profile handle from the URL route
  const rawUsername = params?.username || 'Producer';
  const displayHandle = rawUsername.toLowerCase();

  // Mock Data aligned with your profile setup (@chaotic_stone / @nthakur styles)
  const [producerRole] = useState('Music Producer');
  const [selectedGenres] = useState(['Coke Studio', 'Hip Hop', 'Ambient']);
  
  // Audio tracking for live playback element
  const [trackTitle] = useState('midnight');
  const [trackGenre] = useState('Coke Studio');
  const [trackBpm] = useState('90');
  const [trackKey] = useState('F# Minor');
  const [instrumentType] = useState('Guitar Loop / Sample');
  
  // Standard background preview track stream (You can drop an asset URL here later!)
  const [audioUrl] = useState('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#FAF8F5', color: '#111111' }}>
      
      {/* PUBLIC NAVBAR SIDE PANEL */}
      <aside style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #E8E2D9', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'sticky', top: 0, height: '100vh', boxSizing: 'border-box' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' }}>
            🎵 Producer Saab
          </div>
        </Link>
        
        <div style={{ padding: '14px 0', borderBottom: '1px solid #FAF8F5', marginBottom: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#C5A880', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Browsing Profile</span>
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
      </aside>

      {/* CORE PROFILE INTERFACE */}
      <main style={{ flex: 1, padding: '40px 60px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '980px', display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '40px', alignItems: 'start' }}>
          
          {/* LEFT SECTION: PROFILE CANVAS HEADER & PORTFOLIO TRACK CARD */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* HERO PROFILE HEADER */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #E8E2D9', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
              <div style={{ height: '140px', backgroundColor: '#C5A880', backgroundImage: 'linear-gradient(45deg, #C5A880, #E8E2D9)' }} />
              
              <div style={{ padding: '32px', position: 'relative', marginTop: '-60px' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50px', backgroundColor: '#111111', border: '4px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', color: '#ffffff' }}>
                  🎧
                </div>

                <div style={{ marginTop: '20px' }}>
                  <h1 style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px' }}>@{displayHandle} Studio</h1>
                  <p style={{ margin: '0 0 12px 0', color: '#C5A880', fontWeight: '700', fontSize: '15px' }}>{producerRole} • Verified Creator</p>
                </div>

                <p style={{ margin: '12px 0 20px 0', color: '#666666', fontSize: '14px', lineHeight: '1.6' }}>
                  Welcome to my verified audio drops portfolio space. Stream my latest sound stems, melody lines, and instrument layers below.
                </p>

                {/* Genre Style Badges Showcase Block */}
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

            {/* SOUND AUDIO PORTFOLIO TRACK SHOWCASE (WITH PLAYBACK SUPPORT) */}
            <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', border: '1px solid #E8E2D9' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '800' }}>Featured Tracks & Audio Drops</h3>
              <p style={{ margin: '0 0 24px 0', color: '#777777', fontSize: '13px' }}>Listen to custom sound architectures directly inside the browser player.</p>

              {trackTitle ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', backgroundColor: '#FAF8F5', borderRadius: '16px', border: '1px solid #E8E2D9' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: '#111111', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>💿</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', textTransform: 'capitalize' }}>{trackTitle}</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{trackGenre} • {trackBpm} BPM • {trackKey} • {instrumentType}</p>
                    </div>
                    <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 'bold', backgroundColor: '#f0fdf4', padding: '4px 10px', borderRadius: '12px' }}>Live</span>
                  </div>

                  {/* Integrated Public HTML5 Audio Interface Element */}
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
                  <p style={{ margin: 0, fontWeight: '600' }}>This artist hasn't published any files yet.</p>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT SECTION: METRIC INSIGHTS INTERFACES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <section style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '24px', border: '1px solid #E8E2D9', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '800' }}>Connect with Creator</h4>
              <p style={{ margin: '0 0 20px 0', color: '#666666', fontSize: '13px', lineHeight: '1.5' }}>Follow for network feed alerts when new loops or stems launch.</p>
              
              <button style={{ width: '100%', padding: '14px', borderRadius: '30px', border: 'none', backgroundColor: '#111111', color: '#ffffff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }} onClick={function() { alert('Connected safely!'); }}>
                ＋ Follow Artist
              </button>
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
