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
} from "lucide-react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

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
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"></div>
      <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-50 text-[#4f46e5] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Kenalan Dulu!</h3>
          <p className="text-slate-500 text-sm">
            Masukkan namamu agar teman-teman tahu siapa yang memesan menu ini.
          </p>
        </div>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama kamu..."
          className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-[#4f46e5] outline-none font-bold text-center mb-4"
        />
        <button
          onClick={() => name.trim() && onSave(name)}
          className="w-full bg-[#4f46e5] text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform">
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
  const [room, setRoom] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showNameModal, setShowNameModal] = useState(false);

  const [isCopied, setIsCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Kembali normal setelah 2 detik
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

      // 1. Beritahu server bahwa kita bergabung ke ruangan ini
      socket.emit("joinRoom", roomId);

      // 2. Dengerin sinyal 'updateData' dari server
      socket.on("updateData", () => {
        // Otomatis fetch ulang saat ada yang nambah menu
        fetchRoomData();
      });

      // 3. Bersihkan saat keluar halaman
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
      <div className="min-h-screen flex items-center justify-center font-bold text-[#4f46e5]">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans text-slate-800 pb-20">
      <GuestNameModal isOpen={showNameModal} onSave={handleSaveGuestName} />

      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
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
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=${myClientId}"
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
            Room - {room.name}
          </h1>
          <p className="text-sm text-slate-500">
            Kelola tagihan bersama teman-temanmu dengan transparan.
          </p>
        </div>

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
                {room.code}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className={`bg-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                isCopied
                  ? "text-emerald-600 shadow-sm"
                  : "text-[#5b51d8] hover:bg-slate-50"
              }`}>
              {isCopied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Tersalin!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy Code
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 tracking-wider block mb-4">
            PARTISIPAN ({participants.length})
          </span>
          <div className="space-y-4 mb-6">
            {participants.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={
                        p.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`
                      }
                      className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">
                      {p.name} {p.id === myClientId && "(Kamu)"}
                    </div>
                    <div
                      className={`text-[10px] font-bold mt-0.5 ${p.role === "OWNER" ? "text-[#4f46e5]" : "text-slate-400"}`}>
                      {p.role}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  {p.is_paid && (
                    <span className="text-[11px] font-semibold text-green-500">
                      LUNAS
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-900 mb-5">
              Pilih Pesanan Anda
            </h2>
            <div className="space-y-4">
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
                    className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-sm transition-shadow">
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-bold text-slate-800 text-base">
                          {item.name}
                        </h3>
                        <span className="text-xs font-bold text-slate-400">
                          Sisa: {sisa}/{item.total_quantity}
                        </span>
                      </div>
                      <div className="text-[#4f46e5] font-semibold text-sm mt-1 mb-3">
                        Rp {Number(item.price).toLocaleString("id-ID")}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">
                          Diklaim oleh:
                        </span>
                        {claimers.length > 0 ? (
                          <div className="flex gap-2">
                            {claimers.map(([uid, qty]) => {
                              const p = participants.find(
                                (part) => part.id === uid,
                              );
                              return (
                                <span
                                  key={uid}
                                  className={`text-[10px] font-bold px-2 py-1 rounded-md ${p?.is_paid ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                                  {p?.name || "Guest"} ({qty as number}x)
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Belum ada
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-full sm:w-auto flex justify-end mt-2 sm:mt-0">
                      {myQty > 0 ? (
                        <div className="flex items-center gap-3 bg-slate-50 rounded-full p-1 border border-slate-200">
                          <button
                            onClick={() => updateClaim(item.id, -1)}
                            disabled={amIPaid}
                            className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-600 hover:text-[#4f46e5]">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-bold text-slate-800 w-4 text-center">
                            {myQty}
                          </span>
                          <button
                            onClick={() => updateClaim(item.id, 1)}
                            disabled={sisa === 0 || amIPaid}
                            className="w-7 h-7 bg-[#5b51d8] rounded-full flex items-center justify-center shadow-sm text-white hover:bg-indigo-700">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => updateClaim(item.id, 1)}
                          disabled={sisa === 0 || amIPaid}
                          className="px-5 py-2 rounded-full border border-[#4f46e5] text-[#4f46e5] text-xs font-bold hover:bg-indigo-50">
                          Tambah
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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

              <div className="space-y-4 mb-6">
                {myClaimedItems.map((it) => (
                  <div key={it.id} className="flex justify-between items-start">
                    <div>
                      <div className="text-[13px] font-bold text-slate-800">
                        {it.name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {it.myQty}x Rp{" "}
                        {Number(it.price).toLocaleString("id-ID")}
                      </div>
                    </div>
                    <div className="text-[13px] font-bold text-slate-800">
                      Rp {(it.myQty * it.price).toLocaleString("id-ID")}
                    </div>
                  </div>
                ))}
              </div>

              <hr className="border-dashed border-slate-200 mb-4" />
              <div className="space-y-2.5 mb-6 text-[13px]">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="text-slate-800">
                    Rp {subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Pajak</span>
                  <span className="text-slate-800">
                    Rp {taxAmount.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Layanan</span>
                  <span className="text-slate-800">
                    Rp {serviceAmount.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center mb-8">
                <span className="font-bold text-slate-900">Total</span>
                <span className="text-xl font-bold text-[#4f46e5]">
                  Rp {totalAkhir.toLocaleString("id-ID")}
                </span>
              </div>

              <button
                onClick={handlePayClick}
                disabled={myClaimedItems.length === 0}
                className="w-full bg-[#5b51d8] hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-colors mb-4 text-sm disabled:opacity-50">
                {amIPaid ? "LIHAT BUKTI BAYAR" : "Konfirmasi & Bayar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
