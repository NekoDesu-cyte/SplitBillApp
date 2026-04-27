import React, { useState } from "react";
import {
  ArrowLeft,
  Upload,
  Plus,
  X,
  ArrowRight,
  ReceiptText,
} from "lucide-react";
import { Button } from "./Button";

interface Item {
  id: number;
  name: string;
  price: number;
  qty: number;
}

export const CreateRoom: React.FC<{
  onBack: () => void;
  onCreate: () => void;
}> = ({ onBack, onCreate }) => {
  const [items, setItems] = useState<Item[]>([
    { id: 1, name: "Nasi Goreng Spesial", price: 45000, qty: 1 },
    { id: 2, name: "Es Teh Manis", price: 10000, qty: 2 },
  ]);

  const [splitMethod, setSplitMethod] = useState<"equal" | "custom">("equal");

  const deleteItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ReceiptText className="text-white w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">
              SplitBill
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pt-10">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl font-bold mb-2">Create Room</h1>
          <p className="text-slate-500">
            Set up your bill and invite friends to split.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 space-y-8">
          {/* Form Utama */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Room Name *
              </label>
              <input
                type="text"
                placeholder="e.g., Dinner at Sushi Tei"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Total Bill (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                  Rp
                </span>
                <input
                  type="number"
                  defaultValue={0}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tax (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    defaultValue={10}
                    className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary transition-all text-center"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    %
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Service Charge (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Optional"
                    className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary transition-all text-center"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Split Method */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              Split Method
            </label>
            <div className="flex p-1 bg-slate-100 rounded-2xl">
              <button
                onClick={() => setSplitMethod("equal")}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${splitMethod === "equal" ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"}`}
              >
                Equal Split
              </button>
              <button
                onClick={() => setSplitMethod("custom")}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${splitMethod === "custom" ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"}`}
              >
                Custom (OCR)
              </button>
            </div>
          </div>

          {/* OCR Section */}
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer group">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4 text-primary group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-600">
              Drag & drop receipt or{" "}
              <span className="text-primary font-bold">Browse</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports JPG, PNG (Max 5MB)
            </p>
            <Button
              variant="secondary"
              className="mt-6 py-2 px-6 text-sm flex items-center gap-2 mx-auto"
            >
              <ReceiptText className="w-4 h-4" /> Extract Items
            </Button>
          </div>

          {/* Item List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ReceiptText className="w-5 h-5 text-accent" />
                <h3 className="font-bold text-slate-800">Extracted Items</h3>
              </div>
              <button className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600">
                      {item.qty}x
                    </div>
                    <span className="font-medium text-slate-700">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-900">
                      {(item.price * item.qty).toLocaleString("id-ID")}
                    </span>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={onCreate} // Ganti jadi ini
            className="w-full flex items-center justify-center gap-2 py-5 text-lg"
          >
            Create Room <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
