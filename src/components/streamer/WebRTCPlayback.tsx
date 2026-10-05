"use client";

import { useEffect, useRef, useState } from "react";

export default function WebRTCPlayback({
  playbackUrl,
  title = "Live Stream",
}: {
  playbackUrl: string;
  title?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const sessionUrlRef = useRef("");
  const [state, setState] = useState<"connecting" | "live" | "offline" | "error">("connecting");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      try {
        setState("connecting");
        setError("");

        const pc = new RTCPeerConnection();
        pcRef.current = pc;

        pc.addTransceiver("video", { direction: "recvonly" });
        pc.addTransceiver("audio", { direction: "recvonly" });

        const media = new MediaStream();
        if (videoRef.current) {
          videoRef.current.srcObject = media;
          videoRef.current.muted = false;
        }

        pc.ontrack = (event) => {
          event.streams[0]?.getTracks().forEach((track) => {
            if (!media.getTracks().some((existing) => existing.id === track.id)) {
              media.addTrack(track);
            }
          });
          if (!cancelled) setState("live");
          void videoRef.current?.play().catch(() => {});
        };

        pc.onconnectionstatechange = () => {
          if (cancelled) return;
          if (pc.connectionState === "connected") setState("live");
          else if (["failed", "closed", "disconnected"].includes(pc.connectionState)) {
            setState("offline");
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const response = await fetch(playbackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/sdp" },
          body: offer.sdp,
        });

        if (!response.ok) {
          const body = await response.text().catch(() => "");
          throw new Error(body || `WHEP request failed: ${response.status}`);
        }

        const answer = await response.text();
        await pc.setRemoteDescription({ type: "answer", sdp: answer });

        const location = response.headers.get("Location");
        if (location) {
          sessionUrlRef.current = new URL(location, playbackUrl).toString();
        }

        if (!cancelled && pc.connectionState !== "failed") setState("live");
      } catch (err) {
        if (cancelled) return;
        setState("error");
        setError(err instanceof Error ? err.message : "WebRTC playback gagal.");
      }
    };

    void start();

    return () => {
      cancelled = true;
      const sessionUrl = sessionUrlRef.current;
      if (sessionUrl) {
        void fetch(sessionUrl, { method: "DELETE", keepalive: true }).catch(() => {});
      }
      pcRef.current?.close();
      pcRef.current = null;
      sessionUrlRef.current = "";
    };
  }, [playbackUrl]);

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        title={title}
        className="w-full h-full object-contain"
        autoPlay
        playsInline
        controls
      />
      {state !== "live" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-5 text-center">
          <div>
            <div className="text-sm font-black">
              {state === "connecting" ? "Menghubungkan ke live..." :
               state === "error" ? "Live belum dapat diputar" : "Streamer belum live"}
            </div>
            {error && <div className="text-[11px] text-rose-300 mt-2 break-words max-w-md">{error}</div>}
          </div>
        </div>
      )}
      {state === "live" && (
        <div className="absolute left-3 top-3 rounded-lg bg-rose-600/90 px-2.5 py-1 text-[10px] font-black">
          LIVE
        </div>
      )}
    </div>
  );
}
