import React, { useState, useEffect, useRef } from "react";
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
  ArrowLeft,
  AlertCircle,
  Clock,
} from "lucide-react";
import { socket } from "../socket";

// --- MODAL KONFIRMASI TUTUP ROOM ---
const ConfirmCloseModal = ({
  isOpen,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onCancel}></div>
      <div className="relative bg-white w-full max-w-[320px] rounded-[2rem] p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1.5">
            Tutup Ruangan?
          </h3>
          <p className="text-slate-500 text-[11px] leading-relaxed px-2">
            Peserta tidak akan bisa menambah atau mengubah pesanan lagi setelah
            ruangan ini ditutup.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-slate-100 text-slate-600 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 text-white py-3.5 rounded-xl font-bold text-sm shadow-md hover:bg-red-600 active:scale-[0.98] transition-all">
            Ya, Tutup
          </button>
        </div>
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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const pendingRequests = useRef(0);
  const requestQueue = useRef(Promise.resolve());
  const optimisticItemsRef = useRef<any[]>([]);

  useEffect(() => {
    // Sinkronkan ref ini dengan state asli jika tidak ada request yang pending
    if (pendingRequests.current === 0) {
      optimisticItemsRef.current = items;
    }
  }, [items]);

  const [paymentNotif, setPaymentNotif] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const [notifHistory, setNotifHistory] = useState<
    { id: number; message: string; time: Date }[]
  >(() => {
    const saved = sessionStorage.getItem(`notif_${roomId}`);
    if (saved) {
      return JSON.parse(saved).map((n: any) => ({
        ...n,
        time: new Date(n.time),
      }));
    }
    return [];
  });

  useEffect(() => {
    sessionStorage.setItem(`notif_${roomId}`, JSON.stringify(notifHistory));
  }, [notifHistory, roomId]);

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
  const myClientId = String(myIdentity.id);

  const triggerError = (msg: string) => {
    setError(msg);
    setTimeout(() => setError(null), 3000); // Hilang dalam 3 detik
  };

  const fetchRoomData = async () => {
    try {
      const res = await fetch(`https://splitbill-backend-804441447131.asia-southeast2.run.app/api/rooms/${roomId}`);
      if (!res.ok) throw new Error(); // Tambahkan ini agar masuk ke catch jika 404

      const data = await res.json();
      
      // JANGAN timpa state jika user sedang ngeklik (mencegah balapan data server vs UI lokal)
      if (pendingRequests.current > 0) {
        return;
      }

      setRoom(data);
      setItems(data.items || []);

      // Fix Avatar Double (Deduplikasi)
      const rawParticipants = data.participants || [];
      const uniqueParticipants = Array.from(
        new Map(rawParticipants.map((p: any) => [p.id, p])).values(),
      );
      optimisticItemsRef.current = data.items || [];
      setParticipants(uniqueParticipants);
    } catch (e) {
      // GANTI ALERT JADI UI SERASI
      triggerError("Gagal memuat data ruangan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchRoomData();
      socket.emit("joinRoom", { roomId, clientId: myClientId });

      socket.on("updateData", () => {
        // Abaikan socket event jika kita masih ada request yang tertunda
        // Ini menghindari UI terset-ulang saat kita lagi klik-klik cepat
        if (pendingRequests.current > 0) {
          return;
        }

        fetchRoomData();
      });

      socket.on("onlineUsers", (users: string[]) => {
        setOnlineUsers(users);
      });

      socket.on("paymentNotification", (data: { participantName: string }) => {
        setPaymentNotif(data.participantName);

        setNotifHistory((prev) => [
          {
            id: Date.now(),
            message: `${data.participantName} baru saja melunasi tagihannya.`,
            time: new Date(),
          },
          ...prev,
        ]);

        setTimeout(() => setPaymentNotif(null), 4000);
      });

      return () => {
        socket.emit("leaveRoom", { roomId, clientId: myClientId });
        socket.off("updateData");
        socket.off("onlineUsers");
        socket.off("paymentNotification");
      };
    }
  }, [roomId, myClientId]);

  const amIPaid =
    participants.find((p) => p.id === myClientId)?.is_paid || false;

  const updateClaim = async (itemId: string, delta: number) => {
    // Gunakan optimisticItemsRef.current agar state tetap valid walau diklik beruntun
    const currentItems = optimisticItemsRef.current.length > 0 ? optimisticItemsRef.current : items;
    const item = currentItems.find((it) => it.id === itemId);

    if (!item) return;

    const claimsObj = item.claims || {};

    const paidQty = Object.entries(claimsObj).reduce((acc, [uid, qty]) => {
      const participant = participants.find(
        (p) => String(p.id) === String(uid),
      );

      return participant?.is_paid ? acc + (qty as number) : acc;
    }, 0);

    const isFullyPaid = room?.is_closed && paidQty >= item.total_quantity;

    if (isFullyPaid) return;

    const currentClaims = item.claims || {};
    const newQty = (currentClaims[myClientId] || 0) + delta;
    if (newQty < 0) return;

    let totalUsed = 0;

    if (room?.is_closed) {
      // Setelah room ditutup -> hanya hitung yang SUDAH bayar
      totalUsed = Object.entries(currentClaims).reduce((acc, [uid, qty]) => {
        if (uid === myClientId) return acc;

        const participant = participants.find(
          (p) => String(p.id) === String(uid),
        );

        return participant?.is_paid ? acc + (qty as number) : acc;
      }, 0);
    } else {
      // Sebelum room ditutup -> semua claim dihitung
      totalUsed = Object.entries(currentClaims)
        .filter(([id]) => id !== myClientId)
        .reduce((acc, [_, qty]) => acc + (qty as number), 0);
    }

    if (totalUsed + newQty > item.total_quantity) {
      triggerError(`Stok ${item.name} sudah habis!`);
      return;
    }

    const newClaims = { ...currentClaims, [myClientId]: newQty };
    
    // Update ref langsung untuk klik berikutnya yang sangat cepat
    optimisticItemsRef.current = currentItems.map((it) => 
      it.id === itemId ? { ...it, claims: newClaims } : it
    );
    
    setItems(optimisticItemsRef.current);

    pendingRequests.current += 1;

    // Masukkan fetch ke dalam antrian agar request tidak balapan (race condition) di network/backend
    requestQueue.current = requestQueue.current.then(async () => {
      try {
        // Ambil claims paling up-to-date di momen fetch ini berjalan
        const latestItem = optimisticItemsRef.current.find(it => it.id === itemId);
        if (latestItem) {
          await fetch(`https://splitbill-backend-804441447131.asia-southeast2.run.app/api/rooms/${roomId}/items/${itemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ claims: latestItem.claims }),
          });
        }
      } finally {
        // Beri jeda 500ms agar database Neon benar-benar selesai commit dan sinkron
        // sebelum kita membolehkan fetch data baru. Ini mencegah UI "flicker" membaca data kadaluarsa.
        setTimeout(() => {
          pendingRequests.current -= 1;
          if (pendingRequests.current === 0) {
            fetchRoomData();
          }
        }, 500);
      }
    });
  };

  const handlePayClick = () => {
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

  const handleCloseRoom = async () => {
    setShowConfirmClose(false); // Tutup modal saat tombol 'Ya' ditekan
    try {
      const res = await fetch(
        `https://splitbill-backend-804441447131.asia-southeast2.run.app/api/rooms/${roomId}/close`,
        {
          method: "PATCH",
        },
      );
      if (res.ok) {
        fetchRoomData();
        setSuccess("Ruangan telah dikunci.");
        setTimeout(() => setSuccess(null), 3000); // Pesan sukses hilang otomatis
      } else {
        triggerError("Gagal menutup ruangan.");
      }
    } catch (e) {
      triggerError("Gagal menutup ruangan.");
    }
  };

  // =========================================================================
  // RENDER LAYOUT MOBILE-FIRST
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center font-sans text-slate-800 overflow-x-hidden">
      {/* Kontainer Mobile */}
      <div className="w-full max-w-[480px] bg-[#f8f9fa] min-h-screen shadow-2xl relative flex flex-col">

        {/* TAMBAHKAN MODAL INI DI SINI */}
        <ConfirmCloseModal
          isOpen={showConfirmClose}
          onCancel={() => setShowConfirmClose(false)}
          onConfirm={handleCloseRoom}
        />

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
              {!room?.is_closed && room?.host_id === myClientId && (
                <button
                  onClick={() => setShowConfirmClose(true)}
                  className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-all">
                  <Lock className="w-4 h-4" />
                </button>
              )}

              {/* --- TOMBOL LONCENG DAN DROPDOWN NOTIFIKASI --- */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 rounded-full transition-all relative ${showNotifications ? "bg-indigo-50 text-[#4f46e5]" : "hover:text-slate-700 hover:bg-slate-50"}`}>
                  <Bell className="w-5 h-5" />
                  {/* Indikator Titik Merah jika ada notifikasi */}
                  {notifHistory.length > 0 && (
                    <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                  )}
                </button>

                {/* Panel Dropdown Notifikasi */}
                {showNotifications && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <h3 className="font-bold text-sm text-slate-800">
                        Notifikasi
                      </h3>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-slate-400 hover:text-slate-600">
                        <X size={14} />
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifHistory.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center">
                          <Bell className="w-8 h-8 mb-2 opacity-20" />
                          Belum ada aktivitas baru.
                        </div>
                      ) : (
                        notifHistory.map((notif) => (
                          <div
                            key={notif.id}
                            className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 items-start">
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-[11px] font-medium text-slate-700 leading-relaxed">
                                {notif.message}
                              </p>
                              <span className="text-[9px] font-bold text-slate-400 mt-1.5 block">
                                {notif.time.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* ----------------------------------------------- */}

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

        {paymentNotif && !room?.is_closed && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-50 pointer-events-none">
            <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md border border-emerald-100 p-3.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] animate-in slide-in-from-top-4 fade-in duration-500">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-bold text-slate-800 leading-tight">
                  Yeay! Ada yang bayar 🎉
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  <span className="font-bold text-[#4f46e5]">
                    {paymentNotif}
                  </span>{" "}
                  baru saja melunasi tagihannya.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-32">
          <div className="px-5 py-6">
            {/* Header Ruangan */}
            <div className="mb-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-slate-900 truncate">
                  {room.name}
                </h1>
                {room.is_closed && (
                  <span className="bg-slate-200 text-slate-600 text-[9px] px-2 py-0.5 rounded-full font-black animate-in fade-in zoom-in">
                    CLOSED
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {room.is_closed
                  ? "Ruangan ini sudah dikunci oleh host."
                  : "Pilih pesananmu di bawah ini."}
              </p>
            </div>

            {/* INFO INLINE: Tampil hanya jika room ditutup */}
            {room.is_closed ? (
              <div className="mb-6 bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3 animate-in slide-in-from-top-4 duration-500">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0 text-amber-600">
                  <Lock size={16} />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-amber-900 mb-0.5">
                    ROOM Telah Ditutup
                  </h4>
                  <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
                    Host telah menutup ruangan ini. Kamu tidak dapat menambah
                    atau mengubah klaim pesanan lagi.
                  </p>
                </div>
              </div>
            ) : (
              /* Invite Box: Hanya tampil jika room masih terbuka */
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
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
              </div>
            )}

            {/* List Partisipan */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider block mb-3 uppercase">
                Partisipan ({participants.length})
              </span>
              <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
                {participants.map((p) => {
                  // FIX: Gunakan String untuk mencocokkan ID agar aman dari perbedaan tipe data (Number vs String)
                  const isMe = String(p.id) === myClientId;

                  return (
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
                        {!p.is_paid && onlineUsers.includes(String(p.id)) && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="text-[10px] font-bold text-slate-700 truncate w-full text-center">
                        {/* Menggunakan variabel isMe yang sudah diperbaiki */}
                        {isMe ? "Kamu" : p.name.split(" ")[0]}
                      </div>
                    </div>
                  );
                })}
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

                  const paidQty = Object.entries(claimsObj).reduce(
                    (acc, [uid, qty]) => {
                      const participant = participants.find(
                        (p) => String(p.id) === String(uid),
                      );

                      return participant?.is_paid ? acc + (qty as number) : acc;
                    },
                    0,
                  );

                  const isFullyPaid =
                    room?.is_closed && paidQty >= item.total_quantity;

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
                                  (part) => String(part.id) === uid,
                                );
                                const isMe = uid === myClientId;

                                return (
                                  <span
                                    key={uid}
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${p?.is_paid ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                                    {isMe
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
                          {isFullyPaid ? (
                            // ROOM CLOSED + SEMUA ITEM SUDAH DIBAYAR
                            <div className="flex items-center justify-center bg-slate-50 rounded-full py-1.5 px-4 border border-slate-200">
                              <span className="text-[13px] font-bold text-slate-800">
                                {myQty}
                              </span>
                            </div>
                          ) : (
                            // SELAMA BELUM FULLY PAID -> tombol tetap ada
                            <div className="flex items-center gap-2 bg-slate-50 rounded-full p-1 border border-slate-200">
                              <button
                                onClick={() => updateClaim(item.id, -1)}
                                disabled={room?.is_closed && myQty === 0}
                                className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-600 hover:text-red-500 disabled:opacity-50">
                                <Minus className="w-3 h-3" />
                              </button>

                              <span className="text-[13px] font-bold text-slate-800 w-4 text-center">
                                {myQty}
                              </span>

                              <button
                                onClick={() => updateClaim(item.id, 1)}
                                disabled={
                                  room?.is_closed && sisa > 0 ? false : false
                                }
                                className="w-6 h-6 bg-[#4f46e5] rounded-full flex items-center justify-center shadow-sm text-white hover:bg-indigo-700 disabled:opacity-50">
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
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
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-8">
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

        {/* TOAST SUCCESS (Tampil saat room berhasil dikunci) */}
        {success && (
          <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-50">
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3.5 rounded-xl animate-in slide-in-from-bottom-4 duration-300 border border-emerald-100 shadow-xl">
              <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-bold leading-tight">{success}</span>
              <button
                onClick={() => setSuccess(null)}
                className="ml-auto opacity-70 hover:opacity-100 text-emerald-800">
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* TOAST ERROR */}
        {error && (
          <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-50">
            <div className="bg-red-500 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-xs font-bold">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto opacity-70 hover:opacity-100">
                <X size={14} />
              </button>
            </div>
          </div>
        )}

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
              amIPaid && room?.is_closed
                ? "bg-slate-100 text-slate-500 shadow-none border border-slate-200"
                : "bg-[#4f46e5] hover:bg-indigo-700 text-white active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            }`}>
            {amIPaid && room?.is_closed
              ? "LIHAT BUKTI BAYAR"
              : "Konfirmasi & Bayar"}
          </button>
        </div>
      </div>
    </div>
  );
};
