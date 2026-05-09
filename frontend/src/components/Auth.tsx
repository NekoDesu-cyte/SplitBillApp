import React, { useState } from "react";
import {
  Receipt,
  Mail,
  Lock,
  EyeOff,
  Eye,
  User,
  ArrowRight,
  ArrowLeft, // Tambahan icon untuk back
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const endpoint = activeTab === "login" ? "login" : "register";

    try {
      const res = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: activeTab === "register" ? name : undefined,
          email,
          password,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Terjadi kesalahan");

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        onBack();
      } else {
        alert("Berhasil Daftar! Silakan Login.");
        setActiveTab("login");
      }
    } catch (err: any) {
      alert(err.message);
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
              <div className="w-7 h-7 bg-[#4f46e5] rounded-lg flex items-center justify-center shadow-sm">
                <Receipt className="text-white w-4 h-4" />
              </div>
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
            {activeTab === "register" && (
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Nama Lengkap"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#fafafa] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] transition-all text-sm placeholder:text-slate-400 font-medium"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Alamat Email"
                className="w-full pl-12 pr-4 py-3.5 bg-[#fafafa] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] transition-all text-sm placeholder:text-slate-400 font-medium"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
                className="w-full pl-12 pr-12 py-3.5 bg-[#fafafa] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] transition-all text-sm placeholder:text-slate-400 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors">
                {showPassword ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#4f46e5] hover:bg-indigo-700 text-white py-4 mt-2 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-sm">
              {isLoading
                ? "Loading..."
                : activeTab === "login"
                  ? "Login ke Akun"
                  : "Buat Akun Sekarang"}{" "}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
