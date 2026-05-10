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
  Clock,
} from "lucide-react";
import { CreateRoom } from "./components/CreateRoom";
import { RoomDetail } from "./components/RoomDetail";
import { Auth } from "./components/Auth";
import { HistoryRoom } from "./components/HistoryRoom";

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
      <div className="relative bg-white w-full max-w-[360px] rounded-[2rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-full">
          <X size={18} />
        </button>
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-50 text-[#4f46e5] rounded-2xl flex items-center justify-center mx-auto mb-5">
            <LogIn className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Login Dulu, Yuk!
          </h3>
          <p className="text-slate-500 text-xs mb-8 leading-relaxed px-2">
            Kamu perlu masuk ke akunmu untuk bisa membuat ruangan split bill dan
            memantau riwayatnya.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={onLogin}
              className="w-full py-3.5 bg-[#4f46e5] text-white rounded-xl font-bold text-sm shadow-sm hover:bg-indigo-700 transition-colors">
              Login Sekarang
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 text-slate-400 font-semibold text-xs hover:text-slate-600 transition-colors">
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
    "landing" | "create-room" | "room-detail" | "auth" | "payment" | "history"
  >((sessionStorage.getItem("app_view") as any) || "landing");

  // State baru untuk integrasi backend
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
    sessionStorage.getItem("app_room_id") || null,
  );
  const [roomCode, setRoomCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null); // State baru untuk error
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Load user data dari localStorage
  useEffect(() => {
    sessionStorage.setItem("app_view", view);
    if (selectedRoomId) {
      sessionStorage.setItem("app_room_id", selectedRoomId);
    } else {
      sessionStorage.removeItem("app_room_id");
    }
  }, [view, selectedRoomId]);

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
    // Reset error setiap kali tombol ditekan
    setError(null);

    if (!roomCode || roomCode.length < 4) {
      setError("Masukkan 4 digit kode room!");
      return;
    }

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
      setError("Kode salah atau room sudah dihapus."); // Set pesan error UI
    } finally {
      setIsJoining(false);
    }
  };

  const handleBackToLanding = () => {
    setSelectedRoomId(null);
    setView("landing");
  };

  // Logika Perpindahan Halaman (Fungsi Asli Tetap Sama)
  if (view === "room-detail" && selectedRoomId) {
    return (
      <RoomDetail
        roomId={selectedRoomId}
        onBack={handleBackToLanding} // <- Ubah di sini
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
        onBack={handleBackToLanding}
        onCreate={(id: string) => {
          setSelectedRoomId(id);
          setView("room-detail");
        }}
      />
    );
  }

  if (view === "history" && user) {
    return (
      <HistoryRoom
        userId={user.id}
        onBack={handleBackToLanding}
        onSelectRoom={(id) => {
          setSelectedRoomId(id);
          setView("room-detail");
        }}
      />
    );
  }

  if (view === "auth") {
    return <Auth onBack={handleBackToLanding} />;
  }

  // =========================================================================
  // RENDER LANDING PAGE DENGAN LAYOUT MOBILE-FIRST
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center font-sans text-slate-800 overflow-x-hidden">
      {/* Kontainer Mobile (Layar HP) - max-w-[480px] */}
      <div className="w-full max-w-[480px] bg-white min-h-screen shadow-2xl relative flex flex-col pb-10">
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLogin={() => {
            setShowAuthModal(false);
            setView("auth");
          }}
        />

        {/* Navbar */}
        <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 w-full">
          <div className="px-5 h-16 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#4f46e5] rounded-lg flex items-center justify-center shadow-sm">
                <Receipt className="text-white w-4 h-4" />
              </div>
              <span className="font-display font-extrabold text-lg tracking-tight text-[#4f46e5]">
                BagiBayar
              </span>
            </div>

            {/* Menu Kanan: Nama User atau Tombol Login */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-2 bg-indigo-50 pl-3 pr-1 py-1 rounded-full border border-indigo-100">
                  <span className="text-[12px] font-bold text-[#4f46e5] max-w-[70px] truncate">
                    {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 bg-white rounded-full text-red-500 shadow-sm hover:bg-red-50 transition-colors">
                    <LogOut size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setView("auth")}
                  className="bg-[#4f46e5] text-white px-5 py-1.5 rounded-full text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm">
                  Login
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* 1. Hero Section */}
        <div className="px-5 py-10 flex flex-col items-center text-center">
          <h1 className="font-display text-4xl font-extrabold leading-tight mb-4 text-slate-900 tracking-tight">
            Split Bill <span className="text-[#4f46e5]">Tanpa Ribet</span>
          </h1>
          <p className="text-[13px] text-slate-500 mb-8 max-w-[300px] leading-relaxed font-medium">
            Bagi tagihan bareng teman, transparan & cepat. Gak perlu lagi pusing
            hitung manual atau nagih satu-satu.
          </p>

          {/* BOX INPUT KODE ROOM */}
          <div className="bg-[#f8f9fa] border border-slate-200 p-4 rounded-3xl w-full mb-6 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-left pl-2">
              Masukkan Kode Room
            </p>
            <div className="flex gap-2">
              <input
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value);
                  if (error) setError(null); // Hilangkan error saat user mengetik ulang
                }}
                placeholder="0000"
                maxLength={4}
                className={`w-full bg-white border ${error ? "border-red-400" : "border-slate-200"} rounded-xl px-3 py-3.5 text-xl font-mono tracking-[0.4em] text-center focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] font-bold text-[#4f46e5] transition-all`}
              />
              <button
                onClick={handleJoin}
                disabled={isJoining}
                className="px-5 py-3.5 bg-[#4f46e5] text-white rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center">
                {isJoining ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Gabung"
                )}
              </button>
            </div>

            {/* Pesan Error UI yang Setema */}
            {error && (
              <div className="mt-3 flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl animate-in slide-in-from-top-2 duration-300">
                <AlertCircle size={14} />
                <span className="text-[11px] font-bold">{error}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleCreateClick}
            className="w-full bg-[#4f46e5] text-white rounded-xl font-bold py-4 text-sm flex items-center justify-center gap-2 shadow-md hover:bg-indigo-700 transition-colors">
            Create Room <ArrowRight className="w-4 h-4" />
          </button>

          {/* TOMBOL HISTORY: Hanya muncul jika user login */}
          {user && (
            <button
              onClick={() => setView("history")}
              className="w-full mt-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold py-3.5 text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
              <Clock className="w-4 h-4" /> Lihat Riwayat Ruangan
            </button>
          )}

          <div className="mt-10 w-full max-w-[280px]">
            <HeroIllustration />
          </div>
        </div>

        {/* 2. Problem Section */}
        <div className="px-5 py-10 bg-[#f8f9fa] border-y border-slate-100">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold mb-2 text-slate-900">
              Kenapa Split Bill Susah?
            </h2>
            <p className="text-xs text-slate-500">
              Masalah klasik yang sering kita hadapi saat makan bareng.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {[
              {
                icon: <Calculator className="w-6 h-6 text-red-500" />,
                title: "Ribet Hitung Manual",
                desc: "Pake kalkulator hp, salah input dikit harus ulang dari awal.",
              },
              {
                icon: <AlertCircle className="w-6 h-6 text-red-500" />,
                title: "Bingung Siapa Bayar Apa",
                desc: "Lupa siapa yang pesen es teh manis atau nasi goreng spesial.",
              },
              {
                icon: <MessageSquare className="w-6 h-6 text-red-500" />,
                title: "Harus Nagih Satu-satu",
                desc: "Gak enak hati buat nagih utang ke temen sendiri lewat chat.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-start gap-4">
                <div className="bg-red-50 p-2.5 rounded-xl shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Solution Section */}
        <div className="px-5 py-10">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl font-bold mb-2 text-slate-900">
              Solusi Pintar Buat Kamu
            </h2>
            <p className="text-xs text-slate-500">
              Fitur yang bikin split bill jadi gampang.
            </p>
          </div>
          <div className="flex flex-col gap-8">
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
                <div className="w-32 mb-4">
                  <SolutionIllustration />
                </div>
                <h3 className="font-bold text-base text-slate-800 mb-1.5">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-xs px-4">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. How It Works */}
        <div className="mx-4 bg-[#4f46e5] text-white rounded-3xl py-10 px-5 relative overflow-hidden mb-10 shadow-lg">
          <div className="relative z-10">
            <div className="text-center mb-10">
              <h2 className="font-display text-2xl font-bold mb-2">
                Cara Kerja
              </h2>
              <p className="text-indigo-200 text-xs">
                4 langkah mudah untuk mulai.
              </p>
            </div>
            <div className="flex flex-col gap-6 relative">
              {/* Garis vertikal penghubung step */}
              <div className="absolute top-10 bottom-10 left-[2rem] w-0.5 bg-indigo-400/30 -z-0"></div>

              {[
                {
                  step: "1",
                  title: "Create Room",
                  icon: <Receipt />,
                  desc: "Buka app & buat room.",
                },
                {
                  step: "2",
                  title: "Invite Teman",
                  icon: <Users />,
                  desc: "Bagikan link ke teman.",
                },
                {
                  step: "3",
                  title: "Input Pesanan",
                  icon: <Calculator />,
                  desc: "Pilih menu masing-masing.",
                },
                {
                  step: "4",
                  title: "Kirim & Bayar",
                  icon: <Share2 />,
                  desc: "Selesaikan pembayaran.",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 relative z-10">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#4f46e5] shadow-md shrink-0 relative">
                    {/* INI BAGIAN YANG DIPERBAIKI */}
                    {React.cloneElement(
                      item.icon as React.ReactElement<{ className?: string }>,
                      {
                        className: "w-7 h-7",
                      },
                    )}

                    <div className="absolute -top-2 -right-2 bg-pink-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white">
                      {item.step}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                    <p className="text-indigo-200 text-[11px]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. CTA Section */}
        <div className="px-5 py-12 text-center relative overflow-hidden bg-slate-50 border-t border-slate-100">
          <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
            <BlobBackground />
          </div>
          <div className="relative z-10">
            <h2 className="font-display text-2xl font-bold mb-3 text-slate-900">
              Mulai Split Bill Sekarang
            </h2>
            <p className="text-xs text-slate-500 mb-8 max-w-[250px] mx-auto leading-relaxed">
              Bergabunglah dengan ribuan pengguna yang sudah meninggalkan cara
              lama yang ribet.
            </p>
            <button
              onClick={handleCreateClick}
              className="w-full bg-[#4f46e5] hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-md transition-colors text-sm">
              Create Room Now
            </button>
          </div>
        </div>

        {/* 6. Footer */}
        <footer className="bg-white border-t border-slate-200 py-8 px-5">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 opacity-80">
              <div className="w-6 h-6 bg-[#4f46e5] rounded flex items-center justify-center">
                <Receipt className="text-white w-3 h-3" />
              </div>
              <span className="font-display font-bold text-sm tracking-tight text-slate-700">
                BagiBayar
              </span>
            </div>
            <div className="flex gap-4 text-slate-400 text-[11px] font-medium">
              <a href="#" className="hover:text-[#4f46e5] transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-[#4f46e5] transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-[#4f46e5] transition-colors">
                Contact
              </a>
            </div>
            <p className="text-slate-400 text-[10px]">
              &copy; {new Date().getFullYear()} BagiBayar. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
