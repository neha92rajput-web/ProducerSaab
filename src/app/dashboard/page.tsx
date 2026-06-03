'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  // Navigation & UI States
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Profile Setup Mock Data (Pulled from image_a3cda5.jpg)
  const [producerRole, setProducerRole] = useState('Music Producer');
  const [instagramUrl, setInstagramUrl] = useState('https://instagram.com/chaotic_stone');

  // Audio Upload Form State Variables
  const [trackTitle, setTrackTitle] = useState('');
  const [selectedTrackGenre, setSelectedTrackGenre] = useState('');
  const [trackBpm, setTrackBpm] = useState('');
  const [trackKey, setTrackKey] = useState('');
  const [instrumentType, setInstrumentType] = useState('');
  const [uploadStatus, setUploadStatus] = useState('Idle');
  
  // NEW: Audio file tracking and stream object URLs
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');

  // Handle local audio file loading and create a working play url stream
  function handleFileChange(event) {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      setAudioFile(selectedFile);
      
      // Generate a temporary browser URL stream for the player element
      const streamingUrl = URL.createObjectURL(selectedFile);
      setAudioUrl(streamingUrl);
    }
  }

  function simulateAudioUpload(event) {
    event.preventDefault();
    setUploadStatus('Progress');
    setTimeout(function() {
      setUploadStatus('Success');
    }, 1500);
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#FAF8F5', color: '#111111' }}>
      
      {/* SIDEBAR NAVIGATION */}
      <aside style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #E8E2D9', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          🎵 Producer Saab
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: '#C5A880', color: '#ffffff', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}>
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
          
          {/* LEFT COLUMN: PROFILE CARD AREA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* HERO COVER PROFILE HIGHLIGHT */}
            <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #E8E2D9', overflow: 'hidden' }}>
              <div style={{ height: '140px', backgroundColor: '#C5A880', backgroundImage: 'linear-gradient(45deg, #C5A880, #E8E2D9)' }} />
              
              <div style={{ padding: '32px', position: 'relative', marginTop: '-60px' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50px', backgroundColor: '#111111', border: '4px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', color: '#ffffff' }}>
                  👑
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h1 style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px' }}>@chaotic_stone Studio</h1>
                    <p style={{ margin: '0 0 12px 0', color: '#C5A880', fontWeight: '700', fontSize: '15px' }}>{producerRole} • Verified Creator</p>
                  </div>
                </div>

                <p style={{ margin: '12px 0 20px 0', color: '#666666', fontSize: '14px', lineHeight: '1.6' }}>
                  Welcome back to your central audio drops processing terminal. Here you can showcase your profile and deploy new files to the community.
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid #FAF8F5', paddingTop: '20px' }}>
                  <span style={{ backgroundColor: '#FAF6F0', color: '#C5A880', fontSize: '12px', fontWeight: 'bold', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(197, 168, 128, 0.2)' }}>🎵 Coke Studio</span>
                  <span style={{ backgroundColor: '#FAF6F0', color: '#C5A880', fontSize: '12px', fontWeight: 'bold', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(197, 168, 128, 0.2)' }}>🎵 Hip Hop</span>
                  <span style={{ backgroundColor: '#FAF6F0', color: '#C5A880', fontSize: '12px', fontWeight: 'bold', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(197, 168, 128, 0.2)' }}>🎵 Ambient</span>
                </div>
              </div>
            </div>

            {/* FEATURED AUDIO SHOWCASE REEL */}
            <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', border: '1px solid #E8E2D9' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '800' }}>Featured Tracks & Audio Drops</h3>
              <p style={{ margin: '0 0 24px 0', color: '#777777', fontSize: '13px' }}>Your published sounds appearing on the community feed panel.</p>

              {trackTitle ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px', backgroundColor: '#FAF8F5', borderRadius: '16px', border: '1px solid #E8E2D9' }}>
                  
                  {/* Track Label and Details Header info row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: '#111111', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>💿</div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700' }}>{trackTitle}</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{selectedTrackGenre} • {trackBpm} BPM • {trackKey} • {instrumentType}</p>
                    </div>
                    <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 'bold', backgroundColor: '#f0fdf4', padding: '4px 10px', borderRadius: '12px' }}>Live</span>
                  </div>

                  {/* UPDATED: Embedded HTML5 Audio Controller bar container */}
                  {audioUrl && (
                    <div style={{ width: '100%', marginTop: '4px', borderTop: '1px solid #E8E2D9', paddingTop: '12px' }}>
                      <audio controls src={audioUrl} style={{ width: '100%', accentColor: '#C5A880' }}>
                        Your browser does not support the audio playback element.
                      </audio>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999', border: '2px dashed #FAF8F5', borderRadius: '16px' }}>
                  <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#555' }}>No active audio files cataloged</p>
                  <p style={{ margin: 0, fontSize: '13px' }}>Click the launch controller button on the right to place your first drop track file.</p>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: HUB METRICS & LAUNCH PANEL */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <section style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '24px', border: '1px solid #E8E2D9' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '800' }}>Studio Control Rack</h4>
              <p style={{ margin: '0 0 20px 0', color: '#666666', fontSize: '13px', lineHeight: '1.5' }}>Ready to send a loop layer or master sample block to the community pool?</p>
              
              <button style={{ width: '100%', padding: '16px', borderRadius: '30px', border: 'none', backgroundColor: '#111111', color: '#ffffff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }} onClick={function() { setShowUploadModal(true); setUploadStatus('Idle'); }}>
                📤 Upload Audio File
              </button>
            </section>

            <section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '20px', border: '1px solid #E8E2D9', fontSize: '13px' }}>
              <h5 style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#C5A880', letterSpacing: '0.05em' }}>Studio Dashboard Profile</h5>
              <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><strong>Insta:</strong> chaotic_stone</div>
                <div><strong>Authorized Styles:</strong> Coke Studio, Hip Hop, Ambient</div>
              </div>
            </section>
          </div>

        </div>
      </main>

      {/* UPLOAD FILE CONTAINER MODAL DRAW OVERLAY */}
      {showUploadModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '540px', borderRadius: '24px', padding: '36px', border: '1px solid #E8E2D9', position: 'relative', boxSizing: 'border-box' }}>
            
            <button style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999' }} onClick={function() { setShowUploadModal(false); }}>✕</button>

            <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '800' }}>📤 Upload Audio Project Drop</h3>
            <p style={{ margin: '0 0 24px 0', color: '#777777', fontSize: '13px' }}>Publish custom sound stems directly to the network feed database.</p>

            <form onSubmit={simulateAudioUpload} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px' }}>Audio file track (.mp3 or .wav) *</label>
                {/* CONNECTED: Added the file change handler tracker */}
                <input type="file" accept=".mp3,.wav" onChange={handleFileChange} style={{ width: '100%', padding: '12px', border: '2px dashed #E8E2D9', borderRadius: '8px', boxSizing: 'border-box', backgroundColor: '#FAF8F5' }} required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px' }}>Track / Sample Title *</label>
                <input type="text" placeholder="e.g., Midnight" value={trackTitle} onChange={function(e) { setTrackTitle(e.target.value); }} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box', fontSize: '13px' }} required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px' }}>Audio Genre Classification *</label>
                <select value={selectedTrackGenre} onChange={function(e) { setSelectedTrackGenre(e.target.value); }} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', fontSize: '13px', backgroundColor: '#ffffff' }} required>
                  <option value="">-- Choose Target Track Genre --</option>
                  <option value="Coke Studio">Coke Studio</option>
                  <option value="Hip Hop">Hip Hop</option>
                  <option value="Ambient">Ambient</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px' }}>Tempo BPM *</label>
                  <input type="number" placeholder="90" value={trackBpm} onChange={function(e) { setTrackBpm(e.target.value); }} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', boxSizing: 'border-box', fontSize: '13px' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px' }}>Signature Key Scale *</label>
                  <select value={trackKey} onChange={function(e) { setTrackKey(e.target.value); }} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', fontSize: '13px', backgroundColor: '#ffffff' }} required>
                    <option value="">-- Select Dropdown Scale --</option>
                    <option value="F# Minor">F# Minor</option>
                    <option value="C Major">C Major</option>
                    <option value="A Minor">A Minor</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555555', marginBottom: '6px' }}>Instrument Stem / Sample Layer Source *</label>
                <select value={instrumentType} onChange={function(e) { setInstrumentType(e.target.value); }} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', fontSize: '13px', backgroundColor: '#ffffff' }} required>
                  <option value="">-- Choose Loop Instrument Base Layer --</option>
                  <option value="Guitar Loop / Sample">Guitar Loop / Sample</option>
                  <option value="Piano / Keys Loop">Piano / Keys Loop</option>
                  <option value="Synth Loop">Synth Loop</option>
                </select>
              </div>

              {uploadStatus === 'Idle' && (
                <button type="submit" style={{ marginTop: '10px', width: '100%', padding: '16px', border: 'none', borderRadius: '30px', backgroundColor: '#111111', color: '#ffffff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>
                  Publish Stems to Global Library Feed
                </button>
              )}

              {uploadStatus === 'Progress' && (
                <button type="button" style={{ marginTop: '10px', width: '100%', padding: '16px', border: 'none', borderRadius: '30px', backgroundColor: '#F0EBE3', color: '#C5A880', fontWeight: 'bold', fontSize: '14px', cursor: 'not-allowed' }}>
                  ⚡ Syncing audio array blocks...
                </button>
              )}

              {uploadStatus === 'Success' && (
                <div style={{ marginTop: '10px', textAlign: 'center', backgroundColor: '#FAF6F0', border: '1px solid #C5A880', borderRadius: '12px', padding: '14px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#B8986E' }}>🎉 Project uploaded securely onto feed!</span>
                  <button type="button" onClick={function() { setShowUploadModal(false); }} style={{ display: 'block', margin: '8px auto 0 auto', background: 'none', border: 'none', color: '#111111', fontSize: '12px', fontWeight: 'bold', textDecoration: 'underline', cursor: 'pointer' }}>Return to Studio Feed</button>
                </div>
              )}
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
