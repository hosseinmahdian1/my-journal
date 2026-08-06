"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { GlassBadge } from "@/components/ui/glass/GlassBadge";
import { loadSettings, saveSettings, loadTrades, loadJournals } from "@/lib/storage/store";
import { UserSettings } from "@/types/trade";
import { Settings, Key, Shield, Database, Download, Save, CheckCircle, Bot, Zap } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(loadSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const handleSave = () => {
    saveSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExportJSON = () => {
    const data = {
      settings: loadSettings(),
      trades: loadTrades(),
      journals: loadJournals(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trading-journal-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold dark:text-white text-slate-950 flex items-center gap-3">
            <Settings className="h-8 w-8 text-sky-400" />
            <span>Settings & AI Engine Config</span>
          </h1>
          <p className="mt-1 text-xs dark:text-slate-400 text-slate-600">
            Configure multi-provider AI API keys, calendar preferences, single-user Cloudflare Access authentication, and data backups.
          </p>
        </div>

        <GlassButton variant="primary" onClick={handleSave}>
          {savedSuccess ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Save className="h-4 w-4" />}
          <span>{savedSuccess ? "Saved!" : "Save Settings"}</span>
        </GlassButton>
      </div>

      {/* AI Providers & API Keys */}
      <GlassCard glowColor="purple" className="space-y-6">
        <div className="flex items-center justify-between border-b dark:border-white/10 border-black/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold dark:text-white text-slate-900">AI Provider Configuration</h2>
              <p className="text-xs dark:text-slate-400 text-slate-600">Choose your active AI provider and enter your API keys.</p>
            </div>
          </div>
          <GlassBadge variant="purple" className="flex items-center gap-1">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>Groq Llama-3.3 70B Active</span>
          </GlassBadge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold dark:text-slate-400 text-slate-700">Active AI Provider</label>
            <select
              value={settings.activeAiProvider}
              onChange={(e) => setSettings({ ...settings, activeAiProvider: e.target.value as any })}
              className="mt-1.5 w-full rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 p-2.5 text-xs font-bold dark:text-white text-slate-900"
            >
              <option value="Groq">Groq Cloud (Llama-3.3 70B Ultra-Fast 30ms)</option>
              <option value="Gemini">Google Gemini (Gemini 1.5/2.0)</option>
              <option value="OpenAI">OpenAI (GPT-4o)</option>
              <option value="Claude">Anthropic Claude (Claude 3.5)</option>
              <option value="DeepSeek">DeepSeek (R1 / V3)</option>
              <option value="OpenRouter">OpenRouter Gateway</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-amber-400">Groq API Key (gsk_...)</label>
            <input
              type="password"
              placeholder="gsk_..."
              value={settings.apiKeys.groqApiKey || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  apiKeys: { ...settings.apiKeys, groqApiKey: e.target.value },
                })
              }
              className="mt-1.5 w-full rounded-xl border border-amber-500/40 dark:bg-zinc-950 bg-slate-100 p-2.5 text-xs font-mono dark:text-amber-300 text-amber-900 font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-semibold dark:text-slate-400 text-slate-700">Gemini API Key</label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={settings.apiKeys.geminiApiKey || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  apiKeys: { ...settings.apiKeys, geminiApiKey: e.target.value },
                })
              }
              className="mt-1.5 w-full rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 p-2.5 text-xs dark:text-white text-slate-900"
            />
          </div>

          <div>
            <label className="text-xs font-semibold dark:text-slate-400 text-slate-700">OpenAI API Key</label>
            <input
              type="password"
              placeholder="sk-proj-..."
              value={settings.apiKeys.openaiApiKey || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  apiKeys: { ...settings.apiKeys, openaiApiKey: e.target.value },
                })
              }
              className="mt-1.5 w-full rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 p-2.5 text-xs dark:text-white text-slate-900"
            />
          </div>

          <div>
            <label className="text-xs font-semibold dark:text-slate-400 text-slate-700">DeepSeek API Key</label>
            <input
              type="password"
              placeholder="sk-..."
              value={settings.apiKeys.deepseekApiKey || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  apiKeys: { ...settings.apiKeys, deepseekApiKey: e.target.value },
                })
              }
              className="mt-1.5 w-full rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 p-2.5 text-xs dark:text-white text-slate-900"
            />
          </div>
        </div>
      </GlassCard>

      {/* Calendar & Backup Section */}
      <GlassCard className="space-y-6">
        <div className="flex items-center justify-between border-b dark:border-white/10 border-black/10 pb-4">
          <div className="flex items-center gap-3">
            <Database className="h-6 w-6 text-sky-400" />
            <div>
              <h2 className="text-base font-bold dark:text-white text-slate-900">Calendar & Backup Tools</h2>
              <p className="text-xs dark:text-slate-400 text-slate-600">Manage Jalali/Gregorian dual calendar display & full system exports.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-semibold dark:text-slate-400 text-slate-700">Calendar Display Mode</label>
            <select
              value={settings.calendarMode}
              onChange={(e) => setSettings({ ...settings, calendarMode: e.target.value as any })}
              className="mt-1.5 w-full rounded-xl border dark:border-white/10 border-black/10 dark:bg-zinc-950 bg-slate-100 p-2.5 text-xs dark:text-white text-slate-900 font-bold"
            >
              <option value="Both">Both (Gregorian & Jalali Shamsi)</option>
              <option value="Jalali">Jalali (هجری شمسی) Only</option>
              <option value="Gregorian">Gregorian Only</option>
            </select>
          </div>

          <div className="flex items-end">
            <GlassButton variant="outline" className="w-full" onClick={handleExportJSON}>
              <Download className="h-4 w-4" />
              <span>Export Complete JSON Backup</span>
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
