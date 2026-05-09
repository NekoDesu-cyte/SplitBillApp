import React, { useState } from "react";
import {
  Bell,
  Settings,
  Copy,
  X,
  LayoutGrid,
  List,
  Minus,
  Plus,
  ShoppingBag,
  Lock,
} from "lucide-react";

export const RoomDetail: React.FC<{
  onBack: () => void;
  onPay: () => void;
}> = ({ onBack, onPay }) => {
  // Dummy data untuk partisipan
  const participants = [
    {
      id: 1,
      name: "Alex",
      role: "OWNER",
      status: "Online",
      avatar: "https://i.pravatar.cc/150?u=alex",
    },
    {
      id: 2,
      name: "Jordan",
      role: "JOINED",
      status: "Online",
      avatar: "https://i.pravatar.cc/150?u=jordan",
    },
    {
      id: 3,
      name: "Sarah",
      role: "JOINED",
      status: "Online",
      avatar: "https://i.pravatar.cc/150?u=sarah",
    },
  ];

  // Dummy data untuk menu pesanan
  const menuItems = [
    {
      id: 1,
      name: "Nasi Goreng Seafood",
      price: 45000,
      img: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=200&q=80",
      claimedBy: [
        "https://i.pravatar.cc/150?u=jordan",
        "https://i.pravatar.cc/150?u=sarah",
      ],
      qty: 1,
    },
    {
      id: 2,
      name: "Sate Ayam (10 Tusuk)",
      price: 35000,
      img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=200&q=80",
      claimedBy: [],
      qty: 0,
    },
    {
      id: 3,
      name: "Es Teh Manis",
      price: 12000,
      img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=200&q=80",
      claimedBy: ["https://i.pravatar.cc/150?u=alex"],
      qty: 2,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-slate-800 pb-20">
      {/* Navbar Minimalis */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          {/* Logo bisa diklik untuk onBack */}
          <div className="flex items-center cursor-pointer" onClick={onBack}>
            <span className="font-display font-extrabold text-xl tracking-tight text-[#4f46e5]">
              BagiBayar
            </span>
          </div>
          <div className="flex items-center gap-5 text-slate-500">
            <button className="hover:text-slate-800 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 ml-2">
              <img
                src="https://i.pravatar.cc/150?u=alex"
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Header Title */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
            Room Detail - Liburan di Pantai
          </h1>
          <p className="text-sm text-slate-500">
            Kelola tagihan bersama teman-temanmu dengan transparan.
          </p>
        </div>

        {/* Banner Undang Teman */}
        <div className="bg-[#5b51d8] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 shadow-sm">
          <div className="text-white">
            <span className="text-xs font-semibold tracking-wider text-indigo-200 block mb-2">
              UNDANG TEMAN
            </span>
            <h2 className="text-xl md:text-2xl font-bold mb-1">
              Ajak teman untuk bergabung!
            </h2>
            <p className="text-sm text-indigo-100 opacity-90">
              Bagikan kode unik ruangan ini untuk mulai membagi tagihan.
            </p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-xl p-4 flex items-center gap-6 backdrop-blur-sm shrink-0 w-full md:w-auto justify-between">
            <div>
              <span className="text-[10px] font-medium text-indigo-200 block mb-0.5">
                ROOM CODE
              </span>
              <span className="text-2xl font-extrabold text-white tracking-widest">
                8824
              </span>
            </div>
            <button className="bg-white text-[#5b51d8] hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
              <Copy className="w-4 h-4" /> Copy Link
            </button>
          </div>
        </div>

        {/* Partisipan Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 tracking-wider block mb-4">
            PARTISIPAN
          </span>
          <div className="space-y-4 mb-6">
            {participants.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">
                      {p.name}
                    </div>
                    <div
                      className={`text-[10px] font-bold mt-0.5 ${p.role === "OWNER" ? "text-[#4f46e5]" : "text-slate-400"}`}
                    >
                      {p.role}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-[11px] font-semibold text-green-500">
                    {p.status}
                  </span>
                  <button className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors">
                    <X className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full bg-[#f8f9fa] hover:bg-slate-100 text-slate-600 text-sm font-semibold py-3 rounded-xl transition-colors border border-slate-100">
            Invite Friends
          </button>
        </div>

        {/* Grid Layout untuk Menu dan Pesanan Saya */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Kiri: Daftar Menu */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-slate-900">
                Pilih Pesanan Anda
              </h2>
            </div>

            <div className="space-y-4">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-sm transition-shadow"
                >
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0 border border-slate-100"
                  />

                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-base">
                      {item.name}
                    </h3>
                    <div className="text-[#4f46e5] font-semibold text-sm mt-1 mb-3">
                      Rp {item.price.toLocaleString("id-ID")}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">
                        Diklaim oleh:
                      </span>
                      {item.claimedBy.length > 0 ? (
                        <div className="flex -space-x-2">
                          {item.claimedBy.map((avatar, idx) => (
                            <img
                              key={idx}
                              src={avatar}
                              alt="Avatar"
                              className="w-5 h-5 rounded-full border border-white"
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          Belum ada yang memilih item ini
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex justify-end mt-2 sm:mt-0">
                    {item.qty > 0 ? (
                      <div className="flex items-center gap-3 bg-slate-50 rounded-full p-1 border border-slate-200">
                        <button className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-600 hover:text-[#4f46e5] border border-slate-200">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold text-slate-800 w-4 text-center">
                          {item.qty}
                        </span>
                        <button className="w-7 h-7 bg-[#5b51d8] rounded-full flex items-center justify-center shadow-sm text-white hover:bg-indigo-700">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button className="px-5 py-2 rounded-full border border-[#4f46e5] text-[#4f46e5] text-xs font-bold hover:bg-indigo-50 transition-colors">
                        Tambah
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kanan: Pesanan Saya (Sticky Card) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sticky top-24 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-[#4f46e5]">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">
                  Pesanan Saya
                </h3>
              </div>

              {/* Rincian Pesanan */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[13px] font-bold text-slate-800">
                      Nasi Goreng Seafood
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      1x Rp 45.000
                    </div>
                  </div>
                  <div className="text-[13px] font-bold text-slate-800">
                    Rp 45.000
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-[13px] font-bold text-slate-800">
                      Es Teh Manis
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      2x Rp 12.000
                    </div>
                  </div>
                  <div className="text-[13px] font-bold text-slate-800">
                    Rp 24.000
                  </div>
                </div>
              </div>

              <hr className="border-dashed border-slate-200 mb-4" />

              {/* Subtotal & Pajak */}
              <div className="space-y-2.5 mb-6 text-[13px]">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="text-slate-800">Rp 69.000</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Pajak (10%)</span>
                  <span className="text-slate-800">Rp 6.900</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Biaya Layanan (5%)</span>
                  <span className="text-slate-800">Rp 3.450</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-8">
                <span className="font-bold text-slate-900">Total</span>
                <span className="text-xl font-bold text-[#4f46e5]">
                  Rp 79.350
                </span>
              </div>

              <button
                onClick={onPay}
                className="w-full bg-[#5b51d8] hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-colors mb-4 text-sm"
              >
                Konfirmasi & Bayar
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                <Lock className="w-3 h-3" />
                <span>Pembayaran aman & transparan</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
