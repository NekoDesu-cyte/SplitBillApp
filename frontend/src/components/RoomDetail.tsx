import React, { useState, useEffect } from "react";
import {
  Bell,
  Copy,
  X,
  Minus,
  Plus,
  ShoppingBag,
  Lock,
  CheckCircle2,
  User as UserIcon,
  ArrowLeft, // Tambahan icon ArrowLeft untuk tombol back
} from "lucide-react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

// --- MODAL KENALAN GUEST ---
const GuestNameModal = ({
  isOpen,
  onSave,
}: {
  isOpen: boolean;
  onSave: (name: string) => void;
}) => {
  const [name, setName] = useState("");
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>
      <div className="relative bg-white w-full max-w-[360px] rounded-[2rem] p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-indigo-50 text-[#4f46e5] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Kenalan Dulu!
          </h3>
          <p className="text-slate-500 text-[11px] leading-relaxed px-2">
            Masukkan namamu agar teman-teman tahu siapa yang memesan menu ini.
          </p>
        </div>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama kamu..."
          className="w-full px-5 py-3.5 rounded-xl bg-[#fafafa] border border-slate-200 focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] outline-none font-bold text-center mb-4 transition-all text-sm"
        />
        <button
          onClick={() => name.trim() && onSave(name)}
          className="w-full bg-[#4f46e5] text-white py-3.5 rounded-xl font-bold shadow-md hover:bg-indigo-700 active:scale-[0.98] transition-all text-sm">
          Lanjut ke Pembayaran
        </button>
      </div>
    </div>
  );
};

export const RoomDetail: React.FC<{
  roomId: string;
  onBack: () => void;
  onPay: () => void;
}> = ({ roomId, onBack, onPay }) => {
  // =========================================================================
  // STATE & LOGIC BACKEND (TIDAK ADA YANG DIHAPUS)
  // =========================================================================
  const [room, setRoom] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showNameModal, setShowNameModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getMyIdentity = () => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) return { ...JSON.parse(savedUser), isGuest: false };
    let guestId =
      localStorage.getItem("splitbill_client_id") ||
      "guest-" + Math.random().toString(36).substring(2, 9);
    localStorage.setItem("splitbill_client_id", guestId);
    const guestName = localStorage.getItem(`guest_name_${roomId}`);
    return { id: guestId, name: guestName || "Guest", isGuest: !guestName };
  };

  const myIdentity = getMyIdentity();
  const myClientId = myIdentity.id;

  const fetchRoomData = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/${roomId}`);
      const data = await res.json();
      setRoom(data);
      setItems(data.items || []);
      setParticipants(data.participants || []);
    } catch (e) {
      alert("Gagal memuat.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchRoomData();
      socket.emit("joinRoom", roomId);
      socket.on("updateData", () => {
        fetchRoomData();
      });
      return () => {
        socket.off("updateData");
      };
    }
  }, [roomId]);

  const amIPaid =
    participants.find((p) => p.id === myClientId)?.is_paid || false;

  const updateClaim = async (itemId: string, delta: number) => {
    if (amIPaid) return;
    const item = items.find((it) => it.id === itemId);
    const currentClaims = item.claims || {};
    const newQty = (currentClaims[myClientId] || 0) + delta;
    if (newQty < 0) return;

    const totalLainnya = Object.entries(currentClaims)
      .filter(([id]) => id !== myClientId)
      .reduce((acc, [_, qty]) => acc + (qty as number), 0);
    if (totalLainnya + newQty > item.total_quantity) return alert("Habis!");

    const newClaims = { ...currentClaims, [myClientId]: newQty };
    setItems(
      items.map((it) => (it.id === itemId ? { ...it, claims: newClaims } : it)),
    );
    await fetch(`http://localhost:5000/api/rooms/${roomId}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claims: newClaims }),
    });
  };

  const handlePayClick = () => {
    myIdentity.isGuest ? setShowNameModal(true) : onPay();
  };
  const handleSaveGuestName = (name: string) => {
    localStorage.setItem(`guest_name_${roomId}`, name);
    setShowNameModal(false);
    onPay();
  };

  const myClaimedItems = items
    .map((it) => ({ ...it, myQty: (it.claims || {})[myClientId] || 0 }))
    .filter((it) => it.myQty > 0);
  const subtotal = myClaimedItems.reduce(
    (acc, it) => acc + it.price * it.myQty,
    0,
  );
  const taxAmount = (subtotal * (room?.tax_percent || 0)) / 100;
  const serviceAmount = (subtotal * (room?.service_percent || 0)) / 100;
  const totalAkhir = subtotal + taxAmount + serviceAmount;

  if (isLoading)
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center font-bold text-[#4f46e5]">
        Loading Data Ruangan...
      </div>
    );

  // =========================================================================
  // RENDER LAYOUT MOBILE-FIRST
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center font-sans text-slate-800 overflow-x-hidden">
      {/* Kontainer Mobile */}
      <div className="w-full max-w-[480px] bg-[#f8f9fa] min-h-screen shadow-2xl relative flex flex-col">
        <GuestNameModal isOpen={showNameModal} onSave={handleSaveGuestName} />

        {/* Navbar */}
        <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 w-full">
          <div className="px-4 h-16 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button
                onClick={onBack}
                className="p-2 -ml-2 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-full transition-all">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="font-display font-extrabold text-lg tracking-tight text-[#4f46e5]">
                BagiBayar
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <button className="hover:text-slate-700 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-slate-50">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${myClientId}`}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </nav>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-32">
          <div className="px-5 py-6">
            {/* Header Ruangan */}
            <div className="mb-6 text-center">
              <h1 className="text-xl font-bold text-slate-900 mb-1.5 truncate">
                {room.name}
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Pilih pesananmu di bawah ini.
              </p>
            </div>

            {/* Invite Box (Kode Room) */}
            <div className="bg-[#4f46e5] rounded-2xl p-5 mb-6 shadow-md relative overflow-hidden">
              <div className="relative z-10 flex flex-col items-center text-center">
                <span className="text-[10px] font-bold tracking-widest text-indigo-200 mb-1">
                  KODE RUANGAN
                </span>
                <span className="text-3xl font-extrabold text-white tracking-[0.2em] mb-4">
                  {room.code}
                </span>
                <button
                  onClick={handleCopyCode}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all w-full justify-center ${
                    isCopied
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "bg-white text-[#4f46e5] hover:bg-indigo-50"
                  }`}>
                  {isCopied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> KODE TERSALIN
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> SALIN KODE
                    </>
                  )}
                </button>
              </div>
              {/* Dekorasi Card */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
            </div>

            {/* List Partisipan */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider block mb-3 uppercase">
                Partisipan ({participants.length})
              </span>
              <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col items-center gap-1.5 min-w-[60px]">
                    <div className="relative">
                      <img
                        src={
                          p.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`
                        }
                        className={`w-12 h-12 rounded-full border-2 object-cover ${p.is_paid ? "border-green-400" : "border-slate-200"}`}
                      />
                      {p.is_paid && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 text-white w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] font-bold text-slate-700 truncate w-full text-center">
                      {p.id === myClientId ? "Kamu" : p.name.split(" ")[0]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daftar Pesanan */}
            <div className="mb-6">
              <h2 className="text-[13px] font-bold text-slate-900 mb-3 uppercase tracking-wider">
                Daftar Pesanan
              </h2>
              <div className="space-y-3">
                {items.map((item) => {
                  const claimsObj = item.claims || {};
                  const myQty = claimsObj[myClientId] || 0;
                  const totalClaimed = Object.values(claimsObj).reduce(
                    (a: any, b: any) => a + b,
                    0,
                  ) as number;
                  const sisa = item.total_quantity - totalClaimed;
                  const claimers = Object.entries(claimsObj).filter(
                    ([_, qty]) => (qty as number) > 0,
                  );

                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-xl border p-4 transition-all shadow-sm ${myQty > 0 ? "border-[#4f46e5]/40 bg-indigo-50/10" : "border-slate-200"}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="pr-3">
                          <h3 className="font-bold text-slate-800 text-sm mb-1 leading-tight">
                            {item.name}
                          </h3>
                          <div className="text-[#4f46e5] font-black text-[13px]">
                            Rp {Number(item.price).toLocaleString("id-ID")}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span
                            className={`text-[10px] font-bold px-2 py-1 rounded-md ${sisa === 0 ? "bg-slate-100 text-slate-400" : "bg-green-100 text-green-700"}`}>
                            Sisa {sisa}
                          </span>
                        </div>
                      </div>

                      {/* Claimers & Buttons */}
                      <div className="flex items-end justify-between mt-3">
                        <div className="flex-1">
                          {claimers.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {claimers.map(([uid, qty]) => {
                                const p = participants.find(
                                  (part) => part.id === uid,
                                );
                                return (
                                  <span
                                    key={uid}
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${p?.is_paid ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                                    {uid === myClientId
                                      ? "Kamu"
                                      : p?.name.split(" ")[0] || "Guest"}{" "}
                                    ({qty as number})
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">
                              Belum ada yang klaim
                            </span>
                          )}
                        </div>

                        {/* Controls */}
                        <div className="shrink-0 ml-3">
                          {myQty > 0 ? (
                            <div className="flex items-center gap-2 bg-slate-50 rounded-full p-1 border border-slate-200">
                              <button
                                onClick={() => updateClaim(item.id, -1)}
                                disabled={amIPaid}
                                className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-600 hover:text-red-500 disabled:opacity-50">
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-[13px] font-bold text-slate-800 w-4 text-center">
                                {myQty}
                              </span>
                              <button
                                onClick={() => updateClaim(item.id, 1)}
                                disabled={sisa === 0 || amIPaid}
                                className="w-6 h-6 bg-[#4f46e5] rounded-full flex items-center justify-center shadow-sm text-white hover:bg-indigo-700 disabled:opacity-50">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => updateClaim(item.id, 1)}
                              disabled={sisa === 0 || amIPaid}
                              className="px-4 py-1.5 rounded-full border border-[#4f46e5] text-[#4f46e5] text-[11px] font-bold hover:bg-indigo-50 disabled:opacity-50 disabled:border-slate-300 disabled:text-slate-400">
                              + Klaim
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rincian Pesanan Saya (Sebelum Bottom Bar) */}
            {myClaimedItems.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-slate-900">
                  <ShoppingBag className="w-4 h-4 text-[#4f46e5]" />
                  <h3 className="font-bold text-sm">Rincian Tagihanmu</h3>
                </div>

                <div className="space-y-3 mb-4">
                  {myClaimedItems.map((it) => (
                    <div
                      key={it.id}
                      className="flex justify-between items-start text-xs">
                      <div>
                        <div className="font-bold text-slate-700">
                          {it.name}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {it.myQty}x Rp{" "}
                          {Number(it.price).toLocaleString("id-ID")}
                        </div>
                      </div>
                      <div className="font-bold text-slate-800">
                        {(it.myQty * it.price).toLocaleString("id-ID")}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-slate-200 pt-3 space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-medium text-slate-700">
                      {subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Pajak ({room.tax_percent}%)</span>
                    <span className="font-medium text-slate-700">
                      {taxAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Layanan ({room.service_percent}%)</span>
                    <span className="font-medium text-slate-700">
                      {serviceAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Bottom Bar untuk Konfirmasi Pembayaran */}
        <div className="absolute bottom-0 w-full bg-white border-t border-slate-200 p-5 z-40 rounded-t-2xl shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-end mb-4">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                TOTAL BAYAR
              </div>
              <div className="text-2xl font-black text-[#4f46e5] leading-none">
                <span className="text-lg mr-1">Rp</span>
                {totalAkhir.toLocaleString("id-ID")}
              </div>
            </div>
            {amIPaid && (
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> LUNAS
              </div>
            )}
          </div>

          <button
            onClick={handlePayClick}
            disabled={myClaimedItems.length === 0}
            className={`w-full font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-md ${
              amIPaid
                ? "bg-slate-100 text-slate-500 shadow-none border border-slate-200"
                : "bg-[#4f46e5] hover:bg-indigo-700 text-white active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            }`}>
            {amIPaid ? "LIHAT BUKTI BAYAR" : "Konfirmasi & Bayar"}
          </button>
        </div>
      </div>
    </div>
  );
};
