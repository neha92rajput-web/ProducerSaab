'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SlidersHorizontal, Music } from 'lucide-react';

export default function SoundsLibrary() {
  const supabase = createClientComponentClient();
  const [sounds, setSounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedKey, setSelectedKey] = useState('');
  const [bpmQuery, setBpmQuery] = useState('');

  useEffect(() => {
    async function fetchSounds() {
      setLoading(true);
      // Fetch tracks along with their producer's profile information
      let query = supabase.from('sounds').select(`*, profiles(display_name, username)`);

      if (selectedGenre) query = query.eq('genre', selectedGenre);
      if (selectedKey) query = query.eq('musical_key', selectedKey);
      if (bpmQuery) query = query.eq('bpm', parseInt(bpmQuery));

      const { data } = await query.order('created_at', { ascending: false });
      if (data) setSounds(data);
      setLoading(false);
    }
    fetchSounds();
  }, [selectedGenre, selectedKey, bpmQuery, supabase]);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E1E1E] py-10 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-4xl font-serif font-black text-neutral-900">Public Sound Library</h1>
          <p className="text-sm text-neutral-500 mt-1">Discover studio-grade assets deployed by top music creators.</p>
        </div>

        {/* Filter Toolbar Interface */}
        <div className="bg-white p-4 border border-[#EAE6DA] rounded-2xl shadow-sm flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" /> Filters:
          </div>
          
          <select className="px-3 py-2 text-sm bg-[#FAF9F5] border border-[#EAE6DA] rounded-xl outline-none" value={selectedGenre} onChange={e => setSelectedGenre(e.target.value)}>
            <option value="">Filter by Genre</option>
            {['Punjabi', 'Hip Hop', 'Drill', 'Bollywood', 'Trap', 'LoFi', 'EDM', 'Pop', 'R&B'].map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <input type="number" className="px-3 py-2 text-sm bg-[#FAF9F5] border border-[#EAE6DA] rounded-xl outline-none w-32" placeholder="Filter by BPM" value={bpmQuery} onChange={e => setBpmQuery(e.target.value)} />

          <input type="text" className="px-3 py-2 text-sm bg-[#FAF9F5] border border-[#EAE6DA] rounded-xl outline-none w-32" placeholder="Filter by Key" value={selectedKey} onChange={e => setSelectedKey(e.target.value)} />

          {(selectedGenre || bpmQuery || selectedKey) && (
            <button onClick={() => { setSelectedGenre(''); setBpmQuery(''); setSelectedKey(''); }} className="text-xs font-medium text-neutral-500 hover:text-black underline ml-auto等">
              Clear All Filters
            </button>
          )}
        </div>

        {/* Grid Display */}
        {loading ? (
          <div className="text-center py-20 text-neutral-400">Querying global asset catalog...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sounds.map(sound => (
              <div key={sound.id} className="bg-white border border-[#EAE6DA] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-neutral-900">{sound.title}</h3>
                  <p className="text-sm text-neutral-500">by <span className="font-semibold text-neutral-800">@{sound.profiles?.username || 'creator'}</span></p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-2 py-0.5 bg-[#FAF9F5] text-neutral-600 rounded text-xs font-medium border border-[#EAE6DA]">{sound.genre}</span>
                    {sound.bpm && <span className="px-2 py-0.5 bg-[#FAF9F5] text-neutral-600 rounded text-xs font-medium border border-[#EAE6DA]">{sound.bpm} BPM</span>}
                    {sound.musical_key && <span className="px-2 py-0.5 bg-[#FAF9F5] text-neutral-600 rounded text-xs font-medium border border-[#EAE6DA]">{sound.musical_key}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <audio controls src={sound.audio_url} className="accent-[#1E1E1E] h-9 w-full sm:w-64" />
                </div>
              </div>
            ))}
            {sounds.length === 0 && (
              <div className="text-center bg-white border border-[#EAE6DA] rounded-2xl py-20 text-neutral-400 text-sm">
                No audio resources match your active search filters.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
