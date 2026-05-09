import React, { useState } from 'react';
import { Payment } from './components/Payment';
import { Button } from './components/Button';
import { Section } from './components/Section';
import { HeroIllustration, SolutionIllustration, BlobBackground } from './components/AnimatedIllustration';
import { Receipt, Users, Calculator, Share2, MessageSquare, AlertCircle, ArrowRight } from 'lucide-react';
import { CreateRoom } from './components/CreateRoom';
import { RoomDetail } from './components/RoomDetail';
import { Auth } from './components/Auth'; 

export default function App() {
  const [view, setView] = useState<'landing' | 'create-room' | 'room-detail' | 'auth' | 'payment'>('landing');

  // Logika Perpindahan Halaman
  if (view === 'room-detail') {
    return (
      <RoomDetail 
        onBack={() => setView('create-room')} 
        onPay={() => setView('payment')} 
      />
    );
  }

  if (view === 'payment') {
    return <Payment onBack={() => setView('room-detail')} />;
  }

  if (view === 'create-room') {
    return (
      <CreateRoom 
        onBack={() => setView('landing')} 
        onCreate={() => setView('room-detail')} 
      />
    );
  }

  if (view === 'auth') {
    return <Auth onBack={() => setView('landing')} />;
  }

  // Jika state 'view' adalah 'landing', render landing page dalam wujud mobile (Max width 480px)
  return (
    // Background utama abu-abu untuk di layar PC/Desktop
    <div className="min-h-screen bg-slate-100 flex justify-center font-sans text-slate-900">
      
      {/* Kontainer Putih (Simulasi Layar HP) */}
      <div className="w-full max-w-[480px] bg-white min-h-screen shadow-2xl relative overflow-x-hidden flex flex-col">
        
        {/* Navbar - Diganti jadi sticky biar ga keluar dari kontainer */}
        <nav className="sticky top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
          <div className="px-5 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Receipt className="text-white w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">BagiBayar</span>
            </div>
            <Button onClick={() => setView('auth')} variant="outline" className="py-2 px-5 text-sm">
              Login
            </Button>
          </div>
        </nav>

        {/* 1. Hero Section */}
        <Section className="pt-16 pb-12 flex flex-col items-center gap-8 px-5 text-center">
          <div>
            <h1 className="font-display text-4xl font-bold leading-tight mb-4">
              Split Bill <span className="text-primary">Tanpa Ribet</span>
            </h1>
            <p className="text-base text-slate-600 mb-8 px-2">
              Bagi tagihan bareng teman, transparan & cepat. Gak perlu lagi pusing hitung manual atau nagih satu-satu.
            </p>
            <div className="flex flex-col gap-3 w-full">
              <Button 
                onClick={() => setView('create-room')} 
                className="flex items-center justify-center gap-2 w-full py-3.5"
              >
                Create Room <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="outline" className="w-full py-3.5">Try Demo</Button>
            </div>
          </div>
          <div className="w-full mt-4">
            <HeroIllustration />
          </div>
        </Section>

        {/* 2. Problem Section */}
        <Section id="problem" className="bg-slate-50 rounded-3xl my-6 mx-4 px-5 py-10">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl font-bold mb-3">Kenapa Split Bill Itu Susah?</h2>
            <p className="text-slate-600 text-sm">Masalah klasik yang sering kita hadapi saat makan bareng.</p>
          </div>
          <div className="flex flex-col gap-4">
            {[
              { icon: <Calculator className="w-6 h-6 text-red-500" />, title: "Ribet Hitung Manual", desc: "Pake kalkulator hp, salah input dikit harus ulang dari awal." },
              { icon: <AlertCircle className="w-6 h-6 text-red-500" />, title: "Bingung Siapa Bayar Apa", desc: "Lupa siapa yang pesen es teh manis atau nasi goreng spesial." },
              { icon: <MessageSquare className="w-6 h-6 text-red-500" />, title: "Harus Nagih Satu-satu", desc: "Gak enak hati buat nagih utang ke temen sendiri lewat chat." }
            ].map((item, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
                <div className="mt-1 bg-red-50 p-2 rounded-lg shrink-0">{item.icon}</div>
                <div className="text-left">
                  <h3 className="font-display font-bold text-lg mb-1">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* 3. Solution Section */}
        <Section id="solution" className="py-10 px-5 text-center">
          <div className="mb-10">
            <h2 className="font-display text-2xl font-bold mb-3">Solusi Pintar Buat Kamu</h2>
            <p className="text-slate-600 text-sm">Fitur yang bikin split bill jadi pengalaman yang menyenangkan.</p>
          </div>
          <div className="flex flex-col gap-10">
            {[
              { title: "Room Split Bill", desc: "Buat room khusus untuk setiap sesi makan bareng teman-temanmu." },
              { title: "Input Pesanan Bareng", desc: "Setiap orang bisa input pesanan masing-masing secara real-time." },
              { title: "Auto Summary WhatsApp", desc: "Kirim ringkasan tagihan otomatis ke WhatsApp grup dengan satu klik." }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-48 mb-5 flex justify-center">
                  <SolutionIllustration />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm px-4">{item.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* 4. How It Works */}
        <Section id="how-it-works" className="bg-primary text-white rounded-3xl my-6 mx-4 px-5 py-10 relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-center mb-10">
              <h2 className="font-display text-2xl font-bold mb-3">Cara Kerja</h2>
              <p className="text-indigo-100 text-sm">Hanya butuh 4 langkah mudah untuk mulai.</p>
            </div>
            <div className="flex flex-col gap-8 relative">
              {/* Garis Vertikal (Konektor) */}
              <div className="absolute left-1/2 top-10 bottom-10 w-0.5 bg-indigo-400/30 -translate-x-1/2 -z-0"></div>
              
              {[
                { step: "1", title: "Create Room", icon: <Receipt />, desc: "Buka app dan buat room baru." },
                { step: "2", title: "Invite Teman", icon: <Users />, desc: "Bagikan link room ke teman-teman." },
                { step: "3", title: "Input Pesanan", icon: <Calculator />, desc: "Semua orang input pesanan masing-masing." },
                { step: "4", title: "Kirim & Bayar", icon: <Share2 />, desc: "Kirim summary dan selesaikan pembayaran." }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center relative z-10">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 text-primary shadow-lg transform transition-transform">
                    {React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, { className: "w-8 h-8" })}
                  </div>
                  <div className="bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center font-bold mb-2 border-2 border-primary text-xs -mt-8 relative z-20">
                    {item.step}
                  </div>
                  <h3 className="font-display font-bold text-base mb-1 mt-2">{item.title}</h3>
                  <p className="text-indigo-100 text-xs px-4">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-accent/20 rounded-full blur-3xl"></div>
        </Section>

        {/* 5. CTA Section */}
        <Section className="relative text-center py-20 px-5">
          <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30">
            <BlobBackground />
          </div>
          <div className="relative z-10">
            <h2 className="font-display text-3xl font-bold mb-4 leading-tight">Mulai Split Bill Sekarang</h2>
            <p className="text-slate-600 mb-8 text-sm px-2">
              Bergabunglah dengan ribuan pengguna yang sudah meninggalkan cara lama yang ribet.
            </p>
            <Button 
              onClick={() => setView('create-room')} 
              className="text-base py-4 w-full shadow-xl"
            >
              Create Room Now
            </Button>
          </div>
        </Section>

        {/* 6. Footer */}
        <footer className="bg-slate-50 border-t border-slate-200 py-10 px-6 mt-auto">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Receipt className="text-white w-4 h-4" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight">BagiBayar</span>
            </div>
            <div className="flex gap-5 text-slate-400 text-sm font-medium">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>
            <p className="text-slate-400 text-xs mt-2">
              &copy; {new Date().getFullYear()} BagiBayar. All rights reserved.
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}