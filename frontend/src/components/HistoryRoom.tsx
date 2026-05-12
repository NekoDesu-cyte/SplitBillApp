import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Receipt,
  Calendar,
  ChevronRight,
  Lock,
  Clock,
  Search,
} from "lucide-react";

interface HistoryRoomProps {
  userId: string;
  onBack: () => void;
  onSelectRoom: (roomId: string) => void;
}

export const HistoryRoom: React.FC<HistoryRoomProps> = ({
  userId,
  onBack,
  onSelectRoom,
}) => {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `https://splitbill-backend-804441447131.asia-southeast2.run.app/api/rooms/user/${userId}/history`,
        );
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Gagal mengambil history:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [userId]);

  const filteredHistory = history.filter((room) =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center font-sans text-slate-800 overflow-x-hidden">
      <div className="w-full max-w-[480px] bg-[#f8f9fa] min-h-screen shadow-2xl relative flex flex-col">
        {/* Navbar */}
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 w-full">
          <div className="px-4 h-16 flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-800 transition-all">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-base font-bold text-slate-800">
              Riwayat Ruangan
            </h1>
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto p-5">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari nama ruangan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-[#4f46e5] outline-none transition-all"
            />
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <div className="w-8 h-8 border-4 border-indigo-100 border-t-[#4f46e5] rounded-full animate-spin mb-3"></div>
              <p className="text-xs font-medium">Memuat history...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <Receipt className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400">
                Belum ada riwayat ruangan
              </p>
              <p className="text-[11px] text-slate-300 mt-1">
                Ruangan yang kamu buat akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((room) => (
                <button
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className="w-full bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between hover:border-indigo-200 transition-all active:scale-[0.98] group text-left shadow-sm">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${room.is_closed ? "bg-slate-50 text-slate-400" : "bg-indigo-50 text-[#4f46e5]"}`}>
                      {room.is_closed ? (
                        <Lock size={20} />
                      ) : (
                        <Clock size={20} />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-[#4f46e5] transition-colors line-clamp-1">
                        {room.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                        <Calendar size={12} />
                        <span>
                          {new Date(room.created_at).toLocaleDateString(
                            "id-ID",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                        <span
                          className={
                            room.is_closed
                              ? "text-slate-400"
                              : "text-emerald-500"
                          }>
                          {room.is_closed ? "Selesai" : "Aktif"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-slate-300 group-hover:text-[#4f46e5] transition-all"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
