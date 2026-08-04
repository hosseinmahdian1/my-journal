"use client";

import React, { useState, useEffect } from "react";
import { TradingAccount } from "@/types/trade";
import { loadAccounts, saveAccounts, getActiveAccountId, setActiveAccountId } from "@/lib/storage/store";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { Layers, Plus, Check, ChevronDown, Trash2 } from "lucide-react";

interface AccountSwitcherProps {
  onAccountChanged?: () => void;
}

export function AccountSwitcher({ onAccountChanged }: AccountSwitcherProps) {
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [activeAccountId, setActiveId] = useState<string>("acc-1");
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New Account Form State
  const [newAccName, setNewAccName] = useState("");
  const [newAccBroker, setNewAccBroker] = useState("FTMO");
  const [newAccBalance, setNewAccBalance] = useState(25000);

  useEffect(() => {
    const accs = loadAccounts();
    const active = getActiveAccountId();
    setAccounts(accs);
    setActiveId(active);
  }, []);

  const activeAccount = accounts.find((a) => a.id === activeAccountId) || accounts[0];

  const handleSelectAccount = (id: string) => {
    setActiveId(id);
    setActiveAccountId(id);
    setIsOpen(false);
    if (onAccountChanged) onAccountChanged();
    window.location.reload(); // Refresh app to recalculate all stats for the selected account
  };

  const handleCreateAccount = () => {
    if (!newAccName.trim()) return;
    const newAcc: TradingAccount = {
      id: `acc-${Date.now()}`,
      name: newAccName.trim(),
      broker: newAccBroker,
      currency: "USD",
      initialBalance: Number(newAccBalance) || 10000,
      createdAt: new Date().toISOString().split("T")[0],
    };

    const updated = [...accounts, newAcc];
    setAccounts(updated);
    saveAccounts(updated);
    handleSelectAccount(newAcc.id);
    setIsCreateOpen(false);
    setNewAccName("");
  };

  return (
    <div className="relative">
      {/* Account Switcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-900/90 bg-slate-100 px-3 py-2 text-xs font-bold dark:text-slate-200 text-slate-900 hover:border-cyan-500/50 transition-all cursor-pointer shadow-sm"
      >
        <Layers className="h-4 w-4 text-cyan-400" />
        <span className="max-w-[140px] truncate">{activeAccount?.name || "Account"}</span>
        <GlassBadge variant="cyan" className="py-0 px-1.5 text-[10px]">
          ${activeAccount?.initialBalance?.toLocaleString()}
        </GlassBadge>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border dark:border-white/15 border-black/10 dark:bg-black/95 bg-white p-3 shadow-2xl backdrop-blur-2xl space-y-2">
          <div className="flex items-center justify-between border-b dark:border-white/10 border-black/10 pb-2 text-[11px] font-bold text-slate-400">
            <span>SELECT TRADING ACCOUNT</span>
            <button
              onClick={() => {
                setIsCreateOpen(true);
                setIsOpen(false);
              }}
              className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              <span>New Account</span>
            </button>
          </div>

          <div className="space-y-1 max-h-56 overflow-y-auto">
            {accounts.map((acc) => {
              const isSelected = acc.id === activeAccountId;
              return (
                <div
                  key={acc.id}
                  onClick={() => handleSelectAccount(acc.id)}
                  className={`flex items-center justify-between rounded-xl p-2.5 text-xs transition-all cursor-pointer ${
                    isSelected
                      ? "bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-bold"
                      : "hover:bg-white/5 text-slate-300"
                  }`}
                >
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <span>{acc.name}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-cyan-400" />}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {acc.broker || "Forex Broker"} • ${acc.initialBalance.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Account Creation Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="w-full max-w-md rounded-3xl border dark:border-white/15 border-black/10 dark:bg-black/95 bg-white p-6 space-y-4 font-sans">
            <h3 className="text-lg font-extrabold text-white">افزودن حساب معاملاتی جدید (Create Account)</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-400">نام حساب (Account Name)</label>
                <input
                  type="text"
                  placeholder="e.g. FTMO Challenge $100k"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-900 p-3 font-bold text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-400">نام بروکر / پراپ (Broker/Prop)</label>
                <input
                  type="text"
                  placeholder="e.g. FTMO, IC Markets"
                  value={newAccBroker}
                  onChange={(e) => setNewAccBroker(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-900 p-3 text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-400">موجودی اولیه (Initial Balance $)</label>
                <input
                  type="number"
                  value={newAccBalance}
                  onChange={(e) => setNewAccBalance(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-900 p-3 font-bold text-emerald-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <GlassButton variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </GlassButton>
              <GlassButton variant="primary" size="sm" onClick={handleCreateAccount}>
                Create & Switch Account
              </GlassButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
