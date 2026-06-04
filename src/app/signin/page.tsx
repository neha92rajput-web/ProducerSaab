'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

const database = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function AuthFormContent(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [view, setView] = useState<string>('signin'); 
  const [username, setUsername] = useState<string>(''); 
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);

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

  const handleViewSwitch = (newView: 'signup' | 'signin' | 'forgot'): void => {
    setStatusMessage('');
    setEmailSent(false);
    router.push(`${window.location.pathname}?view=${newView}`);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');
    setIsError(false);

    const cleanEmail = email.trim().toLowerCase();

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
          options:
