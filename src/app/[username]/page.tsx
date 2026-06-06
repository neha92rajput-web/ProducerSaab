'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function ProfilePage() {
  const params = useParams();
  // 🔥 THE FIX: decodeURIComponent handles the space in names correctly
  const username = decodeURIComponent(params.username as string);
  const displayHandle = username.toLowerCase();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', displayHandle)
        .maybeSingle();
      
      setProfileData(data);
      setLoading(false);
    }
    loadProfile();
  }, [displayHandle]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Welcome to {username}'s Studio</h1>
      {profileData ? (
        <div>
          <p>Role: {profileData.role}</p>
          {/* Add your audio player here if needed */}
        </div>
      ) : (
        <p>Profile not found.</p>
      )}
    </div>
  );
}
