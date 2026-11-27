import React, { useEffect, useState } from "react";

interface LiveSpaceBackgroundProps {
  isLight: boolean;
}

export const LiveSpaceBackground: React.FC<LiveSpaceBackgroundProps> = ({ isLight }) => {
  const [shooting, setShooting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShooting(true);
      setTimeout(() => setShooting(false), 1400);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  if (isLight) {
    return (
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        {/* Light Mode Rotating Observatory Blueprint Grids */}
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full border border-indigo-500/10 animate-orbit-slow" />
        <div className="absolute -bottom-40 -left-40 h-[700px] w-[700px] rounded-full border border-dashed border-purple-500/10 animate-orbit-reverse" />
        
        {/* Soft floating light orbs */}
        <div className="absolute top-1/4 left-1/5 h-72 w-72 rounded-full bg-indigo-400/5 blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/4 h-96 w-96 rounded-full bg-purple-400/5 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

        {/* Blueprint Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #4f46e5 1px, transparent 1px), linear-gradient(to bottom, #4f46e5 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {/* Dark Mode Floating Nebula Glow */}
      <div className="absolute -top-48 -left-48 h-[650px] w-[650px] rounded-full bg-[#00F0FF]/5 blur-[120px] animate-float" />
      <div className="absolute top-1/3 -right-48 h-[750px] w-[750px] rounded-full bg-[#A855F7]/5 blur-[140px] animate-float" style={{ animationDelay: "2.5s" }} />
      <div className="absolute -bottom-48 left-1/3 h-[600px] w-[600px] rounded-full bg-cyan-600/5 blur-[130px] animate-float" style={{ animationDelay: "1s" }} />

      {/* Telemetry Grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0,240,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(168,85,247,0.4) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      {/* Twinkling Star Field */}
      <div className="absolute inset-0">
        <div className="absolute top-[12%] left-[18%] h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_white] animate-[twinkle_3s_ease-in-out_infinite]" />
        <div className="absolute top-[28%] left-[75%] h-1 w-1 rounded-full bg-[#00F0FF] shadow-[0_0_6px_#00F0FF] animate-[twinkle_2.2s_ease-in-out_infinite_0.4s]" />
        <div className="absolute top-[45%] left-[32%] h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_white] animate-[twinkle_4s_ease-in-out_infinite_1s]" />
        <div className="absolute top-[65%] left-[82%] h-1 w-1 rounded-full bg-[#A855F7] shadow-[0_0_6px_#A855F7] animate-[twinkle_3.5s_ease-in-out_infinite_0.8s]" />
        <div className="absolute top-[82%] left-[15%] h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_white] animate-[twinkle_2.8s_ease-in-out_infinite_1.6s]" />
        <div className="absolute top-[15%] left-[90%] h-1 w-1 rounded-full bg-[#00F0FF] shadow-[0_0_6px_#00F0FF] animate-[twinkle_3.2s_ease-in-out_infinite_2s]" />
      </div>

      {/* Periodic Shooting Star */}
      {shooting && (
        <div
          className="absolute top-[10%] right-[25%] h-0.5 w-32 bg-gradient-to-l from-white via-[#00F0FF] to-transparent rounded-full rotate-[-38deg] animate-[shooting-star_1.2s_linear_forwards]"
        />
      )}
    </div>
  );
};
