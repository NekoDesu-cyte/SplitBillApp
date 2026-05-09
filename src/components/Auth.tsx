import React, { useState } from 'react';
import { Receipt, Mail, Lock, EyeOff, Eye, User, Info, ArrowRight } from 'lucide-react';

interface AuthProps {
  onBack: () => void;
  initialTab?: 'login' | 'register';
}

export const Auth: React.FC<AuthProps> = ({ onBack, initialTab = 'login' }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
      {/* Tombol Back untuk kembali ke Landing Page */}
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 text-slate-500 hover:text-slate-900 font-medium flex items-center gap-2"
      >
        ← Back to Home
      </button>

      <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-10">
        
        {/* Header Logo */}
        <div className="flex justify-center items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Receipt className="text-white w-5 h-5" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-blue-600">BagiBayar</span>
        </div>

        {/* Title & Subtitle */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {activeTab === 'login' ? 'Login' : 'Create Account'}
          </h1>
          <p className="text-slate-500 text-sm">
            {activeTab === 'login' 
              ? 'Easily split expenses with friends' 
              : 'Start creating and managing your split bill rooms'}
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'login' 
                ? 'bg-white shadow-sm text-blue-600' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'register' 
                ? 'bg-white shadow-sm text-blue-600' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Forms */}
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          
          {/* Form: Full Name (Hanya untuk Create Account) */}
          {activeTab === 'register' && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Jane Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-300"
                />
              </div>
            </div>
          )}

          {/* Form: Email Address */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                placeholder={activeTab === 'login' ? 'you@example.com' : 'jane@example.com'}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Form: Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              {activeTab === 'login' && (
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">
                  Forgot password?
                </a>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Form: Confirm Password (Hanya untuk Create Account) */}
          {activeTab === 'register' && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Form: Remember Me (Hanya untuk Login) */}
          {activeTab === 'login' && (
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer">
                Remember me
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex justify-center items-center gap-2 py-3 px-4 mt-6 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {activeTab === 'login' ? (
              <>
                Login <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Divider & Info Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 text-slate-500 text-xs font-medium border border-slate-100">
              <Info className="w-4 h-4" />
              Only required if you want to create a room
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};