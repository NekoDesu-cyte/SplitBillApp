import React from 'react';
import { 
  ArrowLeft, Share2, QrCode 
} from 'lucide-react';
import { Button } from './Button';

export const RoomDetail: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const items = [
    { name: "Super Family Bucket", qty: 1, price: 210000, assigned: ["S", "M", "A"] },
    { name: "French Fries Large", qty: 2, price: 50000, assigned: ["S"] },
    { name: "Coke Float", qty: 4, price: 80000, assigned: ["+3"] },
  ];

  const participants = [
    { name: "Sarah Jenkins (You)", amount: 123000, status: "Paid", color: "bg-indigo-500" },
    { name: "Mike Ross", amount: 110000, status: "Unpaid", color: "bg-emerald-500" },
    { name: "Anna Lee", amount: 105000, status: "Unpaid", color: "bg-orange-500" },
    { name: "Guest 1", amount: 105000, status: "Unpaid", color: "bg-slate-400" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 md:pb-20">
      {/* Navbar Detail */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-lg md:text-xl truncate">SplitBill</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="py-2 px-3 md:px-4 text-xs md:text-sm flex items-center gap-1 md:gap-2">
              <Share2 className="w-4 h-4" /> <span className="hidden sm:inline">Share</span>
            </Button>
            <Button className="py-2 px-3 md:px-4 text-xs md:text-sm bg-primary text-white shrink-0">
              Create Split
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 text-sm mb-6 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Bills
        </button>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div className="w-full md:w-auto">
            <h1 className="text-2xl md:text-4xl font-display font-bold mb-2">Friday Night Dinner</h1>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <div className="w-5 h-5 bg-red-100 rounded flex items-center justify-center shrink-0">
                <span className="text-[10px] text-red-600 font-bold">KFC</span>
              </div>
              <span className="truncate">KFC Sudirman • Oct 24, 2024</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 italic">Anyone with the link can join</p>
          </div>
          
          {/* Total Bill di HP dibikin jadi card sendiri biar rapi */}
          <div className="w-full md:w-auto bg-white md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none border border-slate-100 md:border-none shadow-sm md:shadow-none text-left md:text-right mt-2 md:mt-0">
            <span className="text-xs md:text-sm text-slate-500 font-medium block mb-1 md:mb-0">TOTAL ROOM BILL</span>
            <span className="text-3xl md:text-4xl font-display font-bold text-primary">Rp 485.000</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Side: Items & Participants */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            
            {/* Split Details Table */}
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-4 md:px-6 py-4 border-b border-slate-50 flex flex-wrap gap-4 justify-between items-center bg-slate-50/30">
                <h3 className="font-bold text-base md:text-lg">Split Details</h3>
                <div className="flex gap-1 md:gap-2 p-1 bg-slate-100 rounded-lg shrink-0">
                  <button className="px-3 py-1 text-xs font-bold bg-white rounded shadow-sm text-primary">Equal</button>
                  <button className="px-3 py-1 text-xs font-bold text-slate-500">Custom</button>
                </div>
              </div>
              
              {/* Ini obat anti-berantakan: overflow-x-auto */}
              <div className="p-0 sm:p-6 overflow-x-auto">
                <table className="w-full min-w-[400px] text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100">
                      <th className="text-left pb-4 font-medium px-4 sm:px-0 pt-4 sm:pt-0">Item</th>
                      <th className="text-right pb-4 font-medium pt-4 sm:pt-0">Price</th>
                      <th className="text-right pb-4 font-medium px-4 sm:px-0 pt-4 sm:pt-0">Assigned To</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {items.map((item, i) => (
                      <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4 sm:px-0">
                          <div className="font-bold text-slate-800">{item.name}</div>
                          <div className="text-slate-400 text-xs mt-1">Qty: {item.qty}</div>
                        </td>
                        <td className="py-4 text-right font-bold whitespace-nowrap">Rp {item.price.toLocaleString('id-ID')}</td>
                        <td className="py-4 px-4 sm:px-0">
                          <div className="flex justify-end -space-x-2">
                            {item.assigned.map((initial, idx) => (
                              <div key={idx} className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                                {initial}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Participants List */}
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 p-4 md:p-6">
              <h3 className="font-bold text-base md:text-lg mb-4 md:mb-6 flex items-center gap-2">
                Participants <span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-500">{participants.length}</span>
              </h3>
              <div className="space-y-4 mb-6">
                {participants.map((p, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0">
                      <div className={`w-8 h-8 md:w-10 md:h-10 shrink-0 ${p.color} rounded-full flex items-center justify-center text-white font-bold text-xs`}>
                        {p.name.charAt(0)}
                      </div>
                      <div className="text-xs md:text-sm font-bold text-slate-700 truncate">{p.name}</div>
                    </div>
                    <div className="flex flex-col md:flex-row items-end md:items-center gap-1 md:gap-4 shrink-0">
                      <span className="text-xs md:text-sm font-bold whitespace-nowrap">Rp {p.amount.toLocaleString('id-ID')}</span>
                      <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[9px] md:text-[10px] font-bold ${p.status === 'Paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: QRIS & Summary */}
          <div className="space-y-6 md:space-y-8">
            {/* QRIS Card */}
            <div className="bg-indigo-600 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-white text-center shadow-xl shadow-indigo-200">
              <span className="text-xs md:text-sm font-medium text-indigo-100 opacity-80 mb-2 md:mb-4 block">Your Share to Pay</span>
              <div className="text-3xl md:text-4xl font-display font-bold mb-6 md:mb-8">Rp 123.000</div>
              <div className="bg-white p-3 md:p-4 rounded-2xl md:rounded-3xl inline-block mb-6 md:mb-8">
                <QrCode className="w-24 h-24 md:w-32 md:h-32 text-slate-900" />
              </div>
              <p className="text-[10px] text-indigo-100 opacity-60 mb-6 leading-relaxed px-4">
                Scan this QR code with any<br className="hidden md:block" /> supported banking app or e-wallet.
              </p>
              {/* Perbaikan button QRIS yg td kodenya typo kurang bg-white */}
              <Button className="w-full text-primary font-bold flex items-center justify-center gap-2 py-3 md:py-4 text-sm md:text-base">
                <QrCode className="w-4 h-4 md:w-5 md:h-5" /> Pay with QRIS
              </Button>
            </div>

            {/* Bill Summary */}
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
              <h3 className="font-bold text-base md:text-lg mb-4 md:mb-6">Bill Summary</h3>
              <div className="space-y-3 md:space-y-4 text-xs md:text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">Rp 380.000</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tax (11%)</span>
                  <span className="font-bold text-slate-800">Rp 41.800</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Service Charge (5%)</span>
                  <span className="font-bold text-slate-800">Rp 19.000</span>
                </div>
                <div className="flex justify-between text-slate-400 italic">
                  <span>Rounding</span>
                  <span className="font-bold">+ Rp 44.200</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-1">
                  <span className="font-bold text-base md:text-lg">Grand Total</span>
                  <span className="font-display font-bold text-xl md:text-2xl text-primary">Rp 485.000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};