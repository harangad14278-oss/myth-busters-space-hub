import React, { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, X, XCircle } from "lucide-react";
import { soundEngine } from "../utils/soundEngine";

type Category = "All" | "Space" | "Physics" | "Biology";

interface MythCardItem {
  id: string;
  title: string;
  category: Exclude<Category, "All">;
  verdict: "BUSTED" | "CONFIRMED";
  shortTeaser: string;
  explanation: string;
  funFact: string;
}

const MYTHS: MythCardItem[] = [
  {
    id: "goldfish-memory",
    title: "Goldfish Only Have a 3-Second Memory",
    category: "Biology",
    verdict: "BUSTED",
    shortTeaser: "Do goldfish really forget everything before they finish swimming around their bowl?",
    explanation:
      "Goldfish actually have strong memories that last for months. Scientists have trained goldfish to push levers for food at specific times of day, navigate mazes, and recognize different colors and sounds.",
    funFact: "In experiments, goldfish remembered feeding routines even after five months away from the training tank.",
  },
  {
    id: "dark-side-moon",
    title: "The 'Dark Side' of the Moon Never Gets Sunlight",
    category: "Space",
    verdict: "BUSTED",
    shortTeaser: "Is one half of the Moon trapped in permanent darkness forever?",
    explanation:
      "Every side of the Moon gets two weeks of bright daylight and two weeks of night every month. We call the far side 'dark' only because it faces away from Earth and was a mystery before spacecraft photographed it.",
    funFact: "When we see a New Moon from Earth, the far side of the Moon is actually in full, bright midday sunlight.",
  },
  {
    id: "penny-skyscraper",
    title: "A Dropped Penny Can Crack Concrete Below",
    category: "Physics",
    verdict: "BUSTED",
    shortTeaser: "Could a penny falling off a 100-story building act like a bullet on the sidewalk?",
    explanation:
      "Air resistance slows a flat, lightweight penny down quickly. It reaches a top falling speed of only about 40–50 mph, which stings if it hits your hand but cannot pierce skin or crack concrete.",
    funFact: "Because a penny tumbles and flutters like a leaf as it falls, air pushes against it much harder than against a smooth rock.",
  },
  {
    id: "venus-day",
    title: "A Day on Venus Is Longer Than Its Year",
    category: "Space",
    verdict: "CONFIRMED",
    shortTeaser: "Does Venus take more time to spin once than to travel all the way around the Sun?",
    explanation:
      "Yes! Venus spins incredibly slowly backward, taking 243 Earth days to complete a single rotation. Meanwhile, it orbits the Sun in just 225 Earth days—so a Venusian day really is longer than its year.",
    funFact: "Because Venus spins the opposite direction from Earth, the Sun rises in the west and sets in the east there.",
  },
  {
    id: "water-space",
    title: "Open Water Boils Away Instantly in Space",
    category: "Physics",
    verdict: "CONFIRMED",
    shortTeaser: "Would a cup of cold water start bubbling like a kettle in the vacuum of space?",
    explanation:
      "In a vacuum, there is no air pressure pushing down to hold water molecules together as a liquid. Water immediately boils into vapor—and then the remaining mist rapidly freezes into tiny ice crystals.",
    funFact: "Astronauts who dump excess water from spacecraft watch it flash into a sparkling cloud of ice snow.",
  },
  {
    id: "sun-color",
    title: "The Sun Is Actually White, Not Yellow",
    category: "Space",
    verdict: "CONFIRMED",
    shortTeaser: "If you saw the Sun from outside Earth's atmosphere, what color would it look?",
    explanation:
      "From space, the Sun shines pure white because it gives off all rainbow colors evenly. It only looks yellow or orange from Earth's surface because our atmosphere scatters away blue light across the sky.",
    funFact: "Astronauts on the International Space Station always photograph the Sun as a blinding white star.",
  },
];

const MythSvgIllustration: React.FC<{ id: string }> = ({ id }) => {
  switch (id) {
    case "goldfish-memory":
      return (
        <svg viewBox="0 0 180 100" className="w-full h-28 group-hover:scale-105 transition-transform duration-300" aria-hidden="true">
          <rect width="180" height="100" rx="8" fill="#070C1A" />
          <path d="M20 75 Q50 65 80 75 T140 75 T170 72" stroke="#00F0FF" strokeOpacity="0.25" fill="none" strokeWidth="2" />
          <g className="animate-float" style={{ transformOrigin: "92px 50px" }}>
            <ellipse cx="92" cy="50" rx="28" ry="17" fill="#FB923C" />
            <polygon points="64,50 42,35 47,50 42,65" fill="#F97316" />
            <polygon points="90,34 80,22 102,28" fill="#FDBA74" />
            <circle cx="109" cy="46" r="3" fill="#060913" />
          </g>
          <circle cx="132" cy="36" r="4" fill="none" stroke="#00F0FF" strokeWidth="1.5" />
          <circle cx="144" cy="24" r="6" fill="none" stroke="#00F0FF" strokeWidth="1.5" />
        </svg>
      );
    case "dark-side-moon":
      return (
        <svg viewBox="0 0 180 100" className="w-full h-28 group-hover:scale-105 transition-transform duration-300" aria-hidden="true">
          <rect width="180" height="100" rx="8" fill="#070C1A" />
          <circle cx="30" cy="50" r="14" fill="#FDE047" />
          <line x1="50" y1="50" x2="78" y2="38" stroke="#FDE047" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="50" y1="50" x2="78" y2="50" stroke="#FDE047" strokeWidth="1.5" strokeDasharray="3 3" />
          <g className="animate-orbit-slow" style={{ transformOrigin: "115px 50px" }}>
            <circle cx="115" cy="50" r="24" fill="#334155" stroke="#94A3B8" strokeWidth="1.5" />
            <path d="M115 26 A24 24 0 0 0 115 74 Z" fill="#E2E8F0" />
          </g>
        </svg>
      );
    case "penny-skyscraper":
      return (
        <svg viewBox="0 0 180 100" className="w-full h-28 group-hover:scale-105 transition-transform duration-300" aria-hidden="true">
          <rect width="180" height="100" rx="8" fill="#070C1A" />
          <rect x="28" y="18" width="28" height="70" fill="#1E293B" stroke="#00F0FF" strokeOpacity="0.4" />
          <rect x="34" y="26" width="6" height="8" fill="#38BDF8" opacity="0.5" />
          <rect x="44" y="26" width="6" height="8" fill="#38BDF8" opacity="0.5" />
          <path d="M92 20 C102 35, 82 50, 96 72" stroke="#A855F7" strokeWidth="2" strokeDasharray="4 3" fill="none" />
          <ellipse cx="96" cy="76" rx="9" ry="5" fill="#F59E0B" stroke="#FDE68A" strokeWidth="1.2" className="animate-float" />
        </svg>
      );
    case "venus-day":
      return (
        <svg viewBox="0 0 180 100" className="w-full h-28 group-hover:scale-105 transition-transform duration-300" aria-hidden="true">
          <rect width="180" height="100" rx="8" fill="#070C1A" />
          <ellipse cx="90" cy="52" rx="68" ry="28" fill="none" stroke="#A855F7" strokeOpacity="0.45" strokeDasharray="4 4" />
          <circle cx="90" cy="52" r="12" fill="#FDE047" />
          <g className="animate-orbit-slow" style={{ transformOrigin: "90px 52px" }}>
            <circle cx="144" cy="40" r="13" fill="#F59E0B" />
          </g>
        </svg>
      );
    case "water-space":
      return (
        <svg viewBox="0 0 180 100" className="w-full h-28 group-hover:scale-105 transition-transform duration-300" aria-hidden="true">
          <rect width="180" height="100" rx="8" fill="#070C1A" />
          <circle cx="32" cy="22" r="1.5" fill="#FFF" className="animate-pulse" />
          <circle cx="152" cy="26" r="1.5" fill="#FFF" className="animate-pulse" style={{ animationDelay: "1s" }} />
          <path d="M72 44 L78 82 L102 82 L108 44 Z" fill="#0F172A" stroke="#00F0FF" strokeWidth="1.6" />
          <ellipse cx="90" cy="54" rx="14" ry="4" fill="#38BDF8" opacity="0.65" className="animate-float" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 180 100" className="w-full h-28 group-hover:scale-105 transition-transform duration-300" aria-hidden="true">
          <rect width="180" height="100" rx="8" fill="#070C1A" />
          <circle cx="90" cy="50" r="24" fill="#FFFFFF" className="animate-pulse" />
        </svg>
      );
  }
};

interface GallerySectionProps {
  isLight: boolean;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ isLight }) => {
  const [filter, setFilter] = useState<Category>("All");
  const [selectedMyth, setSelectedMyth] = useState<MythCardItem | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedMyth(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const visibleMyths =
    filter === "All" ? MYTHS : MYTHS.filter((m) => m.category === filter);

  return (
    <section id="gallery" className="scroll-mt-24">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className={`text-xs font-mono uppercase tracking-wider ${isLight ? "text-purple-700 font-semibold" : "text-[#A855F7]"}`}>
            Myth Archive
          </span>
          <h2 className={`mt-1.5 text-3xl md:text-4xl font-bold tracking-tight text-balance ${isLight ? "text-[#0F172A]" : "text-white"}`}>
            Famous Myths Busted
          </h2>
          <p className={`mt-2 text-base ${isLight ? "text-slate-600" : "text-slate-300"}`}>
            Click any card below to open the simple science explanation.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className={`inline-flex items-center gap-1 p-1.5 rounded-xl border self-start md:self-auto ${isLight ? "bg-slate-100 border-slate-300" : "bg-[#0B1020] border-[#00F0FF]/30"}`}>
          {(["All", "Space", "Physics", "Biology"] as Category[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setFilter(cat);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                filter === cat
                  ? isLight
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-[#00F0FF] text-[#060913]"
                  : isLight
                    ? "text-slate-700 hover:text-slate-900"
                    : "text-slate-300 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleMyths.map((myth) => {
          const isConfirmed = myth.verdict === "CONFIRMED";
          return (
            <button
              key={myth.id}
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setSelectedMyth(myth);
              }}
              className={`group text-left rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all duration-300 hover:-translate-y-1 cursor-pointer border shadow-sm hover:shadow-lg ${
                isLight
                  ? "bg-white border-slate-300 hover:border-indigo-600"
                  : "bg-[#0B1020] border-[#00F0FF]/25 hover:border-[#00F0FF]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {myth.category}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-display text-xs font-bold tracking-wider uppercase ${
                      isConfirmed
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    {isConfirmed ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" />
                    )}
                    <span>{myth.verdict}</span>
                  </span>
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-300 dark:border-slate-800 mb-4 bg-[#070C1A]">
                  <MythSvgIllustration id={myth.id} />
                </div>

                <h3 className={`text-lg font-bold transition-colors ${isLight ? "text-[#0F172A] group-hover:text-indigo-600" : "text-white group-hover:text-[#00F0FF]"}`}>
                  {myth.title}
                </h3>
                <p className={`mt-2 text-sm leading-relaxed ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                  {myth.shortTeaser}
                </p>
              </div>

              <span className={`text-xs font-semibold ${isLight ? "text-indigo-600" : "text-[#00F0FF]"} group-hover:underline`}>
                Read the real science →
              </span>
            </button>
          );
        })}
      </div>

      {selectedMyth && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="myth-modal-title"
          onClick={() => setSelectedMyth(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg rounded-2xl p-6 md:p-7 shadow-xl border ${
              isLight
                ? "bg-white border-slate-300 text-[#0F172A]"
                : "bg-[#0B1020] border-[#00F0FF]/60 text-white shadow-[0_0_40px_rgba(0,240,255,0.2)]"
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className={`text-xs font-mono ${isLight ? "text-purple-700 font-semibold" : "text-[#A855F7]"}`}>
                  {selectedMyth.category} Myth
                </span>
                <h3 id="myth-modal-title" className={`mt-1 text-2xl font-bold ${isLight ? "text-[#0F172A]" : "text-white"}`}>
                  {selectedMyth.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMyth(null)}
                aria-label="Close explanation"
                className={`p-2 rounded-lg border cursor-pointer ${isLight ? "border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200" : "border-slate-700 text-slate-300 hover:text-white"}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-800 bg-[#070C1A]">
              <MythSvgIllustration id={selectedMyth.id} />
            </div>

            <div className="mb-4 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-md border-2 px-3 py-1 font-display text-sm font-bold tracking-wider uppercase ${
                  selectedMyth.verdict === "CONFIRMED"
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300"
                }`}
              >
                {selectedMyth.verdict === "CONFIRMED" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <span>{selectedMyth.verdict}</span>
              </span>
            </div>

            <p className={`text-base leading-relaxed ${isLight ? "text-slate-700" : "text-slate-200"}`}>
              {selectedMyth.explanation}
            </p>

            <div className={`mt-4 rounded-xl border p-4 ${isLight ? "border-purple-200 bg-purple-50" : "border-[#A855F7]/35 bg-[#060913]"}`}>
              <p className={`text-xs font-mono mb-1 ${isLight ? "text-purple-700 font-semibold" : "text-[#A855F7]"}`}>Cool Space &amp; Science Fact</p>
              <p className={`text-sm leading-relaxed ${isLight ? "text-slate-700" : "text-slate-300"}`}>{selectedMyth.funFact}</p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedMyth(null)}
                className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-colors cursor-pointer ${
                  isLight ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-[#00F0FF] text-[#060913] hover:bg-cyan-300"
                }`}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
