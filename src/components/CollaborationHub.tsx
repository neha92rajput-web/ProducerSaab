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

  const [collabSubTab, setCollabSubTab] = useState<'active' | 'requests' | 'discover'>('active');
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    if (!profileId) return;
    try {
      const { data: incoming } = await database
        .from('collaboration_requests')
        .select(`
          id, status, message, sender_id,
          sounds ( id, title ),
          profiles!collaboration_requests_sender_id_fkey ( username, account_type )
        `)
        .eq('receiver_id', profileId)
        .order('created_at', { ascending: false });

      const { data: outgoing } = await database
        .from('collaboration_requests')
        .select(`
          id, status, message,
          sounds ( id, title ),
          profiles!collaboration_requests_receiver_id_fkey ( username, account_type )
        `)
        .eq('sender_id', profileId)
        .order('created_at', { ascending: false });

      setIncomingRequests(incoming || []);
      setSentRequests(outgoing || []);
    } catch (err) {
      console.error("Failed to sync structural request logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [profileId]);

  const updateRequestStatus = async (requestId: string, nextStatus: 'accepted' | 'declined') => {
    try {
      const { error } = await database
        .from('collaboration_requests')
        .update({ status: nextStatus })
        .eq('id', requestId);

      if (error) throw error;
      alert(`Pipeline request record marked as ${nextStatus}!`);
      fetchRequests();
    } catch (err: any) {
      alert("Transaction processing timeout: " + err.message);
    }
  };

  if (loading) {
    return <div className="text-center p-6 text-xs text-gray-400 font-mono tracking-widest uppercase">Syncing Collaboration Engine Network...</div>;
  }

  // Count active accepted collaborations safely
  const acceptedCollabsCount = incomingRequests.filter(r => r.status === 'accepted').length + 
                               sentRequests.filter(r => r.status === 'accepted').length;

  return (
    <div className="space-y-6 text-black w-full text-left animate-fadeIn">
      
      {/* 🧭 THREE-SECTION SUB-NAV BAR ARRANGEMENT */}
      <div className="flex border-b border-[#E3DEC1] gap-6 text-[10px] font-black uppercase tracking-widest pb-px">
        <button 
          onClick={() => setCollabSubTab('active')} 
          className={`pb-2 border-b-2 ${collabSubTab === 'active' ? 'text-black border-black' : 'text-[#A4927A] border-transparent'}`}
        >
          🤝 Active Collaborations ({acceptedCollabsCount})
        </button>
        <button 
          onClick={() => setCollabSubTab('requests')} 
          className={`pb-2 border-b-2 ${collabSubTab === 'requests' ? 'text-black border-black' : 'text-[#A4927A] border-transparent'}`}
        >
          Message Inbox ({incomingRequests.filter(r => r.status === 'pending').length})
        </button>
        <button 
          onClick={() => setCollabSubTab('discover')} 
          className={`pb-2 border-b-2 ${collabSubTab === 'discover' ? 'text-black border-black' : 'text-[#A4927A] border-transparent'}`}
        >
          🔎 Discover Creators
        </button>
      </div>

      {/* 🤝 SECTION 1: ACTIVE REALTIME SESSION SPACES */}
      {collabSubTab === 'active' && (
        <div className="space-y-4">
          {acceptedCollabsCount > 0 ? (
            <div className="grid gap-3">
              {/* Dynamic room entries populate here when accepted maps complete */}
              <p className="text-xs text-gray-400 font-medium italic">Active secure chat encryption channels are warming up...</p>
            </div>
          ) : (
            /* 🔥 DESIGN UPGRADE: ACTIONABLE ACTION PLAN CHECKLIST MODULATION */
            <div className="p-8 border border-[#E3DEC1] rounded-2xl bg-white/50 space-y-6 max-w-xl">
              <div className="space-y-1">
                <h4 className="text-sm font-black text-[#191919]">No active collaborations yet.</h4>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">Establish connections with world-class artists to access shared session stems and private project workspaces files.</p>
              </div>

              <div className="space-y-3 text-xs font-bold text-gray-600 bg-[#FDFBF7]/60 p-4 rounded-xl border border-[#E3DEC1]">
                <p className="uppercase tracking-wider text-[9px] text-[#A4927A] mb-1">Start your next session by:</p>
                <div className="flex items-center gap-2 hover:text-black transition cursor-pointer" onClick={() => setCollabSubTab('discover')}>
                  <span className="text-emerald-600 font-mono">✓</span> Finding local vocalists / singers
                </div>
                <div className="flex items-center gap-2 hover:text-black transition cursor-pointer" onClick={() => setCollabSubTab('discover')}>
                  <span className="text-emerald-600 font-mono">✓</span> Finding global hit producers
                </div>
                <div className="flex items-center gap-2 hover:text-black transition cursor-pointer" onClick={() => setCollabSubTab('discover')}>
                  <span className="text-emerald-600 font-mono">✓</span> Finding session guitarists & drummers
                </div>
                <div className="flex items-center gap-2 hover:text-black transition cursor-pointer" onClick={() => setCollabSubTab('discover')}>
                  <span className="text-emerald-600 font-mono">✓</span> Posting a project brief proposal
                </div>
              </div>

              <button 
                onClick={() => setCollabSubTab('discover')}
                className="bg-[#111111] text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-[#4B3B2F] transition-all"
              >
                Browse Network Creators
              </button>
            </div>
          )}
        </div>
      )}

      {/* 📨 SECTION 2: DYNAMIC INCOMING & OUTGOING REQUESTS */}
      {collabSubTab === 'requests' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Incoming Proposals Box</h4>
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
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sent Outgoing Ledger Proposals</h4>
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

      {/* 🔎 SECTION 3: CREATOR TARGET CATEGORY BROWSING INDEX PANEL */}
      {collabSubTab === 'discover' && (
        <div className="space-y-4 bg-white/40 border border-[#E3DEC1] p-6 rounded-2xl">
          <div className="space-y-1">
            <h4 className="text-sm font-black text-black">Discover Network Talents</h4>
            <p className="text-xs text-gray-400 font-medium">Filter creators by their technical trade specs or operational studio roles seamlessly.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            {['🎤 Vocalists', '🎹 Producers', '🎸 Guitarists', '🥁 Drummers', '🎚️ Mix Engineers', '✍️ Songwriters', '🎧 DJs', '🎬 Filmmakers'].map((specRole) => (
              <div 
                key={specRole}
                onClick={() => alert(`Filtering ecosystem registry index for highly skilled: ${specRole}...`)}
                className="p-3 border border-[#E3DEC1] bg-white rounded-xl text-center text-xs font-bold text-[#191919] hover:bg-black hover:text-white hover:border-black transition cursor-pointer shadow-sm active:scale-95 transform duration-150"
              >
                {specRole}
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-center">
            <button 
              onClick={() => window.location.href = '/'}
              className="px-6 py-2.5 border-2 border-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all"
            >
              [ Open Community Feed ]
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
