import React, { useState } from "react";
import {
  ArrowRight,
  Receipt,
  Plus,
  Wand2,
  ArrowLeft,
  Minus,
  Trash2,
  Info,
  X,
} from "lucide-react";

interface Item {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export const CreateRoom: React.FC<{
  onBack: () => void;
  onCreate: (roomId: string) => void;
}> = ({ onBack, onCreate }) => {
  const [name, setName] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [tax, setTax] = useState<number>(10);
  const [service, setService] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);

  // --- STATE UNTUK MODAL TAMBAH ITEM ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState<string>("");
  const [newItemQty, setNewItemQty] = useState<number>(1);

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const totalAkhir =
    subtotal + (subtotal * tax) / 100 + (subtotal * service) / 100;

  const formatRp = (amount: number) => `Rp ${amount.toLocaleString("id-ID")}`;

  // --- FUNGSI SIMPAN ITEM DARI MODAL ---
  const handleAddItem = () => {
    if (!newItemName || !newItemPrice) return alert("Isi nama dan harga item!");

    const newItem: Item = {
      id: Date.now(),
      name: newItemName,
      price: parseInt(newItemPrice.replace(/\D/g, "")),
      quantity: newItemQty,
    };

    setItems([...items, newItem]);
    // Reset & Close Modal
    setNewItemName("");
    setNewItemPrice("");
    setNewItemQty(1);
    setIsModalOpen(false);
  };

  const handleCreate = async () => {
    if (!name) return alert("Nama ruangan harus diisi!");
    setIsLoading(true);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const payload = {
      name,
      hostId: user.id || "guest-host",
      code: Math.floor(1000 + Math.random() * 9000).toString(),
      taxPercent: tax,
      servicePercent: service,
      paymentInfo: { provider: "QRIS", accountNumber: "123456789" },
      items: items.map((it) => ({
        name: it.name,
        price: it.price,
        quantity: it.quantity,
      })),
      hostPart: {
        id: user.id || "guest-host",
        name: user.name || "Tuan Rumah",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Host",
      },
    };

    try {
      const res = await fetch("http://localhost:5000/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      onCreate(data.id);
    } catch (e) {
      alert("Gagal membuat ruangan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20 font-sans text-slate-800">
      {/* MODAL TAMBAH ITEM (SESUAI GAMBAR) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Tambah Item
              </h2>
              <p className="text-slate-500 text-sm">
                Tambahkan item yang tidak terbaca oleh sistem atau input secara
                manual.
              </p>
            </div>

            <div className="space-y-5">
              {/* Input Nama Item */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Nama Item
                </label>
                <input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Misal: Nasi Goreng"
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-[#4f46e5] outline-none font-medium"
                />
              </div>

              {/* Input Harga & Jumlah */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Harga
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      Rp
                    </span>
                    <input
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value)}
                      placeholder="45.000"
                      className="w-full pl-11 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-[#4f46e5] outline-none font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Jumlah
                  </label>
                  <input
                    type="number"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(Number(e.target.value))}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-[#4f46e5] outline-none font-bold text-center"
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-3 items-start">
                <div className="w-5 h-5 bg-[#4f46e5] text-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <Info size={12} />
                </div>
                <p className="text-[13px] text-indigo-700 leading-relaxed">
                  Item ini akan langsung ditambahkan ke daftar tagihan room
                  Anda.
                </p>
              </div>

              {/* Buttons */}
              <button
                onClick={handleAddItem}
                className="w-full bg-[#4f46e5] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">
                <Plus size={20} /> Simpan Item
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full text-slate-400 font-semibold text-sm hover:text-slate-600 transition-colors">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER UTAMA */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center relative px-6">
          <button
            onClick={onBack}
            className="absolute left-4 md:left-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="font-display font-extrabold text-xl tracking-tight text-[#4f46e5]">
            BagiBayar
          </span>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-10">
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 sm:p-10">
          <div className="text-center mb-10">
            <h1 className="text-[1.75rem] font-bold mb-3 text-slate-900 tracking-tight">
              Buat Ruangan
            </h1>
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Misal: Makan Malam di Sushi Tei"
                className="w-full px-4 py-3.5 rounded-xl bg-[#fafafa] border border-slate-200 focus:border-[#4f46e5] outline-none transition-all text-sm font-bold"
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
                {/* BUTTON UNTUK MEMBUKA MODAL */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-[#4f46e5] hover:text-indigo-700 text-[13px] font-bold flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg transition-all">
                  <Plus className="w-[14px] h-[14px]" strokeWidth={2.5} />{" "}
                  Tambah Item
                </button>
              </div>

              <div className="space-y-3">
                {items.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                    Belum ada item.
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center shadow-sm">
                      <div>
                        <div className="text-sm font-bold text-slate-800">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-[#4f46e5] font-bold mt-1">
                          {item.quantity}x {formatRp(item.price)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-black text-slate-900">
                          {formatRp(item.price * item.quantity)}
                        </div>
                        <button
                          onClick={() =>
                            setItems(items.filter((it) => it.id !== item.id))
                          }
                          className="text-red-400 hover:text-red-600 p-1">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pajak & Servis */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-2.5">
                  Pajak (%)
                </label>
                <input
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(Number(e.target.value))}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#fafafa] border border-slate-200 outline-none focus:border-[#4f46e5] font-bold"
                />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-2.5">
                  Servis (%)
                </label>
                <input
                  type="number"
                  value={service}
                  onChange={(e) => setService(Number(e.target.value))}
                  className="w-full px-4 py-3.5 rounded-xl bg-[#fafafa] border border-slate-200 outline-none focus:border-[#4f46e5] font-bold"
                />
              </div>
            </div>

            <div className="bg-[#f5f6ff] rounded-xl p-5 mt-2 space-y-1.5">
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-slate-500 font-medium">Subtotal</span>
                <span className="text-slate-500 font-semibold">
                  {formatRp(subtotal)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-lg font-bold text-slate-900">
                  Total Akhir
                </span>
                <span className="text-xl font-bold text-[#4f46e5]">
                  {formatRp(totalAkhir)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={isLoading}
              className="w-full bg-[#4f46e5] hover:bg-indigo-700 text-white font-bold text-[15px] py-4 rounded-2xl flex items-center justify-center gap-2 transition-all mt-6 disabled:opacity-50 shadow-lg shadow-indigo-100">
              {isLoading ? "Membuat..." : "Buat Ruangan"}{" "}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
