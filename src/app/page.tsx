"use client";

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

type NavKey = "dashboard" | "library";

export default function ProducerCenterPage() {
  const [active, setActive] = useState<NavKey>("dashboard");
  const [fileName, setFileName] = useState<string>(
    "looperman-l-3481630-02935...rvrfriday-bryson-tiller-pad.wav",
  );
  const [title, setTitle] = useState("Neha Thkur");
  const [genre, setGenre] = useState("drill");
  const [bpm, setBpm] = useState("120");
  const [musicKey, setMusicKey] = useState("");
  const [time, setTime] = useState("4/4");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto flex min-h-screen max-w-[1400px]">
        {/* SIDEBAR */}
        <aside className="flex w-64 shrink-0 flex-col justify-between border-r border-gray-200 bg-white px-5 py-8">
          <div>
            <div className="px-2">
              <p className="font-sans text-sm font-bold tracking-[0.28em] text-emerald-600">
                PRODUCER CENTER
              </p>
            </div>

            <nav className="mt-10 flex flex-col gap-2">
              <SideItem
                icon={<LayoutDashboard className="h-4 w-4" />}
                label="Producer Dashboard"
                active={active === "dashboard"}
                onClick={() => setActive("dashboard")}
              />
              <SideItem
                icon={<Globe2 className="h-4 w-4" />}
                label="Global Library"
                active={active === "library"}
                onClick={() => setActive("library")}
              />
            </nav>
          </div>

          <button
            className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-100"
          >
            <LogOut className="h-4 w-4" />
            Sign Out Account
          </button>
        </aside>

        {/* MAIN */}
        <main className="flex-1 bg-gray-50 px-8 py-8">
          <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white px-8 py-7 shadow-sm">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold md:text-4xl text-gray-900">
                  Welcome back, <span className="text-emerald-600">Producer</span>
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                  With your dashboard configured, your layout is locked down.
                </p>
              </div>
              <button
                aria-label="Pin dashboard"
                className="grid h-9 w-9 place-items-center rounded-full border border-gray-200 bg-gray-50 text-emerald-600 transition hover:border-emerald-500/50"
              >
                <Pin className="h-4 w-4" />
              </button>
            </div>
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">Upload New Audio</h2>
              </div>

              <div className="mt-7 space-y-5">
                <FileField fileName={fileName} setFileName={setFileName} />
                <Input label="Title" value={title} onChange={setTitle} placeholder="Track title" />
                <Input label="Genre" value={genre} onChange={setGenre} placeholder="e.g. drill" />

                <div className="grid grid-cols-2 gap-4">
                  <Input label="BPM" value={bpm} onChange={setBpm} placeholder="120" />
                  <Input label="Key" value={musicKey} onChange={setMusicKey} placeholder="Key (e.g., C Min)" />
                </div>

                <Input label="Time Sig" value={time} onChange={setTime} placeholder="4/4" />

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">
                    Description
                  </label>
                  <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Description"
                    rows={4}
                    className="mt-2 w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <Input label="Tags" value={tags} onChange={setTags} placeholder="Tags (comma separated)" />

                <button
                  onClick={() => setUploading((u) => !u)}
                  className={`w-full rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
                    uploading
                      ? "cursor-wait bg-gray-100 text-gray-400"
                      : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                  }`}
                >
                  {uploading ? "Uploading Engine Active…" : "Submit to Library"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">
              <div className="flex items-center gap-2">
                <FileAudio className="h-5 w-5 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">My Uploaded Portfolio</h2>
              </div>

              <div className="mt-10 flex min-h-[420px] flex-col items-center justify-center text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full border border-gray-200 bg-gray-50">
                  <Inbox className="h-7 w-7 text-gray-400" />
                </div>
                <p className="mt-5 max-w-sm text-sm text-gray-500">
                  No audio files tracked yet. Submit your first one to populate your dashboard.
                </p>
                <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">
                  <Music2 className="h-3.5 w-3.5 text-emerald-600" />
                  Waiting on first drop
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function SideItem({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void; }) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
        active ? "bg-emerald-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <span className={`grid h-6 w-6 place-items-center ${active ? "text-white" : "text-gray-400 group-hover:text-emerald-600"}`}>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      />
    </div>
  );
}

function FileField({ fileName, setFileName }: { fileName: string; setFileName: (v: string) => void; }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">
        Audio File (MP3/WAV) <span className="text-emerald-600">*</span>
      </label>
      <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm transition hover:border-emerald-500/50">
        <span className="rounded-md bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">Choose file</span>
        <span className="truncate text-gray-500">{fileName}</span>
        <input
          type="file"
          accept=".mp3,.wav"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setFileName(f.name);
          }}
        />
      </label>
    </div>
  );
}
