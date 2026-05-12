import React, { useState, useRef } from "react";
import {
  ArrowRight,
  Receipt,
  Plus,
  Wand2,
  ArrowLeft,
  Trash2,
  Info,
  AlertCircle,
  Pencil,
  Camera,
  Image as ImageIcon,
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
  const [eWalletNumber, setEWalletNumber] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrSuccess, setOcrSuccess] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  
  const nameInputRef = useRef<HTMLInputElement>(null);
  const eWalletInputRef = useRef<HTMLInputElement>(null);

  const [isExtracting, setIsExtracting] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null); // <-- Ref untuk kamera
  const galleryInputRef = useRef<HTMLInputElement>(null); // <-- Ref untuk galeri

  // Fungsi untuk kirim foto ke Backend
  const handleUploadStruk = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setOcrError(null);
    setOcrSuccess(null);

    const formData = new FormData();
    formData.append("receipt", file);

    try {
      const res = await fetch("https://splitbill-backend-804441447131.asia-southeast2.run.app/api/ocr", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.items && data.items.length > 0) {
        const scannedItems = data.items.map((it: any, index: number) => ({
          id: Date.now() + index,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
        }));
        setItems([...items, ...scannedItems]);
        setOcrSuccess(`Berhasil menemukan ${scannedItems.length} menu!`); 
      } else {
        setOcrError("Tidak ada teks menu yang terdeteksi."); 
      }
    } catch (err) {
      setOcrError("Gagal mengekstrak struk. Coba lagi nanti.");
    } finally {
      setIsExtracting(false);
      if (cameraInputRef.current) cameraInputRef.current.value = ""; // Reset input kamera
      if (galleryInputRef.current) galleryInputRef.current.value = ""; // Reset input galeri
    }
  };

  // --- STATE UNTUK MODAL TAMBAH ITEM ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
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

  const handleEditClick = (item: Item) => {
    setEditingItemId(item.id);
    setNewItemName(item.name);
    setNewItemPrice(item.price.toString());
    setNewItemQty(item.quantity);
    setModalError(null);
    setIsModalOpen(true);
  };

  // --- FUNGSI SIMPAN ITEM DARI MODAL ---
  const handleAddItem = () => {
    if (!newItemName || !newItemPrice) {
      setModalError("Isi nama dan harga item dulu, ya!");
      return;
    }

    const parsedPrice = parseInt(String(newItemPrice).replace(/\D/g, ""));

    if (editingItemId !== null) {
      // Logika untuk EDIT item
      setItems(
        items.map((item) =>
          item.id === editingItemId
            ? {
                ...item,
                name: newItemName,
                price: parsedPrice,
                quantity: newItemQty,
              }
            : item,
        ),
      );
    } else {
      // Logika untuk TAMBAH item baru
      const newItem: Item = {
        id: Date.now(),
        name: newItemName,
        price: parsedPrice,
        quantity: newItemQty,
      };
      setItems([...items, newItem]);
    }

    // Reset & Close Modal
    setNewItemName("");
    setNewItemPrice("");
    setNewItemQty(1);
    setEditingItemId(null);
    setModalError(null);
    setIsModalOpen(false);
  };

  const handleCreate = async () => {
    if (!name) {
      setFormError("Nama ruangan jangan lupa diisi!");
      if (nameInputRef.current) {
        nameInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        nameInputRef.current.focus();
      }
      return;
    }

    if (!eWalletNumber) {
      setFormError("Nomor E-Wallet wajib diisi untuk mempermudah pembayaran!");
      if (eWalletInputRef.current) {
        eWalletInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        eWalletInputRef.current.focus();
      }
      return;
    }

    setIsLoading(true);
    setFormError(null);

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const payload = {
      name,
      hostId: user.id || "guest-host",
      code: Math.floor(1000 + Math.random() * 9000).toString(),
      taxPercent: tax,
      servicePercent: service,
      paymentInfo: { provider: "E-Wallet", accountNumber: eWalletNumber || "Belum diisi" },
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
      const res = await fetch("https://splitbill-backend-804441447131.asia-southeast2.run.app/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      onCreate(data.id);
    } catch (e) {
      setFormError("Gagal membuat ruangan. Periksa koneksi Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 1. Background utama PC (Abu-abu, konten terpusat)
    <div className="min-h-screen bg-slate-100 flex justify-center font-sans text-slate-800 overflow-x-hidden">
      {/* 2. Kontainer Mobile (Maksimal 480px) */}
      <div className="w-full max-w-[480px] bg-white min-h-screen shadow-2xl relative flex flex-col pb-10">
        {/* MODAL TAMBAH ITEM */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => {
                setIsModalOpen(false);
                setEditingItemId(null);
              }}></div>
            <div className="relative bg-white w-full max-w-[360px] rounded-[2rem] p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-1.5">
                  {editingItemId !== null ? "Edit Item" : "Tambah Item"}{" "}
                </h2>
                <p className="text-slate-500 text-[11px] px-2 leading-relaxed">
                  {editingItemId !== null
                    ? "Perbarui nama, harga, atau jumlah item pesanan."
                    : "Tambahkan item yang tidak terbaca oleh sistem atau input secara manual."}
                </p>
              </div>

              <div className="space-y-4">
                {/* Input Nama Item */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Nama Item
                  </label>
                  <input
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Misal: Nasi Goreng"
                    className="w-full px-4 py-3 rounded-xl bg-[#fafafa] border border-slate-200 focus:border-[#4f46e5] outline-none text-sm font-medium transition-all"
                  />
                </div>

                {/* Input Harga & Jumlah */}
                <div className="flex gap-3">
                  <div className="space-y-1.5 flex-[2]">
                    <label className="text-xs font-semibold text-slate-700">
                      Harga
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                        Rp
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={newItemPrice}
                        onChange={(e) => setNewItemPrice(e.target.value.replace(/\D/g, ""))}
                        placeholder="45000"
                        className="w-full pl-9 pr-3 py-3 rounded-xl bg-[#fafafa] border border-slate-200 focus:border-[#4f46e5] outline-none text-sm font-bold transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Jumlah
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newItemQty}
                      onChange={(e) => setNewItemQty(Number(e.target.value))}
                      className="w-full px-2 py-3 rounded-xl bg-[#fafafa] border border-slate-200 focus:border-[#4f46e5] outline-none text-sm font-bold text-center transition-all"
                    />
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex gap-2.5 items-start mt-2">
                  <div className="w-4 h-4 bg-[#4f46e5] text-white rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Info size={10} />
                  </div>
                  <p className="text-[11px] text-indigo-700 leading-relaxed font-medium">
                    Item ini akan langsung ditambahkan ke daftar tagihan room
                    Anda.
                  </p>
                </div>

                {modalError && (
                  <div className="text-red-500 text-xs font-bold text-center mt-2">
                    {modalError}
                  </div>
                )}

                {/* Buttons */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={handleAddItem}
                    className="w-full bg-[#4f46e5] text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-indigo-700 active:scale-95 transition-all">
                    <Plus size={16} />{" "}
                    {editingItemId !== null
                      ? "Simpan Perubahan"
                      : "Simpan Item"}
                  </button>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingItemId(null);
                    }}
                    className="w-full py-3 text-slate-400 font-semibold text-xs hover:text-slate-600 transition-colors">
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navbar / Header Minimalis */}
        <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 w-full">
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
        <div className="px-5 pt-8 pb-10 flex-1">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-1.5 text-slate-900 tracking-tight">
              Buat Ruangan
            </h1>
            <p className="text-slate-500 text-xs font-medium px-4">
              Atur tagihan dan undang teman untuk patungan.
            </p>
          </div>

          <div className="space-y-6">
            {/* Input Nama Ruangan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Nama Ruangan <span className="text-red-500">*</span>
              </label>
              <input
                ref={nameInputRef}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (formError) setFormError(null);
                }}
                type="text"
                placeholder="Misal: Makan Malam di Sushi Tei"
                className="w-full px-4 py-3.5 rounded-xl bg-[#fafafa] border border-slate-200 focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none transition-all text-sm font-bold"
              />
            </div>

            {/* Unggah Struk Section */}
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-2.5">
                Scan Struk (Otomatis deteksi menu AI)
              </label>

              {/* Input File Tersembunyi (Satu untuk Kamera, Satu untuk Galeri) */}
              <input
                type="file"
                accept="image/*"
                capture="environment" // <-- INI KUNCI UNTUK LANGSUNG BUKA KAMERA BELAKANG
                ref={cameraInputRef}
                onChange={handleUploadStruk}
                className="hidden"
              />
              <input
                type="file"
                accept="image/*"
                ref={galleryInputRef}
                onChange={handleUploadStruk}
                className="hidden"
              />

              <div
                className={`border-2 border-dashed border-[#d1d5db] rounded-2xl p-5 bg-[#fafafa] transition-all ${isExtracting ? "border-[#4f46e5] bg-indigo-50/50" : ""}`}>
                {isExtracting ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-6">
                    <Wand2
                      className="w-8 h-8 text-[#4f46e5] animate-spin"
                      strokeWidth={1.5}
                    />
                    <div className="text-center">
                      <p className="text-[13px] font-bold text-[#4f46e5]">
                        Sedang Membaca Struk...
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        AI sedang mengekstrak nama dan harga menu.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-3 w-full mb-4">
                      {/* Tombol Buka Kamera */}
                      <button
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex-1 bg-white border border-slate-200 rounded-xl py-4 flex flex-col items-center gap-2 hover:border-[#4f46e5] hover:text-[#4f46e5] text-slate-600 transition-all shadow-sm active:scale-95">
                        <Camera className="w-7 h-7" strokeWidth={1.5} />
                        <span className="text-xs font-bold">Ambil Foto</span>
                      </button>

                      {/* Tombol Buka Galeri */}
                      <button
                        onClick={() => galleryInputRef.current?.click()}
                        className="flex-1 bg-white border border-slate-200 rounded-xl py-4 flex flex-col items-center gap-2 hover:border-[#4f46e5] hover:text-[#4f46e5] text-slate-600 transition-all shadow-sm active:scale-95">
                        <ImageIcon className="w-7 h-7" strokeWidth={1.5} />
                        <span className="text-xs font-bold">Dari Galeri</span>
                      </button>
                    </div>
                    <div className="bg-slate-100 rounded-lg p-2.5 flex items-start gap-2">
                      <Info className="w-4 h-4 text-slate-400 shrink-0" />
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Pastikan foto struk berada di tempat terang, tidak
                        buram, dan teks terbaca jelas agar AI dapat bekerja
                        maksimal.
                      </p>
                    </div>
                  </>
                )}
              </div>
              
              {ocrError && (
                <div className="mt-3 flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 animate-in fade-in duration-300">
                  <AlertCircle size={14} />
                  <span className="text-[11px] font-bold">{ocrError}</span>
                </div>
              )}
              {ocrSuccess && (
                <div className="mt-3 flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-xl border border-emerald-100 animate-in fade-in duration-300">
                  <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold">{ocrSuccess}</span>
                </div>
              )}
            </div>
          </div>

          {/* Daftar Item Section */}
          <div>
            <div className="flex justify-between items-end mb-3">
              <label className="block text-xs font-bold text-slate-700">
                Daftar Pesanan
              </label>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-[#4f46e5] hover:bg-indigo-100 text-[11px] font-bold flex items-center gap-1 bg-indigo-50 px-2.5 py-1.5 rounded-md transition-all">
                <Plus className="w-3 h-3" strokeWidth={2.5} /> Tambah Item
              </button>
            </div>

            <div className="space-y-2.5">
              {items.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs bg-[#fafafa]">
                  Belum ada pesanan yang ditambahkan.
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-xl p-3.5 flex justify-between items-center shadow-sm">
                    <div>
                      <div className="text-[13px] font-bold text-slate-800">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-[#4f46e5] font-bold mt-0.5">
                        {item.quantity}x {formatRp(item.price)}
                      </div>
                    </div>
                    {/* --- UPDATE BAGIAN BUTTONS INI --- */}
                    <div className="flex items-center gap-1.5">
                      <div className="text-[13px] font-black text-slate-900 mr-2">
                        {formatRp(item.price * item.quantity)}
                      </div>

                      {/* Tombol Edit */}
                      <button
                        onClick={() => handleEditClick(item)}
                        className="text-amber-500 hover:text-amber-600 bg-amber-50 p-1.5 rounded-md transition-colors"
                        title="Edit Item">
                        <Pencil size={14} />
                      </button>

                      {/* Tombol Hapus */}
                      <button
                        onClick={() =>
                          setItems(items.filter((it) => it.id !== item.id))
                        }
                        className="text-red-400 hover:text-red-600 bg-red-50 p-1.5 rounded-md transition-colors"
                        title="Hapus Item">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pajak & Servis */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Pajak (%)
              </label>
              <input
                type="number"
                value={tax}
                onChange={(e) => setTax(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-[#fafafa] border border-slate-200 outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] text-sm font-bold transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Biaya Layanan (%)
              </label>
              <input
                type="number"
                value={service}
                onChange={(e) => setService(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl bg-[#fafafa] border border-slate-200 outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] text-sm font-bold transition-all"
              />
            </div>
          </div>

          {/* Nomor E-Wallet */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Nomor E-Wallet (Dana / GoPay / OVO) <span className="text-red-500">*</span>
            </label>
            <input
              ref={eWalletInputRef}
              type="text"
              value={eWalletNumber}
              onChange={(e) => {
                setEWalletNumber(e.target.value);
                if (formError) setFormError(null);
              }}
              placeholder="Misal: 081234567890"
              className="w-full px-4 py-3 rounded-xl bg-[#fafafa] border border-slate-200 outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] text-sm font-bold transition-all"
            />
          </div>

          {/* Ringkasan Biaya */}
          <div className="bg-[#f8f9fa] border border-slate-200 rounded-xl p-4 mt-2">
            <div className="flex justify-between items-center text-xs mb-3">
              <span className="text-slate-500 font-medium">Subtotal</span>
              <span className="text-slate-700 font-bold">
                {formatRp(subtotal)}
              </span>
            </div>

            {/* RINCIAN PAJAK & LAYANAN (DITAMBAHKAN KEMBALI) */}
            <div className="space-y-2 mb-4 border-t border-dashed border-slate-200 pt-3">
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Pajak ({tax}%)</span>
                <span>{formatRp((subtotal * tax) / 100)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Layanan ({service}%)</span>
                <span>{formatRp((subtotal * service) / 100)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              <span className="text-sm font-bold text-slate-900">
                Total Akhir
              </span>
              <span className="text-xl font-black text-[#4f46e5]">
                {formatRp(totalAkhir)}
              </span>
            </div>
          </div>

          {/* Letakkan ini tepat sebelum tombol "Buat Ruangan Sekarang" */}
          <div className="mt-6">
            {formError && (
              <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3.5 rounded-xl animate-in slide-in-from-top-2 duration-300 mb-4 border border-red-100">
                <AlertCircle size={16} />
                <span className="text-[11px] font-bold leading-tight">
                  {formError}
                </span>
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={isLoading || isExtracting}
              className="w-full bg-[#4f46e5] hover:bg-indigo-700 text-white font-bold text-sm py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Buat Ruangan Sekarang <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
