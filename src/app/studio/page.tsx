'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function StudioWorkspace() {
  const router = useRouter();
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await database.auth.getUser();
      if (!user) { router.replace('/signin'); return; }
      const { data: p } = await database.from('profiles').select('*').eq('id', user.id).single();
      setProfile(p || {});
      setLoading(false);
    }
    init();
  }, [router]);

  const saveProfile = async (field: string, value: string) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }));
    await database.from('profiles').update({ [field]: value }).eq('id', profile.id);
  };

  const fields = [
    { key: 'networks', label: 'Add networks...', icon: '🔗' },
    { key: 'instruments', label: 'Add instruments...', icon: '🎹' },
    { key: 'software', label: 'Add software...', icon: '💻' },
    { key: 'country', label: 'Add country...', icon: '🌍' },
    { key: 'city', label: 'Add city...', icon: '📍' },
  ];

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6">
      {/* Container holding both the banner and the button to maintain alignment */}
      <div className="max-w-4xl mx-auto">
        
        {/* Banner Section */}
        <div className="bg-[#D7C9B7] rounded-[2rem] p-8 shadow-sm flex items-center gap-8 min-h-[250px]">
          <div className="w-28 h-28 bg-[#191919] rounded-full flex items-center justify-center text-white text-4xl italic font-serif flex-shrink-0">
            {String(profile.username || 'N').charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-grow space-y-4">
            {isEditing ? (
              <input defaultValue={profile.username} onBlur={(e) => saveProfile('username', e.target.value)} className="text-3xl font-black italic bg-white/50 p-2 rounded w-full" />
            ) : (
              <h1 className="text-3xl font-black italic">{profile.username}</h1>
            )}
            
            <div className="space-y-2">
              {fields.map((f) => (
                <div key={f.key} className="flex items-center gap-2 text-sm text-[#4B3B2F]">
                  <span>{f.icon}</span>
                  {isEditing ? (
                    <input 
                      defaultValue={profile[f.key] || ''} 
                      placeholder={f.label}
                      onBlur={(e) => saveProfile(f.key, e.target.value)} 
                      className="bg-white/50 p-1 rounded w-full" 
                    />
                  ) : (
                    <span>{profile[f.key] || f.label}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Button placed immediately below the banner with specific top margin */}
        <button 
          onClick={() => setIsEditing(!isEditing)} 
          className="mt-6 px-6 py-2 border border-[#191919] rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#191919] hover:text-white transition"
        >
          {isEditing ? 'Finish Editing' : 'Edit Profile Options'}
        </button>

      </div>
    </div>
  );
}
