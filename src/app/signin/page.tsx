"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  // Initialize the client-side Supabase manager
  const database = createClientComponentClient();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const cleanEmail = email.trim();

    // Authenticate the user against your database instance
    const { error } = await database.auth.signInWithPassword({
      email: cleanEmail,
      password: password,
    });

    if (error) {
      setMessage(`Authentication Error: ${error.message}`);
    } else {
      setMessage("Success! Redirecting to dashboard...");
      router.refresh();
      router.push("/"); 
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const cleanEmail = email.trim();

    // Register a new user profile securely inside Supabase Auth
    const { error } = await database.auth.signUp({
      email: cleanEmail,
      password: password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setMessage(`Registration Error: ${error.message}`);
    } else {
      setMessage("Account created! Check your email inbox for the verification link.");
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "400px", width: "100%", padding: "2rem", border: "1px solid #ccc", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>ProducerSaab Gate</h2>
        
        <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>
          
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: "0.75rem", backgroundColor: "#0070f3", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
          >
            {loading ? "Processing..." : "Sign In"}
          </button>

          <button 
            type="button"
            onClick={handleSignUp}
            disabled={loading}
            style={{ padding: "0.75rem", backgroundColor: "#10b981", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
          >
            Create Account (Sign Up)
          </button>
        </form>

        {message && (
          <p style={{ marginTop: "1rem", padding: "0.5rem", backgroundColor: "#f3f4f6", borderRadius: "4px", fontSize: "0.9rem", textAlign: "center", color: message.includes("Error") ? "red" : "green" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
