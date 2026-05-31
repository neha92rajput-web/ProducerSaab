export interface LoopPattern {
  triggers: number[]; // 16-step array. Drum: 1=kick, 2=rim/snare, 3=both; Bass: 1=trigger; Perc/Others: 1=shaker/chord, 2=conga/arp, 3=both
  notes?: number[];    // Note offsets in scale (C# min or G min)
  velocities?: number[]; // Velocity values (0.0 to 1.0)
}

export interface AudioLoop {
  id: string;
  name: string;
  bpm: number;
  key: string;
  instrument: string;
  genre: string;
  duration: number; // in seconds
  audioUrl: string;
  soundType: 'Melody' | 'Chords';
  category: 'drums' | 'bass' | 'percussion' | 'chords' | 'others';
  pattern: LoopPattern;
}

export const INSTRUMENTS = [
  'Drums',
  'Bass Guitar',
  'Log Drum',
  'Percussion',
  'Guitar',
  'Synthesizer'
] as const;

export const GENRES = [
  'Afro',
  'Afro-Tech',
  'Amapiano',
  'Afrobeats',
  'R&B'
] as const;

export const KEYS = [
  'C# Min',
  'G Min'
] as const;

// 1. AFRO LOOPS (50 loops)
const generateAfroLoops = (): AudioLoop[] => {
  const loops: AudioLoop[] = [];

  // Drums (13 loops)
  const drumNames = [
    "AfroTech Drum 122", "Amapiano Kick 118", "Lagos Kick Groove",
    "Soweto House Rhythm", "Gqom Power Thump", "Kuduro Snare Roll",
    "Bantu Shaker Beat", "Syncopated Rim 120", "Afrobeat Snare Loop",
    "Shango Rimbeat", "Zulu Drum Kick", "Kilimanjaro Grooves",
    "Durban Club Beat"
  ];
  const drumPatterns: number[][] = [
    [1, 0, 0, 0, 2, 0, 1, 0, 0, 1, 2, 0, 1, 0, 0, 0],
    [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 1, 0, 2, 0],
    [1, 0, 0, 0, 2, 0, 0, 1, 0, 0, 2, 0, 1, 0, 0, 1],
    [1, 0, 1, 0, 2, 0, 1, 0, 1, 0, 2, 0, 1, 0, 2, 0],
    [1, 0, 0, 2, 0, 2, 1, 0, 0, 2, 2, 0, 1, 0, 0, 2],
    [1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0],
    [1, 0, 0, 0, 2, 0, 1, 0, 0, 0, 2, 0, 1, 0, 1, 0],
    [1, 0, 2, 0, 2, 0, 1, 0, 2, 0, 2, 0, 1, 0, 2, 0],
    [1, 0, 0, 1, 2, 0, 0, 1, 0, 0, 2, 1, 1, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 2, 2, 0, 1, 0, 0, 2, 2, 0, 1, 0, 2, 0],
    [1, 0, 1, 1, 2, 0, 1, 0, 1, 1, 2, 0, 1, 0, 1, 0]
  ];

  drumNames.forEach((name, idx) => {
    loops.push({
      id: `afro-drum-${idx + 1}`,
      name,
      bpm: 122,
      key: 'C# Min',
      instrument: idx % 2 === 0 ? 'Drums' : 'Percussion',
      genre: idx % 3 === 0 ? 'Afro-Tech' : (idx % 3 === 1 ? 'Amapiano' : 'Afrobeats'),
      duration: 16,
      audioUrl: '',
      soundType: 'Melody',
      category: 'drums',
      pattern: {
        triggers: drumPatterns[idx % drumPatterns.length],
        velocities: Array(16).fill(0.85).map((v, i) => i % 4 === 0 ? 1.0 : v)
      }
    });
  });

  // Bass (13 loops)
  const bassNames = [
    "Karibu Bass Guitar", "Log Drum Sub", "Afro-Tech Sub Bass",
    "Deep Lagos Slide", "Tribal Sine Sub", "Kwaito Bass Synth",
    "Serrated Tech Hook", "Nomad Bassline", "C# Min Sub Slider",
    "Dune Bass Wobble", "Sahara Acid Bass", "Nairobi Low-End",
    "Okavango Pluck Bass"
  ];
  const bassTriggers: number[][] = [
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0],
    [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0],
    [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0],
    [1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]
  ];
  const bassNotes: number[][] = [
    [0, 0, 0, 2, 0, 0, 3, 0, 0, 4, 0, 0, 0, 0, 2, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 3, 0, 0, 4, 0, 5, 0, 0, 3, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 0, 0, 0, 0, 4, 0, 0, 0, 0, 2, 0, 0],
    [0, 0, 0, 0, 3, 0, 2, 0, 0, 0, 0, 0, 3, 0, 0, 0],
    [0, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 0],
    [0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 2, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0],
    [0, 2, 0, 3, 0, 4, 3, 0, 5, 4, 0, 3, 0, 2, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 0, 0, 2, 0, 0, 3, 0, 0, 3, 0, 0, 0]
  ];

  bassNames.forEach((name, idx) => {
    loops.push({
      id: `afro-bass-${idx + 1}`,
      name,
      bpm: 122,
      key: 'C# Min',
      instrument: idx % 3 === 0 ? 'Log Drum' : 'Bass Guitar',
      genre: idx % 2 === 0 ? 'Afro-Tech' : 'Afro',
      duration: 16,
      audioUrl: '',
      soundType: 'Melody',
      category: 'bass',
      pattern: {
        triggers: bassTriggers[idx % bassTriggers.length],
        notes: bassNotes[idx % bassNotes.length],
        velocities: Array(16).fill(0.9)
      }
    });
  });

  // Percussion (12 loops)
  const percNames = [
    "Bongo Loop Thump", "Conga Shake", "Afro Shaker Loop",
    "Marimba Tap Rhythm", "Udu Clay Pot Pop", "Djembe Accent Tap",
    "Shekere Rhythm Loop", "Talking Drum Message", "Calabash Bass Tap",
    "Agogo Bell Ring", "Woodblock Syncopation", "Triangle High Ping"
  ];
  const percTriggers: number[][] = [
    [0, 0, 2, 0, 2, 0, 0, 2, 0, 0, 2, 0, 2, 0, 0, 2],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2, 1, 0, 2, 0],
    [0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0],
    [2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 0],
    [0, 0, 2, 2, 0, 0, 2, 0, 0, 2, 2, 0, 0, 2, 0, 2],
    [1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
    [0, 2, 3, 0, 0, 2, 3, 0, 0, 2, 3, 0, 0, 2, 3, 0],
    [2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0],
    [0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0, 0, 3, 0],
    [3, 0, 0, 3, 0, 0, 3, 0, 3, 0, 0, 3, 0, 0, 3, 0],
    [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0]
  ];

  percNames.forEach((name, idx) => {
    loops.push({
      id: `afro-perc-${idx + 1}`,
      name,
      bpm: 122,
      key: 'C# Min',
      instrument: 'Percussion',
      genre: 'Afro',
      duration: 16,
      audioUrl: '',
      soundType: 'Melody',
      category: 'percussion',
      pattern: {
        triggers: percTriggers[idx % percTriggers.length],
        velocities: Array(16).fill(0.7)
      }
    });
  });

  // Chords (12 loops)
  const chordsNames = [
    "Rufisque Guitar", "Warm Afro Pad", "Kalimba Pluck Pattern",
    "Nairobi Rhodes Swell", "Malinke Chord Pluck", "C# Min Afro Plucks",
    "Desert Blues Lick", "Savannah Guitar Run", "Sufi Reed Melodies",
    "AfroTech Saw Hook", "Mombasa Brass Pad", "Zambian Vibes"
  ];
  const chordsTriggers: number[][] = [
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 2, 0, 2, 0, 0, 2, 0, 0, 2, 0, 2, 0, 0, 2],
    [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0],
    [0, 0, 2, 2, 0, 0, 2, 0, 0, 2, 2, 0, 0, 2, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 2, 0, 2, 0, 2, 0, 0, 0, 2, 0, 2, 0, 2, 0],
    [0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 0],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0]
  ];
  const chordsNotes: number[][] = [
    [0, 0, 0, 0, 5, 0, 0, 0, 2, 0, 0, 0, 6, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 3, 2, 5, 7, 5, 3, 2, 3, 2, 0, 6, 5, 3, 2],
    [0, 0, 0, 3, 0, 0, 5, 0, 6, 0, 0, 3, 0, 0, 5, 0],
    [0, 0, 2, 3, 0, 0, 2, 0, 0, 3, 5, 0, 0, 2, 0, 0],
    [0, 0, 0, 0, 3, 0, 0, 0, 5, 0, 0, 0, 4, 0, 0, 0],
    [0, 0, 2, 0, 3, 0, 5, 0, 0, 0, 5, 0, 3, 0, 2, 0],
    [7, 6, 5, 4, 3, 2, 0, 2, 3, 4, 5, 6, 7, 6, 5, 4],
    [0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0],
    [0, 0, 2, 0, 5, 0, 6, 0, 0, 0, 2, 0, 5, 0, 6, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 2, 0, 0, 2, 0, 0, 3, 0, 0, 3, 0, 0, 0, 0]
  ];

  chordsNames.forEach((name, idx) => {
    loops.push({
      id: `afro-chord-${idx + 1}`,
      name,
      bpm: 122,
      key: 'C# Min',
      instrument: idx % 3 === 0 ? 'Guitar' : 'Synthesizer',
      genre: 'Afro',
      duration: 16,
      audioUrl: '',
      soundType: 'Chords',
      category: 'chords',
      pattern: {
        triggers: chordsTriggers[idx % chordsTriggers.length],
        notes: chordsNotes[idx % chordsNotes.length],
        velocities: Array(16).fill(0.65)
      }
    });
  });

  return loops;
};

// 2. R&B LOOPS (50 loops)
const generateRnBLoops = (): AudioLoop[] => {
  const loops: AudioLoop[] = [];

  // Drums (16 loops)
  const drumNames = [
    "os stc 90 drum loop 5 full", "os stc 90 drum loop 5 snap", "late night pocket snap",
    "smoky room groove", "sweet 80s velvet snare", "sensual bedroom pocket",
    "slow burn acoustic", "mellow soul kick snap", "midnight ride beat",
    "smooth rhythm rimbeat", "silk velvet snap loop", "slow tempo groove",
    "chillout pocket roll", "retro soul acoustic snare", "cozy room clap groove",
    "smoky jazz pocket"
  ];
  // R&B drums triggers (1 = Kick, 2 = Snare/Snap, 3 = Both)
  const drumTriggers: number[][] = [
    [1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0], // basic slow groove kick on 0, 8; snare on 4, 12
    [1, 0, 0, 0, 2, 0, 0, 1, 0, 0, 1, 0, 2, 0, 0, 0], // snap pocket swing
    [1, 0, 0, 1, 2, 0, 0, 0, 1, 0, 0, 1, 2, 0, 0, 1], // syncopated acoustic kick
    [1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 1, 0, 2, 0, 0, 0], // smoky kick-ride
    [1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 1], // 80s electro snap
    [1, 0, 1, 0, 2, 0, 0, 0, 1, 0, 1, 0, 2, 0, 0, 0], // sensual kick roll
    [1, 0, 0, 0, 2, 0, 1, 0, 1, 0, 0, 0, 2, 0, 0, 0], // slow burn
    [1, 0, 0, 0, 2, 0, 0, 1, 1, 0, 0, 0, 2, 0, 0, 0], // mellow kick snare
    [1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 2, 0, 1, 0], // midnight ride
    [1, 0, 1, 0, 2, 0, 0, 1, 0, 0, 1, 0, 2, 0, 0, 0], // smooth rimbeat
    [1, 0, 0, 0, 2, 0, 0, 0, 1, 1, 0, 0, 2, 0, 0, 0], // silk velvet
    [1, 0, 0, 1, 2, 0, 0, 0, 1, 0, 0, 1, 2, 0, 0, 0], // slow swing
    [1, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 2, 0, 1, 1], // chillout
    [1, 0, 1, 0, 2, 0, 0, 0, 1, 0, 1, 0, 2, 0, 0, 1], // retro soul
    [1, 0, 0, 0, 2, 0, 1, 0, 1, 0, 0, 0, 2, 0, 0, 1], // cozy room
    [1, 0, 0, 1, 2, 0, 0, 0, 1, 0, 1, 0, 2, 0, 0, 0]  // smoky jazz
  ];

  drumNames.forEach((name, idx) => {
    loops.push({
      id: `rnb-drum-${idx + 1}`,
      name,
      bpm: 80,
      key: 'G Min',
      instrument: 'Drums',
      genre: 'R&B',
      duration: 16,
      audioUrl: '',
      soundType: 'Melody',
      category: 'drums',
      pattern: {
        triggers: drumTriggers[idx % drumTriggers.length],
        velocities: Array(16).fill(0.8).map((v, i) => i % 4 === 0 ? 0.95 : v)
      }
    });
  });

  // Bass (16 loops)
  const bassNames = [
    "mo fs 100 bass guitar loop smoky emin", "warm flatwound soul line", "smoky sub sliding gmin",
    "silky upright acoustic walk", "late night pulse bass", "analog low pass sweep",
    "satin pocket line", "cozy fretless guitar loop", "bedroom sub harmonic",
    "sweet jazz pocket sub", "smoky soul groove", "velvet sub swell",
    "liquid low-end groove", "smooth filter sweep bass", "sensual flatwound groove",
    "retro jazz walking line"
  ];
  const bassTriggers: number[][] = [
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], // basic slow chord notes
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0], // syncopated soul walk
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0], // sub glide sweep
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0], // jazzy walking fretless
    [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0], // late night pulse
    [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0], // low pass sweep
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0], // satin pocket
    [1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0], // cozy fretless
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0], // sub harmonic
    [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], // sweet jazz
    [1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0], // smoky soul
    [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0], // velvet sub
    [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0], // liquid low-end
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0], // filter sweep bass
    [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0], // sensual flatwound
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0]  // walking line
  ];
  // R&B G minor scale degree mapping: G[0], Bb[2], C[3], D[4], Eb[5], F[6], G[7]
  const bassNotes: number[][] = [
    [0, 0, 0, 0, 3, 0, 0, 0, 5, 0, 0, 0, 4, 0, 0, 0], // G -> C -> Eb -> D
    [0, 0, 0, 2, 0, 0, 3, 0, 0, 4, 0, 0, 0, 0, 2, 0],
    [0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0], // sub slide notes
    [0, 0, 2, 0, 3, 0, 4, 0, 5, 0, 4, 0, 3, 0, 2, 0], // walking
    [0, 0, 0, 0, 4, 0, 3, 0, 0, 0, 0, 0, 4, 0, 0, 0],
    [0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 2, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 0, 0, 2, 0, 0, 3, 0, 0, 3, 0, 0, 0],
    [0, 0, 3, 0, 0, 4, 0, 5, 0, 0, 3, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 0, 0, 0, 0, 4, 0, 0, 0, 0, 2, 0, 0],
    [0, 0, 0, 0, 3, 0, 2, 0, 0, 0, 0, 0, 3, 0, 0, 0],
    [0, 0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 0],
    [0, 0, 0, 2, 0, 0, 0, 3, 0, 0, 2, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ];

  bassNames.forEach((name, idx) => {
    loops.push({
      id: `rnb-bass-${idx + 1}`,
      name,
      bpm: 80,
      key: 'G Min',
      instrument: 'Bass Guitar',
      genre: 'R&B',
      duration: 16,
      audioUrl: '',
      soundType: 'Melody',
      category: 'bass',
      pattern: {
        triggers: bassTriggers[idx % bassTriggers.length],
        notes: bassNotes[idx % bassNotes.length],
        velocities: Array(16).fill(0.8)
      }
    });
  });

  // Others (18 loops)
  const otherNames = [
    "so te 86 melodic loop flutes 2am melody amaj", "midnight warm rhodes chords", "velvet electric guitar arpeggios",
    "ambient midnight air flute", "g-min7 Fender guitar pluck", "sweet Rhodes seventh pad",
    "cozy glass keys chords", "smoky sax horn swell", "satin bell arpeggio",
    "savannah warm wind lick", "bedroom soul keyboard swell", "smooth rhodes chord progression",
    "sensual acoustic string run", "glass room pluck loop", "ambient electric Rhodes keys",
    "smoky minor 9th pads", "velvet fender clean lick", "sweet glass piano notes"
  ];
  // 1 = chord pad trigger, 2 = arpeggio pluck
  const otherTriggers: number[][] = [
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], // slow chords
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], // sustained pads
    [0, 0, 2, 0, 2, 0, 0, 2, 0, 0, 2, 0, 2, 0, 0, 2], // arpeggios
    [0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2], // flute line
    [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0], // sync keys
    [0, 0, 2, 2, 0, 0, 2, 0, 0, 2, 2, 0, 0, 2, 0, 0], // plucks
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], // keys
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], // sax swell
    [0, 0, 2, 0, 2, 0, 2, 0, 0, 0, 2, 0, 2, 0, 2, 0], // bell arps
    [0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2], // wind lick
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], // keyboard swell
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], // progression pad
    [0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0], // string pluck
    [0, 0, 2, 0, 2, 0, 1, 0, 0, 0, 2, 0, 2, 0, 1, 0], // glass keys
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], // rhodes keys
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], // minor 9th pads
    [0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0], // guitar clean
    [0, 2, 2, 0, 2, 2, 0, 2, 2, 0, 2, 2, 0, 2, 2, 0]  // piano run
  ];
  // Chord root mapping in G Minor: 0 = Gm7, 5 = Ebmaj7, 3 = Cm7, 4 = D7 (octave 3 roots)
  const otherNotes: number[][] = [
    [0, 0, 0, 0, 3, 0, 0, 0, 5, 0, 0, 0, 4, 0, 0, 0], // Gm7 -> Cm7 -> Ebmaj7 -> D7
    [0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0], // Gm7 -> Ebmaj7
    [0, 2, 3, 4, 5, 4, 3, 2, 0, 2, 3, 4, 5, 4, 3, 2], // arpeggiations
    [7, 6, 5, 4, 3, 2, 0, 2, 3, 4, 5, 6, 7, 6, 5, 4], // flute melodies
    [0, 0, 0, 3, 0, 0, 5, 0, 4, 0, 0, 3, 0, 0, 5, 0],
    [0, 0, 2, 3, 0, 0, 2, 0, 0, 3, 5, 0, 0, 2, 0, 0],
    [0, 0, 0, 0, 3, 0, 0, 0, 5, 0, 0, 0, 4, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 2, 0, 3, 0, 5, 0, 0, 0, 5, 0, 3, 0, 2, 0],
    [7, 6, 5, 4, 3, 2, 0, 2, 3, 4, 5, 6, 7, 6, 5, 4],
    [0, 0, 0, 0, 3, 0, 0, 0, 5, 0, 0, 0, 4, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 2, 0, 0, 2, 0, 0, 3, 0, 0, 3, 0, 0, 0, 0],
    [0, 0, 2, 0, 3, 0, 5, 0, 0, 0, 5, 0, 3, 0, 2, 0],
    [0, 0, 0, 0, 3, 0, 0, 0, 5, 0, 0, 0, 4, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 2, 0, 0, 2, 0, 0, 3, 0, 0, 3, 0, 0, 0, 0],
    [7, 7, 6, 0, 5, 5, 0, 4, 4, 0, 3, 3, 0, 2, 2, 0]
  ];

  otherNames.forEach((name, idx) => {
    loops.push({
      id: `rnb-other-${idx + 1}`,
      name,
      bpm: 80,
      key: 'G Min',
      instrument: idx % 3 === 0 ? 'Synthesizer' : (idx % 3 === 1 ? 'Guitar' : 'Percussion'),
      genre: 'R&B',
      duration: 16,
      audioUrl: '',
      soundType: idx % 2 === 0 ? 'Chords' : 'Melody',
      category: 'others',
      pattern: {
        triggers: otherTriggers[idx % otherTriggers.length],
        notes: otherNotes[idx % otherNotes.length],
        velocities: Array(16).fill(0.6)
      }
    });
  });

  return loops;
};

const combinedPool = [...generateAfroLoops(), ...generateRnBLoops()];

export const MOCK_LOOPS: AudioLoop[] = combinedPool;
