'use client';

import React, { useState } from 'react';

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
  const [step, setStep] = useState(1);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen) {
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement.textContent?.toLowerCase().includes('log in')) {
        setIsLoginMode(true);
      } else {
        setIsLoginMode(false);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    
    if (!isLoginMode && !name.trim()) errors.name = 'Name is required';
    if (!email.trim()) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';

    if (Object.keys(errors).length > 0) {
      setStep1Errors(errors);
      return;
    }

    if (isLoginMode) {
      console.log('Logging in with:', { email, password });
      onClose();
    } else {
      setStep(2);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full bg-[#F5F5F7] text-[#111111] text-[13px] px-4 py-3 rounded-xl outline-none border transition-all ${
      hasError ? 'border-red-500' : 'border-transparent focus:border-gray-300'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-[440px] bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors">
          ✕
        </button>

        <div className="w-12 h-12 bg-[#C5A880]/20 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-[#C5A880]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v18M17 7v10M7 9v6M22 10v4M2 11v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        <h3 className="text-xl font-extrabold text-[#111111] tracking-tight mb-1 text-center">
          {isLoginMode ? 'Welcome Back' : step === 1 ? 'Join Producer Saab' : 'Producer Verification'}
        </h3>
        
        <p className="text-center text-[#999999] text-xs mb-6">
          {isLoginMode ? 'Sign in to access your profile.' : 'Create your free account in 2 steps.'}
        </p>

        {step === 1 && (
          <form onSubmit={handleStep1Submit} noValidate className="w-full space-y-3">
            {!isLoginMode && (
              <div>
                <input
                  type="text"
                  placeholder="Producer name / alias"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setStep1Errors(prev => ({ ...prev, name: '' })); }}
                  className={inputClass(!!step1Errors.name)}
                  autoComplete="name"
                />
                {step1Errors.name && <p className="text-red-500 text-[10px] mt-1 ml-1">{step1Errors.name}</p>}
              </div>
            )}

            <div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setStep1Errors(prev => ({ ...prev, email: '' })); }}
                className={inputClass(!!step1Errors.email)}
                autoComplete="email"
              />
              {step1Errors.email && <p className="text-red-500 text-[10px] mt-1 ml-1">{step1Errors.email}</p>}
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password (min 8 characters)"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setStep1Errors(prev => ({ ...prev, password: '' })); }}
                className={`${inputClass(!!step1Errors.password)} pr-10`}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAAAAA] hover:text-[#777777] transition-colors cursor-pointer"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>

            {!isLoginMode && password.length > 0 && (
              <div className="flex gap-1 mt-1.5">
                {[1, 2, 3, 4].map((lvl) => {
                  const strength = password.length < 8 ? 1 : password.length < 12 ? 2 : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;
                  return (
                    <div
                      key={lvl}
                      className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${
                        lvl <= strength
                          ? strength === 1 ? 'bg-red-400' : strength === 2 ? 'bg-yellow-400' : strength === 3 ? 'bg-amber-400' : 'bg-emerald-400'
                          : 'bg-[#EBE2D9]'
                      }`}
                    />
                  );
                })}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#111111] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#333333] active:scale-[0.98] transition-all duration-200 cursor-pointer mt-4"
            >
              {isLoginMode ? 'Sign In →' : 'Continue — Verify Your Profile →'}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <p className="text-xs text-[#999999]">
            {isLoginMode ? (
              <>
                Don't have an account?{' '}
                <span onClick={() => setIsLoginMode(false)} className="text-[#C5A880] cursor-pointer hover:underline font-medium">
                  Sign Up
                </span>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <span onClick={() => setIsLoginMode(true)} className="text-[#C5A880] cursor-pointer hover:underline font-medium">
                  Log in
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
