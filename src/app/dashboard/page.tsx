'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const database = createClient(supabaseUrl, supabaseAnonKey);

export default function OnboardingDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Custom Studio States
  const [role, setRole] = useState('Music Producer');
  const [genre, setGenre] = useState('');
  const [instagram, setInstagram] = useState('');
  const [spotify, setSpotify] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await database.auth.getUser();
      if (!user) {
        router.push('/signin');
        return;
      }

      // Check if they are already fully onboarded
      const { data: profile } = await database
        .from('profiles')
        .select('onboarded')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.onboarded === true) {
        router.push('/feed'); // Skip straight to LinkedIn feed if already filled out!
      }
      setLoading(false);
    };
    checkSession();
  }, [router]);

  const saveStudioProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await database.auth.getUser();
    if (!user) return;

    // Save all custom metadata fields directly into the profiles row
    const { error } = await database
      .from('profiles')
      .update({
        role: role,
        genre: genre,
        instagram_handle: instagram,
        spotify_link: spotify,
        bio: bio,
        onboarded: true // Flip flag to unlock feed access
      })
      .eq('id', user.id);

    if (!error) {
      router.push('/feed'); // Seamless navigation right into the LinkedIn audio experience!
    } else {
      alert(`Error saving profile: ${error.message}`);
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', fontFamily: 'sans-serif' }}>Configuring Studio Workspace...</div>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF8F5', fontFamily: 'sans-serif', padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '500px', padding: '40px', borderRadius: '24px', border: '1px solid #E8E2D9', boxShadow: '0 4px 25px rgba(0,0,0,0.03)' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span style={{ fontSize: '44px' }}>🎛️</span>
          <h2 style={{ fontSize: '28px', fontWeight: '800', margin: '10px 0' }}>Setup Your Studio Profile</h2>
          <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>Introduce your sound specialties to the Producer Saab community.</p>
        </header>

        <form onSubmit={saveStudioProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#555', marginBottom: '6px' }}>I identify primarily as a:</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', fontSize: '14px', backgroundColor: '#fff' }}>
              <option value="Music Producer">🎹 Music Producer</option>
              <option value="Beat Maker">🥁 Beat Maker</option>
              <option value="Singer / Vocalist">🎤 Singer / Vocalist</option>
              <option value="Audio Engineer">🎚️ Audio Engineer</option>
              <option value="Songwriter">📝 Songwriter</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#55', marginBottom: '6px' }}>Main Music Genres</label>
            <input type="text" placeholder="e.g., Hip Hop, Trap, Punjabi, Lo-Fi" value={genre} onChange={(e) => setGenre(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px' }} required />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#55', marginBottom: '6px' }}>Instagram Handle</label>
              <input type="text" placeholder="@producer_saab" value={instagram} onChange={(e) => setInstagram(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#55', marginBottom: '6px' }}>Spotify Link</label>
              <input type="url" placeholder="https://open.spotify.com/..." value={spotify} onChange={(e) => setSpotify(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#55', marginBottom: '6px' }}>Short Studio Bio</label>
            <textarea placeholder="Tell us about your DAWs, sample projects, or sound style..." value={bio} onChange={(e) => setBio(e.target.value)} style={{ width: '100%', padding: '14px', border: '1px solid #E8E2D9', borderRadius: '8px', height: '80px', resize: 'none', fontFamily: 'sans-serif' }} required />
          </div>

          <button type="submit" style={{ width: '100%', padding: '16px', borderRadius: '30px', border: 'none', backgroundColor: '#111', color: '#fff', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', marginTop: '6px' }}>
            Save & Open Workstation Feed
          </button>
        </form>
      </div>
    </div>
  );
}
