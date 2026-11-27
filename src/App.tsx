import { useState, useEffect } from "react";
import { Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { LiveSpaceBackground } from "./components/LiveSpaceBackground";
import { HeroSection } from "./components/HeroSection";
import { AboutSection } from "./components/AboutSection";
import { RumorScanner } from "./components/RumorScanner";
import { PhysicsSandbox } from "./components/PhysicsSandbox";
import { SurvivalCalculator } from "./components/SurvivalCalculator";
import { ScholarDebate } from "./components/ScholarDebate";
import { SpaceQuiz } from "./components/SpaceQuiz";
import { SpaceArcade } from "./components/SpaceArcade";
import { GallerySection } from "./components/GallerySection";
import { RegisterSection } from "./components/RegisterSection";
import { soundEngine } from "./utils/soundEngine";

export default function App() {
  const [muted, setMuted] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    soundEngine.setMuted(muted);
  }, [muted]);

  const toggleSound = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
    if (!nextMuted) {
      soundEngine.playClick();
    }
  };

  const toggleTheme = () => {
    soundEngine.playClick();
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const isLight = theme === "light";

  return (
    <div
      className={`min-h-screen transition-colors duration-200 flex flex-col relative ${
        isLight
          ? "bg-[#F8FAFC] text-[#0F172A]"
          : "bg-[#060913] text-white"
      }`}
    >
      {/* Global Live Moving Space Background */}
      <LiveSpaceBackground isLight={isLight} />

      {/* Sticky Top Navigation Bar */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
          isLight
            ? "border-slate-200 bg-white/95 text-[#0F172A]"
            : "border-[#00F0FF]/20 bg-[#060913]/92 text-white"
        }`}
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="#home"
            className="font-display text-lg md:text-xl font-bold tracking-tight whitespace-nowrap shrink-0"
          >
            Myth Busters
          </a>

          <nav
            aria-label="Main navigation"
            className={`hidden md:flex items-center gap-7 text-sm font-medium ${
              isLight ? "text-slate-700" : "text-slate-200"
            }`}
          >
            <a
              href="#home"
              className={`hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
                isLight ? "hover:text-indigo-600" : "hover:text-[#00F0FF]"
              }`}
            >
              Home
            </a>
            <a
              href="#about"
              className={`hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
                isLight ? "hover:text-indigo-600" : "hover:text-[#00F0FF]"
              }`}
            >
              About
            </a>
            <a
              href="#services"
              className={`hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
                isLight ? "hover:text-indigo-600" : "hover:text-[#00F0FF]"
              }`}
            >
              Services
            </a>
            <a
              href="#gallery"
              className={`hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
                isLight ? "hover:text-indigo-600" : "hover:text-[#00F0FF]"
              }`}
            >
              Gallery
            </a>
            <a
              href="#register"
              className={`hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
                isLight ? "hover:text-indigo-600" : "hover:text-[#00F0FF]"
              }`}
            >
              Register
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle light or dark mode"
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                isLight
                  ? "border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200"
                  : "border-slate-700 bg-[#0B1020] text-slate-200 hover:border-slate-500"
              }`}
            >
              {isLight ? (
                <>
                  <Moon className="h-4 w-4 shrink-0 text-indigo-600" />
                  <span>Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>Light Mode</span>
                </>
              )}
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={!muted}
              className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                muted
                  ? isLight
                    ? "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200"
                    : "border-slate-700 bg-[#0B1020] text-slate-300 hover:border-slate-500"
                  : isLight
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                    : "border-[#00F0FF]/55 bg-[#00F0FF]/12 text-[#00F0FF]"
              }`}
            >
              {muted ? (
                <>
                  <VolumeX className="h-4 w-4 shrink-0" />
                  <span>Sound Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 shrink-0" />
                  <span>Sound On</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {/* 1. Home (Hero Section) */}
        <HeroSection isLight={isLight} />

        {/* 2–5. Spacious Structured Sections */}
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-16 md:py-20 space-y-24">
          {/* 2. About Section ("How It Works") */}
          <AboutSection isLight={isLight} />

          {/* 3. Services Section (Interactive Myth-Busting Lab with all tools) */}
          <section id="services" className="scroll-mt-24 space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <p className={`text-xs font-mono uppercase tracking-wider ${isLight ? "text-indigo-600 font-semibold" : "text-[#00F0FF]"}`}>
                Interactive Myth-Busting Lab
              </p>
              <h2 className={`mt-2 text-3xl md:text-4xl font-bold tracking-tight text-balance ${isLight ? "text-[#0F172A]" : "text-white"}`}>
                Test Space &amp; Science Myths Yourself
              </h2>
              <p className={`mt-3 text-base ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                Explore our 6 hands-on Mission Control tools below—each includes quick instructions and instant results.
              </p>
            </div>

            <RumorScanner isLight={isLight} />
            <PhysicsSandbox isLight={isLight} />
            <SurvivalCalculator isLight={isLight} />
            <ScholarDebate isLight={isLight} />
            <SpaceQuiz isLight={isLight} />
            <SpaceArcade isLight={isLight} />
          </section>

          {/* 4. Gallery Section ("Famous Myths Busted") */}
          <GallerySection isLight={isLight} />

          {/* 5. Contact & Register Section */}
          <RegisterSection isLight={isLight} />
        </div>
      </main>

      <footer
        className={`border-t transition-colors relative z-10 ${
          isLight ? "border-slate-200 bg-white text-slate-600" : "border-[#00F0FF]/20 bg-[#060913] text-slate-400"
        }`}
      >
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <span>Myth Busters: The Science &amp; Space Hub</span>
          <a href="#home" className={`hover:underline font-mono text-xs ${isLight ? "text-indigo-600 font-semibold" : "text-[#00F0FF]"}`}>
            Back to Top
          </a>
        </div>
      </footer>
    </div>
  );
}
