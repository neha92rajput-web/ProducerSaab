'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export default function ProfilePage({ params }: { params: { username: string } }) {
  // 🔥 THE FIX: Use decodeURIComponent to turn %20 back into a space
  // This ensures that "Neha%20Thakur" becomes "Neha Thakur" before we query the DB
  const rawUsername = params?.username ? decodeURIComponent(params.username) : 'Producer';
  const displayHandle = rawUsername.toLowerCase();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [isOwner, setIsOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [profileId, setProfileId] = useState('');
  const [producerRole, setProducerRole] = useState('Music Producer');
  const [profileBio, setProfileBio] = useState('Welcome to my verified audio drops portfolio space.');
  const [selectedGenres, setSelectedGenres] = useState(['Coke Studio', 'Hip Hop', 'Ambient']);

  const [trackTitle, setTrackTitle] = useState('midnight');
  const [trackGenre, setTrackGenre] = useState('Coke Studio');
  const [trackBpm, setTrackBpm] = useState('90');
  const [trackKey, setTrackKey] = useState('F# Minor');
  const [instrumentType, setInstrumentType] = useState('Guitar Loop / Sample');
  const [audioUrl, setAudioUrl] = useState('');

  useEffect(() => {
    async function checkIdentityAndLoadData() {
      if (!displayHandle) return;
      
      try {
        // Now using the cleaned displayHandle
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
          if (profileData.track_title) setTrackTitle(profileData.track_title);
          if (profileData.track_genre) setTrackGenre(profileData.track_genre);
          if (profileData.track_bpm) setTrackBpm(profileData.track_bpm);
          if (profileData.track_key) setTrackKey(profileData.track_key);
          if (profileData.instrument_type) setInstrumentType(profileData.instrument_type);
          if (profileData.audio_url) setAudioUrl(profileData.audio_url);
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && profileData && session.user.id === profileData.id) {
          setIsOwner(true);
        }
      } catch (err) {
        console.error('Profile loading error:', err);
      } finally {
        setLoading(false);
      }
    }

    checkIdentityAndLoadData();
  }, [displayHandle]);

  // ... (The rest of your existing JSX UI remains exactly the same)
  
  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Studio...</div>;
  }

  return (
    // ... (Your existing UI code here)
    <div style={{ padding: '20px' }}>
        <h1>Welcome to {rawUsername}'s Studio</h1>
        {/* Your existing profile design */}
    </div>
  );
}
