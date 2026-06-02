'use client'; // This is required for your useState and interaction

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
  const [fileName, setFileName] = useState("Choose a file...");
  const [title, setTitle] = useState("Neha Thkur");
  const [genre, setGenre] = useState("drill");
  const [bpm, setBpm] = useState("120");
  const [musicKey, setMusicKey] = useState("");
  const [time, setTime] = useState("4/4");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);

  // ... (Keep the rest of your ProducerCenter component code here)
  // Just make sure you return the JSX exactly as you provided it!
  
  return (
    // Paste your existing return(...) block here
  );
}

// Add all your helper components (SideItem, Input, FileField) below this
