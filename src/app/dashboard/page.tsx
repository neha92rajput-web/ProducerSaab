'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const database = createClient(supabaseUrl, supabaseAnonKey);

export default function DashboardPage() {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Profile Specific State
  const [userHandle, setUserHandle] = useState('producer');
  const [producerRole, setProducerRole] = useState('Music Producer');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Hip Hop']);

  // Onboarding Input States
  const [formRole, setFormRole] = useState('Music Producer');
  const [formGenres, setFormGenres] = useState<string[]>([]);
  const DEFAULT_GENRES = ['Hip Hop', 'Trap', 'Drill', 'R&B', 'Electronic / EDM', 'Pop', 'Rock / Metal', 'Lo-Fi / Jazz', 'Afrobeats', 'Ambient'];

  useEffect(() => {
    async function fetchStudioProfile() {
      try {
        const { data: { user } } = await database.auth.getUser();
        if (!user) { setAppLoading(false); return; }
        setUserHandle(user.user_metadata?.username || 'saab');
        
        const { data: profile } = await database.from('profiles').select('*').eq('id', user.id).maybeSingle();

        if (profile && profile.onboarded) {
          setIsOnboarded(true);
          setProducerRole(profile.role || 'Music Producer');
          setSelectedGenres(profile.genres || ['Hip Hop']);
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

  const handleOnboardingSubmit = async (e: any) => {
    e.preventDefault();
    setAppLoading(true);
    try {
      const { data: { user } } = await database.auth.getUser();
      if (user) {
        await database.from('profiles').upsert({
          id: user.id,
          role: formRole,
          genres: formGenres,
          onboarded: true
        });
        setProducerRole(formRole);
        setSelectedGenres(formGenres);
        setIsOnboarded(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAppLoading(false);
    }
  };

  if (appLoading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF8F5', fontFamily: 'sans-serif', fontWeight: 'bold', color: '#C5A880' }}>📡 Connecting workspace parameters...</div>;
  }

  // ONBOARDING SCREEN FOR NEW USERS
  if (!isOnboarded) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#FAF8F5', color: '#111111', justifyContent: 'center', padding: '40px 20px', boxSizing: 'border-box' }}>
        <div style={{ width: '100%', maxWidth: '640px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <header style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '24px', border: '1px solid #E8E2D9', textAlign: 'center' }}>
            <span style={{ color: '#C5A880', fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Onboarding Suite</span>
            <h1 style={{ margin: '6px 0 8px 0', fontSize: '30px', fontWeight: '800' }}>Setup Your Creator Profile</h1>
            <p style={{ margin: 0, color: '#777777', fontSize: '14px' }}>Complete your music options to activate your LinkedIn-style dashboard.</p>
          </header>

          <div style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '24px', border: '1px solid #E8E2D9' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800' }}>1. Select Specialty Role</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['Music Producer', 'Beatmaker', 'Audio Engineer', 'Vocalist'].map((role) => (
                <label key={role} style={{ display: 'flex', alignItems: 'center', padding: '14px', border: formRole === role ? '2px solid #C5A880' : '1px solid #E8E2D9', borderRadius: '12px', cursor: 'pointer', backgroundColor: formRole === role ? '#FAF6F0' : 'transparent' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>{role}</span>
                  <input type="radio" name="role" checked={formRole === role} onChange={() => setFormRole(role)} style={{ marginLeft: 'auto', accentColor: '#C5A880' }} />
                </label>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '24px', border: '1px solid #E8E2D9' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800' }}>2. Pick Signature Genres</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {DEFAULT_GENRES.map((g) => {
                const active = formGenres.includes(g);
                return (
                  <button key={g} type="button" onClick={() => toggleFormGenre(g)} style={{ padding: '8px 16px', borderRadius: '30px', border: '1px solid', borderColor: active ? '#C5A880' : '#E8E2D9', backgroundColor: active ? '#C5A880' : '#ffffff', color: active ? '#ffffff' : '#555555', fontWeight: '600', fontSize: '12px', cursor: 'pointer' }}>{g} {active ? '✓' : '+'}</button>
                );
              })}
            </div>
          </div>

          <button onClick={handleOnboardingSubmit} disabled={formGenres.length === 0} style={{ width: '100%', padding: '16px', borderRadius: '35px', border: 'none', backgroundColor: formGenres.length > 0 ? '#111111' : '#E8E2D9', color: '#ffffff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}>Initialize Dashboard Profile Portfolio</button>
        </div>
      </div>
    );
  }

  // THE LINKEDIN-STYLE DASHBOARD SUITE
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#FAF8F5', color: '#111111' }}>
      <aside style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #E8E2D9', padding: '24px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
        <div style={{ fontWeight: 'bold', fontSize: '14px', letterSpacing: '0.15em', marginBottom: '20px' }}>🎵 PRODUCER SAAB</div>
        <button style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: '#C5A880', color: '#ffffff', fontWeight: '600', textAlign: 'left' }}>🎛️ Studio Hub</button>
      </aside>

      <main style={{ flex: 1, padding: '40px 60px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '980px', display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '40px' }}>
          <div>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #E8E2D9', overflow: 'hidden' }}>
              <div style={{ height: '140px', backgroundColor: '#C5A880' }} />
              <div style={{ padding: '32px', marginTop: '-60px' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50px', backgroundColor: '#111111', border: '4px solid #ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', color: '#ffffff' }}>👑</div>
                <h1 style={{ margin: '20px 0 4px 0', fontSize: '28px', fontWeight: '900' }}>@{userHandle} Studio</h1>
                <p style={{ margin: 0, color: '#C5A880', fontWeight: '700' }}>{producerRole} • Verified Member</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '20px', borderTop: '1px solid #FAF8F5', paddingTop: '20px' }}>
                  {selectedGenres.map(g => <span key={g} style={{ backgroundColor: '#FAF6F0', color: '#C5A880', fontSize: '12px', fontWeight: 'bold', padding: '6px 14px', borderRadius: '20px' }}>🎵 {g}</span>)}
                </div>
              </div>
            </div>
          </div>
          <div>
            <section style={{ backgroundColor: '#ffffff', padding: '28px', borderRadius: '24px', border: '1px solid #E8E2D9' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '800' }}>Studio Control Rack</h4>
              <button style={{ width: '100%', padding: '16px', borderRadius: '30px', border: 'none', backgroundColor: '#111111', color: '#ffffff', fontWeight: 'bold', fontSize: '14px' }}>📤 Upload Audio File</button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
