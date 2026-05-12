import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Clock,
  QrCode,
  CheckCircle2,
  ChevronRight,
  Download,
  Share2,
  Info,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  CreditCard,
  Building2,
  Wallet,
} from "lucide-react";

// Pastikan roomId dikirim dari App.tsx agar bisa fetch data dari backend
export const Payment: React.FC<{ roomId: string; onBack: () => void }> = ({
  roomId,
  onBack,
}) => {
  // State untuk UI Accordion
  const [isMbankingOpen, setIsMbankingOpen] = useState(true);
  const [isAtmOpen, setIsAtmOpen] = useState(false);

  // State untuk Backend & Fungsionalitas Pembayaran
  const [totalTagihan, setTotalTagihan] = useState(0);
  const [myItems, setMyItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [service, setService] = useState(0);
  const [paymentAccount, setPaymentAccount] = useState<string>("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [timeLeft, setTimeLeft] = useState<string>("--:--:--");
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  // Timer Countdown Effect
  useEffect(() => {
    if (remainingSeconds === null) return;
    
    let currentSeconds = remainingSeconds;
    
    // Set initial display immediately
    const h = Math.floor(currentSeconds / 3600);
    const m = Math.floor((currentSeconds % 3600) / 60);
    const s = Math.floor(currentSeconds % 60);
    setTimeLeft(
      `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    );

    const interval = setInterval(() => {
      currentSeconds = Math.max(0, currentSeconds - 1);
      
      const h = Math.floor(currentSeconds / 3600);
      const m = Math.floor((currentSeconds % 3600) / 60);
      const s = Math.floor(currentSeconds % 60);
      
      setTimeLeft(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingSeconds]);

  // Logic untuk mengambil total tagihan berdasarkan item yang di-claim user
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }

    const fetchPaymentData = async () => {
      try {
        let myClientId = localStorage.getItem("splitbill_client_id") || "guest";
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          myClientId = String(JSON.parse(savedUser).id);
        }
        const res = await fetch(`https://splitbill-backend-804441447131.asia-southeast2.run.app/api/rooms/${roomId}`);

        if (!res.ok) throw new Error("Gagal mengambil data");
        const data = await res.json();

        setPaymentAccount(data.payment_account || data.paymentAccount || "");
        if (data.remainingSeconds !== undefined) {
          setRemainingSeconds(data.remainingSeconds);
        }

        const items = (data.items || [])
          .map((it: any) => ({
            ...it,
            myQty: (it.claims || {})[myClientId] || 0,
          }))
          .filter((it: any) => it.myQty > 0);
          
        setMyItems(items);

        const sub = items.reduce(
          (acc: number, it: any) => acc + it.price * it.myQty,
          0,
        );
        setSubtotal(sub);

        // Memastikan penamaan properti persentase pajak dan servis sesuai dari backend
        const taxPercent = data.taxPercent || data.tax_percent || 0;
        const servicePercent = data.servicePercent || data.service_percent || 0;
        
        setTax((sub * taxPercent) / 100);
        setService((sub * servicePercent) / 100);

        setTotalTagihan(
          sub + (sub * taxPercent) / 100 + (sub * servicePercent) / 100,
        );
      } catch (error) {
        console.error("Error fetching payment:", error);
      }
    };

    if (roomId) {
      fetchPaymentData();
    }
  }, [roomId]);

  // Logic konfirmasi tombol bayar
  const handlePay = async () => {
    setIsConfirming(true);
    try {
      // --- FIX LOGIKA IDENTITAS ---
      const savedUser = localStorage.getItem("user");
      let clientId = localStorage.getItem("splitbill_client_id") || "guest";
      let participantName =
        localStorage.getItem(`guest_name_${roomId}`) || "User";

      // Jika user sudah login (Host), gunakan ID dan Nama aslinya!
      if (savedUser) {
        const user = JSON.parse(savedUser);
        clientId = String(user.id);
        participantName = user.name;
      }

      await fetch(`https://splitbill-backend-804441447131.asia-southeast2.run.app/api/rooms/${roomId}/pay`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          participantName,
        }),
      });

      setIsSuccess(true);
      setTimeout(() => onBack(), 2000); // Kembali ke halaman sebelumnya setelah 2 detik
    } catch (error) {
      console.error(error);
      setIsConfirming(false);
    }
  };

  return (
    // =========================================================================
    // 1. Pembungkus Utama (Background PC)
    // =========================================================================
    <div className="min-h-screen bg-slate-100 flex justify-center font-sans text-slate-800">
      {/* =========================================================================
          2. Kontainer Mobile (Layar HP)
          ========================================================================= */}
      <div className="w-full max-w-[480px] bg-[#f8f9fa] min-h-screen shadow-2xl relative flex flex-col pb-6">
        {/* Header */}
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 w-full">
          <div className="px-4 h-16 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 -ml-2 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-full transition-all flex items-center justify-center">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-base font-bold text-slate-800">Pembayaran</h1>
            </div>

            <div className="flex items-center gap-1.5 bg-red-50 text-red-500 px-2.5 py-1 rounded-full shrink-0 border border-red-100">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold tracking-wide">
                {timeLeft}
              </span>
            </div>
          </div>
        </nav>

        {/* Konten Utama */}
        <div ref={scrollRef} className="px-4 py-6 overflow-y-auto flex-1 scroll-smooth">
          <div className="flex flex-col gap-6">
            {/* --- RINCIAN PESANAN DAN KARTU TOTAL TAGIHAN --- */}
            <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm">
              <h3 className="text-[13px] font-bold text-slate-800 mb-4 tracking-widest uppercase text-center border-b border-slate-100 pb-3">
                Rincian Tagihan Kamu
              </h3>
              
              <div className="space-y-3 mb-4">
                {myItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div>
                      <div className="font-bold text-slate-700">{item.name}</div>
                      <div className="text-[11px] text-slate-500">{item.myQty}x Rp {item.price.toLocaleString("id-ID")}</div>
                    </div>
                    <div className="font-bold text-slate-800">
                      Rp {(item.price * item.myQty).toLocaleString("id-ID")}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-3 border-t border-dashed border-slate-200 mb-4">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Subtotal</span>
                  <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Pajak</span>
                    <span>Rp {tax.toLocaleString("id-ID")}</span>
                  </div>
                )}
                {service > 0 && (
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Layanan</span>
                    <span>Rp {service.toLocaleString("id-ID")}</span>
                  </div>
                )}
              </div>

              <div className="text-center pt-4 border-t border-slate-100">
                <h3 className="text-[11px] font-bold text-slate-400 mb-1.5 tracking-widest uppercase">
                  TOTAL TAGIHAN KAMU
                </h3>
                <div className="text-3xl font-black text-[#4f46e5]">
                  Rp {totalTagihan.toLocaleString("id-ID")}
                </div>
              </div>
            </div>

            {/* 1. Metode Pembayaran Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-4">
                Metode Pembayaran
              </h2>

              {/* Selected Method (E-Wallet) */}
              <div className="border border-[#4f46e5] bg-indigo-50/30 rounded-xl p-3 flex items-center justify-between mb-5 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center text-[#4f46e5]">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-slate-800">
                      E-Wallet (Dana/GoPay/OVO)
                    </div>
                    <div className="text-[11px] text-[#4f46e5] font-medium">
                      {paymentAccount ? paymentAccount : "Nomor belum diatur oleh Host"}
                    </div>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-[#4f46e5]" />
              </div>

              {/* Other Methods */}
              <div className="mb-2">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider">
                  METODE LAINNYA
                </span>
              </div>

              <div className="space-y-2.5 opacity-50 pointer-events-none">
                {[
                  {
                    icon: <QrCode className="w-4 h-4" />,
                    name: "QRIS",
                    desc: "Otomatis Terverifikasi",
                  },
                  {
                    icon: <CreditCard className="w-4 h-4" />,
                    name: "Virtual Account",
                    desc: "Dicek dalam 1 menit",
                  },
                  {
                    icon: <Building2 className="w-4 h-4" />,
                    name: "Transfer Bank",
                    desc: "Dicek otomatis",
                  },
                ].map((method, idx) => (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-xl p-3 flex items-center justify-between transition-colors cursor-not-allowed">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                        {method.icon}
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-slate-800">
                          {method.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {method.desc}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. E-Wallet Payment Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center">
              <div className="text-[13px] font-bold text-slate-600 mb-5 text-center">
                Silakan Transfer ke Nomor E-Wallet Berikut
              </div>

              {/* Nomor E-Wallet Highlight */}
              <div className="border-2 border-dashed border-indigo-200 p-5 bg-indigo-50/30 rounded-[1.5rem] mb-6 w-full text-center">
                <div className="text-2xl font-black text-[#4f46e5] tracking-wider mb-2">
                  {paymentAccount || "-"}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Atas Nama: Host
                </div>
              </div>

              <div className="flex items-center w-full">
                <button 
                  onClick={() => navigator.clipboard.writeText(paymentAccount || "")}
                  className="w-full py-3 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors">
                  <CheckCircle2 className="w-4 h-4" /> Salin Nomor
                </button>
              </div>
            </div>

            {/* 3. Instruksi Pembayaran */}
            <div className="bg-[#f8f9fa] border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-[#4f46e5]">
                <Info className="w-4 h-4" />
                <h3 className="font-bold text-sm text-slate-800">
                  Instruksi Pembayaran
                </h3>
              </div>

              <div className="space-y-2.5">
                {/* Accordion 1 */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setIsMbankingOpen(!isMbankingOpen)}
                    className="w-full px-4 py-3.5 flex justify-between items-center text-[13px] font-bold text-slate-800 hover:bg-slate-50 transition-colors">
                    Cara bayar via M-Banking
                    {isMbankingOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {isMbankingOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-3">
                      <p>1. Buka aplikasi M-Banking Anda.</p>
                      <p>2. Pilih menu Pembayaran &gt; Virtual Account.</p>
                      <p>3. Masukkan nomor VA: 8801 0812 3456 7890.</p>
                      <p>4. Masukkan nominal pembayaran yang sesuai.</p>
                      <p>5. Masukkan PIN Anda dan simpan bukti transaksi.</p>
                    </div>
                  )}
                </div>

                {/* Accordion 2 */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setIsAtmOpen(!isAtmOpen)}
                    className="w-full px-4 py-3.5 flex justify-between items-center text-[13px] font-bold text-slate-800 hover:bg-slate-50 transition-colors">
                    Cara bayar via ATM
                    {isAtmOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {isAtmOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-3">
                      <p>1. Masukkan kartu ATM dan PIN Anda.</p>
                      <p>2. Pilih menu Transaksi Lainnya &gt; Transfer.</p>
                      <p>3. Pilih ke Rekening Virtual Account.</p>
                      <p>4. Masukkan nomor VA: 8801 0812 3456 7890.</p>
                      <p>5. Ikuti instruksi untuk menyelesaikan pembayaran.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Kanan -> Bawah: Promo & Security */}
            <div>
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400 mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Pembayaran Aman & Terenkripsi</span>
              </div>

              <div className="bg-[#edf2ff] border border-indigo-100 rounded-2xl p-5 relative overflow-hidden mb-6">
                <div className="relative z-10">
                  <span className="text-[9px] font-bold text-[#4f46e5] tracking-wider mb-1.5 block">
                    PENAWARAN SPESIAL
                  </span>
                  <h3 className="text-base font-bold text-slate-800 mb-1.5 leading-tight">
                    Hemat 10% dengan GoPay
                  </h3>
                  <p className="text-[11px] text-slate-600 mb-4 leading-relaxed max-w-[200px]">
                    Gunakan GoPay untuk pembayaran pertama Anda.
                  </p>
                  <button className="bg-[#4f46e5] hover:bg-indigo-700 text-white text-[11px] font-bold py-2 px-4 rounded-full transition-colors shadow-sm">
                    Lihat Detail
                  </button>
                </div>

                {/* Background Decoration */}
                <div className="absolute -right-8 -bottom-8 opacity-30 pointer-events-none">
                  <div className="w-32 h-32 bg-white rounded-2xl rotate-12 shadow-xl"></div>
                </div>
              </div>

              {/* --- TOMBOL KONFIRMASI BAYAR (DITAMBAHKAN KEMBALI) --- */}
              <button
                onClick={handlePay}
                disabled={isConfirming || isSuccess}
                className={`w-full py-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed ${
                  isSuccess
                    ? "bg-green-500 shadow-green-200"
                    : "bg-[#4f46e5] hover:bg-indigo-700 shadow-indigo-100"
                }`}>
                {isSuccess ? (
                  <>
                    <CheckCircle2 size={18} /> PEMBAYARAN BERHASIL
                  </>
                ) : isConfirming ? (
                  "MEMPROSES..."
                ) : (
                  "SAYA SUDAH BAYAR"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
