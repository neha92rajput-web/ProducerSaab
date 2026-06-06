'use client';

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface CollabHubProps {
  profileId: string;
}

export default function CollaborationHub({ profileId }: CollabHubProps) {
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  // Tabs routing matching your structure design plan
  const [subTab, setSubTab] = useState<'active' | 'messages' | 'find' | 'opportunities'>('active');
  const [loading, setLoading] = useState(true);

  // Data storage arrays
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [filteredCreators, setFilteredCreators] = useState<any[]>([]);

  // Search Filters State
  const [filterRole, setFilterRole] = useState('🎤 Vocalist');
  const [filterGenre, setFilterGenre] = useState('Any');
  const [filterLocation, setFilterLocation] = useState('Any');

  // Opportunity Posting Form State
  const [isPostingOpportunity, setIsPostingOpportunity] = useState(false);
  const [oppTitle, setOppTitle] = useState('');
  const [oppRole, setOppRole] = useState('🎤 Vocalist');
  const [oppGenre, setOppGenre] = useState('Trap');
  const [oppBpm, setOppBpm] = useState('');
  const [oppKey, setOppKey] = useState('F# Minor');
  const [oppMessage, setOppMessage] = useState('');

  const syncCollaborationData = async () => {
    if (!profileId) return;
    try {
      // Fetch incoming/outgoing requests
      const { data: incoming } = await database
        .from('collaboration_requests')
        .select('id, status, message, sender_id, sounds(title), profiles!collaboration_requests_sender_id_fkey(username, account_type)')
        .eq('receiver_id', profileId);

      const { data: outgoing } = await database
        .from('collaboration_requests')
        .select('id, status, message, sounds(title), profiles!collaboration_requests_receiver_id_fkey(username, account_type)')
        .eq('sender_id', profileId);

      // Fetch all global project opportunities briefs
      const { data: opps } = await database
        .from('collaboration_opportunities')
        .select('*, profiles(username, account_type)')
        .order('created_at', { ascending: false });

      setIncomingRequests(incoming || []);
      setSentRequests(outgoing || []);
      setOpportunities(opps || []);
    } catch (err) {
      console.error("Pipeline read fault:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncCollaborationData();
  }, [profileId]);

  // Handle live creators directory filtering (Step 4 of your blueprint)
  useEffect(() => {
    async function runSearch() {
      let query = database.from('profiles').select('*');
      if (filterRole) query = query.eq('account_type', filterRole);
      if (filterLocation !== 'Any') query = query.eq('country', filterLocation.toLowerCase());
      
      const { data } = await query.limit(10);
      setFilteredCreators(data || []);
    }
    if (subTab === 'find') runSearch();
  }, [filterRole, filterLocation, subTab]);

  const handlePostOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oppTitle.trim() || !oppBpm.trim()) return alert("Please fill out mandatory project info slots.");

    try {
      const { error } = await database.from('collaboration_opportunities').insert({
        creator_id: profileId,
        role_needed: oppRole,
        title: oppTitle,
        genre: oppGenre,
        bpm: Number(oppBpm),
        musical_key: oppKey,
        message: oppMessage
      });

      if (error) throw error;
      alert("🎯 Project Opportunity Broadcasted Successfully!");
      setIsPostingOpportunity(false);
      syncCollaborationData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-6 text-xs text-gray-400 font-mono">Loading Collaboration System Maps...</div>;
  }

  return (
    <div className="space-y-6 text-black w-full text-left">
      
      {/* 🧭 UPGRADED 4-TAB SYSTEM HEADER STRUCTURE */}
      <div className="flex flex-wrap border-b border-[#E3DEC1] gap-6 text-[10px] font-black uppercase tracking-widest pb-px">
        <button onClick={() => setSubTab('active')} className={`pb-2 border-b-2 ${subTab === 'active' ? 'text-black border-black' : 'text-[#A4927A] border-transparent'}`}>🤝 Active Projects</button>
        <button onClick={() => setSubTab('messages')} className={`pb-2 border-b-2 ${subTab === 'messages' ? 'text-black border-black' : 'text-[#A4927A] border-transparent'}`}>📨 Messages</button>
        <button onClick={() => setSubTab('find')} className={`pb-2 border-b-2 ${subTab === 'find' ? 'text-black border-black' : 'text-[#A4927A] border-transparent'}`}>🔎 Find Creators</button>
        <button onClick={() => setSubTab('opportunities')} className={`pb-2 border-b-2 ${subTab === 'opportunities' ? 'text-black border-black' : 'text-[#A4927A] border-transparent'}`}>🎯 Opportunities</button>
      </div>

      {/* 🤝 ACTIVE WORKSPACES PANEL */}
      {subTab === 'active' && (
        <div className="p-8 border border-[#E3DEC1] rounded-2xl bg-white/50 text-center space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">No active collaborations yet.</h4>
          <p className="text-xs text-gray-500 font-medium max-w-sm mx-auto">Once a creator accepts your project request brief, your private secure timeline room opens here.</p>
          <button onClick={() => setSubTab('opportunities')} className="px-5 py-2.5 bg-[#111111] text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Post a Project Brief</button>
        </div>
      )}

      {/* 📨 MESSAGES INBOX PANEL */}
      {subTab === 'messages' && (
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Incoming Requests Log Box</h4>
          {incomingRequests.length === 0 ? (
            <p className="text-xs text-gray-400 font-medium italic">Your conversation request mailbox ledger is clean.</p>
          ) : (
            incomingRequests.map(r => (
              <div key={r.id} className="p-4 border border-[#E3DEC1] rounded-2xl bg-white/70 text-xs font-semibold flex justify-between items-center">
                <div>@{r.profiles?.username} wants to record audio lines on "{r.sounds?.title || 'Track'}"</div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[9px] uppercase tracking-wider">{r.status}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* 🔎 LINKEDIN-STYLE SEARCH DIRECTORY */}
      {subTab === 'find' && (
        <div className="space-y-4">
          {/* Dynamic Filter Row Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white/50 p-4 border border-[#E3DEC1] rounded-2xl text-xs font-bold text-gray-500">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider">Vocation</label>
              <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="w-full bg-white border border-[#E3DEC1] p-2 rounded-xl text-black">
                <option value="🎤 Artist / Singer">🎤 Vocalist</option>
                <option value="🎹 Producer">🎹 Producer</option>
                <option value="🎸 Musician">🎸 Instrumentalist</option>
                <option value="🎚️ Engineer">🎚️ Mixing Engineer</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider">Genre</label>
              <select value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)} className="w-full bg-white border border-[#E3DEC1] p-2 rounded-xl text-black">
                <option value="Any">Pop / All Genres</option>
                <option value="Trap">Trap</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider">Location</label>
              <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className="w-full bg-white border border-[#E3DEC1] p-2 rounded-xl text-black">
                <option value="Any">Any Location</option>
                <option value="India">India</option>
              </select>
            </div>
          </div>

          {/* Results Grid display lists */}
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest pt-1">{filteredCreators.length} Creators Found Matching Specifications</div>
          <div className="grid sm:grid-cols-2 gap-4">
            {filteredCreators.map(c => (
              <div key={c.id} className="p-5 border border-[#E3DEC1] rounded-2xl bg-white shadow-sm flex justify-between items-center">
                <div className="space-y-1">
                  <h5 className="font-serif italic font-normal text-lg text-black">@{c.username}</h5>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{c.account_type} • {c.country || 'Global'}</div>
                </div>
                <button onClick={() => alert(`Opening tracking layout profile route for @${c.username}...`)} className="bg-black text-white text-[9px] uppercase font-black tracking-widest px-4 py-2 rounded-xl">View Profile</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🎯 OPPORTUNITIES WORK BRIEF DISPATCH BOARD */}
      {subTab === 'opportunities' && (
        <div className="space-y-4 w-full">
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Co-Creation Briefs</h4>
            <button 
              onClick={() => setIsPostingOpportunity(!isPostingOpportunity)}
              className="bg-black text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl"
            >
              {isPostingOpportunity ? '✕ Close Form' : '+ Create Collaboration Request'}
            </button>
          </div>

          {/* Create Brief Form Layout input views */}
          {isPostingOpportunity && (
            <form onSubmit={handlePostOpportunity} className="p-6 border border-black rounded-3xl bg-white space-y-4 text-xs font-bold text-gray-500 max-w-md animate-fadeIn">
              <div className="space-y-1">
                <label className="uppercase text-[9px]">Project Call Title</label>
                <input type="text" value={oppTitle} onChange={(e) => setOppTitle(e.target.value)} placeholder="e.g., Need heavy sub bassline layers" className="w-full p-2.5 border border-[#E3DEC1] rounded-xl text-black focus:outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase text-[9px]">Need Specific Role</label>
                  <select value={oppRole} onChange={(e) => setOppRole(e.target.value)} className="w-full p-2.5 border border-[#E3DEC1] bg-white text-black rounded-xl focus:outline-none">
                    <option value="🎤 Vocalist">🎤 Vocalist</option>
                    <option value="🎹 Producer">🎹 Producer</option>
                    <option value="🎸 Guitarist">🎸 Guitarist</option>
                    <option value="🥁 Drummers">🥁 Drummers</option>
                    <option value="🎚️ Mix Engineers">🎚️ Mix Engineer</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="uppercase text-[9px]">Genre Track Space</label>
                  <input type="text" value={oppGenre} onChange={(e) => setOppGenre(e.target.value)} className="w-full p-2.5 border border-[#E3DEC1] text-black rounded-xl focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase text-[9px]">Tempo (BPM)</label>
                  <input type="number" value={oppBpm} onChange={(e) => setOppBpm(e.target.value)} placeholder="140" className="w-full p-2.5 border border-[#E3DEC1] text-black rounded-xl focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="uppercase text-[9px]">Key Scale Signature</label>
                  <input type="text" value={oppKey} onChange={(e) => setOppKey(e.target.value)} className="w-full p-2.5 border border-[#E3DEC1] text-black rounded-xl focus:outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="uppercase text-[9px]">Vibe Parameters / Summary Note</label>
                <textarea rows={2} value={oppMessage} onChange={(e) => setOppMessage(e.target.value)} placeholder="Looking for clean melodic hooks..." className="w-full p-2.5 border border-[#E3DEC1] text-black rounded-xl focus:outline-none resize-none" />
              </div>

              <button type="submit" className="w-full py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl">Publish Request Brief</button>
            </form>
          )}

          {/* Project Cards Loops Grid Display Pipeline Feed */}
          <div className="grid md:grid-cols-2 gap-4">
            {opportunities.length === 0 ? (
              <p className="text-xs text-gray-400 font-medium italic">No studio active project briefs have been distributed yet.</p>
            ) : (
              opportunities.map((opp) => (
                <div key={opp.id} className="p-5 border border-[#E3DEC1] rounded-3xl bg-white shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="text-[10px] bg-black text-white font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">{opp.role_needed}</span>
                      <span className="text-[10px] text-gray-400 font-bold font-mono">By @{opp.profiles?.username}</span>
                    </div>
                    <h5 className="text-sm font-black text-black tracking-tight leading-tight">{opp.title}</h5>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-mono text-gray-500 font-bold uppercase">
                      <div>Genre: {opp.genre}</div>
                      <div>BPM: {opp.bpm}</div>
                      <div>Key: {opp.musical_key}</div>
                    </div>
                    {opp.message && <p className="text-xs text-gray-400 font-medium bg-gray-50/70 p-3 rounded-xl italic">"{opp.message}"</p>}
                  </div>

                  <button 
                    onClick={() => alert(`Dispatching application proposal for session project context string values...`)}
                    className="w-full py-2.5 border border-black hover:bg-black hover:text-white transition rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Apply for Session
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
