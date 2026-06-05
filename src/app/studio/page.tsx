// ... (Keep all your existing states and logic exactly as they are) ...

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D2621] font-sans antialiased selection:bg-[#E3DEC1]">
      
      {/* HEADER: Minimalist, clean */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md px-8 py-6 flex justify-between items-center border-b border-[#EADFCF]">
        <span className="font-serif italic font-black text-xl tracking-tight">PRODUCER SAAB</span>
        <div className="flex gap-8">
          <button onClick={() => setViewMode('community')} className="text-[10px] font-black uppercase tracking-widest hover:text-[#A4927A]">Producer Community</button>
          <button onClick={async () => { await database.auth.signOut(); router.push('/'); }} className="text-[10px] font-black uppercase tracking-widest hover:text-red-600">Signing off</button>
        </div>
      </header>

      {/* CENTERED EDITORIAL COLUMN */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* HERO: Cinematic, Rounded, Warm */}
        <div className="relative w-full h-[300px] bg-[#D7C9B7] rounded-[2rem] overflow-hidden shadow-inner mb-12 flex items-end p-8">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          <div className="relative flex items-center gap-6">
            <div className="w-24 h-24 rounded-full border-4 border-white bg-[#191919] flex items-center justify-center text-white text-3xl font-serif italic">{userInitial}</div>
            <div className="text-white">
              <h1 className="text-3xl font-black italic font-serif">{profile.display_name}</h1>
              <p className="text-[11px] font-bold uppercase tracking-widest opacity-90">{profile.company || 'Music Producer'}</p>
            </div>
          </div>
        </div>

        {/* WORKSPACE ACTIONS: Minimal and functional */}
        <div className="flex gap-4 mb-16">
          <button onClick={() => setShareType('audio')} className="bg-[#4B3B2F] text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#3D2F24] transition">🎵 Bounce Track</button>
          <button onClick={() => setShareType('post')} className="bg-[#EFECE3] text-[#4B3B2F] px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#E3DEC1] transition">✍️ Log Thought</button>
        </div>

        {/* TRACKS CATALOG: Clean, Modular Cards */}
        <h3 className="text-xs font-black uppercase tracking-widest mb-8 text-[#4B3B2F]">Featured Sound Architectures</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {mySounds.map(track => (
            <div key={track.id} className="bg-white p-5 rounded-2xl border border-[#E3DEC1] hover:shadow-lg transition-all">
               <div className="flex items-center gap-4">
                 <button onClick={() => toggleMasterPlayback(track)} className="w-12 h-12 bg-[#F6F3EC] rounded-xl flex items-center justify-center font-bold">▶</button>
                 <div className="flex-1">
                   <h4 className="font-bold text-sm truncate">{track.title}</h4>
                   <p className="text-[10px] text-gray-500 uppercase font-bold">{track.genre} • {track.bpm} BPM</p>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
