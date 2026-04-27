import React from 'react';
import { 
  ArrowLeft, Share2, MessageSquare, Users, 
  Settings, MoreHorizontal, Plus, QrCode 
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Navbar Detail */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                <QrCode className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl">SplitBill</span>
            </div>
            <div className="hidden md:flex gap-6 text-sm font-medium text-slate-500">
              <span className="text-primary border-b-2 border-primary h-16 flex items-center">Bills</span>
              <span className="h-16 flex items-center hover:text-slate-800 cursor-pointer">Friends</span>
              <span className="h-16 flex items-center hover:text-slate-800 cursor-pointer">Activity</span>
              <span className="h-16 flex items-center hover:text-slate-800 cursor-pointer">Settings</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="py-2 px-4 text-sm flex items-center gap-2">
              <Share2 className="w-4 h-4" /> Share
            </Button>
            <Button className="py-2 px-4 text-sm bg-primary text-white">Create Split</Button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 text-sm mb-6 hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Bills
        </button>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">Friday Night Dinner</h1>
            <div className="flex items-center gap-2 text-slate-500">
              <div className="w-5 h-5 bg-red-100 rounded flex items-center justify-center">
                <span className="text-[10px] text-red-600 font-bold">KFC</span>
              </div>
              <span>KFC Sudirman • Oct 24, 2024</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 italic">Anyone with the link can join</p>
          </div>
          <div className="text-right">
            <span className="text-sm text-slate-500 font-medium block">TOTAL ROOM BILL</span>
            <span className="text-4xl font-display font-bold text-primary">Rp 485.000</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side: Items & Participants */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Split Details Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h3 className="font-bold text-lg">Split Details</h3>
                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                  <button className="px-3 py-1 text-xs font-bold bg-white rounded shadow-sm text-primary">Equal</button>
                  <button className="px-3 py-1 text-xs font-bold text-slate-500">Custom</button>
                </div>
              </div>
              <div className="p-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100">
                      <th className="text-left pb-4 font-medium">Item</th>
                      <th className="text-right pb-4 font-medium">Price</th>
                      <th className="text-right pb-4 font-medium">Assigned To</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {items.map((item, i) => (
                      <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-4">
                          <div className="font-bold text-slate-800">{item.name}</div>
                          <div className="text-slate-400 text-xs">Qty: {item.qty}</div>
                        </td>
                        <td className="py-4 text-right font-bold">Rp {item.price.toLocaleString('id-ID')}</td>
                        <td className="py-4">
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
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                Participants <span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-500">{participants.length}</span>
              </h3>
              <div className="space-y-4 mb-6">
                {participants.map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${p.color} rounded-full flex items-center justify-center text-white font-bold text-xs`}>
                        {p.name.charAt(0)}
                      </div>
                      <div className="text-sm font-bold text-slate-700">{p.name}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold">Rp {p.amount.toLocaleString('id-ID')}</span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${p.status === 'Paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-4 border-t border-slate-50">
                <input 
                  type="text" 
                  placeholder="Add guest name..." 
                  className="flex-1 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
                <Button className="py-2 px-4 text-xs font-bold bg-slate-900 text-white">Add Guest</Button>
              </div>
            </div>
          </div>

          {/* Right Side: QRIS & Summary */}
          <div className="space-y-6">
            {/* QRIS Card */}
            <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white text-center shadow-xl shadow-indigo-200">
              <span className="text-sm font-medium text-indigo-100 opacity-80 mb-4 block">Your Share to Pay</span>
              <div className="text-3xl font-display font-bold mb-8">Rp 123.000</div>
              <div className="bg-white p-4 rounded-3xl inline-block mb-8">
                <QrCode className="w-32 h-32 text-slate-900" />
              </div>
              <p className="text-[10px] text-indigo-100 opacity-60 mb-6 leading-relaxed">
                Scan this QR code with any<br />supported banking app or e-wallet.
              </p>
              <Button className="w-full bg-white text-primary font-bold flex items-center justify-center gap-2 py-4">
                <QrCode className="w-5 h-5" /> Pay with QRIS
              </Button>
            </div>

            {/* Bill Summary */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <h3 className="font-bold text-lg mb-6">Bill Summary</h3>
              <div className="space-y-4 text-sm">
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
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="font-bold text-lg">Grand Total</span>
                  <span className="font-display font-bold text-2xl text-primary">Rp 485.000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};