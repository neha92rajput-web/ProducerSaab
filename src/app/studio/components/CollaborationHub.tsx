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

  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    if (!profileId) return;
    try {
      // Fetch Requests sent TO you
      const { data: incoming } = await database
        .from('collaboration_requests')
        .select(`
          id, status, message, sender_id,
          sounds ( id, title ),
          profiles!collaboration_requests_sender_id_fkey ( username, account_type )
        `)
        .eq('receiver_id', profileId)
        .order('created_at', { ascending: false });

      // Fetch Requests sent BY you
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
      console.error("Failed to load collaboration feed:", err);
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
      alert(`Request marked as ${nextStatus}!`);
      fetchRequests();
    } catch (err: any) {
      alert("Error processing transaction: " + err.message);
    }
  };

  if (loading) {
    return <div className="text-center p-6 text-xs text-gray-400 font-mono">Syncing Request Pipeline Ledger...</div>;
  }

  return (
    <div className="space-y-8 text-black">
      {/* Incoming Requests Panel */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#191919] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Incoming Request Proposals
        </h3>
        
        <div className="grid gap-3">
          {incomingRequests.length > 0 ? (
            incomingRequests.map((req) => (
              <div key={req.id} className="p-5 border border-[#E3DEC1] rounded-2xl bg-white/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black text-[#191919]">@{req.profiles?.username}</span>
                    <span className="bg-[#E3DEC1] text-[#4B3B2F] text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">{req.profiles?.account_type || 'Creator'}</span>
                    <span className="text-gray-400 font-medium text-[11px]">wants to collaborate on</span>
                    <span className="text-xs font-bold italic text-black">"{req.sounds?.title || 'Your Track'}"</span>
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
            <div className="text-center p-8 border border-dashed border-[#E3DEC1] rounded-2xl text-xs text-gray-400 font-medium bg-white/30">No incoming session request letters waiting in your inbox yet.</div>
          )}
        </div>
      </div>

      {/* Outgoing Sent Proposals Panel */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-widest text-[#191919] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Outgoing Sent Requests
        </h3>

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
            <div className="text-center p-6 border border-dashed border-[#E3DEC1] rounded-2xl text-xs text-gray-400 font-medium">You haven't dispatched any outgoing collaboration notes yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
