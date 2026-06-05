'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="font-serif italic font-black text-5xl text-[#191919] mb-12">PRODUCER SAAB</h1>
      
      <div className="flex flex-col gap-4 w-full max-w-xs">
        {/* These routes now point to the files we just created */}
        <button 
          onClick={() => router.push('/signin')} 
          className="w-full py-4 border border-[#191919] rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#191919] hover:text-white transition"
        >
          Enter Studio
        </button>
        <button 
          onClick={() => router.push('/signup')} 
          className="w-full py-4 bg-[#191919] text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#4B3B2F] transition"
        >
          Join the Community
        </button>
      </div>
    </div>
  );
}
