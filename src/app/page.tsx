"use client";
import React, { useEffect, useState } from "react";
import { SysLogo } from "../components/SysLogo";
import { useLanguage } from "../i18n";

export default function Root({ onLoaded }: { onLoaded?: () => void }) {
  const [dots, setDots] = useState("");
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);

    const redirectTimer = setTimeout(() => {
      if (onLoaded) {
        onLoaded();
      } else if (typeof window !== "undefined") {
        window.location.hash = "/room/main";
      }
    }, 1200);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer);
    };
  }, [onLoaded]);

  return (
    <div className="bg-[#060a14] min-h-screen flex flex-col items-center justify-center text-cyan-400 font-mono">
      <div className="mb-5 flex flex-col items-center">
        <SysLogo size="xl" showText={false} />
      </div>
      <div className="tracking-widest font-extrabold text-base text-white flex items-center gap-1">
        <span>{t('SYS STREAM LOADING')}</span>
        <span className="text-amber-400">{dots}</span>
      </div>
      <div className="text-xs text-slate-500 mt-2 font-sans">
        Initializing TikTok Live Sync + Cloudflare D1 Connection
      </div>
    </div>
  );
}
