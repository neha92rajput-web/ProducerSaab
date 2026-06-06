'use client';

import React, { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface NotificationCenterProps {
  profileId: string;
}

export default function NotificationCenter({ profileId }: NotificationCenterProps) {
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!profileId) return;
    try {
      const { data } = await database
        .from('notifications')
        .select(`
          id, type, message, is_read, created_at,
          profiles!notifications_sender_id_fkey ( username )
        `)
        .eq('receiver_id', profileId)
        .order('created_at', { ascending: false });

      const list = data || [];
      setNotifications(list);
      setUnreadCount(list.filter((n: any) => !n.is_read).length);
    } catch (err) {
      console.error("Failed to fetch notification feed data logs:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Check for updates every 12 seconds
    const loopInterval = setInterval(fetchNotifications, 12000);
    return () => clearInterval(loopInterval);
  }, [profileId]);

  const markAllAsRead = async () => {
    if (notifications.length === 0) return;
    try {
      await database
        .from('notifications')
        .update({ is_read: true })
        .eq('receiver_id', profileId);
      
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative z-50 text-black">
      <button 
        onClick={() => { setIsOpen(!isOpen); if(!isOpen) markAllAsRead(); }}
        className="hover:opacity-70 flex items-center gap-1.5 relative text-xs font-bold font-sans uppercase tracking-widest text-[#191919]"
      >
        🔔 Notifications
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black font-mono animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white border border-[#E3DEC1] rounded-2xl p-4 shadow-xl animate-fadeIn max-h-96 overflow-y-auto text-left">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Activity Hub</span>
            {unreadCount > 0 && <span className="text-[8px] text-emerald-600 font-bold uppercase font-mono">Updated</span>}
          </div>

          <div className="space-y-2">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-3 rounded-xl border border-gray-50 text-xs transition-colors duration-150 ${!notif.is_read ? 'bg-amber-50/40 border-amber-100' : 'bg-white'}`}
                >
                  <div className="font-semibold text-gray-700 leading-tight">
                    <span className="text-black font-black">@{notif.profiles?.username}</span> {notif.message}
                  </div>
                  <div className="text-[9px] text-gray-400 font-mono mt-1">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 font-medium italic py-4 text-center">Your notification feed is clear.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
