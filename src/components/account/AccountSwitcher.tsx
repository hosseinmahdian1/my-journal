"use client";

import React, { useState, useEffect } from "react";
import { TradingAccount } from "@/types/trade";
import { loadAccounts, saveAccounts, getActiveAccountId, setActiveAccountId, deleteAccount } from "@/lib/storage/store";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { Layers, Plus, Check, ChevronDown, Sparkles, Trash2 } from "lucide-react";

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
    window.location.reload();
  };

  const handleDeleteAccount = (id: string, name: string) => {
    if (accounts.length <= 1) return;
    if (!window.confirm(`Delete "${name}" and all its trades?`)) return;
    deleteAccount(id);
    window.location.reload();
  };

  const handleCreateAccount = () => {
    const fallbackName = newAccBroker
      ? `${newAccBroker} Account ($${(Number(newAccBalance) || 10000).toLocaleString()})`
      : `Trading Account ${accounts.length + 1}`;

    const accName = newAccName.trim() || fallbackName;

    const newAcc: TradingAccount = {
      id: `acc-${Date.now()}`,
      name: accName,
      broker: newAccBroker.trim() || "Prop Broker",
      currency: "USD",
      initialBalance: Number(newAccBalance) || 10000,
      createdAt: new Date().toISOString().split("T")[0],
    };

    const updated = [...accounts, newAcc];
    setAccounts(updated);
    saveAccounts(updated);
    setActiveAccountId(newAcc.id);
    setActiveId(newAcc.id);
    setIsCreateOpen(false);
    setNewAccName("");
    setNewAccBroker("FTMO");
    setNewAccBalance(25000);

    if (onAccountChanged) onAccountChanged();
    window.location.reload();
  };

  return (
    <div className="relative">
      {/* Account Switcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border dark:border-[#1E2028]/40 border-slate-300 dark:bg-[#0F1016] bg-white px-3 py-2 text-xs font-bold dark:text-[#FFFFFF] text-slate-900 hover:border-[#00E5FF] transition-all cursor-pointer shadow-sm"
      >
        <Layers className="h-4 w-4 text-[#00E5FF]" />
        <span className="max-w-[140px] truncate">{activeAccount?.name || "Account"}</span>
        <GlassBadge variant="gold" className="py-0 px-1.5 text-[10px]">
          ${activeAccount?.initialBalance?.toLocaleString()}
        </GlassBadge>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 sm:right-0 top-12 z-50 w-72 rounded-2xl border dark:border-[#1E2028]/40 border-slate-200 dark:bg-[#050507]/95 bg-white p-3 shadow-2xl backdrop-blur-2xl space-y-2">
          <div className="flex items-center justify-between border-b dark:border-[#1E2028]/30 border-slate-200 pb-2 text-[11px] font-bold dark:text-[#8E92A4] text-slate-600">
            <span>SELECT TRADING ACCOUNT</span>
            <button
              onClick={() => {
                setIsCreateOpen(true);
                setIsOpen(false);
              }}
              className="text-[#00E5FF] hover:underline flex items-center gap-1 cursor-pointer font-bold"
            >
              <Plus className="h-3.5 w-3.5" />
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
                      ? "bg-[#00E5FF]/15 border border-[#00E5FF]/40 text-[#00E5FF] font-bold"
                      : "hover:bg-slate-100 dark:hover:bg-[#0F1016]/60 dark:text-[#8E92A4] text-slate-700"
                  }`}
                >
                  <div>
                    <div className="flex-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <span>{acc.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-[#00E5FF]" />}
                      </div>
                      <div className="text-[10px] dark:text-[#8E92A4] text-slate-500">
                        {acc.broker || "Forex Broker"} • ${acc.initialBalance.toLocaleString()}
                      </div>
                    </div>
                    {accounts.length > 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteAccount(acc.id, acc.name); }}
                        className="text-[#FF334B]/60 hover:text-[#FF334B] p-1 rounded-lg hover:bg-[#FF334B]/10 transition-all"
                        title="Delete account"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
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
          <div className="w-full max-w-md rounded-3xl border dark:border-[#1E2028]/40 border-slate-200 dark:bg-[#050507]/95 bg-white p-6 space-y-5 font-sans shadow-2xl">
            <div className="flex items-center justify-between border-b dark:border-[#1E2028]/30 border-slate-200 pb-3">
              <h3 className="text-base font-extrabold dark:text-[#FFFFFF] text-slate-900 flex items-center gap-2 font-persian">
                <Sparkles className="h-4 w-4 text-[#00E5FF]" />
                <span>افزودن حساب معاملاتی جدید (Create Account)</span>
              </h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold dark:text-[#8E92A4] text-slate-700 block mb-1">نام حساب (Account Name)</label>
                <input
                  type="text"
                  placeholder="مثلاً: FTMO Challenge $100k"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="w-full rounded-xl border dark:border-[#1E2028]/40 border-slate-300 dark:bg-[#0F1016] bg-white p-3 font-bold dark:text-[#FFFFFF] text-slate-900 focus:border-[#00E5FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold dark:text-[#8E92A4] text-slate-700 block mb-1">نام بروکر / پراپ (Broker/Prop)</label>
                <input
                  type="text"
                  placeholder="مثلاً: FTMO, IC Markets, FundedNext"
                  value={newAccBroker}
                  onChange={(e) => setNewAccBroker(e.target.value)}
                  className="w-full rounded-xl border dark:border-[#1E2028]/40 border-slate-300 dark:bg-[#0F1016] bg-white p-3 font-bold dark:text-[#FFFFFF] text-slate-900 focus:border-[#00E5FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold dark:text-[#8E92A4] text-slate-700 block mb-1">موجودی اولیه (Initial Balance $)</label>
                <input
                  type="number"
                  value={newAccBalance}
                  onChange={(e) => setNewAccBalance(Number(e.target.value))}
                  className="w-full rounded-xl border dark:border-[#1E2028]/40 border-slate-300 dark:bg-[#0F1016] bg-white p-3 font-bold dark:text-[#00E676] text-emerald-500 focus:border-[#00E5FF] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <GlassButton variant="secondary" size="sm" onClick={() => setIsCreateOpen(false)}>
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
