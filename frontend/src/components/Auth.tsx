import React, { useState } from "react";
import {
  Receipt,
  Mail,
  Lock,
  EyeOff,
  Eye,
  User,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

interface AuthProps {
  onBack: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);

  // State dan fungsi asli dari backend tetap dipertahankan
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ... di dalam komponen Auth
  const [error, setError] = useState<string | null>(null); // State error
  const [success, setSuccess] = useState<string | null>(null); // State sukses

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // --- VALIDASI FRONTEND ---
    if (password.length < 8) {
      setError("Password minimal harus 8 karakter, ya!");
      setIsLoading(false);
      return;
    }

    const endpoint = activeTab === "login" ? "login" : "register";

    try {
      const res = await fetch(`https://splitbill-backend-804441447131.asia-southeast2.run.app/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: activeTab === "register" ? name : undefined,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Jika backend mengirim error "Email already exists" atau sejenisnya
        // Pesan ini akan otomatis ditangkap dan ditampilkan di UI
        throw new Error(data.error || "Terjadi kesalahan");
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onBack();
      } else {
        setSuccess("Berhasil Daftar! Silakan Login.");
        setActiveTab("login");
        // Reset form
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (err: any) {
      // Tampilkan pesan error (termasuk error email sudah terdaftar dari backend)
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 1. Background utama PC (Abu-abu, konten terpusat)
    <div className="min-h-screen bg-slate-100 flex justify-center font-sans text-slate-800 overflow-x-hidden">
      {/* 2. Kontainer Mobile (Maksimal 480px) */}
      <div className="w-full max-w-[480px] bg-white min-h-screen shadow-2xl relative flex flex-col">
        {/* Navbar / Header Minimalis */}
        <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 w-full">
          <div className="px-5 h-16 flex items-center relative">
            <button
              onClick={onBack}
              className="absolute left-4 p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-full transition-all flex items-center justify-center">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1 flex justify-center items-center gap-2">
              <img src="/favicon.svg" alt="Bagi Bayar Logo" className="w-7 h-7 rounded-lg shadow-sm" />
              <span className="font-display font-extrabold text-lg tracking-tight text-[#4f46e5]">
                BagiBayar
              </span>
            </div>
          </div>
        </nav>

        {/* Konten Utama */}
        <div className="flex-1 flex flex-col justify-center px-6 py-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2 text-slate-900">
              {activeTab === "login"
                ? "Selamat Datang Kembali!"
                : "Buat Akun Baru"}
            </h1>
            <p className="text-[13px] text-slate-500 leading-relaxed px-4">
              {activeTab === "login"
                ? "Silakan masuk ke akunmu untuk melanjutkan sesi split bill."
                : "Daftar sekarang untuk menikmati kemudahan membagi tagihan."}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-[#f8f9fa] border border-slate-100 p-1 rounded-xl mb-8">
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === "login"
                  ? "bg-white shadow-sm text-[#4f46e5]"
                  : "text-slate-400 hover:text-slate-600"
              }`}>
              Login
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                activeTab === "register"
                  ? "bg-white shadow-sm text-[#4f46e5]"
                  : "text-slate-400 hover:text-slate-600"
              }`}>
              Create Account
            </button>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Input Nama (Hanya muncul jika di tab Register) */}
            {activeTab === "register" && (
              <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="absolute left-4 top-3.5 text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Nama Lengkap"
                  className={`w-full pl-12 pr-4 py-3.5 bg-[#fafafa] border ${
                    error ? "border-red-200" : "border-slate-200"
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] transition-all text-sm placeholder:text-slate-400 font-medium`}
                />
              </div>
            )}

            {/* Input Email */}
            <div className="relative">
              <div className="absolute left-4 top-3.5 text-slate-400">
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email"
                className={`w-full pl-12 pr-4 py-3.5 bg-[#fafafa] border ${
                  error ? "border-red-200" : "border-slate-200"
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] transition-all text-sm placeholder:text-slate-400 font-medium`}
              />
            </div>

            {/* Input Password */}
            <div className="relative">
              <div className="absolute left-4 top-3.5 text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
                className={`w-full pl-12 pr-12 py-3.5 bg-[#fafafa] border ${
                  error ? "border-red-200" : "border-slate-200"
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] transition-all text-sm placeholder:text-slate-400 font-medium`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors">
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            {/* BAGIAN PESAN FEEDBACK (Error & Success) */}
            <div className="pt-2">
              {error && (
                <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl animate-in slide-in-from-top-2 duration-300 mb-4 border border-red-100">
                  <AlertCircle size={16} />
                  <span className="text-[11px] font-bold leading-tight">
                    {error}
                  </span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-xl animate-in slide-in-from-top-2 duration-300 mb-4 border border-emerald-100">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="4">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold leading-tight">
                    {success}
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#4f46e5] hover:bg-indigo-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-sm">
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {activeTab === "login"
                      ? "Login ke Akun"
                      : "Buat Akun Sekarang"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
