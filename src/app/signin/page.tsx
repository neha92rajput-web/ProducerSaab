'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

const database = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function AuthFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // States: 'signin' | 'signup' | 'forgot'
  const [view, setView] = useState('signin'); 
  const [username, setUsername] = useState(''); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const urlView = searchParams.get('view');
    if (urlView === 'signup') {
      setView('signup');
    } else if (urlView === 'forgot') {
      setView('forgot');
    } else {
      setView('signin');
    }
  }, [searchParams]);

  const handleViewSwitch = (newView: 'signup' | 'signin' | 'forgot') => {
    setStatusMessage('');
    setEmailSent(false);
    router.push(`${window.location.pathname}?view=${newView}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');
    setIsError(false);

    const cleanEmail = email.trim().toLowerCase();

    // A. FORGOT PASSWORD ACTION HANDLER
    if (view === 'forgot') {
      try {
        const { error } = await database.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/update-password`,
        });

        if (error) throw error;
        setEmailSent(true);
        setStatusMessage('✉️ Reset link sent! Check your inbox.');
      } catch (err: any) {
        setIsError(true);
        setStatusMessage(`❌ Error: ${err.message || 'Could not send reset link.'}`);
      } finally {
        setLoading(false);
      }
      return;
    }

    // B. SIGN UP ACTION HANDLER
    if (view === 'signup') {
      const cleanHandle = username.trim().toLowerCase().replace(/\s+/g, '');
      
      if (password !== confirmPassword) {
        setLoading(false);
        setIsError(true);
        setStatusMessage('❌ Passwords do not match!');
        return;
      }

      try {
        const { data: existingUser } = await database
          .from('profiles')
          .select('username')
          .eq('username', cleanHandle)
          .maybeSingle();

        if (existingUser) {
          setLoading(false);
          setIsError(true);
          setStatusMessage(`❌ The handle @${cleanHandle} is already taken!`);
          return;
        }

        const { error } = await database.auth.signUp({
          email: cleanEmail,
          password: password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?type=signup`,
            data: { username: cleanHandle }
          },
        });

        if (error) throw error;
        setEmailSent(true);
      } catch (err: any) {
        setIsError(true);
        setStatusMessage(`❌ Registration Error: ${err.message || 'Could not create account.'}`);
      } finally {
        setLoading(false);
      }
      return;
    }

    // C. FIXED STANDARD SIGN IN ACTION HANDLER
    try {
      const { data, error } = await database.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (error) throw error;

      // 1. Force the client router to register cookie sync
      router.refresh(); 
      
      // 2. Direct hardcoded routing to bypass profile state dependency loops
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);

    } catch (err: any) {
      setIsError(true);
      setStatusMessage(`❌ Login Failed: ${err.message || 'Invalid credentials.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAF8F5', fontFamily: 'sans-serif', color: '#111111', padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ backgroundColor: '#ffffff', width: '100%', maxWidth: '440px', padding: '40px', borderRadius: '24px', border: '1px solid #E8E2D9', boxShadow: '0 4px 25px rgba(0,0,0,0.03)', boxSizing: 'border-box' }}>
        
        {emailSent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize
