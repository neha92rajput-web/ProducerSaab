'use client';

import React from 'react';
import { Music } from 'lucide-react';

export default function ProducerFeedView() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-600 mx-auto mb-4">
          <Music className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Trending Music Feed</h1>
        <p className="text-gray-500 text-sm">
          Your music discovery feed is initialized and ready.
        </p>
      </div>
    </div>
  );
}
