"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Authentication & Profile States
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>({
    username: "",
    display_name: "",
    bio: "",
    account_type: "Producer",
  });
  const [mySounds, setMySounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Audio Upload Form States
  const [trackTitle, setTrackTitle] = useState("");
  const [trackGenre, setTrackGenre] = useState("Loop");
  const [audioUrl, setAudioUrl] = useState("");
  const [uploadingTrack, setUploadingTrack] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDashboardData() {
      // 1. Check if user is logged in securely
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/signin");
        return;
      }
      setUser(user);

      // 2. Fetch or create LinkedIn-style profile metadata
      let { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!profileData) {
        // Create an initial fallback profile if none exists yet
        const defaultUsername = user.email?.split("@")[0] || "producer";
        const { data: newProfile } = await supabase
          .from("profiles")
          .insert([{ id: user.id, username: defaultUsername, display_name: defaultUsername, account_type: "Producer" }])
          .select()
          .single();
        if (newProfile) profileData = newProfile;
      }
      if (profileData) setProfile(profileData);

      // 3. Fetch user's uploaded tracks
      const { data: soundRecords } = await supabase
        .from("sounds")
        .select("*")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false });
      if (soundRecords) setMySounds(soundRecords);

      setLoading(false);
    }
    loadDashboardData();
  }, [supabase, router]);

  // Handle Profile Update Changes
  const saveProfileChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: profile.display_name,
        username: profile.username.trim().toLowerCase().replace(/\s+/g, ""),
        bio: profile.bio,
        account_type: profile.account_type,
      })
      .eq("id", user.id);

    if (error) {
      setMessage(`❌ Profile Save Error: ${error.message}`);
    } else {
      setMessage("✨ Profile workstation metrics saved successfully!");
    }
    setUpdatingProfile(false);
  };

  // Handle Audio Upload Registration
  const handlePublishAudio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioUrl.trim()) return;
    setUploadingTrack(true);
    setMessage("");

    const { data: newTrack, error } = await supabase
      .from("sounds")
      .insert([
        {
          title: trackTitle,
          genre: trackGenre,
          audio_url: audioUrl.trim(),
          profile_id: user.id,
        },
      ])
      .select();

    if (error) {
      setMessage(`❌ Audio Save Error: ${error.message}`);
    } else {
      setMessage("🚀 New sound track compiled and sent to public feeds!");
      setTrackTitle("");
      setAudioUrl("");
      if (newTrack) setMySounds([newTrack[0], ...mySounds]);
    }
    setUploadingTrack(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontFamily: "sans-serif", backgroundColor: "#F6F1EA" }}>
        <h3 style={{ color: "#5A5550" }}>Loading Control Room Dashboard...</h3>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F6F1EA", color: "#1C1B1A", fontFamily: "sans-serif", paddingBottom: "60px" }}>
      {/* HEADER NAVBAR */}
      <header style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #E7DED3", padding: "16px 32px", sticky: "top" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ textDecoration: "none", color: "#1C1B1A", fontWeight: "900", letterSpacing: "2px", fontSize: "14px", uppercase: "true" }}>
            <span style={{ color: "#C89B6D", marginRight: "6px" }}>川</span>PRODUCER SAAB STUDIO
          </Link>
          <button onClick={handleSignOut} style={{ padding: "8px 18px", backgroundColor: "#111111", color: "white", border: "none", borderRadius: "20px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
            Leave Dashboard
          </button>
        </div>
      </header>

      {/* TWO-COLUMN LINKEDIN STYLE LAYOUT */}
      <div style={{ maxWidth: "1100px", margin: "40px auto", padding: "0 20px", display: "grid", gridTemplateColumns: "1fr", gap: "30px" }} className="md:grid-cols-12">
        
        {/* LEFT COLUMN: PROFILE CARD CONTROLS (LinkedIn Style Card) */}
        <div style={{ gridColumn: "span 4" }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #E7DED3", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
            <div style={{ height: "70px", backgroundColor: "#C89B6D" }} /> {/* Profile Banner Accent */}
            
            <div style={{ padding: "24px", marginTop: "-45px", textAlign: "center" }}>
              <div style={{ width: "70px", height: "70px", backgroundColor: "#111111", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "bold", margin: "0 auto 16px auto", border: "3px solid white" }}>
                {String(profile.display_name || "P").charAt(0).toUpperCase()}
              </div>
              
              <h2 style={{ fontSize: "18px", fontWeight: "800", margin: "0 0 4px 0" }}>{profile.display_name}</h2>
              <p style={{ color: "#A3855C", fontSize: "12px", fontWeight: "bold", margin: "0 0 16px 0" }}>@{profile.username} • {profile.account_type}</p>
              <p style={{ color: "#5A5550", fontSize: "13px", lineHeight: "1.5", margin: "0 0 24px 0", backgroundColor: "#FAF8F5", padding: "10px", borderRadius: "8px", border: "1px solid #F0EAE1" }}>
                {profile.bio || "No custom bio established yet. Tweak your control panel configuration parameters below."}
              </p>
            </div>

            {/* INTERACTIVE WORKSPACE SETTINGS FORM */}
            <form onSubmit={saveProfileChanges} style={{ borderTop: "1px solid #E7DED3", padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <h3 style={{ fontSize: "13px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 6px 0", color: "#1C1B1A" }}>Edit Profile Space</h3>
              
              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: "bold", color: "#5A5550", marginBottom: "4px", textTransform: "uppercase" }}>Display Name</label>
                <input type="text" value={profile.display_name || ""} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} style={{ width: "100%", padding: "10px", border: "1px solid #E7DED3", borderRadius: "8px", boxSizing: "border-box", fontSize: "13px" }} required />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: "bold", color: "#5A5550", marginBottom: "4px", textTransform: "uppercase" }}>Unique Handle Handle (@)</label>
                <input type="text" value={profile.username || ""} onChange={(e) => setProfile({ ...profile, username: e.target.value })} style={{ width: "100%", padding: "10px", border: "1px solid #E7DED3", borderRadius: "8px", boxSizing: "border-box", fontSize: "13px" }} required />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: "bold", color: "#5A5550", marginBottom: "4px", textTransform: "uppercase" }}>Account Specialty Role</label>
                <select value={profile.account_type || "Producer"} onChange={(e) => setProfile({ ...profile, account_type: e.target.value })} style={{ width: "100%", padding: "10px", border: "1px solid #E7DED3", borderRadius: "8px", boxSizing: "border-box", fontSize: "13px" }}>
                  <option value="Producer">Music Producer</option>
                  <option value="Audio Engineer">Audio Engineer</option>
                  <option value="Vocalist / Artist">Vocalist / Artist</option>
                  <option value="Sound Designer">Sound Designer</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: "bold", color: "#5A5550", marginBottom: "4px", textTransform: "uppercase" }}>Short Bio Description</label>
                <textarea rows={3} value={profile.bio || ""} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell the community about your equipment array..." style={{ width: "100%", padding: "10px", border: "1px solid #E7DED3", borderRadius: "8px", boxSizing: "border-box", fontSize: "13px", resize: "none" }} />
              </div>

              <button type="submit" disabled={updatingProfile} style={{ width: "100%", padding: "12px", border: "none", backgroundColor: "#C89B6D", color: "white", borderRadius: "24px", fontWeight: "bold", fontSize: "13px", cursor: "pointer", transition: "background 0.2s" }}>
                {updatingProfile ? "Updating Panel..." : "Save Profile Edits"}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: RELEASES & STUDIO MANAGEMENT FEED */}
        <div style={{ gridColumn: "span 8" }}>
          
          {/* AUDIO TRACK SUBMISSION PANEL */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #E7DED3", padding: "28px", marginBottom: "30px", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "800", margin: "0 0 6px 0", color: "#1C1B1A" }}>Publish a New Production Sound</h2>
            <p style={{ color: "#5A5550", fontSize: "13px", margin: "0 0 20px 0" }}>Broadcast loops, patches, or full masters directly to the community streaming array feed network.</p>
            
            <form onSubmit={handlePublishAudio} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "10px", fontWeight: "bold", color: "#5A5550", marginBottom: "6px", textTransform: "uppercase" }}>Track Name Title</label>
                  <input type="text" placeholder="e.g., Summer Lo-Fi Melody Loop" value={trackTitle} onChange={(e) => setTrackTitle(e.target.value)} style={{ width: "100%", padding: "12px", border: "1px solid #E7DED3", borderRadius: "8px", boxSizing: "border-box", fontSize: "13px" }} required />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "10px", fontWeight: "bold", color: "#5A5550", marginBottom: "6px", textTransform: "uppercase" }}>Sound Category</label>
                  <select value={trackGenre} onChange={(e) => setTrackGenre(e.target.value)} style={{ width: "100%", padding: "12px", border: "1px solid #E7DED3", borderRadius: "8px", boxSizing: "border-box", fontSize: "13px" }}>
                    <option value="Loop">Melody Loop</option>
                    <option value="Drum Kit">Drum Kit</option>
                    <option value="Synth Patch">Synth Patch</option>
                    <option value="Full Beat">Full Beat</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "10px", fontWeight: "bold", color: "#5A5550", marginBottom: "6px", textTransform: "uppercase" }}>Direct Audio Storage Link (URL File Target)</label>
                <input type="url" placeholder="https://your-hosting-domain.com/sample.mp3" value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} style={{ width: "100%", padding: "12px", border: "1px solid #E7DED3", borderRadius: "8px", boxSizing: "border-box", fontSize: "13px" }} required />
              </div>

              <button type="submit" disabled={uploadingTrack} style={{ alignSelf: "flex-end", padding: "12px 30px", border: "none", backgroundColor: "#111111", color: "white", borderRadius: "24px", fontWeight: "bold", fontSize: "13px", cursor: "pointer" }}>
                {uploadingTrack ? "Deploying Code..." : "Publish Sound File"}
              </button>
            </form>
          </div>

          {/* DYNAMIC LIST OF RELEASES RECORDED */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #E7DED3", padding: "28px", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "800", margin: "0 0 20px 0" }}>Your Studio Workstation Releases ({mySounds.length})</h3>
            
            {mySounds.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {mySounds.map((track) => (
                  <div key={track.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #E7DED3", padding: "16px", borderRadius: "12px", backgroundColor: "#FAF8F5" }}>
                    <div style={{ flex: 1, marginRight: "20px" }}>
                      <span style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", backgroundColor: "#E7DED3", padding: "3px 6px", borderRadius: "4px", color: "#1C1B1A" }}>{track.genre}</span>
                      <h4 style={{ fontSize: "14px", fontWeight: "bold", margin: "8px 0 0 0" }}>{track.title}</h4>
                    </div>
                    <audio controls src={track.audio_url} style={{ height: "32px", width: "240px" }} />
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: "13px", color: "#5A5550", fontStyle: "italic", textAlign: "center", padding: "40px 0", border: "1px solid #E7DED3", borderRadius: "12px", borderStyle: "dashed" }}>
                No active tracks initialized yet inside your catalog array pipeline.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* FEEDBACK POPUP MESSAGE SYSTEM */}
      {message && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", padding: "16px 24px", backgroundColor: "#ffffff", borderRadius: "12px", border: "2px solid #C89B6D", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", fontSize: "13px", fontWeight: "600", zIndex: 100 }}>
          {message}
        </div>
      )}
    </div>
  );
}
