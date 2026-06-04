"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const database = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await database.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();
  }, [database]);

  const handleSignOut = async () => {
    await database.auth.signOut();
    router.refresh();
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontFamily: "sans-serif", backgroundColor: "#FAF8F5" }}>
        <h3>Loading Workstation Studio...</h3>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", fontFamily: "sans-serif", backgroundColor: "#FAF8F5", color: "#111111" }}>
      {/* Navigation Header Bar */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", backgroundColor: "#ffffff", borderBottom: "1px solid #E8E2D9" }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: "800" }}>Producer Saab</h1>
        <div>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ fontSize: "14px", color: "#555555", fontWeight: "600" }}>@{user.user_metadata?.username || user.email.split('@')[0]}</span>
              <button onClick={handleSignOut} style={{ padding: "8px 16px", backgroundColor: "#9B1C1C", color: "white", border: "none", borderRadius: "20px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>
                Leave Studio
              </button>
            </div>
          ) : (
            <button onClick={() => router.push("?view=signin")} style={{ padding: "8px 20px", backgroundColor: "#111111", color: "white", border: "none", borderRadius: "20px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* Main Core Workstation View */}
      <main style={{ maxWidth: "800px", margin: "80px auto", padding: "0 20px", textAlign: "center" }}>
        <h2 style={{ fontSize: "42px", fontWeight: "800", margin: "0 0 16px 0", letterSpacing: "-1px" }}>Welcome to the Workstation</h2>
        <p style={{ fontSize: "16px", color: '#555555', lineHeight: "1.6", margin: "0 0 40px 0" }}>
          Your digital studio platform layout is officially active and listening cleanly.
        </p>

        {user ? (
          <div style={{ padding: '40px', backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #E8E2D9', boxShadow: '0 4px 25px rgba(0,0,0,0.02)' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#A3855C', fontSize: '20px', fontWeight: '800' }}>🎉 Workstation Space Unlocked</h3>
            <p style={{ margin: 0, color: '#555555', fontSize: '14px' }}>Your active session is fully integrated with Supabase backend engines.</p>
          </div>
        ) : (
          <div style={{ padding: '40px', backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #E8E2D9', boxShadow: '0 4px 25px rgba(0,0,0,0.02)' }}>
            <p style={{ margin: '0 0 24px 0', color: '#555555', fontSize: '15px' }}>Please authenticate your credentials to load your project arrangement configurations.</p>
            <button onClick={() => router.push("/signin")} style={{ padding: '16px 36px', backgroundColor: '#111111', color: '#ffffff', border: 'none', borderRadius: '30px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              Enter Studio Suite
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
