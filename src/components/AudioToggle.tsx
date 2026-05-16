// import { useState } from "react";
// import { audioManager } from "@/lib/audioManager";

// export const AudioToggle = () => {
//   const [muted, setMuted] = useState(false);

//   const toggle = () => {
//     const nowMuted = audioManager.toggleMute();
//     setMuted(nowMuted);
//   };

//   return (
//     <button
//       onClick={toggle}
//       aria-label={muted ? "Unmute" : "Mute"}
//       style={{
//         position: "fixed",
//         bottom: "1.5rem",
//         right: "1.5rem",
//         zIndex: 9999,
//         width: "44px",
//         height: "44px",
//         borderRadius: "50%",
//         background: "rgba(255,255,255,0.08)",
//         backdropFilter: "blur(12px)",
//         border: "1px solid rgba(255,255,255,0.15)",
//         color: "rgba(255,255,255,0.7)",
//         fontSize: "1.2rem",
//         cursor: "pointer",
//         display: "grid",
//         placeItems: "center",
//         transition: "all 0.3s ease",
//       }}
//     >
//       {muted ? "🔇" : "🔊"}
//     </button>
//   );
// };



import { useState, useEffect } from "react";
import { audioManager } from "@/lib/audioManager";

export const AudioToggle = () => {
  const [muted, setMuted] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPending(audioManager.hasPending());
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const toggle = () => {
    if (audioManager.hasPending()) {
      audioManager.resumePending();
      setPending(false);
      return;
    }
    const nowMuted = audioManager.toggleMute();
    setMuted(nowMuted);
  };

  return (
    <>
      {/* Pulse keyframe injected once */}
      <style>{`
        @keyframes audio-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245,200,66,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(245,200,66,0); }
        }
      `}</style>

      <button
        onClick={toggle}
        aria-label={pending ? "Click to start audio" : muted ? "Unmute" : "Mute"}
        title={pending ? "Click to enable sound" : muted ? "Unmute" : "Mute"}
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 9999,
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: pending
            ? "rgba(245,200,66,0.12)"
            : "rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: pending
            ? "1px solid rgba(245,200,66,0.5)"
            : "1px solid rgba(255,255,255,0.15)",
          color: pending
            ? "rgba(245,200,66,0.9)"
            : "rgba(255,255,255,0.7)",
          fontSize: "1.2rem",
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          transition: "all 0.3s ease",
          animation: pending
            ? "audio-pulse 1.8s ease-in-out infinite"
            : "none",
        }}
      >
        {pending ? "♪" : muted ? "🔇" : "🔊"}
      </button>
    </>
  );
};