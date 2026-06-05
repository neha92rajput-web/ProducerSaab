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
  const [mySounds, setMySounds] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await database.auth.getUser();
      if (!user) { router.replace('/signin'); return; }
      const { data: p } = await database.from('profiles').select('*').eq('id', user.id).single();
      const { data: s } = await database.from('sounds').select('*').eq('profile_id', user.id);
      setProfile(p || {});
      setMySounds(s || []);
      setLoading(false);
    }
    init();
  }, [router]);

  const saveProfile = async (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    await database.from('profiles').update({ [field]: value }).eq('id', profile.id);
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#191919] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="relative mt-0 mb-4 bg-[#D7C9B7] rounded-[2rem] p-8 shadow-sm flex items-center gap-8 min-h-[250px]">
          <div className="w-28 h-28 bg-[#191919] border-4 border-[#FDFBF7] rounded-full flex items-center justify-center text-white text-4xl italic font-serif shadow-lg flex-shrink-0">
            {String(profile.username || 'N').charAt(0).toUpperCase()}
          </div>
          <div className="flex-grow space-y-2">
            {isEditing ? (
              <input defaultValue={profile.username} onBlur={(e) => saveProfile('username', e.target.value)} className="text-3xl font-black italic bg-white/50 p-2 rounded w-full" />
            ) : (
              <h1 className="text-3xl font-black italic">{profile.username}</h1>
            )}
            <span className="block text-[10px] font-black uppercase tracking-widest text-[#4B3B2F]/70">{profile.account_type || 'Role Not Set'}</span>
            <div className="space-y-2 text-sm text-[#4B3B2F]">
              {[ { key: 'networks', label: '🔗' }, { key: 'instruments', label: '🎹' }, { key: 'software', label: '💻' } ].map((item) => (
                <div key={item.key} className="flex gap-2">
                  <span>{item.label}</span>
                  {isEditing ? (
                    <input defaultValue={profile[item.key]} onBlur={(e) => saveProfile(item.key, e.target.value)} className="bg-white/50 p-1 rounded w-full" />
                  ) : (
                    <span>{profile[item.key] || `Add ${item.key}...`}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <button onClick={() => setIsEditing(!isEditing)} className="text-[10px] font-black uppercase border border-[#A4927A] px-6 py-2 rounded-full">
          {isEditing ? 'Finish Editing' : 'Edit Profile Options'}
        </button>
      </div>
    </div>
  );
}
