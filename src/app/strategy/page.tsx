"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StrategyRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/analytics");
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center text-xs text-slate-400 font-semibold">
      <span>Redirecting to unified Advanced Stats & Strategy Suite...</span>
    </div>
  );
}
