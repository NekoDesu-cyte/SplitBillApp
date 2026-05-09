import React, { useState } from "react";
import {
  Receipt,
  Mail,
  Lock,
  EyeOff,
  Eye,
  User,
  Info,
  ArrowRight,
} from "lucide-react";

interface AuthProps {
  onBack: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
      <button
        onClick={onBack}
        className="absolute top-6 left-6 text-slate-500 hover:text-slate-900 font-medium flex items-center gap-2">
        ← Back to Home
      </button>
      <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-10">
        <div className="flex justify-center items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Receipt className="text-white w-5 h-5" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-blue-600">
            BagiBayar
          </span>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {activeTab === "login" ? "Login" : "Create Account"}
          </h1>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${activeTab === "login" ? "bg-white shadow-sm text-blue-600" : "text-slate-600"}`}>
            Login
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${activeTab === "register" ? "bg-white shadow-sm text-blue-600" : "text-slate-600"}`}>
            Create Account
          </button>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          {activeTab === "register" && (
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Full Name"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email Address"
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
              className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-slate-400">
              <EyeOff className="h-5 w-5" />
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
            {isLoading
              ? "Loading..."
              : activeTab === "login"
                ? "Login"
                : "Create Account"}{" "}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
