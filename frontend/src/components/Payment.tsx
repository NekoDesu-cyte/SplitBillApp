import React, { useState, useEffect } from "react";
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

export const Payment: React.FC<{ roomId: string; onBack: () => void }> = ({
  roomId,
  onBack,
}) => {
  const [isMbankingOpen, setIsMbankingOpen] = useState(true);
  const [isAtmOpen, setIsAtmOpen] = useState(false);
  const [totalTagihan, setTotalTagihan] = useState(0);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchPaymentData = async () => {
      const myClientId = localStorage.getItem("splitbill_client_id") || "guest";
      const res = await fetch(`http://localhost:5000/api/rooms/${roomId}`);
      const data = await res.json();

      const myItems = (data.items || [])
        .map((it: any) => ({
          ...it,
          myQty: (it.claims || {})[myClientId] || 0,
        }))
        .filter((it: any) => it.myQty > 0);
      const sub = myItems.reduce(
        (acc: number, it: any) => acc + it.price * it.myQty,
        0,
      );
      setTotalTagihan(
        sub +
          (sub * data.tax_percent) / 100 +
          (sub * data.service_percent) / 100,
      );
    };
    fetchPaymentData();
  }, [roomId]);

  const handlePay = async () => {
    setIsConfirming(true);
    const clientId = localStorage.getItem("splitbill_client_id") || "guest";
    const guestName = localStorage.getItem(`guest_name_${roomId}`);
    await fetch(`http://localhost:5000/api/rooms/${roomId}/pay`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, participantName: guestName || "User" }),
    });
    setIsSuccess(true);
    setTimeout(() => onBack(), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-slate-800 pb-20">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h1 className="text-lg font-medium text-slate-800">
              Selesaikan Pembayaran
            </h1>
          </div>
          <div className="flex items-center gap-1.5 bg-red-50 text-red-500 px-3 py-1.5 rounded-full">
            <Clock className="w-4 h-4" />
            <span className="text-[13px] font-bold tracking-wide">
              23:59:45
            </span>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-5">
                Metode Pembayaran
              </h2>
              <div className="border border-[#4f46e5] bg-indigo-50/30 rounded-xl p-4 flex items-center justify-between mb-6 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-[#4f46e5]">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold text-slate-800">
                      QRIS
                    </div>
                    <div className="text-[12px] text-slate-500">
                      Otomatis Terverifikasi
                    </div>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-[#4f46e5]" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col items-center">
              <div className="text-sm font-medium text-slate-600 mb-6">
                Scan QRIS Untuk Membayar
              </div>
              <div className="border border-slate-200 p-4 rounded-3xl mb-8">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=splitbill-payment-123"
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 mb-4">
              <ShieldCheck className="w-4 h-4" />
              <span>Pembayaran Aman & Terenkripsi</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-4 text-center">
              <h3 className="font-bold text-slate-500 mb-2">TOTAL TAGIHAN</h3>
              <div className="text-3xl font-black text-[#4f46e5]">
                Rp {totalTagihan.toLocaleString("id-ID")}
              </div>
            </div>
            <button
              onClick={handlePay}
              disabled={isConfirming || isSuccess}
              className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 ${isSuccess ? "bg-green-500" : "bg-[#4f46e5]"}`}>
              {isSuccess ? (
                <CheckCircle2 size={20} />
              ) : isConfirming ? (
                "MENGIRIM..."
              ) : (
                "SAYA SUDAH BAYAR"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
