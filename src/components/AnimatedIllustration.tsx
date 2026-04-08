import React from 'react';

export const HeroIllustration = () => (
  <div className="relative w-full max-w-lg mx-auto animate-float">
    <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      {/* Background Circle */}
      <circle cx="250" cy="250" r="200" fill="#EEF2FF" />
      
      {/* Bill/Receipt */}
      <rect x="150" y="100" width="200" height="280" rx="10" fill="white" stroke="#4F46E5" strokeWidth="4" className="animate-pulse-slow" />
      <line x1="180" y1="150" x2="320" y2="150" stroke="#E5E7EB" strokeWidth="4" />
      <line x1="180" y1="180" x2="280" y2="180" stroke="#E5E7EB" strokeWidth="4" />
      <line x1="180" y1="210" x2="320" y2="210" stroke="#E5E7EB" strokeWidth="4" />
      
      {/* Floating Avatars */}
      <circle cx="120" cy="150" r="30" fill="#4F46E5" className="animate-float" style={{ animationDelay: '0.5s' }} />
      <circle cx="380" cy="200" r="35" fill="#22C55E" className="animate-float" style={{ animationDelay: '1s' }} />
      <circle cx="100" cy="300" r="25" fill="#F59E0B" className="animate-float" style={{ animationDelay: '1.5s' }} />
      
      {/* Connecting Lines */}
      <path d="M150 150 Q 120 150 120 150" stroke="#4F46E5" strokeWidth="2" strokeDasharray="4 4" />
      <path d="M350 200 Q 380 200 380 200" stroke="#22C55E" strokeWidth="2" strokeDasharray="4 4" />
    </svg>
  </div>
);

export const SolutionIllustration = () => (
  <div className="w-16 h-16 mb-4">
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="50" cy="50" r="40" fill="#EEF2FF" className="animate-pulse-slow" />
      <path d="M30 50 L45 65 L70 35" stroke="#4F46E5" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

export const BlobBackground = () => (
  <div className="absolute inset-0 overflow-hidden -z-10">
    <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
    <div className="absolute top-0 -right-4 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" style={{ animationDelay: '2s' }}></div>
    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" style={{ animationDelay: '4s' }}></div>
  </div>
);
