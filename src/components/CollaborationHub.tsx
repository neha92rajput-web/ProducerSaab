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

  // Tabs routing matching your structure design plan perfectly
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

  // Handle live creators directory filtering
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
      alert("🎯 Collaboration Request Broadcasted Successfully!");
      setIsPostingOpportunity(false);
      syncCollaborationData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const updateRequestStatus = async (requestId: string, nextStatus: 'accepted' | 'declined') => {
    try {
      const { error } = await database
        .from('collaboration_requests')
        .update({ status: nextStatus })
        .eq('id', requestId);

      if (error) throw error;
      alert(`Pipeline request record marked as ${nextStatus}!`);
      syncCollaborationData();
    } catch (err: any) {
      alert("Transaction processing timeout: " + err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-6 text-xs text-gray-400 font-mono tracking-widest uppercase">Syncing Collaboration Engine Network...</div>;
  }

  // Count active accepted collaborations safely
  const acceptedCollabsCount = incomingRequests.filter(r => r.status === 'accepted').length + 
                               sentRequests.filter(r => r.status === 'accepted').length;

  return (
    <div className="space-y-6 text-black w-full text-left animate-fadeIn">
      
      {/* 🧭 NAVIGATION TABS ARRAY HEADER STRUCTURE */}
      <div className="flex flex-wrap border-b border-[#E3DEC1] gap-6 text-[10px] font-black uppercase tracking-widest pb-px">
        <button onClick={() => setSubTab('active')} className={`pb-2 border-b-2 ${subTab === 'active' ? 'text-black border-black' : 'text-[#A4927A] border-transparent'}`}>🤝 Active Projects</button>
        <button onClick={() => setSubTab('messages')} className={`pb-2 border-b-2 ${subTab === 'messages' ? 'text-black border-black' : 'text-[#A4927A] border-transparent'}`}>📨 Messages</button>
        <button onClick={() => setSubTab('find')} className={`pb-2 border-b-2 ${subTab === 'find' ? 'text-black border-black' : 'text-[#A4927A] border-transparent'}`}>🔎 Find Creators</button>
        
        {/* 🎯 RENAMED TAB: Synchronized exactly to say "Collaboration Requests" */}
        <button onClick={() => setSubTab('opportunities')} className={`pb-2 border-b-2 ${subTab === 'opportunities' ? 'text-black border-black' : 'text-[#A4927A] border-transparent'}`}>🎯 Collaboration Requests</button>
      </div>

      {/* 🤝 ACTIVE WORKSPACES PANEL */}
      {subTab === 'active' && (
        <div className="p-8 border border-[#E3DEC1] rounded-2xl bg-white/50 text-center space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">No active collaborations yet.</h4>
          <p className="text-xs text-gray-500 font-medium max-w-sm mx-auto">Once a creator accepts your project request brief, your private secure timeline room opens here.</p>
          <button onClick={() => setSubTab('opportunities')} className="px-5 py-2.5 bg-[#111111] text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Post a Collaboration Request</button>
        </div>
      )}

      {/* 📨 MESSAGES INBOX PANEL */}
      {subTab === 'messages' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Incoming Proposals Box</h4>
            <div className="grid gap-3">
              {incomingRequests.length > 0 ? (
                incomingRequests.map((req) => (
                  <div key={req.id} className="p-5 border border-[#E3DEC1] rounded-2xl bg-white/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                        <span className="font-black text-[#191919]">@{req.profiles?.username}</span>
                        <span className="text-gray-400 font-medium">wants to collaborate on your track</span>
                        <span className="font-bold italic">"{req.sounds?.title || 'Your Track'}"</span>
                      </div>
                      {req.message && <p className="text-xs text-gray-500 font-medium bg-gray-50 p-2.5 rounded-xl border border-gray-100 max-w-xl italic">"{req.message}"</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {req.status === 'pending' ? (
                        <>
                          <button onClick={() => updateRequestStatus(req.id, 'accepted')} className="px-4 py-1.5 bg-[#191919] text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-emerald-700 transition">Accept</button>
                          <button onClick={() => updateRequestStatus(req.id, 'declined')} className="px-4 py-1.5 border border-[#E3DEC1] text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-red-50 hover:text-red-600 transition">Decline</button>
                        </>
                      ) : (
                        <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${req.status === 'accepted' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{req.status}</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 border border-dashed border-[#E3DEC1] rounded-2xl text-xs text-gray-400 font-medium bg-white/30">No incoming coordination letters inside this mailbox view directory.</div>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sent Outgoing Ledger Proposals</h4>
            <div className="grid gap-3">
              {sentRequests.length > 0 ? (
                sentRequests.map((req) => (
                  <div key={req.id} className="p-4 border border-[#E3DEC1] rounded-2xl bg-white/50 text-xs flex justify-between items-center gap-4">
                    <div className="truncate font-medium text-gray-500">
                      Proposal tracking note sent to <span className="font-bold text-black">@{req.profiles?.username}</span> for track <span className="italic font-bold text-black">"{req.sounds?.title || 'Asset'}"</span>
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shrink-0 ${req.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' : req.status === 'accepted' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>{req.status}</span>
                  </div>
                ))
              ) : (
                <div className="text-center p-6 border border-dashed border-[#E3DEC1] rounded-2xl text-xs text-gray-400 font-medium">You haven't dispatched any outgoing requests yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🔎 BROWSE CREATORS SECTION */}
      {subTab === 'find' && (
        <div className="space-y-4">
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
            {/* Form deployment switcher toggle button button element */}
            <button 
              onClick={() => setIsPostingOpportunity(!isPostingOpportunity)}
              className="bg-black text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition duration-150 active:scale-95 cursor-pointer"
            >
              {isPostingOpportunity ? '✕ Close Form' : '+ Create Collaboration Request'}
            </button>
          </div>

          {/* Form Overlay Area Input Fields */}
          {isPostingOpportunity && (
            <form onSubmit={handlePostOpportunity} className="p-6 border border-black rounded-3xl bg-white space-y-4 text-xs font-bold text-gray-500 max-w-md animate-fadeIn shadow-xl">
              <div className="space-y-1">
                <label className="uppercase text-[9px]">Project Call Title</label>
                <input type="text" value={oppTitle} onChange={(e) => setOppTitle(e.target.value)} placeholder="e.g., Need heavy sub bassline layers" className="w-full p-2.5 border border-[#E3DEC1] rounded-xl text-black focus:outline-none font-semibold text-sm" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase text-[9px]">Need Specific Role</label>
                  <select value={oppRole} onChange={(e) => setOppRole(e.target.value)} className="w-full p-2.5 border border-[#E3DEC1] bg-white text-black rounded-xl focus:outline-none font-semibold">
                    <option value="🎤 Vocalist">🎤 Vocalist</option>
                    <option value="🎹 Producer">🎹 Producer</option>
                    <option value="🎸 Guitarist">🎸 Guitarist</option>
                    <option value="🥁 Drummers">🥁 Drummers</option>
                    <option value="🎚️ Mix Engineers">🎚️ Mix Engineer</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="uppercase text-[9px]">Genre Track Space</label>
                  <input type="text" value={oppGenre} onChange={(e) => setOppGenre(e.target.value)} placeholder="Trap" className="w-full p-2.5 border border-[#E3DEC1] text-black rounded-xl focus:outline-none font-semibold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="uppercase text-[9px]">Tempo (BPM)</label>
                  <input type="number" value={oppBpm} onChange={(e) => setOppBpm(e.target.value)} placeholder="140" className="w-full p-2.5 border border-[#E3DEC1] text-black rounded-xl focus:outline-none font-semibold" />
                </div>
                <div className="space-y-1">
                  <label className="uppercase text-[9px]">Key Scale Signature</label>
                  <input type="text" value={oppKey} onChange={(e) => setOppKey(e.target.value)} placeholder="F# Minor" className="w-full p-2.5 border border-[#E3DEC1] text-black rounded-xl focus:outline-none font-semibold" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="uppercase text-[9px]">Vibe Parameters / Summary Note</label>
                <textarea rows={2} value={oppMessage} onChange={(e) => setOppMessage(e.target.value)} placeholder="Looking for clean melodic hooks..." className="w-full p-2.5 border border-[#E3DEC1] text-black rounded-xl focus:outline-none resize-none font-medium" />
              </div>

              <button type="submit" className="w-full py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition hover:bg-[#4B3B2F] cursor-pointer">Publish Request Brief</button>
            </form>
          )}

          {/* Project List Rendering Row Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {opportunities.length === 0 ? (
              <p className="text-xs text-gray-400 font-medium italic py-6">No studio active project briefs have been distributed yet.</p>
            ) : (
              opportunities.map((opp) => (
                <div key={opp.id} className="p-5 border border-[#E3DEC1] rounded-3xl bg-white shadow-sm flex flex-col justify-between space-y-4 animate-fadeIn">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="text-[10px] bg-black text-white font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">{opp.role_needed}</span>
                      <span className="text-[10px] text-gray-400 font-bold font-mono">By @{opp.profiles?.username}</span>
                    </div>
                    <h5 className="text-sm font-black text-black tracking-tight text-left leading-tight">{opp.title}</h5>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-mono text-gray-400 font-bold uppercase">
                      <div>Genre: {opp.genre}</div>
                      <div>BPM: {opp.bpm}</div>
                      <div>Key: {opp.musical_key}</div>
                    </div>
                    {opp.message && <p className="text-xs text-gray-400 font-medium bg-gray-50/70 p-3 rounded-xl italic text-left">"{opp.message}"</p>}
                  </div>

                  <button 
                    onClick={() => alert(`Opening collaboration pipeline route options details...`)}
                    className="w-full py-2.5 border border-black hover:bg-black hover:text-white transition rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer"
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
