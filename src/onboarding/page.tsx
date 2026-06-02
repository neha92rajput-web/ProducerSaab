'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Music, User, MapPin, Link2, FileAudio, CheckCircle } from 'lucide-react';

const GENRE_OPTIONS = ['Punjabi', 'Hip Hop', 'Drill', 'Bollywood', 'Trap', 'LoFi', 'EDM', 'Pop', 'R&B', 'Other'];
const ACCOUNT_TYPES = ['Producer', 'Artist / Singer', 'Both Producer & Artist', 'Songwriter', 'Musician', 'Audio Engineer'];

export default function Onboarding() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [authForm, setAuthForm] = useState({ email: '', password: '', confirmPassword: '', username: '' });
  const [accountType, setAccountType] = useState('');
  const [profileForm, setProfileForm] = useState({
    displayName: '', bio: '', country: '', city: '',
    instagramUrl: '', youtubeUrl: '', spotifyUrl: '', websiteUrl: ''
  });
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Step 1 Execution: Account Registration
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authForm.password !== authForm.confirmPassword) return setError("Passwords do not match");
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signUp({
      email: authForm.email,
      password: authForm.password,
      options: { data: { username: authForm.username.toLowerCase() } }
    });

    setLoading(false);
    if (authError) setError(authError.message);
    else setStep(2);
  };

  // Step 3 Execution: Profile Compilation & Avatar Upload
  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let avatarUrl = '';
    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, avatarFile);
      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
        avatarUrl = publicUrlData.publicUrl;
      }
    }

    const { error: dbError } = await supabase.from('profiles').insert({
      id: user.id,
      username: authForm.username.toLowerCase(),
      display_name: profileForm.displayName,
      account_type: accountType,
      bio: profileForm.bio,
      country: profileForm.country,
      city: profileForm.city,
      genres: selectedGenres,
      avatar_url: avatarUrl,
      instagram_url: profileForm.instagramUrl,
      youtube_url: profileForm.youtubeUrl,
      spotify_url: profileForm.spotifyUrl,
      website_url: profileForm.websiteUrl,
    });

    setLoading(false);
    if (dbError) setError(dbError.message);
    else router.push('/dashboard');
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E1E1E] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-xl bg-white border border-[#EAE6DA] rounded-2xl shadow-sm p-8">
        
        {/* Progress Navigation Tracker */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#FAF9F5]">
          {['Account', 'Role Selection', 'Professional Profile'].map((label, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= idx + 1 ? 'bg-[#D4AF37] text-white' : 'bg-[#EAE6DA] text-neutral-500'}`}>
                {idx + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${step === idx + 1 ? 'text-[#1E1E1E]' : 'text-neutral-400'}`}>{label}</span>
            </div>
          ))}
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

        {/* STEP 1: AUTHENTICATION SCHEMA */}
        {step === 1 && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-neutral-900">Create Creator Identity</h2>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Username</label>
              <input required type="text" className="w-full px-4 py-2.5 rounded-lg border border-[#EAE6DA] focus:outline-none focus:border-[#D4AF37] bg-[#FAF9F5]" placeholder="saab_beats" value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Email Address</label>
              <input required type="email" className="w-full px-4 py-2.5 rounded-lg border border-[#EAE6DA] focus:outline-none focus:border-[#D4AF37] bg-[#FAF9F5]" placeholder="creator@producersaab.com" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Password</label>
                <input required type="password" className="w-full px-4 py-2.5 rounded-lg border border-[#EAE6DA] focus:outline-none focus:border-[#D4AF37] bg-[#FAF9F5]" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1">Confirm Password</label>
                <input required type="password" className="w-full px-4 py-2.5 rounded-lg border border-[#EAE6DA] focus:outline-none focus:border-[#D4AF37] bg-[#FAF9F5]" value={authForm.confirmPassword} onChange={e => setAuthForm({...authForm, confirmPassword: e.target.value})} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full mt-2 py-3 bg-[#1E1E1E] hover:bg-neutral-800 text-white rounded-lg font-medium transition duration-200">
              {loading ? 'Registering...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* STEP 2: PROFESSION IDENTIFICATION */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-neutral-900">What best describes you?</h2>
              <p className="text-sm text-neutral-500">Select your prime discipline to help other ecosystem creators find you.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ACCOUNT_TYPES.map((type) => (
                <button key={type} onClick={() => setAccountType(type)} className={`p-4 text-left rounded-xl border transition-all duration-200 flex items-center justify-between ${accountType === type ? 'border-[#D4AF37] bg-[#FAF9F5] shadow-inner font-semibold' : 'border-[#EAE6DA] bg-white hover:border-neutral-400'}`}>
                  <span>{type}</span>
                  {accountType === type && <CheckCircle className="w-5 h-5 text-[#D4AF37]" />}
                </button>
              ))}
            </div>
            <button onClick={() => accountType && setStep(3)} disabled={!accountType} className="w-full py-3 bg-[#1E1E1E] disabled:bg-neutral-300 text-white rounded-lg font-medium transition duration-200">
              Continue Set Up
            </button>
          </div>
        )}

        {/* STEP 3: STUDIO METADATA SCHEDULING */}
        {step === 3 && (
          <form onSubmit={handleCompleteProfile} className="space-y-5">
            <h2 className="text-2xl font-serif font-bold text-neutral-900">Complete Profile Details</h2>
            
            <div className="flex items-center gap-4 p-4 bg-[#FAF9F5] rounded-xl border border-[#EAE6DA]">
              <div className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center text-neutral-400 overflow-hidden relative">
                {avatarFile ? <img src={URL.createObjectURL(avatarFile)} className="w-full h-full object-cover" /> : <User className="w-8 h-8" />}
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">Avatar Photo *</label>
                <input required type="file" accept="image/*" onChange={e => e.target.files?.[0] && setAvatarFile(e.target.files[0])} className="text-sm text-neutral-600 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-neutral-800 file:text-white hover:file:bg-neutral-700" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">Display Name *</label>
                <input required type="text" className="w-full px-4 py-2 bg-[#FAF9F5] border border-[#EAE6DA] rounded-lg focus:outline-none" placeholder="Saab Beats" value={profileForm.displayName} onChange={e => setProfileForm({...profileForm, displayName: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">Country *</label>
                  <input required type="text" className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#EAE6DA] rounded-lg focus:outline-none" placeholder="India" value={profileForm.country} onChange={e => setProfileForm({...profileForm, country: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">City *</label>
                  <input required type="text" className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#EAE6DA] rounded-lg focus:outline-none" placeholder="Mohali" value={profileForm.city} onChange={e => setProfileForm({...profileForm, city: e.target.value})} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-1">Bio *</label>
              <textarea required rows={3} className="w-full px-4 py-2 bg-[#FAF9F5] border border-[#EAE6DA] rounded-lg focus:outline-none resize-none" placeholder="Multi-platinum drill and hip-hop producer..." value={profileForm.bio} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-500 mb-2">Core Sonic Genres (Select Multiple)</label>
              <div className="flex flex-wrap gap-2">
                {GENRE_OPTIONS.map(genre => (
                  <button type="button" key={genre} onClick={() => toggleGenre(genre)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selectedGenres.includes(genre) ? 'bg-[#D4AF37] border-[#D4AF37] text-white' : 'bg-white border-[#EAE6DA] text-neutral-600 hover:border-neutral-400'}`}>
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-[#EAE6DA] pt-4 space-y-3">
              <label className="block text-xs font-semibold uppercase text-neutral-500">Social Connections (Optional)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="url" className="w-full px-4 py-2 bg-[#FAF9F5] border border-[#EAE6DA] rounded-lg text-sm" placeholder="Instagram URL" value={profileForm.instagramUrl} onChange={e => setProfileForm({...profileForm, instagramUrl: e.target.value})} />
                <input type="url" className="w-full px-4 py-2 bg-[#FAF9F5] border border-[#EAE6DA] rounded-lg text-sm" placeholder="YouTube URL" value={profileForm.youtubeUrl} onChange={e => setProfileForm({...profileForm, youtubeUrl: e.target.value})} />
              </div>
            </div>

            <button type="submit" disabled={loading || selectedGenres.length === 0} className="w-full py-3 bg-[#1E1E1E] hover:bg-neutral-800 text-white rounded-lg font-medium transition duration-200">
              {loading ? 'Building Workspace...' : 'Complete Profile'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
