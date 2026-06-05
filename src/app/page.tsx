'use client';

import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="font-serif italic font-black text-5xl text-[#191919] mb-8">PRODUCER SAAB</h1>
      <p className="text-[#A4927A] text-sm font-bold uppercase tracking-widest mb-12 max-w-xs">
        The professional workspace for creators and producers.
      </p>
      
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Link href="/signin" className="w-full py-4 border border-[#191919] rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#191919] hover:text-white transition">
          Enter Studio
        </Link>
        <Link href="/signup" className="w-full py-4 bg-[#191919] text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#4B3B2F] transition">
          Join the Community
        </Link>
      </div>
    </div>
  );
}
