'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  Music, 
  Volume2,
  VolumeX,
  Upload,
  Globe,
  Sliders,
  User,
  Activity,
  TrendingUp,
  X,
  Download,
  Lock
} from 'lucide-react';

// --- Interfaces ---
interface SampleTrack {
  id: string;
  filename: string;
  description: string;
  duration: string;
  key: string;
  bpm: number;
  url: string;
  audioUrl?: string;
  genre: string; 
  artworkColor: string;
  creator: string;
  isUserUploaded?: boolean;
  title?: string;
  keySignature?: string;
  tempo?: number | string;
  customGenre?: string;
  customKey?: string;
}

// --- Sample Tracks Database (Initialized as completely empty by default) ---
const initialSampleTracks: SampleTrack[] = [];

// Hydration-safe static heights for the waveform bar graphic
const barHeights = [
  25, 45, 65, 30, 85, 40, 15, 60, 80, 25, 10, 55, 90, 30, 20, 75,
  80, 20, 10, 40, 95, 30, 15, 60, 85, 25, 10, 50, 90, 30, 20, 70,
  80, 15, 10, 45, 90, 25, 15, 60, 40, 75, 20, 85, 55, 30, 70, 10, 45, 90
];

const defaultPills = [
  'Hip Hop',
  'Trap',
  'R&B',
  'Electronic / EDM',
  'Pop',
  'Rock / Metal',
  'Afrobeats / Reggae',
  'Cinematic / Orchestral',
  'Lo-Fi / Jazz',
  'FX / Textures',
  'Others'
];

const extendedSubGenres = [
  'Afrobeats', 'Lo-Fi', 'Dancehall', 'Drill', 'Pop', 'Reggae', 'Synthwave', 'Acoustic'
];

interface TrendingCreator {
  rank: number;
  username: string;
  avatarLetter: string;
  genreTag: string;
  plays: string;
}

const trendingCreators: TrendingCreator[] = [];

// --- IndexedDB Audio File Storage ---
const IDB_NAME = 'ProducerSaabAudio';
const IDB_STORE = 'audioFiles';
const IDB_VERSION = 1;

function openAudioDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(IDB_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveAudioToIDB(trackId: string, file: File): Promise<void> {
  const db = await openAudioDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put(file, trackId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadAudioFromIDB(trackId: string): Promise<File | null> {
  const db = await openAudioDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readonly');
    const req = tx.objectStore(IDB_STORE).get(trackId);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

// --- Local Profiles Database Interfaces ---
interface SavedProfile {
  id: string;
  name: string;
  handle: string;
  bio: string;
  instagram: string;
  primaryDaw?: string;
  soundsUploaded: number;
  monthlyPlays: number;
  downloads: number;
  tracks: SampleTrack[];
}

// --- SVG Icons to replace lucide dependencies ---
function InstagramIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  );
}

// --- Artist Profile Component ---
interface ArtistProfileProps {
  artistName: string;
  tracks: SampleTrack[];
  activeTrackId: string | null;
  isPlaying: boolean;
  progress: number;
  barHeights: number[];
  handleTogglePlay: (track: SampleTrack) => void;
  setPendingDownloadTrack: (track: SampleTrack | null) => void;
  onBack: () => void;
  isFollowing: boolean;
  setIsFollowing: (following: boolean) => void;
  savedDisplayName: string;
  savedBio: string;
  savedInstagram: string;
}

function ArtistProfile({
  artistName,
  tracks,
  activeTrackId,
  isPlaying,
  progress,
  barHeights,
  handleTogglePlay,
  setPendingDownloadTrack,
  onBack,
  isFollowing,
  setIsFollowing,
  savedDisplayName,
  savedBio,
  savedInstagram
}: ArtistProfileProps) {
  const artistTracks = tracks.filter(t => t.creator === artistName);
  const selfHandle = savedDisplayName.startsWith('@') ? savedDisplayName : `@${savedDisplayName}`;
  const isSelf = artistName.toLowerCase() === selfHandle.toLowerCase();

  const bioToDisplay = isSelf ? savedBio : "Official Studio Sound Designer & Loops Creator. Crafting premium signature soundscapes, custom transients, and melodic loops for global music production.";
  const instagramToDisplay = isSelf && savedInstagram ? savedInstagram : null;

  return (
    <div className="space-y-8 animate-fadeIn">
      <button
        onClick={onBack}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F5F0E8] hover:bg-[#F0EBE3] border border-[#E8E2D9] text-xs font-bold text-slate-300 hover:text-white transition duration-200 cursor-pointer self-start"
      >
        ⬅️ Back to Global Feed
      </button>

      <div className="relative overflow-hidden rounded-2xl border border-[#E8E2D9] bg-gradient-to-b from-[#162133] via-[#121824] to-[#121824] p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-blue-600/10 blur-[80px] pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-lg shrink-0">
              <div className="w-full h-full rounded-full bg-[#F5F0E8] flex items-center justify-center text-blue-400">
                <User className="w-9 h-9" />
              </div>
            </div>
            
            <div className="space-y-2.5">
              <h2 className="text-2xl font-black text-[#111111] tracking-tight">{artistName}</h2>
              <p className="text-xs text-slate-400 max-w-md font-medium leading-relaxed">
                {bioToDisplay}
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-1">
                <a 
                  href={instagramToDisplay ? `https://instagram.com/${instagramToDisplay}` : "#instagram"} 
                  target={instagramToDisplay ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-[#F0EBE3] border border-[#E8E2D9] text-[10px] font-bold text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <InstagramIcon className="w-3 h-3 text-pink-400 shrink-0" />
                  <span>Instagram</span>
                </a>
                <a href="#youtube" className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-[#F0EBE3] border border-[#E8E2D9] text-[10px] font-bold text-slate-300 hover:text-white transition cursor-pointer">
                  <YoutubeIcon className="w-3 h-3 text-red-400 shrink-0" />
                  <span>YouTube</span>
                </a>
                <a href="#twitter" className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-[#F0EBE3] border border-[#E8E2D9] text-[10px] font-bold text-slate-300 hover:text-white transition cursor-pointer">
                  <span className="text-[10px] text-blue-400 font-bold leading-none shrink-0">𝕏</span>
                  <span>Twitter</span>
                </a>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsFollowing(!isFollowing)}
            className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-305 shadow-lg active:scale-95 cursor-pointer shrink-0 border
              ${isFollowing 
                ? 'bg-transparent text-slate-300 border-[#E8E2D9] hover:bg-[#F0EBE3]/40 hover:text-white' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-transparent shadow-blue-500/20'}`}
          >
            {isFollowing ? '✓ Following' : 'Follow'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
          Released Sounds ({artistTracks.length})
        </h3>
        
        <div className="space-y-4">
          {artistTracks.length > 0 ? (
            artistTracks.map((track) => {
              const isActive = activeTrackId === track.id;
              const isPlayingThis = isActive && isPlaying;

              return (
                <div 
                  key={track.id}
                  className={`p-4 rounded-xl bg-white/60 border border-[#E8E2D9] hover:border-[#D4CFC6]/80 transition-all duration-300 flex items-start gap-4 group relative
                    ${isActive ? 'bg-[#F5F0E8]/80 border-blue-500/30' : ''}`}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-tr ${track.artworkColor} flex items-center justify-center shrink-0 shadow-lg relative`}>
                    <Music className="w-5.5 h-5.5 text-black font-extrabold stroke-[2.5]" />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col gap-2.5">
                    <div className="flex items-center gap-3">
                      {(track.url || track.audioUrl) ? (
                        <button
                          onClick={() => handleTogglePlay(track)}
                          className={`w-8.5 h-8.5 rounded-full flex items-center justify-center transition duration-200 border shrink-0 cursor-pointer shadow-md
                            ${isPlayingThis 
                              ? 'text-emerald-400 border-emerald-500 bg-emerald-500/10 shadow-[0_0_8px_rgba(16,185,129,0.2)] hover:scale-105' 
                              : 'bg-[#F5F0E8] text-slate-300 border-[#D4CFC6] hover:text-white hover:border-blue-500'}`}
                        >
                          {isPlayingThis ? (
                            <Pause className="w-3.5 h-3.5 fill-current stroke-[2.5]" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5 stroke-[2.5]" />
                          )}
                        </button>
                      ) : (
                        <div className="w-8.5 h-8.5 rounded-full bg-slate-800/40 border border-[#E8E2D9] flex items-center justify-center text-slate-500 cursor-not-allowed shrink-0" title="Preview unavailable (Refreshed session)">
                          <Play className="w-3.5 h-3.5 fill-current opacity-40 ml-0.5 stroke-[2.5]" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1 pr-1">
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-[#111111] truncate">
                            {track.filename}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase mt-1">
                            Genre: {track.genre === 'Others' ? track.customGenre : track.genre}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3.5 shrink-0 mt-1.5 sm:mt-0">
                          <div className="flex items-center gap-2 text-[10px] font-bold font-mono text-slate-400 tracking-wider uppercase">
                            <span>{track.bpm} BPM</span>
                            <span>•</span>
                            <span className="text-purple-400">{track.key}</span>
                            <span>•</span>
                            <span>{track.duration}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 bg-[#F5F0E8] border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-bold text-emerald-400 tracking-wide shrink-0">
                            <Lock className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                            <span>⚖️ Royalty-Free License Included</span>
                          </div>

                          {track.url && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPendingDownloadTrack(track);
                              }}
                              className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase border border-[#E8E2D9] rounded bg-[#F5F0E8] text-slate-300 hover:text-white hover:border-blue-500 hover:bg-blue-600/20 active:scale-95 transition flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>DOWNLOAD</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="relative w-full h-9 bg-[#F0EBE3] rounded-lg overflow-hidden flex items-center px-3 border border-[#E8E2D9]">
                      <div className="w-full h-4 flex items-center gap-[2.5px] pointer-events-none">
                        {barHeights.map((height, idx) => {
                          const isBarActive = isActive && (progress >= (idx / barHeights.length) * 100);
                          return (
                            <div 
                              key={idx}
                              className={`flex-1 rounded-sm transition-colors duration-150
                                ${isBarActive ? 'bg-blue-500 shadow-[0_0_2px_rgba(59,130,246,0.4)]' : 'bg-slate-700/30'}`}
                              style={{ height: `${height}%` }}
                            />
                          );
                        })}
                      </div>
                      {isActive && (
                        <div 
                          className="absolute top-0 bottom-0 w-[2px] bg-blue-400 shadow-[0_0_8px_#3b82f6] z-10 pointer-events-none"
                          style={{ left: `${progress}%` }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 rounded-xl border border-dashed border-[#E8E2D9] bg-white/20 text-center text-slate-500 text-xs">
              <p>No sounds uploaded by this creator yet. Upload some custom Logic bounces in the Creator Dashboard!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AudioDashboard() {
  const [tracks, setTracks] = useState<SampleTrack[]>(initialSampleTracks);
  const [activeTab, setActiveTab] = useState<'feed' | 'dashboard'>('feed');
  const [activeFilter, setActiveFilter] = useState<string>('Hip Hop');
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const activeTrackId = activePlayingId;
  const isPlaying = activePlayingId !== null;
  const playingTrackId = activePlayingId;
  const [progress, setProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isGenreModalOpen, setIsGenreModalOpen] = useState<boolean>(false);
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);
  const [pendingDownloadTrack, setPendingDownloadTrack] = useState<SampleTrack | null>(null);
  const [viewingArtistProfile, setViewingArtistProfile] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [isUploadFormVisible, setIsUploadFormVisible] = useState<boolean>(false);
  const [isProfileExpanded, setIsProfileExpanded] = useState<boolean>(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const currentPlayingId = activePlayingId;
  const setCurrentPlayingId = setActivePlayingId;

  const [artistDisplayName, setArtistDisplayName] = useState<string>("");
  const [artistBio, setArtistBio] = useState<string>("");
  const [primaryDaw, setPrimaryDaw] = useState<string>("Logic Pro");
  const [customDaw, setCustomDaw] = useState<string>("");
  const [instagramHandle, setInstagramHandle] = useState<string>("");
  const [isProfileCreated, setIsProfileCreated] = useState<boolean>(false);
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);

  const [isAudioActive, setIsAudioActive] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedStatus = localStorage.getItem('producer_saab_audio_status');
      return savedStatus ? JSON.parse(savedStatus) : true; 
    }
    return true;
  });

  const [userEmail, setUserEmail] = useState<string>("");
  const [otpCode, setOtpCode] = useState<string>("");
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [entryPath, setEntryPath] = useState<'new' | 'existing' | null>(null);
  const [hasChosenEntryMode, setHasChosenEntryMode] = useState<boolean>(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [localProfiles, setLocalProfiles] = useState<SavedProfile[]>([]);

  const [editingTrackId, setEditingTrackId] = useState<string | number | null>(null);

  const [trackTitle, setTrackTitle] = useState<string>('');
  const [genre, setGenre] = useState<string>('Hip Hop');
  const [keySignature, setKeySignature] = useState<string>('A Min');
  const [tempo, setTempo] = useState<number | string>("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isComplianceChecked, setIsComplianceChecked] = useState<boolean>(false);
  const [customGenre, setCustomGenre] = useState<string>("");
  const [customKeySignature, setCustomKeySignature] = useState<string>("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeProducer = localProfiles.find(p => p.id === selectedProfileId);
  const myUploadedTracks = React.useMemo(() => {
    return activeProducer ? (activeProducer.tracks || []) : [];
  }, [activeProducer]);
  
  const totalSoundsUploaded = myUploadedTracks.length;
  const mockAudioPlays = activeProducer
    ? activeProducer.monthlyPlays + (isPlaying && activeTrackId?.startsWith('uploaded') ? 1 : 0)
    : 0 + (isPlaying && activeTrackId?.startsWith('uploaded') ? 1 : 0);
  const mockMarketplaceDownloads = activeProducer ? activeProducer.downloads : 0;

  const filterPills = defaultPills.includes(activeFilter)
    ? defaultPills
    : [...defaultPills, activeFilter];

  const filteredTracks = tracks.filter(track => {
    const displayGenre = track.genre === 'Others' ? (track.customGenre || 'Others') : track.genre;
    return displayGenre === activeFilter;
  });

  const handleTogglePlay = (track: SampleTrack) => {
    if (currentPlayingId === track.id) {
      if (audioElement) {
        audioElement.pause();
      }
      setCurrentPlayingId(null);
      setAudioUrl(null);
      return;
    }

    if (audioElement) {
      audioElement.pause();
    }

    if (!track.audioUrl || track.audioUrl === '#') {
      alert("This initial placeholder track doesn't contain a real audio file bounce. Please use the '+ Upload New Track' button to test live audio playback!");
      return;
    }

    const newAudio = new Audio(track.audioUrl);
    newAudio.muted = !isAudioActive;
    
    newAudio.addEventListener('timeupdate', () => {
      if (newAudio.duration) {
        setProgress((newAudio.currentTime / newAudio.duration) * 100);
      }
    });

    newAudio.play().catch(err => console.error("Audio playback failed:", err));
    
    setAudioElement(newAudio);
    setCurrentPlayingId(track.id);
    setAudioUrl(track.audioUrl);

    newAudio.addEventListener('ended', () => {
      setCurrentPlayingId(null);
      setAudioUrl(null);
      setProgress(0);
    });
  };

  const handleDownload = (track: SampleTrack) => {
    if (!track.url) return;
    setDownloadMessage(`🛒 [Marketplace Active] 1 Download Token Credit deducted. Securing commercial distribution license...`);
    
    setTimeout(() => {
      setDownloadMessage(null);
    }, 4000);

    const link = document.createElement('a');
    link.href = track.url;
    link.download = track.filename.endsWith('.wav') || track.filename.endsWith('.mp3') ? track.filename : `${track.filename}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFormFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      if (!trackTitle) {
        const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setTrackTitle(cleanName);
      }
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTrackId !== null) {
      if (!trackTitle.trim()) {
        alert("Please enter a track title.");
        return;
      }
      if (genre === 'Others' && !customGenre.trim()) {
        alert("Please enter a custom genre.");
        return;
      }
      if (keySignature === 'Others' && !customKeySignature.trim()) {
        alert("Please enter a custom scale / key.");
        return;
      }

      let displayFilename = trackTitle.trim();
      if (!displayFilename.endsWith('.wav') && !displayFilename.endsWith('.mp3')) {
        displayFilename += '.wav';
      }

      const finalKey = keySignature === 'Others' ? customKeySignature.trim() : keySignature;

      setTracks(prev => prev.map(t => {
        if (t.id === editingTrackId) {
          const objectUrl = audioFile ? URL.createObjectURL(audioFile) : t.url;
          const finalAudioUrl = audioFile ? URL.createObjectURL(audioFile) : (t.audioUrl || t.url || '#');
          return {
            ...t,
            filename: displayFilename,
            key: finalKey,
            bpm: Number(tempo) || 0,
            url: objectUrl,
            audioUrl: finalAudioUrl,
            title: trackTitle.trim(),
            genre: genre,
            keySignature: keySignature,
            tempo: tempo,
            customGenre: genre === 'Others' ? customGenre.trim() : '',
            customKey: keySignature === 'Others' ? customKeySignature.trim() : ''
          };
        }
        return t;
      }));

      if (selectedProfileId && typeof window !== 'undefined') {
        const stored = localStorage.getItem('gravity_saved_profiles');
        let currentProfiles: SavedProfile[] = localProfiles;
        if (stored) {
          try {
            currentProfiles = JSON.parse(stored);
          } catch (err) {
            console.error("Failed to parse storage profiles on edit:", err);
          }
        }
        const updatedProfiles = currentProfiles.map(prof => {
          if (prof.id === selectedProfileId) {
            const updatedTracks = (prof.tracks || []).map(t => {
              if (t.id === editingTrackId) {
                const objectUrl = audioFile ? URL.createObjectURL(audioFile) : t.url;
                const finalAudioUrl = audioFile ? URL.createObjectURL(audioFile) : (t.audioUrl || t.url || '#');
                return {
                  ...t,
                  filename: displayFilename,
                  key: finalKey,
                  bpm: Number(tempo) || 0,
                  url: objectUrl,
                  audioUrl: finalAudioUrl,
                  title: trackTitle.trim(),
                  genre: genre,
                  keySignature: keySignature,
                  tempo: tempo,
                  customGenre: genre === 'Others' ? customGenre.trim() : '',
                  customKey: keySignature === 'Others' ? customKeySignature.trim() : ''
                };
              }
              return t;
            });
            return {
              ...prof,
              tracks: updatedTracks
            };
          }
          return prof;
        });
        setLocalProfiles(updatedProfiles);
        localStorage.setItem('gravity_saved_profiles', JSON.stringify(updatedProfiles));
      }

      setTrackTitle('');
      setGenre('Hip Hop');
      setKeySignature('A Min');
      setCustomGenre('');
      setCustomKeySignature('');
      setTempo('');
      setAudioFile(null);
      setIsComplianceChecked(false);
      setEditingTrackId(null);
      setIsUploadFormVisible(false);
      alert("Track details saved successfully!");
      return;
    }

    if (!audioFile) {
      alert("Please select or drop an audio file before publishing.");
      return;
    }
    if (!trackTitle.trim()) {
      alert("Please enter a track title.");
      return;
    }
    if (genre === 'Others' && !customGenre.trim()) {
      alert("Please enter a custom genre.");
      return;
    }
    if (keySignature === 'Others' && !customKeySignature.trim()) {
      alert("Please enter a custom scale / key.");
      return;
    }

    const objectUrl = URL.createObjectURL(audioFile);
    let displayFilename = trackTitle.trim();
    if (!displayFilename.endsWith('.wav') && !displayFilename.endsWith('.mp3')) {
      displayFilename += '.wav';
    }

    const creatorHandle = artistDisplayName.startsWith('@') ? artistDisplayName : `@${artistDisplayName}`;
    const finalGenre = genre === 'Others' ? customGenre.trim() : genre;
    const finalKey = keySignature === 'Others' ? customKeySignature.trim() : keySignature;

    const newTrack: SampleTrack = {
      id: `uploaded-${Date.now()}`,
      filename: displayFilename,
      description: 'Logic Pro Export Bounce',
      duration: '0:08',
      key: finalKey,
      bpm: Number(tempo) || 0,
      url: objectUrl,
      audioUrl: audioFile ? URL.createObjectURL(audioFile) : '#',
      artworkColor: 'from-emerald-400 to-teal-500',
      creator: creatorHandle,
      isUserUploaded: true,
      title: trackTitle.trim(),
      genre: genre,
      keySignature: keySignature,
      tempo: tempo,
      customGenre: genre === 'Others' ? customGenre.trim() : '',
      customKey: keySignature === 'Others' ? customKeySignature.trim() : ''
    };

    setTracks(prev => [newTrack, ...prev]);

    if (audioFile) {
      saveAudioToIDB(newTrack.id, audioFile).catch(err =>
        console.error('Failed to save audio to IndexedDB:', err)
      );
    }

    if (selectedProfileId && typeof window !== 'undefined') {
      const stored = localStorage.getItem('gravity_saved_profiles');
      let currentProfiles: SavedProfile[] = localProfiles;
      if (stored) {
        try {
          currentProfiles = JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse storage profiles on publish:", e);
        }
      }
      const updatedProfiles = currentProfiles.map(prof => {
        if (prof.id === selectedProfileId) {
          const updatedTracks = [newTrack, ...(prof.tracks || [])];
          return {
            ...prof,
            soundsUploaded: updatedTracks.length,
            tracks: updatedTracks
          };
        }
        return prof;
      });
      setLocalProfiles(updatedProfiles);
      localStorage.setItem('gravity_saved_profiles', JSON.stringify(updatedProfiles));
    }

    setTrackTitle('');
    setGenre('Hip Hop');
    setKeySignature('A Min');
    setCustomGenre('');
    setCustomKeySignature('');
    setTempo('');
    setAudioFile(null);
    setIsComplianceChecked(false);
    setIsUploadFormVisible(false);
    setActiveFilter(finalGenre);
    setActiveTab('feed');
  };

  const selectProducerProfile = (producer: SavedProfile) => {
    setSelectedProfileId(producer.id);
    setArtistDisplayName(producer.name);
    setArtistBio(producer.bio);
    setInstagramHandle(producer.instagram);
    
    const standardDaws = ["FL Studio", "Logic Pro", "Ableton Live", "Pro Tools", "Cubase", "Studio One", "GarageBand", "Reaper"];
    const loadedDaw = producer.primaryDaw || "Logic Pro";
    if (standardDaws.includes(loadedDaw)) {
      setPrimaryDaw(loadedDaw);
      setCustomDaw("");
    } else {
      setPrimaryDaw("Others");
      setCustomDaw(loadedDaw);
    }
    
    const sanitizedTracks = (producer.tracks || []).map(track => ({
      ...track,
      url: track.url && track.url.startsWith('blob:') ? '' : track.url
    }));

    setTracks(prev => {
      const filtered = prev.filter(track => track.creator !== producer.handle);
      return [...sanitizedTracks, ...filtered];
    });

    setIsProfileCreated(true);
    setIsProfileExpanded(false);
  };

  const handleSubGenreSelect = (subGenre: string) => {
    setActiveFilter(subGenre.toLowerCase());
    setIsGenreModalOpen(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type.startsWith('audio/')) {
        setAudioFile(file);
        if (!trackTitle) {
          const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          setTrackTitle(cleanName);
        }
      } else {
        alert("Please drop a valid audio file.");
      }
    }
  };

  const hydrateAudioUrls = useCallback(async (profiles: SavedProfile[]) => {
    const hydrated = await Promise.all(
      profiles.map(async (profile) => ({
        ...profile,
        tracks: await Promise.all(
          (profile.tracks || []).map(async (track) => {
            try {
              const file = await loadAudioFromIDB(String(track.id));
              if (file) {
                const freshUrl = URL.createObjectURL(file);
                return { ...track, url: freshUrl, audioUrl: freshUrl };
              }
            } catch {
              // Graceful catch for missing index entries
            }
            return {
              ...track,
              url: track.url?.startsWith('blob:') ? '' : (track.url ?? ''),
              audioUrl: track.audioUrl?.startsWith('blob:') ? '' : (track.audioUrl ?? '')
            };
          })
        )
      }))
    );
    return hydrated;
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gravity_saved_profiles');
      if (stored) {
        try {
          const parsed: SavedProfile[] = JSON.parse(stored);
          hydrateAudioUrls(parsed).then((hydratedProfiles) => {
            setLocalProfiles(hydratedProfiles);
            const allTracks: SampleTrack[] = [];
            hydratedProfiles.forEach(profile => {
              if (profile.tracks) {
                profile.tracks.forEach(track => allTracks.push(track));
              }
            });
            setTracks(allTracks);
          });
        } catch (e) {
          console.error("Failed to parse saved profiles:", e);
        }
      }
    }
  }, [hydrateAudioUrls]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, [audioElement]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('producer_saab_audio_status', JSON.stringify(isAudioActive));
    }
  }, [isAudioActive]);

  useEffect(() => {
    if (audioElement) {
      const currentAudio = audioElement;
      currentAudio.muted = !isAudioActive;
    }
  }, [isAudioActive, audioElement]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#111111] font-sans flex flex-col select-none relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#C5A880]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#C5A880]/5 blur-[120px] pointer-events-none" />

      <div className="w-full bg-[#C5A880] py-3.5 px-4 text-center border-b border-[#B8986E]/20 relative z-30 shadow-md">
        <p className="text-xs md:text-sm font-semibold tracking-wide text-white flex items-center justify-center gap-2 flex-wrap">
          <span>Unlock 100 royalty-free credits a month. Download clear, placement-ready sounds from top producers.</span>
          <a href="#subscribe" className="underline hover:text-[#FAF8F5] font-bold inline-flex items-center gap-0.5 group transition duration-200">
            Subscribe now <span className="no-underline ml-0.5">›</span>
          </a>
        </p>
      </div>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 md:py-16 relative z-10 flex flex-col justify-start">
        {viewingArtistProfile ? (
          <ArtistProfile
            artistName={viewingArtistProfile}
            tracks={tracks}
            activeTrackId={activeTrackId}
            isPlaying={isPlaying}
            progress={progress}
            barHeights={barHeights}
            handleTogglePlay={handleTogglePlay}
            setPendingDownloadTrack={setPendingDownloadTrack}
            onBack={() => setViewingArtistProfile(null)}
            isFollowing={isFollowing}
            setIsFollowing={setIsFollowing}
            savedDisplayName={artistDisplayName}
            savedBio={artistBio}
            savedInstagram={instagramHandle}
          />
        ) : (
          <div className="w-full flex flex-col justify-start">
            <div className="max-w-md w-full mx-auto bg-[#F5F0E8] border border-[#E8E2D9] p-1.5 rounded-full flex justify-between items-center mb-10 relative z-20 shadow-2xl">
              <button
                onClick={() => setActiveTab('feed')}
                className={`flex-1 py-2.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider text-center cursor-pointer transition-all duration-200 flex items-center justify-center gap-2
                  ${activeTab === 'feed' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-105' 
                    : 'text-slate-400 hover:text-white'}`}
              >
                <Globe className="w-3.5 h-3.5" /> Global Sound Feed
              </button>
              
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex-1 py-2.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider text-center cursor-pointer transition-all duration-200 flex items-center justify-center gap-2
                  ${activeTab === 'dashboard' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-105' 
                    : 'text-slate-400 hover:text-white'}`}
              >
                <Sliders className="w-3.5 h-3.5" /> Creator Dashboard
              </button>
            </div>

            {activeTab === 'feed' && (
              <div className="space-y-8 animate-fadeIn relative">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E8E2D9] pb-6 mb-8 relative z-20">
                  <div>
                    <span className="text-yellow-400 font-bold text-xs tracking-widest uppercase block mb-1">MY STUDIO</span>
                    <h1 className="text-3xl md:text-4xl font-black text-[#111111] tracking-tight">Sample Library</h1>
                  </div>

                  <div className="flex flex-wrap gap-2.5 items-center">
                    {filterPills.map((pill) => {
                      const isActive = activeFilter === pill;
                      return (
                        <button
                          key={pill}
                          onClick={() => setActiveFilter(pill)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer border
                            ${isActive 
                              ? 'bg-blue-600/25 text-blue-400 border-blue-500 shadow-md shadow-blue-500/10 scale-105' 
                              : 'bg-[#F5F0E8] text-slate-400 border-[#E8E2D9] hover:text-white hover:border-[#D4CFC6] hover:scale-105'}`}
                        >
                          {pill}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setIsGenreModalOpen(!isGenreModalOpen)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer border flex items-center gap-1
                        ${isGenreModalOpen 
                          ? 'bg-blue-600 text-white border-blue-500 scale-105 shadow-md shadow-blue-500/10' 
                          : 'bg-[#F5F0E8] text-slate-400 border-[#E8E2D9] hover:text-white hover:border-[#D4CFC6]'}`}
                    >
                      more
                    </button>
                  </div>
                </div>

                {isGenreModalOpen && (
                  <div className="absolute top-[80px] right-0 w-full md:w-[480px] bg-white/95 backdrop-blur-md border border-[#E8E2D9] p-5 rounded-xl shadow-2xl z-30 animate-slideDown">
                    <div className="flex items-center justify-between border-b border-[#E8E2D9] pb-2.5 mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Extended Genre Directory</h3>
                      <button onClick={() => setIsGenreModalOpen(false)} className="p-1 rounded-md text-slate-500 hover:text-white hover:bg-[#F0EBE3] transition">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {extendedSubGenres.map((subGenre) => {
                        const isSelected = activeFilter === subGenre.toLowerCase();
                        return (
                          <button
                            key={subGenre}
                            onClick={() => handleSubGenreSelect(subGenre)}
                            className={`px-3 py-2 rounded-lg text-left text-xs font-semibold tracking-wide transition duration-150 border cursor-pointer
                              ${isSelected 
                                ? 'bg-blue-600/15 text-blue-400 border-blue-500/50 font-bold' 
                                : 'bg-[#F5F0E8]/60 text-slate-400 border-[#E8E2D9] hover:text-white hover:bg-[#F0EBE3]/80 hover:border-[#D4CFC6]'}`}
                          >
                            {subGenre}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start relative z-10">
                  <div className="lg:col-span-3 space-y-4">
                    {filteredTracks.length > 0 ? (
                      filteredTracks.map((track) => {
                        const isActive = activeTrackId === track.id;
                        const isPlayingThis = isActive && isPlaying;

                        return (
                          <div 
                            key={track.id}
                            className={`p-4 rounded-xl bg-white/60 border border-[#E8E2D9] hover:border-[#D4CFC6]/80 transition-all duration-300 flex items-start gap-4 group relative
                              ${isActive ? 'bg-[#F5F0E8]/80 border-blue-500/30' : ''}`}
                          >
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-tr ${track.artworkColor} flex items-center justify-center shrink-0 shadow-lg relative`}>
                              <Music className="w-5.5 h-5.5 text-black font-extrabold stroke-[2.5]" />
                              <div className="absolute inset-0 bg-black/10 rounded-lg hover:bg-black/0 transition duration-305" />
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col gap-2.5">
                              <div className="flex items-center gap-3">
                                {(track.url || track.audioUrl) ? (
                                   <button
                                     onClick={() => handleTogglePlay(track)}
                                     className={`w-8.5 h-8.5 rounded-full flex items-center justify-center transition duration-200 border shrink-0 cursor-pointer shadow-md
                                       ${isPlayingThis 
                                         ? 'text-emerald-400 border-emerald-500 bg-emerald-500/10 shadow-[0_0_8px_rgba(16,185,129,0.2)] hover:scale-105' 
                                         : 'bg-[#F5F0E8] text-slate-300 border-[#D4CFC6] hover:text-white hover:border-blue-500 hover:scale-105'}`}
                                   >
                                     {isPlayingThis ? <Pause className="w-3.5 h-3.5 fill-current stroke-[2.5]" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5 stroke-[2.5]" />}
                                   </button>
                                 ) : (
                                   <div className="w-8.5 h-8.5 rounded-full bg-slate-800/40 border border-[#E8E2D9] flex items-center justify-center text-slate-500 cursor-not-allowed shrink-0" title="Preview unavailable (Refreshed session)">
                                     <Play className="w-3.5 h-3.5 fill-current opacity-40 ml-0.5 stroke-[2.5]" />
                                   </div>
                                 )}

                                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1 pr-1">
                                  <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-semibold text-[#111111] truncate group-hover:text-[#C5A880] transition duration-200">
                                      {track.filename}
                                    </span>
                                    <span className="text-xs text-slate-400 mt-1 font-medium select-none flex items-center gap-1.5">
                                      <User className="w-3 h-3 text-blue-400/80" />
                                      <span>Uploaded by:</span>
                                      <button 
                                        onClick={(e) => {
                                          e.preventDefault();
                                          setViewingArtistProfile(track.creator);
                                        }}
                                        className="text-blue-400 hover:underline font-semibold transition cursor-pointer text-left bg-transparent border-none p-0"
                                      >
                                        {track.creator}
                                      </button>
                                    </span>
                                  </div>
                                  
                                  <div className="flex flex-wrap items-center gap-3.5 shrink-0 mt-1.5 sm:mt-0">
                                    <div className="flex items-center gap-2 text-[10px] font-bold font-mono text-slate-400 tracking-wider uppercase">
                                      <span>{track.bpm} BPM</span>
                                      <span>•</span>
                                      <span className="text-purple-400">{track.key}</span>
                                      <span>•</span>
                                      <span>{track.duration}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-1.5 bg-[#F5F0E8] border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-bold text-emerald-400 tracking-wide shrink-0">
                                      <Lock className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                                      <span>⚖️ Royalty-Free License Included</span>
                                    </div>
                                    {track.url && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setPendingDownloadTrack(track);
                                        }}
                                        className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase border border-[#E8E2D9] rounded bg-[#F5F0E8] text-slate-300 hover:text-white hover:border-blue-500 hover:bg-blue-600/20 active:scale-95 transition flex items-center gap-1 cursor-pointer"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>DOWNLOAD</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="relative w-full h-9 bg-[#F0EBE3] rounded-lg overflow-hidden flex items-center px-3 border border-[#E8E2D9]">
                                <div className="w-full h-4 flex items-center gap-[2.5px] pointer-events-none">
                                  {barHeights.map((height, idx) => {
                                    const isBarActive = isActive && (progress >= (idx / barHeights.length) * 100);
                                    return (
                                      <div 
                                        key={idx}
                                        className={`flex-1 rounded-sm transition-colors duration-150
                                          ${isBarActive 
                                            ? 'bg-blue-500 shadow-[0_0_2px_rgba(59,130,246,0.4)]' 
                                            : 'bg-slate-700/30'}`}
                                        style={{ height: `${height}%` }}
                                      />
                                    );
                                  })}
                                </div>
                                
                                {isActive && (
                                  <div 
                                    className="absolute top-0 bottom-0 w-[2px] bg-blue-400 shadow-[0_0_8px_#3b82f6] z-10 pointer-events-none transition-all duration-100"
                                    style={{ left: `${progress}%` }}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-12 rounded-xl border border-dashed border-[#E8E2D9] bg-white/20 text-center text-slate-500 text-xs">
                        <p>No sounds uploaded in this category yet. Head to the Creator Dashboard to upload your custom loops!</p>
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-1">
                    <div className="bg-white/60 border border-[#E8E2D9] p-5 rounded-xl shadow-xl space-y-4 backdrop-blur-sm">
                      <div>
                        <h3 className="text-xs font-bold text-[#111111] uppercase tracking-widest flex items-center gap-1.5">
                          <span>🔥 Trending This Week</span>
                        </h3>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">Top creators gaining traction in the community.</p>
                      </div>

                      <div className="space-y-3.5">
                        {trendingCreators.length > 0 ? trendingCreators.map((creator) => (
                          <div key={creator.rank} className="flex items-center justify-between gap-2 pb-3 border-b border-[#E8E2D9] last:border-b-0 last:pb-0">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0
                                ${creator.rank === 1 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse' : 
                                  creator.rank === 2 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' : 
                                  'bg-amber-700/20 text-amber-600 border border-amber-700/30'}`}
                              >
                                {creator.rank}
                              </div>

                              <div className="w-8 h-8 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-black shrink-0 uppercase">
                                {creator.avatarLetter}
                              </div>

                              <div className="min-w-0 flex flex-col">
                                <button
                                  onClick={() => setViewingArtistProfile(creator.username)}
                                  className="text-xs font-semibold text-[#111111] truncate hover:underline hover:text-[#C5A880] text-left cursor-pointer bg-transparent border-none p-0"
                                >
                                  {creator.username}
                                </button>
                                <span className="text-[9px] text-slate-500 font-medium truncate uppercase mt-0.5">
                                  {creator.genreTag} • {creator.plays} Plays
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => alert(`You followed ${creator.username}!`)}
                              className="px-2.5 py-1 rounded bg-white hover:bg-[#F0EBE3] border border-[#E8E2D9] text-[9px] font-bold text-slate-300 hover:text-white transition duration-200 cursor-pointer shrink-0"
                            >
                              Follow
                            </button>
                          </div>
                        )) : (
                          <div className="py-8 text-center">
                            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[#F0EBE3] flex items-center justify-center">
                              <TrendingUp className="w-5 h-5 text-[#C5A880]" />
                            </div>
                            <p className="text-[#777777] text-xs mb-1">No trending creators yet</p>
                            <p className="text-[#AAAAAA] text-[10px]">Upload sounds to start trending.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-fadeIn">
                {!isProfileCreated ? (
                  <>
                    {entryPath === 'existing' && !selectedProfileId && (
                      <div className="max-w-3xl mx-auto w-full animate-fadeIn py-8 space-y-6">
                        <div className="text-center space-y-2">
                          <h3 className="text-2xl font-black text-[#111111] tracking-tight">Select an Existing Artist Account</h3>
                          <p className="text-xs text-slate-400 font-medium">Choose an artist profile to load their existing Logic Pro Studio workspace.</p>
                        </div>

                        {localProfiles.length === 0 ? (
                          <div className="bg-white border border-[#E8E2D9] p-8 rounded-xl text-center space-y-5 max-w-md mx-auto w-full">
                            <p className="text-sm text-slate-300 font-medium leading-relaxed">
                              No local profiles found on this device yet. Please head back and click &quot;Create Brand New Profile&quot; to set up your first authentic workspace.
                            </p>
                            <button
                              onClick={() => {
                                setEntryPath(null);
                                setIsEmailVerified(false);
                                setHasChosenEntryMode(false);
                              }}
                              className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition duration-200 shadow-md cursor-pointer inline-block"
                            >
                              Go Back
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {localProfiles.map((producer) => (
                              <button
                                key={producer.id}
                                onClick={() => selectProducerProfile(producer)}
                                className="text-left bg-white border border-[#E8E2D9] hover:border-blue-500/50 p-6 rounded-xl transition duration-200 cursor-pointer hover:scale-105 flex flex-col justify-between h-48 shadow-lg hover:shadow-blue-500/5 hover:bg-[#F5F0E8] w-full"
                              >
                                <div className="space-y-2.5">
                                  <div className="w-10 h-10 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-black uppercase">
                                    {producer.name.substring(0, 1)}
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-[#111111] tracking-wide truncate">{producer.name}</h4>
                                    <p className="text-xs text-slate-400 font-medium">{producer.handle}</p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E8E2D9] w-full">
                                  <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Tracks</span>
                                  <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-extrabold text-blue-400">
                                    {producer.soundsUploaded} Loops
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        <button
                          onClick={() => {
                            setEntryPath(null);
                            setIsEmailVerified(false);
                            setHasChosenEntryMode(false);
                          }}
                          className="mx-auto block text-xs text-slate-500 hover:text-slate-300 transition duration-150 cursor-pointer bg-transparent border-none py-2"
                        >
                          &larr; Return to Studio Portal Selection
                        </button>
                      </div>
                    )}

                    {!(entryPath === 'existing' && !selectedProfileId) && (
                      <div className="max-w-xl mx-auto w-full animate-fadeIn py-8">
                        <div className="bg-white border border-[#E8E2D9] p-8 rounded-xl shadow-2xl space-y-6">
                          <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold text-[#111111] tracking-wide">
                              {isEditingProfile ? "✏️ Edit Your Artist Identity" : (
                                <>
                                  {!hasChosenEntryMode && "👋 Welcome to Creator Studio"}
                                  {entryPath === 'new' && !isEmailVerified && !isOtpSent && "👋 Secure Your Creator Studio"}
                                  {entryPath === 'new' && !isEmailVerified && isOtpSent && "⚡ Enter Verification Code"}
                                  {((entryPath === 'new' && isEmailVerified) || (entryPath === 'existing' && selectedProfileId !== null)) && "👋 Create Your Artist Identity First"}
                                </>
                              )}
                            </h3>
                            <p className="text-xs text-slate-400 font-medium">
                              {isEditingProfile ? "Update your public artist handle, biography, and social links below." : (
                                <>
                                  {!hasChosenEntryMode && "Choose how you would like to get started today."}
                                  {entryPath === 'new' && !isEmailVerified && !isOtpSent && "Enter your email address to receive a secure OTP code."}
                                  {entryPath === 'new' && !isEmailVerified && isOtpSent && `We have sent a verification code to your email.`}
                                  {((entryPath === 'new' && isEmailVerified) || (entryPath === 'existing' && selectedProfileId !== null)) && "Customize your public artist handle, biography, and social links before entering the studio."}
                                </>
                              )}
                            </p>
                          </div>
                          
                          <div className="space-y-4">
                            {!hasChosenEntryMode && (
                              <div className="space-y-3">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setEntryPath('existing');
                                    setIsEmailVerified(true);
                                    setHasChosenEntryMode(true);
                                  }}
                                  className="w-full py-3.5 px-4 rounded-xl border border-[#D4CFC6] bg-[#F5F0E8] hover:bg-[#F0EBE3] text-[#555555] hover:text-[#111111] transition duration-205 text-xs font-extrabold uppercase tracking-widest cursor-pointer shadow-md flex items-center justify-center gap-2"
                                >
                                  📂 Enter Existing Studio
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setEntryPath('new');
                                    setHasChosenEntryMode(true);
                                  }}
                                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition duration-205 text-xs font-extrabold uppercase tracking-widest cursor-pointer shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                                >
                                  🆕 Create Brand New Profile
                                </button>
                              </div>
                            )}

                            {entryPath === 'new' && !isEmailVerified && !isOtpSent && (
                              <>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Email Address</label>
                                  <input 
                                    type="email" 
                                    value={userEmail}
                                    onChange={(e) => setUserEmail(e.target.value)}
                                    placeholder="enter your email address"
                                    className="w-full bg-white border border-[#E8E2D9] rounded-lg px-3.5 py-2 text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#C5A880] transition duration-200"
                                  />
                                </div>
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (!userEmail.trim() || !userEmail.includes('@')) {
                                      alert("Please enter a valid email address.");
                                      return;
                                    }
                                    setIsOtpSent(true);
                                  }}
                                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition duration-200 text-xs font-bold uppercase tracking-wider rounded-lg text-white cursor-pointer shadow-lg shadow-blue-500/20"
                                >
                                  📩 Send Verification Code
                                </button>
                              </>
                            )}

                            {!isEmailVerified && isOtpSent && (
                              <>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Email Address</label>
                                  <input 
                                    type="email" 
                                    value={userEmail}
                                    disabled
                                    className="w-full bg-white/55 border border-[#E8E2D9] rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-500 cursor-not-allowed"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Verification Code</label>
                                  <input 
                                    type="text" 
                                    maxLength={4}
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Enter 4-Digit OTP Code"
                                    className="w-full bg-white border border-[#E8E2D9] rounded-lg px-3.5 py-2 text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#C5A880] transition duration-200 text-center tracking-widest text-lg font-mono"
                                  />
                                </div>
                                <button 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (otpCode.length !== 4) {
                                      alert("Please enter a valid 4-digit OTP code.");
                                      return;
                                    }
                                    alert("✔️ Email verified successfully!");
                                    setIsEmailVerified(true);
                                  }}
                                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition duration-200 text-xs font-bold uppercase tracking-wider rounded-lg text-white cursor-pointer shadow-lg shadow-blue-500/20"
                                >
                                  ⚡ Verify & Continue
                                </button>
                              </>
                            )}

                            {isEmailVerified && (
                              <>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Display Name <span className="text-red-500">*</span></label>
                                  <input 
                                    type="text" 
                                    value={artistDisplayName}
                                    onChange={(e) => setArtistDisplayName(e.target.value)}
                                    placeholder="e.g. ProdByAlex"
                                    className="w-full bg-white border border-[#E8E2D9] rounded-lg px-3.5 py-2 text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#C5A880] transition duration-200"
                                  />
                                </div>
                                
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">About Me / Bio <span className="text-red-500">*</span></label>
                                  <textarea 
                                    value={artistBio}
                                    onChange={(e) => setArtistBio(e.target.value)}
                                    placeholder="Describe your production style... (min 10 characters)"
                                    rows={3}
                                    className="w-full bg-white border border-[#E8E2D9] rounded-lg px-3.5 py-2 text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#C5A880] transition duration-200 resize-none"
                                  />
                                  <p className="text-[10px] text-slate-500 mt-1">Must be at least 10 characters detailing your production style.</p>
                                </div>
                                
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Primary DAW <span className="text-red-500">*</span></label>
                                  <select
                                    value={primaryDaw}
                                    onChange={(e) => setPrimaryDaw(e.target.value)}
                                    className="w-full bg-white border border-[#E8E2D9] rounded-lg px-3.5 py-2 text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#C5A880] transition duration-200 cursor-pointer"
                                  >
                                    <option value="FL Studio">FL Studio</option>
                                    <option value="Logic Pro">Logic Pro</option>
                                    <option value="Ableton Live">Ableton Live</option>
                                    <option value="Pro Tools">Pro Tools</option>
                                    <option value="Cubase">Cubase</option>
                                    <option value="Studio One">Studio One</option>
                                    <option value="GarageBand">GarageBand</option>
                                    <option value="Reaper">Reaper</option>
                                    <option value="Others">Others</option>
                                  </select>
                                </div>

                                {primaryDaw === 'Others' && (
                                  <div className="animate-fadeIn">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">SPECIFY DAW / HARDWARE <span className="text-red-500">*</span></label>
                                    <input 
                                      type="text" 
                                      value={customDaw}
                                      onChange={(e) => setCustomDaw(e.target.value)}
                                      placeholder="e.g. Reaper, Bitwig, Akai MPC"
                                      className="w-full bg-white border border-[#E8E2D9] rounded-lg px-3.5 py-2 text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#C5A880] transition duration-200"
                                    />
                                  </div>
                                )}
                                
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">INSTAGRAM USERNAME <span className="text-red-500">*</span></label>
                                  <input 
                                    type="text" 
                                    value={instagramHandle}
                                    onChange={(e) => setInstagramHandle(e.target.value)}
                                    placeholder="e.g. prodbyalex"
                                    className="w-full bg-white border border-[#E8E2D9] rounded-lg px-3.5 py-2 text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#C5A880] transition duration-200"
                                  />
                                </div>
                                
                                <button 
                                  type="submit"
                                  disabled={
                                    !artistDisplayName.trim() || 
                                    !artistBio.trim() || 
                                    artistBio.trim().length < 10 || 
                                    !instagramHandle.trim() || 
                                    !primaryDaw || 
                                    (primaryDaw === 'Others' && !customDaw.trim())
                                  }
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (!artistDisplayName.trim()) return;
                                    if (artistBio.trim().length < 10) {
                                      alert("Please enter a bio with at least 10 characters detailing your style.");
                                      return;
                                    }
                                    if (!instagramHandle.trim()) {
                                      alert("Please enter your Instagram username.");
                                      return;
                                    }
                                    if (!primaryDaw) {
                                      alert("Please select a primary DAW.");
                                      return;
                                    }
                                    if (primaryDaw === 'Others' && !customDaw.trim()) {
                                      alert("Please specify your custom DAW / hardware.");
                                      return;
                                    }
                                    
                                    const cleanHandle = artistDisplayName.startsWith('@') ? artistDisplayName : `@${artistDisplayName}`;
                                    const finalDaw = primaryDaw === 'Others' ? customDaw.trim() : primaryDaw;
                                    
                                    if (isEditingProfile && selectedProfileId) {
                                      const updatedProfiles = localProfiles.map(prof => {
                                        if (prof.id === selectedProfileId) {
                                          return {
                                            ...prof,
                                            name: artistDisplayName.trim(),
                                            handle: cleanHandle,
                                            bio: artistBio.trim(),
                                            instagram: instagramHandle.trim(),
                                            primaryDaw: finalDaw
                                          };
                                        }
                                        return prof;
                                      });
                                      setLocalProfiles(updatedProfiles);
                                      if (typeof window !== 'undefined') {
                                        localStorage.setItem('gravity_saved_profiles', JSON.stringify(updatedProfiles));
                                      }
                                      setIsEditingProfile(false);
                                      setIsProfileCreated(true);
                                      alert("Profile details updated successfully!");
                                    } else {
                                      const newProfile: SavedProfile = {
                                        id: `profile-${Date.now()}`,
                                        name: artistDisplayName.trim(),
                                        handle: cleanHandle,
                                        bio: artistBio.trim(),
                                        instagram: instagramHandle.trim(),
                                        primaryDaw: finalDaw,
                                        soundsUploaded: 0,
                                        monthlyPlays: 0,
                                        downloads: 0,
                                        tracks: []
                                      };
         
                                      const updatedProfiles = [...localProfiles.filter(p => p.id !== newProfile.id), newProfile];
                                      setLocalProfiles(updatedProfiles);
                                      if (typeof window !== 'undefined') {
                                        localStorage.setItem('gravity_saved_profiles', JSON.stringify(updatedProfiles));
                                      }
         
                                      setSelectedProfileId(newProfile.id);
                                      setIsProfileCreated(true);
                                      setIsProfileExpanded(false);
                                      alert("Profile details saved successfully! Entering Creator Studio.");
                                    }
                                  }}
                                  className={`w-full py-3 transition duration-200 text-xs font-bold uppercase tracking-wider rounded-lg text-white shadow-lg
                                    ${(!artistDisplayName.trim() || !artistBio.trim() || artistBio.trim().length < 10 || !instagramHandle.trim() || !primaryDaw || (primaryDaw === 'Others' && !customDaw.trim())) 
                                      ? 'bg-slate-800 border border-[#D4CFC6]/80 text-slate-500 cursor-not-allowed pointer-events-none' 
                                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 cursor-pointer shadow-blue-500/20'}`}
                                >
                                  {isEditingProfile ? "💾 SAVE CHANGES" : "🚀 Create Profile & Enter Studio"}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="p-6 rounded-xl bg-gradient-to-r from-[#C5A880]/5 via-white to-white border border-[#E8E2D9] shadow-xl flex items-center justify-between">
                      <div>
                        <span className="text-yellow-400 font-bold text-[10px] tracking-widest uppercase block mb-1">WORK WORKSPACE ACTIVE</span>
                        <h2 className="text-2xl font-black tracking-tight text-[#111111]">Welcome Back, Creator Studio</h2>
                        <p className="text-xs text-slate-400 mt-0.5 font-medium">Manage your portfolio, publish audio bounces, and trace metrics.</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                        <Sliders className="w-5.5 h-5.5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-5 rounded-xl bg-white/60 border border-[#E8E2D9] flex items-center gap-4 hover:border-[#D4CFC6] transition duration-300 shadow-md">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 tracking-wider block uppercase">Sounds Uploaded</span>
                          <span className="text-2xl font-black text-[#111111] mt-0.5 block">{totalSoundsUploaded}</span>
                        </div>
                      </div>

                      <div className="p-5 rounded-xl bg-white/60 border border-[#E8E2D9] flex items-center gap-4 hover:border-[#D4CFC6] transition duration-300 shadow-md">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                          <Activity className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 tracking-wider block uppercase">Monthly Audio Plays</span>
                          <span className="text-2xl font-black text-[#111111] mt-0.5 block">{mockAudioPlays}</span>
                        </div>
                      </div>

                      <div className="p-5 rounded-xl bg-white/60 border border-[#E8E2D9] flex items-center gap-4 hover:border-[#D4CFC6] transition duration-300 shadow-md">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 tracking-wider block uppercase">Marketplace Downloads</span>
                          <span className="text-2xl font-black text-[#111111] mt-0.5 block">{mockMarketplaceDownloads}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
                      {isUploadFormVisible && isProfileExpanded && (
                        <div className="md:col-span-3 bg-white border border-[#E8E2D9] p-6 rounded-xl shadow-xl space-y-6">
                        <div>
                          <h3 className="text-lg font-bold text-[#111111] tracking-wide">
                            {editingTrackId ? "Edit Sound Bounce Details" : "Publish Sound Bounce"}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5 font-medium">
                            {editingTrackId ? "Update your track's details on the existing record." : "Distribute custom audio phrases instantly to the public library."}
                          </p>
                        </div>

                        <form onSubmit={handlePublish} className="space-y-4">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Track Title <span className="text-red-500">*</span></label>
                            <input 
                              type="text" 
                              placeholder="e.g. LogicPro_Drums_Loop"
                              value={trackTitle}
                              onChange={(e) => setTrackTitle(e.target.value)}
                              className="w-full bg-white border border-[#E8E2D9] rounded-lg px-3.5 py-2 text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#C5A880] transition duration-200"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4 items-start">
                            <div className="space-y-4">
                              <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Genre</label>
                                <select
                                  value={genre}
                                  onChange={(e) => setGenre(e.target.value)}
                                  className="w-full bg-white border border-[#E8E2D9] rounded-lg px-3 py-2 text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#C5A880] transition duration-200 cursor-pointer"
                                >
                                  <option value="Hip Hop">Hip Hop</option>
                                  <option value="Trap">Trap</option>
                                  <option value="R&B">R&B</option>
                                  <option value="Electronic / EDM">Electronic / EDM</option>
                                  <option value="Pop">Pop</option>
                                  <option value="Rock / Metal">Rock / Metal</option>
                                  <option value="Afrobeats / Reggae">Afrobeats / Reggae</option>
                                  <option value="Cinematic / Orchestral">Cinematic / Orchestral</option>
                                  <option value="Lo-Fi / Jazz">Lo-Fi / Jazz</option>
                                  <option value="FX / Textures">FX / Textures</option>
                                  <option value="Others">Others</option>
                                </select>
                              </div>
                              {genre === 'Others' && (
                                <div className="animate-fadeIn">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">CUSTOM GENRE <span className="text-red-500">*</span></label>
                                  <input 
                                    type="text"
                                    placeholder="e.g., Synthwave, Phonk, Hyperpop"
                                    value={customGenre}
                                    onChange={(e) => setCustomGenre(e.target.value)}
                                    className="w-full bg-white border border-[#E8E2D9] rounded-lg px-3.5 py-2 text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#C5A880] transition duration-200"
                                  />
                                </div>
                              )}
                            </div>

                            <div className="space-y-4">
                              <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Key Signature <span className="text-red-500">*</span></label>
                                <select
                                  value={keySignature}
                                  onChange={(e) => setKeySignature(e.target.value)}
                                  className="w-full bg-white border border-[#E8E2D9] rounded-lg px-3 py-2 text-xs font-semibold text-[#111111] focus:outline-none focus:border-[#C5A880] transition duration-200 cursor-pointer"
                                >
                                  <option value="C Maj">C Maj</option>
                                  <option value="C Min">C Min</option>
                                  <option value="C# Maj">C# Maj</option>
                                  <option value="C# Min">C# Min</option>
                                  <option value="D Maj">D Maj</option>
                                  <option value="D Min">D Min</option>
                                  <option value="D# Maj">D# Maj</option>
                                  <option value="D# Min">D# Min</option>
                                  <option value="E Maj">E Maj</option>
                                  <option value="E Min">E Min</option>
                                  <option value="F Maj">F Maj</option>
                                  <option value="F Min">F Min</option>
                                  <option value="F# Maj">F# Maj</option>
                                  <option value="F# Min">F# Min</option>
                                  <option value="G Maj">G Maj</option>
                                  <option value="G Min">G Min</option>
                                  <option value="G# Maj">G# Maj</option>
                                  <option value="G# Min">G# Min</option>
                                  <option value="A Maj">A Maj</option>
                                  <option value="A Min">A Min</option>
                                  <option value="A# Maj">A# Maj</option>
                                  <option value="A# Min">A# Min</option>
                                  <option value="B Maj">B Maj</option>
                                  <option value="B Min">B Min</option>
                                  <option value="Others">Others</option>
                                </select>
                              </div>
                              {keySignature === 'Others' && (
                                <div className="animate-fadeIn">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">CUSTOM SCALE / KEY <span className="text-red-500">*</span></label>
                                  <input 
                                    type="text"
                                    placeholder="e.g., A Harmonic Minor, D Dorian, Pentatonic"
                                    value={customKeySignature}
                                    onChange={(e) => setCustomKeySignature(e.target.value)}
                                    className="w-full bg-white border border-[#E8E2D9] rounded-lg px-3.5 py-2 text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#C5A880] transition duration-200"
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Tempo (BPM) <span className="text-red-500">*</span></label>
                            <input 
                              type="number"
                              placeholder="e.g. 120"
                              value={tempo}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "") {
                                  setTempo("");
                                } else {
                                  setTempo(parseInt(val) || "");
                                }
                              }}
                              className="w-full bg-white border border-[#E8E2D9] rounded-lg px-3.5 py-2 text-sm font-semibold text-[#111111] focus:outline-none focus:border-[#C5A880] transition duration-200"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Audio File {!editingTrackId && <span className="text-red-500">*</span>}</label>
                            <div 
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              onClick={() => fileInputRef.current?.click()}
                              className={`p-6 rounded-lg border border-dashed text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-1.5 select-none
                                ${isDragging 
                                  ? 'border-blue-500 bg-blue-500/5 text-blue-400 shadow-md shadow-blue-500/5' 
                                  : 'border-[#E8E2D9] bg-white/40 text-slate-400 hover:border-[#D4CFC6] hover:bg-white/60'}`}
                            >
                              <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFormFileSelect}
                                accept="audio/*" 
                                className="hidden" 
                              />
                              <Upload className="w-5 h-5 text-slate-500 transition" />
                              {audioFile ? (
                                <div className="text-xs text-[#111111] max-w-[240px] truncate">
                                  <p className="font-semibold">{audioFile.name}</p>
                                  <p className="text-[10px] text-emerald-400 font-bold tracking-wider mt-0.5 uppercase">File Loaded</p>
                                </div>
                              ) : (
                                <div>
                                  <p className="text-xs font-bold text-slate-300">Drop or Browse your Logic Pro X export</p>
                                  <p className="text-[10px] text-slate-500 font-medium mt-0.5">Supports .wav or .mp3 bounces</p>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5 pt-1 select-none">
                            <input 
                              type="checkbox"
                              id="complianceCheck"
                              checked={isComplianceChecked}
                              onChange={(e) => setIsComplianceChecked(e.target.checked)}
                              className="mt-0.5 w-3.5 h-3.5 accent-blue-500 rounded border-[#E8E2D9] bg-white cursor-pointer"
                            />
                            <label htmlFor="complianceCheck" className="text-[10px] font-medium text-slate-400 leading-normal cursor-pointer">
                              I certify that this audio bounce is my original work, royalty-free, and cleared for commercial distribution. <span className="text-red-500">*</span>
                            </label>
                          </div>

                          {(() => {
                            const isCustomGenreValid = genre !== 'Others' || customGenre.trim() !== '';
                            const isCustomKeyValid = keySignature !== 'Others' || customKeySignature.trim() !== '';
                            const isAudioFileValid = editingTrackId !== null || audioFile !== null;
                            const isUploadValid = trackTitle.trim() !== "" && keySignature !== "" && Number(tempo) > 0 && isComplianceChecked && isAudioFileValid && isCustomGenreValid && isCustomKeyValid;
                            return (
                              <div className="space-y-2">
                                <button 
                                  type="submit"
                                  disabled={!isUploadValid}
                                  className={`w-full py-3 transition-all duration-300 text-xs font-bold uppercase tracking-widest rounded-lg shadow-lg mt-2
                                    ${!isUploadValid 
                                      ? 'bg-slate-800 border border-[#D4CFC6]/80 text-slate-500 cursor-not-allowed pointer-events-none' 
                                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 cursor-pointer shadow-blue-500/20 active:scale-95'}`}
                                >
                                  {editingTrackId ? "💾 SAVE TRACK CHANGES" : "PUBLISH TO PUBLIC FEED"}
                                </button>
                                
                                {editingTrackId ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingTrackId(null);
                                      setTrackTitle('');
                                      setGenre('Hip Hop');
                                      setKeySignature('A Min');
                                      setCustomGenre('');
                                      setCustomKeySignature('');
                                      setTempo('');
                                      setAudioFile(null);
                                      setIsComplianceChecked(false);
                                      setIsUploadFormVisible(false);
                                    }}
                                    className="w-full py-2.5 bg-transparent hover:bg-[#F0EBE3]/40 border border-[#E8E2D9] hover:border-[#D4CFC6] transition-all duration-200 text-xs font-bold uppercase tracking-widest rounded-lg cursor-pointer text-slate-400 hover:text-white"
                                  >
                                    Cancel Editing
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTrackTitle('');
                                      setGenre('Hip Hop');
                                      setKeySignature('A Min');
                                      setCustomGenre('');
                                      setCustomKeySignature('');
                                      setTempo('');
                                      setAudioFile(null);
                                      setIsComplianceChecked(false);
                                      setIsUploadFormVisible(false);
                                    }}
                                    className="w-full py-2.5 bg-transparent hover:bg-[#F0EBE3]/40 border border-[#E8E2D9] hover:border-[#D4CFC6] transition-all duration-200 text-xs font-bold uppercase tracking-widest rounded-lg cursor-pointer text-slate-400 hover:text-white"
                                  >
                                    Cancel Upload
                                  </button>
                                )}
                              </div>
                            );
                          })()}
                        </form>
                      </div>
                      )}

                      <div className={(isUploadFormVisible && isProfileExpanded) ? "md:col-span-2 space-y-6" : "md:col-span-5 space-y-6 max-w-3xl mx-auto w-full"}>
                        <div className="flex justify-start">
                          <button
                            onClick={() => setActiveTab('feed')}
                            className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest bg-white/60 hover:bg-[#F0EBE3] text-slate-300 hover:text-white border border-[#E8E2D9] hover:border-[#D4CFC6]/80 transition duration-200 rounded-lg cursor-pointer flex items-center gap-2 shadow-md"
                          >
                            📂 &larr; BACK TO FEED
                          </button>
                        </div>

                        <div 
                          onClick={() => setIsProfileExpanded(prev => !prev)}
                          className="bg-white border border-[#E8E2D9] p-6 rounded-xl shadow-xl space-y-4 cursor-pointer hover:border-[#D4CFC6]/80 hover:shadow-2xl transition-all duration-300 relative group"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">👤 Artist Profile</h3>
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setIsProfileExpanded(prev => !prev)}
                                className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-[#C5A880]/30 rounded bg-[#C5A880]/10 text-[#C5A880] hover:text-white hover:border-[#C5A880] hover:bg-[#C5A880] transition cursor-pointer"
                              >
                                {isProfileExpanded ? "📁 Hide Catalog" : "📂 Open Catalog"}
                              </button>
                              <button 
                                onClick={() => {
                                  setIsProfileCreated(false);
                                  setIsEditingProfile(true);
                                }}
                                className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-[#E8E2D9] rounded bg-[#F5F0E8] text-slate-300 hover:text-white hover:border-blue-500 transition cursor-pointer"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-black shrink-0">
                                {artistDisplayName.trim().replace('@', '').substring(0, 1).toUpperCase() || 'P'}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-400">Active Profile</p>
                                <p className="text-sm font-black text-[#111111] truncate">
                                  {artistDisplayName.startsWith('@') ? artistDisplayName : `@${artistDisplayName}`}
                                </p>
                              </div>
                            </div>
                            
                            <p className="text-xs text-slate-300 font-medium leading-relaxed bg-white p-3 rounded-lg border border-[#E8E2D9]">
                              {artistBio || "No bio set."}
                            </p>
                            
                            <div className="flex flex-wrap gap-2">
                              {instagramHandle && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-[#E8E2D9] text-[10px] font-bold text-slate-400">
                                  <InstagramIcon className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                                  <span className="truncate">@{instagramHandle.replace('@', '')}</span>
                                </div>
                              )}

                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white border border-[#E8E2D9] text-[10px] font-bold text-slate-400">
                                <Sliders className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                <span>DAW: {activeProducer?.primaryDaw || "Logic Pro"}</span>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-[#E8E2D9] flex items-center justify-between text-[9px] font-bold text-slate-500 group-hover:text-slate-400 transition-colors uppercase tracking-widest">
                              <span>Click card to {isProfileExpanded ? "collapse" : "expand"} catalog</span>
                              <span className="text-xs transition-transform duration-300">
                                {isProfileExpanded ? "▲" : "▼"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {isProfileExpanded && (
                          <div className="bg-white border border-[#E8E2D9] p-6 rounded-xl shadow-xl space-y-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-bold text-[#111111] tracking-wide">My Uploaded Catalog</h3>
                              <p className="text-xs text-slate-400 mt-0.5 font-medium">Verify your uploaded community bounces here.</p>
                            </div>
                            {!isUploadFormVisible && (
                              <button
                                onClick={() => {
                                  setEditingTrackId(null);
                                  setTrackTitle('');
                                  setGenre('Hip Hop');
                                  setKeySignature('A Min');
                                  setCustomGenre('');
                                  setCustomKeySignature('');
                                  setTempo('');
                                  setAudioFile(null);
                                  setIsComplianceChecked(false);
                                  setIsUploadFormVisible(true);
                                }}
                                className="px-3.5 py-2 text-xs font-bold tracking-wider uppercase border border-blue-500/30 rounded-lg bg-blue-600/10 text-blue-400 hover:text-white hover:border-blue-500 hover:bg-blue-600 active:scale-95 transition flex items-center gap-1 cursor-pointer"
                              >
                                ➕ Upload New Track
                              </button>
                            )}
                          </div>

                          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                            {myUploadedTracks.length > 0 ? (
                              myUploadedTracks.map((track) => {
                                const isActive = activeTrackId === track.id;
                                const isPlayingThis = isActive && isPlaying;

                                return (
                                  <div 
                                    key={track.id}
                                    className={`p-4 rounded-xl bg-white/60 border border-[#E8E2D9] hover:border-[#D4CFC6]/80 transition-all duration-300 flex flex-col gap-3 group relative
                                      ${isActive ? 'bg-[#F5F0E8]/80 border-blue-500/30' : ''}`}
                                  >
                                    <div className="flex items-start gap-4">
                                      <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 shadow-lg relative">
                                        <Music className="w-5 h-5 text-black font-extrabold" />
                                      </div>

                                      <div className="flex-1 min-w-0 flex flex-col gap-2">
                                        <div className="flex items-center justify-between gap-3">
                                          <div className="flex items-center gap-3 flex-1 min-w-0">
                                            {(track.url || track.audioUrl) ? (
                                              <button
                                                onClick={() => handleTogglePlay(track)}
                                                className={`w-7.5 h-7.5 rounded-full flex items-center justify-center transition duration-200 border shrink-0 cursor-pointer shadow-md
                                                  ${isPlayingThis 
                                                    ? 'text-emerald-400 border-emerald-500 bg-emerald-500/10 shadow-[0_0_8px_rgba(16,185,129,0.2)] hover:scale-105' 
                                                    : 'bg-[#F5F0E8] text-slate-300 border-[#D4CFC6] hover:text-white hover:border-blue-500'}`}
                                              >
                                                {isPlayingThis ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                                              </button>
                                            ) : (
                                              <div className="w-7.5 h-7.5 rounded-full bg-slate-800/40 border border-[#E8E2D9] flex items-center justify-center text-slate-500 cursor-not-allowed shrink-0" title="Preview unavailable (Refreshed session)">
                                                <Play className="w-3 h-3 fill-current opacity-40 ml-0.5" />
                                              </div>
                                            )}

                                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                              <span className="text-xs font-semibold text-[#111111] truncate">
                                                {track.filename}
                                              </span>
                                              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">
                                                  {track.bpm} BPM • {track.key} • {track.genre === 'Others' ? track.customGenre : track.genre}
                                                </span>
                                                <button 
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    setViewingArtistProfile(track.creator);
                                                  }}
                                                  className="text-[9px] text-blue-400 hover:underline font-bold transition cursor-pointer bg-transparent border-none p-0"
                                                >
                                                  {track.creator}
                                                </button>
                                              </div>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-2 shrink-0">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingTrackId(track.id);
                                                setIsUploadFormVisible(true);
                                                
                                                const resolvedTitle = track.title !== undefined ? track.title : (track.filename ? track.filename.replace(/\.(wav|mp3)$/, '') : '');
                                                setTrackTitle(resolvedTitle);
                                                
                                                const defaultPills = ["Hip Hop", "Trap", "R&B", "Electronic / EDM", "Pop", "Rock / Metal", "Afrobeats / Reggae", "Cinematic / Orchestral", "Lo-Fi / Jazz", "FX / Textures"];
                                                const resolvedGenre = track.genre || 'Hip Hop';
                                                if (resolvedGenre === 'Others') {
                                                  setGenre('Others');
                                                  setCustomGenre(track.customGenre || '');
                                                } else if (!defaultPills.includes(resolvedGenre)) {
                                                  setGenre('Others');
                                                  setCustomGenre(resolvedGenre);
                                                } else {
                                                  setGenre(resolvedGenre);
                                                  setCustomGenre('');
                                                }
                                                
                                                const standardScales = [
                                                  "C Maj", "C Min", "C# Maj", "C# Min", "D Maj", "D Min", "D# Maj", "D# Min", 
                                                  "E Maj", "E Min", "F Maj", "F Min", "F# Maj", "F# Min", "G Maj", "G Min", 
                                                  "G# Maj", "G# Min", "A Maj", "A Min", "A# Maj", "A# Min", "B Maj", "B Min"
                                                ];
                                                const resolvedKey = track.keySignature || track.key || 'A Min';
                                                if (resolvedKey === 'Others') {
                                                  setKeySignature('Others');
                                                  setCustomKeySignature(track.customKey || '');
                                                } else if (!standardScales.includes(resolvedKey)) {
                                                  setKeySignature('Others');
                                                  setCustomKeySignature(resolvedKey);
                                                } else {
                                                  setKeySignature(resolvedKey);
                                                  setCustomKeySignature('');
                                                }
                                                
                                                const resolvedTempo = track.tempo !== undefined ? track.tempo : (track.bpm || '');
                                                setTempo(resolvedTempo);
                                                setIsComplianceChecked(true);
                                              }}
                                              className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase border border-[#E8E2D9] rounded bg-[#F5F0E8] text-slate-300 hover:text-white hover:border-blue-500 hover:bg-blue-600/20 active:scale-95 transition flex items-center gap-1 cursor-pointer"
                                            >
                                              <span>✏️ Edit Track</span>
                                            </button>
                                            {track.url && (
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setPendingDownloadTrack(track);
                                                }}
                                                className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase border border-[#E8E2D9] rounded bg-[#F5F0E8] text-slate-300 hover:text-white hover:border-blue-500 hover:bg-blue-600/20 active:scale-95 transition flex items-center gap-1 cursor-pointer"
                                              >
                                                <Download className="w-3.5 h-3.5" />
                                                <span>DOWNLOAD</span>
                                              </button>
                                            )}
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 bg-white border border-emerald-500/20 px-2 py-0.5 rounded text-[8px] font-bold text-emerald-400 tracking-wide shrink-0 self-start">
                                          <Lock className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                                          <span>⚖️ Royalty-Free License Included</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="relative w-full h-6 bg-[#F0EBE3] rounded-md overflow-hidden flex items-center px-2.5 border border-[#E8E2D9]">
                                      <div className="w-full h-3 flex items-center gap-[2px] pointer-events-none">
                                        {barHeights.slice(0, 32).map((height, idx) => {
                                          const isBarActive = isActive && (progress >= (idx / 32) * 100);
                                          return (
                                            <div 
                                              key={idx}
                                              className={`flex-1 rounded-sm transition-colors duration-150
                                                ${isBarActive ? 'bg-blue-500' : 'bg-slate-700/30'}`}
                                              style={{ height: `${height}%` }}
                                            />
                                          );
                                        })}
                                      </div>
                                      {isActive && (
                                        <div 
                                          className="absolute top-0 bottom-0 w-[1.5px] bg-blue-400 z-10 pointer-events-none"
                                          style={{ left: `${progress}%` }}
                                        />
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="p-8 rounded-xl border border-dashed border-[#E8E2D9] bg-white/20 text-center text-slate-500 text-xs">
                                <p>You haven&apos;t uploaded any loops yet.</p>
                                <p className="text-[10px] text-slate-600 mt-1 font-medium">Your published Logic bounces will show up here.</p>
                              </div>
                            )}
                          </div>
                        </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-[#E8E2D9] px-5 py-3 rounded-full shadow-2xl flex items-center gap-4 z-40">
        <div className="flex items-center gap-3 text-xs font-semibold select-none">
          {playingTrackId ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse" />
              <span className="font-mono text-slate-300 text-[10px] uppercase tracking-wider">
                NOW PLAYING: {tracks.find(s => s.id === playingTrackId)?.filename}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              <span className="font-mono text-slate-500 text-[10px] tracking-wider uppercase">NO PREVIEW ACTIVE</span>
            </div>
          )}
          
          <div className="h-4.5 w-[1px] bg-slate-800" />

          <button 
            onClick={() => setIsAudioActive(prev => !prev)}
            className={`flex items-center gap-1.5 transition-colors duration-200 hover:text-white cursor-pointer ${
              isAudioActive ? "text-emerald-400" : "text-slate-500"
            }`}
            title={isAudioActive ? "Click to mute preview audio" : "Click to unmute preview audio"}
          >
            {isAudioActive ? (
              <>
                <Volume2 className="w-4 h-4" />
                <span className="text-[10px] font-mono tracking-wider uppercase">AUDIO ACTIVE</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-rose-500" />
                <span className="text-[10px] font-mono tracking-wider uppercase text-rose-500">AUDIO MUTED</span>
              </>
            )}
          </button>
        </div>
      </div>

      {downloadMessage && (
        <div className="fixed bottom-24 right-6 bg-white/95 backdrop-blur-md border border-emerald-500/30 p-4 rounded-xl shadow-2xl z-50 max-w-sm flex items-start gap-3 border-l-4 border-l-emerald-500 transition-all duration-300 transform translate-y-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <Lock className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider">Transaction Logged</h4>
            <p className="text-[11px] text-slate-300 mt-1 font-medium leading-relaxed">
              {downloadMessage}
            </p>
          </div>
          <button 
            onClick={() => setDownloadMessage(null)}
            className="text-slate-500 hover:text-white transition cursor-pointer p-0.5 hover:bg-[#F0EBE3] rounded shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {pendingDownloadTrack && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#F5F0E8] border border-[#E8E2D9] rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
            <button 
              onClick={() => setPendingDownloadTrack(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition cursor-pointer p-1 hover:bg-[#F0EBE3] rounded"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center mt-2 mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#111111] tracking-tight">Checkout Authorization</h3>
              <p className="text-xs text-slate-400 mt-1 truncate max-w-full px-2">
                Authorizing license for: <span className="text-blue-400 font-semibold">{pendingDownloadTrack.filename}</span>
              </p>
            </div>

            <div className="bg-white border border-[#E8E2D9] rounded-xl p-4 mb-6 space-y-3">
              <div className="flex justify-between items-center pb-2.5 border-b border-[#E8E2D9]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Item Cost</span>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Cost: 1 Download Token Credit</span>
              </div>
              
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                Don&apos;t have tokens? Upgrade to the Creator Studio Membership plan for $9.99/mo to unlock 100 monthly tokens.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  const track = pendingDownloadTrack;
                  setPendingDownloadTrack(null);
                  handleDownload(track);
                }}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 text-xs font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer text-white flex items-center justify-center gap-1.5"
              >
                ⚡ Use 1 Token & Download
              </button>
              
              <button
                onClick={() => setPendingDownloadTrack(null)}
                className="w-full py-2.5 bg-transparent hover:bg-[#F0EBE3]/40 border border-[#E8E2D9] hover:border-[#D4CFC6] transition-all duration-200 text-xs font-bold uppercase tracking-widest rounded-lg cursor-pointer text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <audio
        ref={audioRef}
        loop
        onTimeUpdate={() => {
          if (audioRef.current && audioRef.current.duration) {
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
          }
        }}
        onEnded={() => {
          setActivePlayingId(null);
          setProgress(0);
        }}
      />
    </div>
  );
}
