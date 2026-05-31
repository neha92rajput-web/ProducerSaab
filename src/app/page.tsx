'use client';

import React from 'react';
import { AudioDashboard } from '@/components/AudioDashboard';
import { 
  Layers, 
  HelpCircle
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#05050a] text-slate-100 select-none">
      
      {/* Sleek Minimal Header */}
      <header className="h-16 bg-[#09090f] border-b border-slate-900 px-6 flex items-center justify-between shrink-0">
        
        {/* Left Side Logo */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-[#ff007f] to-[#00e5ff] flex items-center justify-center p-1.5 shadow-md shadow-[#00e5ff]/10">
              <Layers className="h-full w-full text-black stroke-[2.5]" />
            </div>
            <span className="font-black text-lg tracking-wider bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent group-hover:to-white transition-all">
              PRODUCER SAAB<span className="text-[#00e5ff]">.</span>
            </span>
          </div>
        </div>

        {/* Right Side Help Link */}
        <div className="flex items-center gap-3">
          <a 
            href="#" 
            className="flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-slate-300 transition"
            onClick={(e) => {
              e.preventDefault();
              alert("Viral Video Creator v1.0.0 prototype - Dynamic timeline visualizer with instant MP4 output simulation.");
            }}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Documentation</span>
          </a>
        </div>

      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col">
        <AudioDashboard />
      </main>

    </div>
  );
}
