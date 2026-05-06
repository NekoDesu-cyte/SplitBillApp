import React, { useState } from 'react';
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
  Wallet
} from 'lucide-react';

export const Payment: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isMbankingOpen, setIsMbankingOpen] = useState(true);
  const [isAtmOpen, setIsAtmOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-slate-800 pb-20">
      
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h1 className="text-lg font-medium text-slate-800">Selesaikan Pembayaran</h1>
          </div>
          
          <div className="flex items-center gap-1.5 bg-red-50 text-red-500 px-3 py-1.5 rounded-full">
            <Clock className="w-4 h-4" />
            <span className="text-[13px] font-bold tracking-wide">23:59:45</span>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Kiri: Detail Pembayaran */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Metode Pembayaran Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-5">Metode Pembayaran</h2>
              
              {/* Selected Method (QRIS) */}
              <div className="border border-[#4f46e5] bg-indigo-50/30 rounded-xl p-4 flex items-center justify-between mb-6 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-[#4f46e5]">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold text-slate-800">QRIS</div>
                    <div className="text-[12px] text-slate-500">Otomatis Terverifikasi</div>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-[#4f46e5]" />
              </div>

              {/* Other Methods */}
              <div className="mb-3">
                <span className="text-[12px] font-semibold text-slate-500 tracking-wide">Virtual Account</span>
              </div>
              
              <div className="space-y-3">
                {[
                  { icon: <CreditCard className="w-5 h-5" />, name: "Virtual Account", desc: "Dicek dalam 1 menit" },
                  { icon: <Building2 className="w-5 h-5" />, name: "Transfer Bank", desc: "Dicek otomatis" },
                  { icon: <Wallet className="w-5 h-5" />, name: "E-Wallet", desc: "Konfirmasi instan" },
                ].map((method, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-indigo-300 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                        {method.icon}
                      </div>
                      <div>
                        <div className="text-[14px] font-semibold text-slate-800">{method.name}</div>
                        <div className="text-[12px] text-slate-500">{method.desc}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* 2. QR Code Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col items-center">
              <div className="text-sm font-medium text-slate-600 mb-6">Scan QRIS Untuk Membayar</div>
              
              {/* QR Image Placeholder */}
              <div className="border border-slate-200 p-4 rounded-3xl mb-8">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=splitbill-payment-123" 
                  alt="QR Code" 
                  className="w-48 h-48"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                <button className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-[#4f46e5] text-[#4f46e5] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors">
                  <Download className="w-4 h-4" /> Simpan QR
                </button>
                <button className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-[#4f46e5] text-[#4f46e5] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors">
                  <Share2 className="w-4 h-4" /> Bagikan
                </button>
              </div>
            </div>

            {/* 3. Instruksi Pembayaran */}
            <div className="bg-[#f8f9fa] border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 text-[#4f46e5]">
                <Info className="w-5 h-5" />
                <h3 className="font-semibold text-slate-800">Instruksi Pembayaran</h3>
              </div>

              <div className="space-y-3">
                {/* Accordion 1 */}
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <button 
                    onClick={() => setIsMbankingOpen(!isMbankingOpen)}
                    className="w-full px-5 py-4 flex justify-between items-center text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                  >
                    Cara bayar via M-Banking
                    {isMbankingOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </button>
                  
                  {isMbankingOpen && (
                    <div className="px-5 pb-5 text-[13px] text-slate-600 space-y-2 border-t border-slate-100 pt-4">
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
                    className="w-full px-5 py-4 flex justify-between items-center text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
                  >
                    Cara bayar via ATM
                    {isAtmOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </button>
                  
                  {isAtmOpen && (
                    <div className="px-5 pb-5 text-[13px] text-slate-600 space-y-2 border-t border-slate-100 pt-4">
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

          </div>

          {/* Kanan: Promo & Security */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 mb-4">
              <ShieldCheck className="w-4 h-4" />
              <span>Pembayaran Aman & Terenkripsi</span>
            </div>

            <div className="bg-[#edf2ff] border border-indigo-100 rounded-2xl p-6 relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-[10px] font-bold text-[#4f46e5] tracking-wider mb-2 block">PENAWARAN SPESIAL</span>
                <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight">Hemat 10% dengan GoPay</h3>
                <p className="text-[12px] text-slate-600 mb-6 leading-relaxed max-w-[200px]">
                  Gunakan GoPay untuk pembayaran pertama Anda.
                </p>
                <button className="bg-[#4f46e5] hover:bg-indigo-700 text-white text-[13px] font-semibold py-2 px-5 rounded-full transition-colors shadow-sm">
                  Lihat Detail
                </button>
              </div>
              
              {/* Background Decoration */}
              <div className="absolute -right-10 -bottom-10 opacity-30 pointer-events-none">
                <div className="w-40 h-40 bg-white rounded-2xl rotate-12 shadow-xl"></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};