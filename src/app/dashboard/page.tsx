import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // 1. Guard Protection: If someone isn't authenticated, bounce them to signin
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/signin');
  }

  // 2. Safely read the handle metadata we captured from our signup form
  const username = session.user.user_metadata?.username || 'Producer';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f9f9f9' }}>
      
      {/* Sidebar Navigation Panel */}
      <aside style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #eaeaea', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: '#0f2416', color: '#ffffff', fontWeight: '600', cursor: 'pointer' }}>
          🎛️ Producer Dashboard
        </button>
        
        {/* Clickable Global Library Link */}
        <Link href="/feed" style={{ textDecoration: 'none', width: '100%' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '14px', borderRadius: '10px', border: 'none', backgroundColor: 'transparent', color: '#444', fontWeight: '500', cursor: 'pointer', textAlign: 'left' }}>
            🌐 Global Library
          </button>
        </Link>
      </aside>

      {/* Main UI Station */}
      <main style={{ flex: 1, padding: '40px' }}>
        
        {/* Dynamic User Onboarding Header */}
        <header style={{ backgroundColor: '#ffffff', padding: '24px 32px', borderRadius: '16px', border: '1px solid #eaeaea', marginBottom: '32px' }}>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '500' }}>
            Welcome back, <span style={{ color: '#16a34a', fontWeight: '700' }}>@{username}</span>
          </h1>
          <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>With your dashboard configured, your layout is locked down.</p>
        </header>

        {/* Action Widgets */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          
          {/* Audio Upload Form Container */}
          <section style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '16px', border: '1px solid #eaeaea' }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>📤 Upload New Audio</h3>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: '#444', textTransform: 'uppercase' }}>Audio File (MP3/WAV) *</label>
                <input type="file" accept=".mp3,.wav" style={{ width: '100%', padding: '12px', border: '1px dashed #cccccc', borderRadius: '8px' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: '#444', textTransform: 'uppercase' }}>Title</label>
                <input type="text" placeholder="Track Title" style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', boxSizing: 'border-box' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: '#444', textTransform: 'uppercase' }}>BPM</label>
                  <input type="number" placeholder="120" style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '8px', color: '#444', textTransform: 'uppercase' }}>Key</label>
                  <input type="text" placeholder="e.g., C Min" style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', boxSizing: 'border-box' }} />
                </div>
              </div>

              <button type="button" style={{ marginTop: '12px', width: '100%', padding: '14px', border: 'none', borderRadius: '8px', backgroundColor: '#e2e8f0', color: '#666', fontWeight: '600', cursor: 'not-allowed' }}>
                Uploading Engine Active...
              </button>
            </form>
          </section>

          {/* Empty State View */}
          <section style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '16px', border: '1px solid #eaeaea', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#888', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📦</div>
            <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#333' }}>No audio files tracked yet.</p>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px' }}>Submit your first one to populate your dashboard.</p>
            <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>🎵 WAITING ON FIRST DROP</span>
          </section>

        </div>
      </main>
    </div>
  );
}
