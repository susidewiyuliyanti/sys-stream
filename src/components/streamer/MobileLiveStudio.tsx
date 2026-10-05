"use client";

import React, { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../i18n";
import { Camera, CameraOff, Mic, MicOff, Radio, Smartphone, Square } from "lucide-react";

type Props = {
  whipUrl: string;
  onStarted?: () => void;
  onStopped?: () => void;
  showToast?: (title: string, message: string, type?: "success" | "error" | "info") => void;
};

export default function MobileLiveStudio({ whipUrl, onStarted, onStopped, showToast }: Props) {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const mediaRef = useRef<MediaStream | null>(null);
  const sessionUrlRef = useRef<string>("");
  const [busy, setBusy] = useState(false);
  const [live, setLive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  const cleanup = async () => {
    const pc = pcRef.current;
    const media = mediaRef.current;
    const sessionUrl = sessionUrlRef.current;
    pcRef.current = null;
    mediaRef.current = null;
    sessionUrlRef.current = "";
    if (pc) pc.close();
    if (media) media.getTracks().forEach(track => track.stop());
    if (sessionUrl) {
      try { await fetch(sessionUrl, { method: "DELETE", keepalive: true }); } catch {}
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setLive(false);
    setMuted(false);
    setCameraOff(false);
    onStopped?.();
  };

  useEffect(() => () => { void cleanup(); }, []);

  const start = async () => {
    if (!whipUrl || busy || live) return;
    setBusy(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(t("Browser ini tidak mendukung kamera/mikrofon live. Gunakan Chrome/Safari terbaru melalui HTTPS."));
      }

      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "user" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      mediaRef.current = media;
      if (videoRef.current) {
        videoRef.current.srcObject = media;
        await videoRef.current.play().catch(() => {});
      }

      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      media.getTracks().forEach(track => pc.addTransceiver(track, { direction: "sendonly" }));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      if (!pc.localDescription?.sdp) throw new Error(t("SDP kamera tidak tersedia."));

      const response = await fetch(whipUrl, {
        method: "POST",
        headers: { "Content-Type": "application/sdp", "Accept": "application/sdp" },
        body: pc.localDescription.sdp
      });
      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        throw new Error(detail || t("Cloudflare menolak koneksi live dari browser."));
      }

      const answer = await response.text();
      const location = response.headers.get("Location") || "";
      if (location) sessionUrlRef.current = new URL(location, whipUrl).toString();

      await pc.setRemoteDescription({ type: "answer", sdp: answer });
      setLive(true);
      onStarted?.();
      showToast?.(t("Mobile Live"), t("Kamera dan mikrofon sudah LIVE."), "success");
    } catch (error: any) {
      await cleanup();
      showToast?.(t("Mobile Live"), t(error?.message || "Gagal memulai live dari HP."), "error");
    } finally {
      setBusy(false);
    }
  };

  const stop = async () => {
    if (busy) return;
    setBusy(true);
    await cleanup();
    setBusy(false);
    showToast?.(t("Mobile Live"), t("Live dari HP sudah dihentikan."), "info");
  };

  const toggleMute = () => {
    const audio = mediaRef.current?.getAudioTracks()[0];
    if (!audio) return;
    audio.enabled = !audio.enabled;
    setMuted(!audio.enabled);
  };

  const toggleCamera = () => {
    const video = mediaRef.current?.getVideoTracks()[0];
    if (!video) return;
    video.enabled = !video.enabled;
    setCameraOff(!video.enabled);
  };

  return (
    <section className="mt-3 rounded-2xl border border-fuchsia-500/25 bg-fuchsia-500/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-fuchsia-300 font-black">
            <Smartphone className="w-4 h-4" /> MOBILE LIVE
          </div>
          <div className="text-sm font-bold mt-1">{t("Live langsung dari kamera HP")}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {t("Tidak perlu OBS. Izinkan kamera dan mikrofon, lalu tekan MULAI LIVE.")}
          </p>
        </div>
        <span className={live ? "rounded-full bg-rose-500/20 text-rose-300 px-2 py-1 text-[10px] font-black" : "rounded-full bg-slate-900 text-slate-500 px-2 py-1 text-[10px] font-black"}>
          {live ? "● LIVE" : t("READY")}
        </span>
      </div>

      <div className="mt-4 aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 relative">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        {!live && !busy && (
          <div className="absolute inset-0 flex items-center justify-center text-center p-6">
            <Camera className="w-10 h-10 mx-auto text-fuchsia-400 mb-2" />
            <div>
              <div className="text-sm font-black">{t("Kamera siap digunakan")}</div>
              <div className="text-[11px] text-slate-500 mt-1">{t("Tekan tombol mulai untuk meminta izin kamera & mikrofon.")}</div>
            </div>
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-xs font-black animate-pulse">{t("MENGHUBUNGKAN KE CLOUDFARE...")}</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <button disabled={!live || busy} onClick={toggleMute} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs font-black disabled:opacity-40">
          {muted ? <MicOff className="w-4 h-4 mx-auto mb-1 text-rose-400" /> : <Mic className="w-4 h-4 mx-auto mb-1 text-emerald-400" />}
          {muted ? t("UNMUTE") : t("MIC")}
        </button>
        <button disabled={!live || busy} onClick={toggleCamera} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-xs font-black disabled:opacity-40">
          {cameraOff ? <CameraOff className="w-4 h-4 mx-auto mb-1 text-rose-400" /> : <Camera className="w-4 h-4 mx-auto mb-1 text-emerald-400" />}
          {cameraOff ? t("CAM OFF") : t("CAM")}
        </button>
        {!live ? (
          <button disabled={!whipUrl || busy} onClick={() => void start()} className="rounded-xl bg-fuchsia-400 px-3 py-2.5 text-xs font-black text-slate-950 disabled:opacity-40">
            <Radio className="w-4 h-4 mx-auto mb-1" /> {t("MULAI LIVE")}
          </button>
        ) : (
          <button disabled={busy} onClick={() => void stop()} className="rounded-xl bg-rose-500 px-3 py-2.5 text-xs font-black text-white disabled:opacity-40">
            <Square className="w-4 h-4 mx-auto mb-1" /> {t("STOP LIVE")}
          </button>
        )}
      </div>
      <div className="text-[10px] text-slate-600 mt-3">
        {t("WebRTC/WHIP • ultra-low latency • kamera dan mikrofon hanya aktif setelah Anda menekan MULAI LIVE.")}
      </div>
    </section>
  );
}
