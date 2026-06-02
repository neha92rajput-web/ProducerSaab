export const dynamic = 'force-dynamic';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Globe, Instagram, Youtube, Music, MapPin } from 'lucide-react';

interface Props { params: { username: string } }

export default async function PublicProfile({ params }: Props) {
  // Strip out any accidental "@" symbols from the URL parameter automatically
  const cleanUsername = decodeURIComponent(params.username).replace('@', '').toLowerCase();
  const supabase = createServerComponentClient({ cookies });

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', cleanUsername)
    .single();

  if (!profile) notFound();

  const { data: sounds } = await supabase
    .from('sounds')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E1E1E] py-12 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Profile Card Summary */}
        <div className="bg-white border border-[#EAE6DA] rounded-3xl p-8 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm">
          <div className="w-24 h-24 bg-neutral-100 rounded-full border border-neutral-300 overflow-hidden shadow-inner flex-shrink-0">
            {profile.avatar_url && <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />}
          </div>
          <div className="space-y-3 text-center md:text-left flex-grow">
            <div>
              <h1 className="text-3xl font-serif font-black tracking-tight text-neutral-900">{profile.display_name}</h1>
              <p className="text-sm font-medium text-[#D4AF37]">@{profile.username} • {profile.account_type}</p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 items-center text-xs text-neutral-500">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {profile.city}, {profile.country}</span>
            </div>
            <p className="text-sm text-neutral-700 max-w-2xl leading-relaxed">{profile.bio}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
              {profile.genres?.map((g: string) => (
                <span key={g} className="px-2.5 py-1 bg-[#FAF9F5] border border-[#EAE6DA] text-neutral-600 rounded-md text-xs font-semibold">{g}</span>
              ))}
            </div>
          </div>

          {/* Social Array Module */}
          <div className="flex md:flex-col gap-2 justify-center pt-2 md:pt-0">
            {profile.instagram_url && <a href={profile.instagram_url} target="_blank" rel="noreferrer" className="p-2 bg-[#FAF9F5] border border-[#EAE6DA] rounded-xl hover:text-[#D4AF37] transition"><Instagram className="w-4 h-4" /></a>}
            {profile.youtube_url && <a href={profile.youtube_url} target="_blank" rel="noreferrer" className="p-2 bg-[#FAF9F5] border border-[#EAE6DA] rounded-xl hover:text-[#D4AF37] transition"><Youtube className="w-4 h-4" /></a>}
            {profile.website_url && <a href={profile.website_url} target="_blank" rel="noreferrer" className="p-2 bg-[#FAF9F5] border border-[#EAE6DA] rounded-xl hover:text-[#D4AF37] transition"><Globe className="w-4 h-4" /></a>}
          </div>
        </div>

        {/* Catalog Showcase Segment */}
        <div className="bg-white border border-[#EAE6DA] rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-serif font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <Music className="w-5 h-5 text-[#D4AF37]" /> Sound Portfolio
          </h2>
          {sounds && sounds.length > 0 ? (
            <div className="space-y-4">
              {sounds.map(track => (
                <div key={track.id} className="p-4 bg-[#FAF9F5] border border-[#EAE6DA] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-neutral-900">{track.title}</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">{track.genre} • {track.bpm || 'N/A'} BPM • {track.musical_key || 'No Key'}</p>
                  </div>
                  <audio controls src={track.audio_url} className="w-full sm:max-w-xs h-8 accent-[#1E1E1E]" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-neutral-400 py-8">No sounds uploaded to this portfolio yet.</p>
          )}
        </div>

      </div>
    </div>
  );
}
