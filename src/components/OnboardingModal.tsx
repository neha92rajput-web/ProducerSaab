'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [authFeedback, setAuthFeedback] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormErrors({});
      setAuthFeedback('');
    }
  }, [isOpen, isLoginMode]);

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setAuthFeedback('');
    
    const errors: Record<string, string> = {};
    if (!email.trim()) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';
    if (!isLoginMode && !name.trim()) errors.name = 'Producer name is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (isLoginMode) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthFeedback(error.message);
      } else {
        onClose();
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin }
      });
      if (error) {
        setAuthFeedback(error.message);
      } else {
        alert('Registration complete! Check your email to verify your validation token code.');
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-[440px] bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors">✕</button>

        <div className="w-12 h-12 bg-[#C5A880]/20 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-[#C5A880]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v18M17 7v10M7 9v6M22 10v4M2 11v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        <h3 className="text-xl font-extrabold text-[#111111] tracking-tight mb-1 text-center">
          {isLoginMode ? 'Welcome Back' : 'Join Producer Saab'}
        </h3>
        
        <p className="text-center text-[#999999] text-xs mb-6">
          {isLoginMode ? 'Sign in to access your profile center.' : 'Create an account to upload components.'}
        </p>

        {authFeedback && <div className="w-full bg-red-50 text-red-600 p-3 rounded-xl text-xs text-center font-medium mb-3">{authFeedback}</div>}

        <form onSubmit={handleAuthSubmit} noValidate className="w-full space-y-3">
          {!isLoginMode && (
            <div>
              <input
                type="text"
                placeholder="Producer name / alias"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#F5F5F7] text-[#111111] text-[13px] px-4 py-3 rounded-xl outline-none border border-transparent focus:border-gray-300 transition-all text-black"
              />
              {formErrors.name && <p className="text-red-500 text-[10px] mt-1 ml-1">{formErrors.name}</p>}
            </div>
          )}

          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F5F5F7] text-[#111111] text-[13px] px-4 py-3 rounded-xl outline-none border border-transparent focus:border-gray-300 transition-all text-black"
            />
            {formErrors.email && <p className="text-red-500 text-[10px] mt-1 ml-1">{formErrors.email}</p>}
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F5F5F7] text-[#111111] text-[13px] px-4 py-3 rounded-xl outline-none border border-transparent focus:border-gray-300 transition-all pr-10 text-black"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAAAAA] hover:text-[#777777] cursor-pointer"
            >
              <EyeIcon open={showPassword} />
            </button>
            {formErrors.password && <p className="text-red-500 text-[10px] mt-1 ml-1">{formErrors.password}</p>}
          </div>

          <button type="submit" className="w-full bg-[#111111] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#333333] transition-all duration-200 cursor-pointer mt-4">
            {isLoginMode ? 'Sign In →' : 'Register Account →'}
          </button>
        </form>

        <div className="text-center mt-6">
          <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-xs text-[#C5A880] hover:underline font-medium bg-transparent border-none outline-none cursor-pointer">
            {isLoginMode ? "Don't have an account? Sign Up" : 'Already have an account? Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}
