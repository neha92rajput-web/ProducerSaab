'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-6xl font-serif font-black text-neutral-900">404</h1>
        <h2 className="text-xl font-bold text-neutral-800">Lost in the Mix</h2>
        <p className="text-sm text-neutral-500 leading-relaxed">
          The project, track, or creative portfolio profile you are searching for doesn't exist or has been pulled from the master deck.
        </p>
        <div className="pt-2">
          <Link 
            href="/" 
            className="inline-block px-6 py-3 bg-[#1E1E1E] hover:bg-neutral-800 text-white font-medium rounded-xl text-sm transition shadow-sm"
          >
            Return to HQ
          </Link>
        </div>
      </div>
    </div>
  );
}
