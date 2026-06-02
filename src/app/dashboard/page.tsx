import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Music, UploadCloud, Users, Disc } from 'lucide-react';

export default async function Dashboard() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', session?.user.id).single();
  const { data: mySounds } = await supabase.from('sounds').select('*').eq('user_id', session?.user.id).order('created_at', { ascending: false });
  const { data: featuredProducers } = await supabase.from('profiles').select('*').neq('id', session?.user.id).limit(3);

  // Profile completeness tracking calculation
  const metrics = [profile?.avatar_url, profile?.bio, profile?.instagram_url || profile?.youtube_url, profile?.genres?.length];
  const completionPercentage = Math.round((metrics.filter(Boolean).length / metrics.length) * 100);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E1E1E] p-6 sm:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Dashboard Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 bg-white border border-[#EAE6DA] rounded-2xl shadow-sm">
          <div>
            <h1 className="text-3xl font-serif font-bold text-neutral-900">Welcome back, {profile?.display_name || 'Creator'}</h1>
            <p className="text-sm text-neutral-500 mt-1">@{profile?.username} • {profile?.account_type}</p>
          </div>
          <Link href="/dashboard/upload" className="flex items-center justify-center gap-2 px-5 py-3 bg-[#1E1E1E] text-white font-medium rounded-xl hover:bg-neutral-800 transition shadow-sm">
            <UploadCloud className="w-5 h-5 text-[#D4AF37]" />
            <span>Upload Track Asset</span>
          </Link>
        </div>

        {/* Modular Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Feed Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#EAE6DA] rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
                <Music className="w-5 h-5 text-[#D4AF37]" /> My Released Assets
              </h2>
              {mySounds && mySounds.length > 0 ? (
                <div className="divide-y divide-[#FAF9F5]">
                  {mySounds.map(sound => (
                    <div key={sound.id} className="py-4 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-neutral-900">{sound.title}</p>
                        <p className="text-xs text-neutral-400 mt-0.5">{sound.genre} • {sound.bpm || 'N/A'} BPM • {sound.musical_key || 'No Key'}</p>
                      </div>
                      <span className="text-xs text-neutral-400">{new Date(sound.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-[#EAE6DA] rounded-xl bg-[#FAF9F5]">
                  <Disc className="w-8 h-8 text-neutral-300 mx-auto mb-2 animate-spin-slow" />
                  <p className="text-sm text-neutral-400">No audio files deployed to public library yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Analytics Column */}
          <div className="space-y-6">
            
            {/* Completion Matrix Card */}
            <div className="bg-white border border-[#EAE6DA] rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">Network Profile Strength</h3>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-serif font-black text-[#D4AF37]">{completionPercentage}%</span>
                <span className="text-xs text-neutral-400 mb-1">Optimized Discoverability</span>
              </div>
              <div className="w-full bg-[#FAF9F5] h-2 rounded-full mt-3 overflow-hidden border border-[#EAE6DA]">
                <div className="bg-[#D4AF37] h-full transition-all duration-500" style={{ width: `${completionPercentage}%` }}></div>
              </div>
            </div>

            {/* Network Peer Suggestion Card */}
            <div className="bg-white border border-[#EAE6DA] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-md font-serif font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-[#D4AF37]" /> Community Spotlight
              </h3>
              <div className="space-y-3">
                {featuredProducers && featuredProducers.length > 0 ? (
                  featuredProducers.map(prod => (
                    <Link href={`/@${prod.username}`} key={prod.id} className="flex items-center gap-3 p-2 hover:bg-[#FAF9F5] rounded-xl transition group">
                      <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden border border-[#EAE6DA]">
                        {prod.avatar_url && <img src={prod.avatar_url} className="w-full h-full object-cover" alt="" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold group-hover:text-[#D4AF37] transition">{prod.display_name}</p>
                        <p className="text-xs text-neutral-400">{prod.account_type}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-xs text-neutral-400">Expanding network nodes...</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
