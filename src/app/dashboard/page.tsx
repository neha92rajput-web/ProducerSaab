import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function DashboardPage() {
  const cookieStore = cookies();

  // 1. Establish the Server Client to read active user cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // 2. Fetch the current authorized user session
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // 3. Absolute door lock: If cookie session failed, send back to login
  if (!user || userError) {
    redirect('/signin');
  }

  // 4. Fetch additional studio profile details from your profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw', 
      backgroundColor: '#FAF8F5', 
      color: '#111111', 
      fontFamily: 'sans-serif', 
      padding: '40px',
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        backgroundColor: '#ffffff', 
        padding: '32px', 
        borderRadius: '24px', 
        border: '1px solid #E8E2D9',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
      }}>
        
        {/* DASHBOARD SUITE NAVIGATION HEADER */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid #E8E2D9',
          paddingBottom: '20px',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>Workstation Studio</h1>
            <p style={{ margin: 0, color: '#666666', fontSize: '14px' }}>
              Owner: <strong>{user.email}</strong> {profile?.studio_name ? `| Studio: ${profile.studio_name}` : ''}
            </p>
          </div>
          
          <a href="/auth/signout" style={{
            padding: '12px 24px',
            borderRadius: '30px',
            backgroundColor: '#111111',
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '13px',
            textDecoration: 'none',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            Disconnect Studio
          </a>
        </header>

        {/* PRIMARY STUDIO CONTROL PANEL VIEWS */}
        <main style={{ padding: '20px 0' }}>
          <div style={{ backgroundColor: '#FAF8F5', borderRadius: '16px', padding: '32px', border: '1px solid #E8E2D9', textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '54px' }}>🎛️</span>
            <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '16px 0 8px 0' }}>Welcome to Producer Saab Control Room</h2>
            <p style={{ color: '#666666', fontSize: '15px', maxWidth: '540px', margin: '0 auto 24px auto', lineHeight: '1.6' }}>
              Your authentication session is completely secured and active. Your workstation environment tools are fully ready for project production tracking.
            </p>
          </div>

          {/* PROJECT SUITE METRICS CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #E8E2D9', padding: '24px', borderRadius: '16px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', textTransform: 'uppercase', color: '#777777', fontWeight: 'bold' }}>Audio Masters</h3>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: '800' }}>0</p>
            </div>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #E8E2D9', padding: '24px', borderRadius: '16px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', textTransform: 'uppercase', color: '#777777', fontWeight: 'bold' }}>Studio Collaborators</h3>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: '800' }}>1</p>
            </div>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #E8E2D9', padding: '24px', borderRadius: '16px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', textTransform: 'uppercase', color: '#777777', fontWeight: 'bold' }}>Active Licenses</h3>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: '800' }}>Free Tier</p>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}
