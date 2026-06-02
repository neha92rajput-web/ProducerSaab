'use client';

import { useState } from "react";
import {
  LayoutDashboard,
  Globe2,
  Pin,
  Upload,
  FileAudio,
  LogOut,
  Music2,
  Inbox,
} from "lucide-react";

export default function ProducerCenter() {
  const [active, setActive] = useState<"dashboard" | "library">("dashboard");
  const [fileName, setFileName] = useState("looperman-l-3481630-02935...rvrfriday-bryson-tiller-pad.wav");
  const [title, setTitle] = useState("Neha Thkur");
  const [genre, setGenre] = useState("drill");
  const [bpm, setBpm] = useState("120");
  const [musicKey, setMusicKey] = useState("");
  const [time, setTime] = useState("4/4");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(true);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1400px]">
        {/* SIDEBAR */}
        <aside className="flex w-64 shrink-0 flex-col justify-between border-r border-border bg-background px-5 py-8">
          <div>
            <div className="px-2">
              <p className="font-display text-sm tracking-[0.28em] text-gold">PRODUCER CENTER</p>
            </div>
            <nav className="mt-10 flex flex-col gap-2">
              <SideItem icon={<LayoutDashboard className="h-4 w-4" />} label="Producer Dashboard" active={active === "dashboard"} onClick={() => setActive("dashboard")} />
              <SideItem icon={<Globe2 className="h-4 w-4" />} label="Global Library" active={active === "library"} onClick={() => setActive("library")} />
            </nav>
          </div>
          <button className="flex items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive transition hover:bg-destructive/10">
            <LogOut className="h-4 w-4" /> Sign Out Account
          </button>
        </aside>

        {/* MAIN */}
        <main className="flex-1 px-8 py-8">
          <section className="relative overflow-hidden rounded-2xl border border-border bg-card/70 px-8 py-7">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl">Welcome back, <span className="text-gold">Producer</span></h1>
                <p className="mt-2 text-sm text-muted-foreground">With your dashboard configured, your layout is locked down.</p>
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card/70 p-7">
              <div className="flex items-center gap-2"><Upload className="h-5 w-5 text-gold" /><h2 className="text-2xl">Upload New Audio</h2></div>
              <div className="mt-7 space-y-5">
                <FileField fileName={fileName} setFileName={setFileName} />
                <Input label="Title" value={title} onChange={setTitle} placeholder="Track title" />
                <Input label="Genre" value={genre} onChange={setGenre} placeholder="e.g. drill" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="BPM" value={bpm} onChange={setBpm} placeholder="120" />
                  <Input label="Key" value={musicKey} onChange={setMusicKey} placeholder="Key (e.g., C Min)" />
                </div>
                <Input label="Time Sig" value={time} onChange={setTime} placeholder="4/4" />
                <button onClick={() => setUploading(!uploading)} className="w-full rounded-xl px-4 py-3.5 text-sm font-medium transition bg-muted text-muted-foreground">
                  {uploading ? "Uploading Engine Active…" : "Submit to Library"}
                </button>
              </div>
            </div>
            
            <div className="rounded-2xl border border-border bg-card/70 p-7">
              <div className="flex items-center gap-2"><FileAudio className="h-5 w-5 text-gold" /><h2 className="text-2xl">My Uploaded Portfolio</h2></div>
              <div className="mt-10 flex min-h-[420px] flex-col items-center justify-center text-center">
                <Inbox className="h-7 w-7 text-muted-foreground" />
                <p className="mt-5 text-sm text-muted-foreground">No audio files tracked yet.</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function SideItem({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm ${active ? "bg-foreground text-background" : "hover:bg-card/80"}`}>
      {icon} <span className="font-medium">{label}</span>
    </button>
  );
}

function Input({ label, value, onChange, placeholder }: any) {
  return (
    <div>
      <label className="block text-[10px] uppercase text-muted-foreground">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border px-4 py-3 text-sm focus:outline-none" />
    </div>
  );
}

function FileField({ fileName, setFileName }: any) {
  return (
    <div>
      <label className="block text-[10px] uppercase text-muted-foreground">Audio File (MP3/WAV)</label>
      <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-3 text-sm">
        <span>Choose file</span>
        <span className="truncate">{fileName}</span>
        <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && setFileName(e.target.files[0].name)} />
      </label>
    </div>
  );
}
