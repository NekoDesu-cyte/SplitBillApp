import React, { useState, useEffect } from "react";
import { Payment } from "./components/Payment";
import { Button } from "./components/Button";
import { Section } from "./components/Section";
import {
  HeroIllustration,
  SolutionIllustration,
  BlobBackground,
} from "./components/AnimatedIllustration";
import {
  Receipt,
  Users,
  Calculator,
  Share2,
  MessageSquare,
  AlertCircle,
  ArrowRight,
  X,
  LogIn,
  LogOut,
} from "lucide-react";
import { CreateRoom } from "./components/CreateRoom";
import { RoomDetail } from "./components/RoomDetail";
import { Auth } from "./components/Auth";

// --- KOMPONEN MODAL POP-UP (LOGIN) ---
const AuthModal = ({
  isOpen,
  onClose,
  onLogin,
}: {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-50 text-[#4f46e5] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <LogIn className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Login Dulu, Yuk!
          </h3>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            Kamu perlu masuk ke akunmu untuk bisa membuat ruangan split bill dan
            memantau riwayatnya.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={onLogin}
              className="w-full py-4 rounded-xl font-bold">
              Login Sekarang
            </Button>
            <button
              onClick={onClose}
              className="w-full py-3 text-slate-400 font-semibold text-sm hover:text-slate-600 transition-colors">
              Nanti Saja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<
    "landing" | "create-room" | "room-detail" | "auth" | "payment"
  >("landing");

  // State baru untuk integrasi backend
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Load user data dari localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, [view]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.reload();
  };

  const handleCreateClick = () => {
    if (user) setView("create-room");
    else setShowAuthModal(true);
  };

  const handleJoin = async () => {
    if (!roomCode || roomCode.length < 4)
      return alert("Masukkan 4 digit kode room!");
    setIsJoining(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/rooms/code/${roomCode}`,
      );
      if (!res.ok) throw new Error("Kode tidak ditemukan");
      const data = await res.json();
      setSelectedRoomId(data.id);
      setView("room-detail");
    } catch (error) {
      alert("Kode Room salah atau ruangan sudah dihapus.");
    } finally {
      setIsJoining(false);
    }
  };

  // Logika Perpindahan Halaman
  if (view === "room-detail" && selectedRoomId) {
    return (
      <RoomDetail
        roomId={selectedRoomId}
        onBack={() => setView("landing")}
        onPay={() => setView("payment")}
      />
    );
  }

  if (view === "payment" && selectedRoomId) {
    return (
      <Payment roomId={selectedRoomId} onBack={() => setView("room-detail")} />
    );
  }

  if (view === "create-room") {
    return (
      <CreateRoom
        onBack={() => setView("landing")}
        onCreate={(id: string) => {
          setSelectedRoomId(id);
          setView("room-detail");
        }}
      />
    );
  }

  if (view === "auth") {
    return <Auth onBack={() => setView("landing")} />;
  }

  // Jika state 'view' adalah 'landing', render landing page seperti biasa
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      {/* Render Modal Login */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={() => setView("auth")}
      />

      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Receipt className="text-white w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">
              BagiBayar
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#problem" className="hover:text-primary transition-colors">
              Problem
            </a>
            <a
              href="#solution"
              className="hover:text-primary transition-colors">
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-primary transition-colors">
              How it Works
            </a>
          </div>

          {/* Menu Kanan: Tampilkan Nama User atau Tombol Login */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 bg-indigo-50 pl-4 pr-1 py-1 rounded-full border border-indigo-100">
                <span className="text-sm font-bold text-[#4f46e5]">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 bg-white rounded-full text-red-500 shadow-sm hover:bg-red-50 transition-colors">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Button
                onClick={() => setView("auth")}
                variant="outline"
                className="hidden md:block py-2 px-6 text-sm">
                Login
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* 1. Hero Section */}
      <Section className="pt-32 md:pt-48 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 text-center md:text-left">
          <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
            Split Bill <span className="text-primary">Tanpa Ribet</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-xl mx-auto md:mx-0">
            Bagi tagihan bareng teman, transparan & cepat. Gak perlu lagi pusing
            hitung manual atau nagih satu-satu.
          </p>

          {/* BOX INPUT KODE ROOM */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-3xl max-w-sm mx-auto md:mx-0 mb-6 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 text-left pl-2">
              Masukkan Kode Room
            </p>
            <div className="flex gap-2">
              <input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="0000"
                maxLength={4}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-2xl font-mono tracking-[0.5em] text-center focus:outline-none focus:border-primary font-bold text-primary"
              />
              <button
                onClick={handleJoin}
                disabled={isJoining}
                className="px-6 py-3 bg-primary text-white rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50">
                {isJoining ? "..." : "Gabung"}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button
              onClick={handleCreateClick}
              className="flex items-center justify-center gap-2">
              Create Room <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline">Try Demo</Button>
          </div>
        </div>
        <div className="flex-1 w-full">
          <HeroIllustration />
        </div>
      </Section>

      {/* 2. Problem Section */}
      <Section id="problem" className="bg-slate-50 rounded-3xl my-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Kenapa Split Bill Itu Susah?
          </h2>
          <p className="text-slate-600">
            Masalah klasik yang sering kita hadapi saat makan bareng.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Calculator className="w-8 h-8 text-red-500" />,
              title: "Ribet Hitung Manual",
              desc: "Pake kalkulator hp, salah input dikit harus ulang dari awal.",
            },
            {
              icon: <AlertCircle className="w-8 h-8 text-red-500" />,
              title: "Bingung Siapa Bayar Apa",
              desc: "Lupa siapa yang pesen es teh manis atau nasi goreng spesial.",
            },
            {
              icon: <MessageSquare className="w-8 h-8 text-red-500" />,
              title: "Harus Nagih Satu-satu",
              desc: "Gak enak hati buat nagih utang ke temen sendiri lewat chat.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="mb-4">{item.icon}</div>
              <h3 className="font-display font-bold text-xl mb-2">
                {item.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* 3. Solution Section */}
      <Section id="solution">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Solusi Pintar Buat Kamu
          </h2>
          <p className="text-slate-600">
            Fitur yang bikin split bill jadi pengalaman yang menyenangkan.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              title: "Room Split Bill",
              desc: "Buat room khusus untuk setiap sesi makan bareng teman-temanmu.",
            },
            {
              title: "Input Pesanan Bareng",
              desc: "Setiap orang bisa input pesanan masing-masing secara real-time.",
            },
            {
              title: "Auto Summary WhatsApp",
              desc: "Kirim ringkasan tagihan otomatis ke WhatsApp grup dengan satu klik.",
            },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <SolutionIllustration />
              <h3 className="font-display font-bold text-xl mb-3">
                {item.title}
              </h3>
              <p className="text-slate-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 4. How It Works */}
      <Section
        id="how-it-works"
        className="bg-primary text-white rounded-3xl my-10 relative overflow-hidden">
        <div className="relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Cara Kerja
            </h2>
            <p className="text-indigo-100">
              Hanya butuh 4 langkah mudah untuk mulai.
            </p>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative">
            <div className="hidden md:block absolute top-10 left-0 w-full h-0.5 bg-indigo-400/30 -z-0"></div>

            {[
              {
                step: "1",
                title: "Create Room",
                icon: <Receipt />,
                desc: "Buka app dan buat room baru.",
              },
              {
                step: "2",
                title: "Invite Teman",
                icon: <Users />,
                desc: "Bagikan link room ke teman-teman.",
              },
              {
                step: "3",
                title: "Input Pesanan",
                icon: <Calculator />,
                desc: "Semua orang input pesanan masing-masing.",
              },
              {
                step: "4",
                title: "Kirim & Bayar",
                icon: <Share2 />,
                desc: "Kirim summary dan selesaikan pembayaran.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center text-center relative z-10">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 text-primary shadow-xl transform hover:rotate-6 transition-transform">
                  {React.cloneElement(
                    item.icon as React.ReactElement<{ className?: string }>,
                    { className: "w-10 h-10" },
                  )}
                </div>
                <div className="bg-accent text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mb-4 border-4 border-primary">
                  {item.step}
                </div>
                <h3 className="font-display font-bold text-lg mb-2">
                  {item.title}
                </h3>
                <p className="text-indigo-100 text-xs px-4">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>
      </Section>

      {/* 5. CTA Section */}
      <Section className="relative text-center py-32">
        <BlobBackground />
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Mulai Split Bill Sekarang
          </h2>
          <p className="text-slate-600 mb-10 text-lg">
            Bergabunglah dengan ribuan pengguna yang sudah meninggalkan cara
            lama yang ribet.
          </p>
          {/* TOMBOL CREATE ROOM DI BAWAH */}
          <Button
            onClick={handleCreateClick}
            className="text-xl py-6 px-12 shadow-2xl">
            Create Room Now
          </Button>
        </div>
      </Section>

      {/* 6. Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <Receipt className="text-white w-4 h-4" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              BagiBayar
            </span>
          </div>
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} BagiBayar. All rights reserved.
          </p>
          <div className="flex gap-6 text-slate-400">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
