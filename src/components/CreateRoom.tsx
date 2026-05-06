import React, { useState } from "react";
import { ArrowRight, Receipt, Plus, Wand2 } from "lucide-react";

interface Item {
  id: number;
  name: string;
  price: number;
}

export const CreateRoom: React.FC<{
  onBack: () => void;
  onCreate: () => void;
}> = ({ onBack, onCreate }) => {
  // State disesuaikan dengan data pada gambar referensi
  const [items, setItems] = useState<Item[]>([
    { id: 1, name: "Salmon Mentai Roll", price: 85000 },
    { id: 2, name: "Ocha (Cold)", price: 12000 },
  ]);

  const [tax, setTax] = useState<number>(10);
  const [service, setService] = useState<number>(5);

  // Perhitungan otomatis
  const subtotal = items.reduce((acc, item) => acc + item.price, 0);
  const totalTax = (subtotal * tax) / 100;
  const totalService = (subtotal * service) / 100;
  const totalAkhir = subtotal + totalTax + totalService;

  // Helper untuk format rupiah
  const formatRp = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20 font-sans text-slate-800">
      {/* Header Minimalis */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-center relative">
          <span className="font-display font-extrabold text-xl tracking-tight text-[#4f46e5]">
            SplitBill
          </span>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-10">
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 sm:p-10">
          
          {/* Judul & Subjudul */}
          <div className="text-center mb-10">
            <h1 className="text-[1.75rem] font-bold mb-3 text-slate-900 tracking-tight">Buat Ruangan</h1>
            <p className="text-slate-500 text-sm font-medium">
              Atur tagihan dan undang teman untuk patungan.
            </p>
          </div>

          <div className="space-y-7">
            {/* Input Nama Ruangan */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-2.5">
                Nama Ruangan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Misal: Makan Malam di Sushi Tei"
                className="w-full px-4 py-3.5 rounded-xl bg-[#fafafa] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] transition-all text-sm placeholder:text-slate-400"
              />
            </div>

            {/* Unggah Struk Section */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-2.5">
                Unggah Struk
              </label>
              <div className="border-2 border-dashed border-[#d1d5db] rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-[#fafafa] hover:bg-slate-50 transition-colors cursor-pointer">
                <Receipt className="w-8 h-8 text-slate-500" strokeWidth={1.5} />
                <p className="text-[13px] font-medium text-slate-500">
                  Klik atau tarik file struk ke sini
                </p>
                <button className="mt-2 bg-[#eef2ff] text-[#4f46e5] hover:bg-indigo-100 transition-colors px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2">
                  <Wand2 className="w-4 h-4" /> Ekstrak Item
                </button>
              </div>
            </div>

            {/* Daftar Item Section */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <label className="block text-[13px] font-semibold text-slate-700">
                  Daftar Item
                </label>
                <button className="text-[#4f46e5] hover:text-indigo-700 text-[13px] font-semibold flex items-center gap-1">
                  <Plus className="w-[14px] h-[14px]" strokeWidth={2.5} /> Tambah Item
                </button>
              </div>
              
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="bg-[#f3f4f6] px-4 py-3 flex justify-between text-xs font-semibold text-slate-600">
                  <span>Item</span>
                  <span>Harga</span>
                </div>
                <div>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="px-4 py-3.5 flex justify-between text-sm border-t border-slate-100"
                    >
                      <span className="text-slate-700 font-medium">{item.name}</span>
                      <span className="text-slate-700 font-medium">{formatRp(item.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Input Pajak dan Servis */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-2.5">
                  Pajak (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={tax}
                    onChange={(e) => setTax(Number(e.target.value))}
                    className="w-full pl-4 pr-10 py-3.5 rounded-xl bg-[#fafafa] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] transition-all text-sm font-medium"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                    %
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-2.5">
                  Servis (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={service}
                    onChange={(e) => setService(Number(e.target.value))}
                    className="w-full pl-4 pr-10 py-3.5 rounded-xl bg-[#fafafa] border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] transition-all text-sm font-medium"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Summary Box */}
            <div className="bg-[#f5f6ff] rounded-xl p-5 mt-2 space-y-1.5">
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-slate-500 font-medium">Subtotal</span>
                <span className="text-slate-500 font-semibold">{formatRp(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-lg font-bold text-slate-900">Total Akhir</span>
                <span className="text-xl font-bold text-slate-900">{formatRp(totalAkhir)}</span>
              </div>
            </div>

            {/* Tombol Buat Ruangan */}
            <button
              onClick={onCreate}
              className="w-full bg-[#4f46e5] hover:bg-indigo-700 text-white font-semibold text-[15px] py-4 rounded-xl flex items-center justify-center gap-2 transition-colors mt-6"
            >
              Buat Ruangan <ArrowRight className="w-4 h-4" />
            </button>
            
          </div>
        </div>
      </div>
    </div>
  );
};