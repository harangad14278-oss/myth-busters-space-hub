import React, { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, Compass, Radio } from "lucide-react";
import { soundEngine } from "../utils/soundEngine";

interface HeroSectionProps {
  isLight: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ isLight }) => {
  const [missionTime, setMissionTime] = useState("T+04:12:38");

  useEffect(() => {
    let secs = 15158;
    const timer = setInterval(() => {
      secs += 1;
      const hrs = Math.floor(secs / 3600);
      const mins = Math.floor((secs % 3600) / 60);
      const s = secs % 60;
      setMissionTime(
        `T+${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="home"
      className={`relative overflow-hidden border-b py-16 md:py-24 lg:py-28 scroll-mt-16 transition-colors ${
        isLight ? "border-slate-200 bg-[#F1F5F9]/70" : "border-[#00F0FF]/20 bg-[#060913]/70"
      }`}
    >
      {/* Live Orbiting Planets & Radar Rings */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
      >
        <div className="relative h-[560px] w-[560px] md:h-[760px] md:w-[760px]">
          {/* Outer Ring 1 */}
          <div className={`absolute inset-0 rounded-full border ${isLight ? "border-indigo-500/20" : "border-[#00F0FF]/30"}`} />
          <div className="absolute inset-0 animate-orbit-slow">
            <span className={`absolute -top-2 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full shadow-lg ${isLight ? "bg-indigo-600 shadow-indigo-600/50" : "bg-[#00F0FF] shadow-[0_0_14px_#00F0FF]"}`} />
          </div>

          {/* Middle Ring 2 (Reverse) */}
          <div className={`absolute inset-20 rounded-full border border-dashed ${isLight ? "border-purple-500/20" : "border-[#A855F7]/30"}`} />
          <div className="absolute inset-20 animate-orbit-reverse">
            <span className={`absolute top-1/2 -right-2 -translate-y-1/2 h-3.5 w-3.5 rounded-full shadow-lg ${isLight ? "bg-purple-600 shadow-purple-600/50" : "bg-[#A855F7] shadow-[0_0_14px_#A855F7]"}`} />
          </div>

          {/* Inner Ring 3 */}
          <div className={`absolute inset-40 rounded-full border ${isLight ? "border-cyan-500/20" : "border-cyan-400/25"}`} />
          <div className="absolute inset-40 animate-orbit-slow" style={{ animationDuration: "18s" }}>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-amber-400 shadow-[0_0_12px_#F59E0B]" />
          </div>

          <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-500/15" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-cyan-500/15" />

          <div
            className="absolute inset-0 rounded-full animate-radar-sweep opacity-35"
            style={{
              background: isLight
                ? "conic-gradient(from 0deg, rgba(79,70,229,0.18) 0deg, rgba(168,85,247,0.06) 42deg, transparent 78deg)"
                : "conic-gradient(from 0deg, rgba(0,240,255,0.25) 0deg, rgba(168,85,247,0.08) 42deg, transparent 78deg)",
            }}
          />
        </div>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center">
        {/* Floating Rocket Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 animate-float shadow-sm bg-white/10 dark:bg-[#0B1020]/80 backdrop-blur-md">
          <Radio className={`h-4 w-4 animate-pulse ${isLight ? "text-indigo-600" : "text-[#00F0FF]"}`} />
          <span className={`text-xs font-mono font-semibold tracking-wider ${isLight ? "text-indigo-900" : "text-[#00F0FF]"}`}>
            MISSION CLOCK: {missionTime} · NOMINAL
          </span>
        </div>

        <div className="inline-flex items-center gap-2 text-xs font-mono tracking-wider uppercase mb-3 block">
          <Compass className={`h-4 w-4 inline mr-1 ${isLight ? "text-indigo-600" : "text-[#00F0FF]"}`} />
          <span className={isLight ? "text-indigo-600 font-semibold" : "text-[#00F0FF]"}>Myth Busters: The Science &amp; Space Hub</span>
        </div>

        <h1 className={`font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] text-balance mx-auto max-w-3xl ${isLight ? "text-[#0F172A]" : "text-white"}`}>
          Separating Space Fact from Sci-Fi Fiction.
        </h1>

        <p className={`mt-6 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed ${isLight ? "text-slate-600" : "text-slate-200"}`}>
          Check viral space rumors with real search data, test Hollywood physics against real vacuum science, and see how long you would survive on other worlds.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#services"
            onClick={() => soundEngine.playClick()}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl px-7 py-3.5 text-base font-bold transition-colors shadow-sm whitespace-nowrap ${
              isLight
                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20"
                : "bg-[#00F0FF] text-[#060913] hover:bg-cyan-300 shadow-[0_0_24px_rgba(0,240,255,0.3)]"
            }`}
          >
            <span>Try the Myth Lab</span>
            <ArrowDown className="h-4 w-4 shrink-0" />
          </a>

          <a
            href="#register"
            onClick={() => soundEngine.playClick()}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl border px-7 py-3.5 text-base font-semibold transition-colors whitespace-nowrap ${
              isLight
                ? "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                : "border-[#A855F7]/70 bg-[#0C1222]/90 text-white hover:border-[#A855F7] hover:bg-[#A855F7]/15"
            }`}
          >
            <span>Join the Club</span>
            <ArrowRight className={`h-4 w-4 shrink-0 ${isLight ? "text-indigo-600" : "text-[#A855F7]"}`} />
          </a>
        </div>
      </div>
    </section>
  );
};
