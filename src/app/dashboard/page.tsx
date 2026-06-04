import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function DashboardPage() {
  const cookieStore = cookies();

  // Read cookies inside the server component layout
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

  // Fetch the current active user profile session
  const { data: { user } } = await supabase.auth.getUser();

  // Safety fallback check (If middleware somehow slips, this locks the door)
  if (!user) {
    redirect('/signin');
  }

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
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid #E8E2D9',
          paddingBottom: '20px',
          marginBottom: '24px'
        }}>
          <div>
            <h1 style={{ margin: '0 0 4px 0', fontSize: '28px', fontWeight: '800' }}>Workstation Studio</h1>
            <p style={{ margin: 0, color: '#666666', fontSize: '14px' }}>Logged in as: <strong>{user.email}</strong></p>
          </div>
          
          <a href="/auth/signout" style={{
            padding: '10px 20px',
            borderRadius: '20px',
            backgroundColor: '#111111',
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '13px',
            textDecoration: 'none'
          }}>
            Disconnect Studio
          </a>
        </header>

        <main style={{ padding: '40px 0', textAlign: 'center' }}>
          <span style={{ fontSize: '48px' }}>🚀</span>
          <h2 style={{ fontSize: '22px', fontWeight: '700', margin: '16px 0 8px 0' }}>Welcome to your Producer Saab Control Room</h2>
          <p style={{ color: '#666666', fontSize: '15px', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
            Your authentication state is fully verified and locked down by secure httpOnly cookies. You have complete root access to manage your audio projects and updates.
          </p>
        </main>
      </div>
    </div>
  );
}
