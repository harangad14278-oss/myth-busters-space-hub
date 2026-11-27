import React, { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Timer } from "lucide-react";
import { soundEngine } from "../utils/soundEngine";

type PlanetId = "venus" | "mars" | "titan" | "europa" | "jupiter";
type OutfitId = "tshirt" | "scuba" | "spacesuit";

interface SurvivalResult {
  seconds: number;
  headline: string;
  explanation: string;
}

const PLANET_OPTIONS: Array<{ id: PlanetId; label: string }> = [
  { id: "venus", label: "Venus (464 °C Acid Oven)" },
  { id: "mars", label: "Mars (Thin Freezing Air)" },
  { id: "titan", label: "Titan (-179 °C Methane Moon)" },
  { id: "europa", label: "Europa (Ice & Radiation Moon)" },
  { id: "jupiter", label: "Jupiter (Crushing Gas Giant)" },
];

const OUTFIT_OPTIONS: Array<{ id: OutfitId; label: string }> = [
  { id: "tshirt", label: "T-Shirt & Jeans" },
  { id: "scuba", label: "Scuba Gear" },
  { id: "spacesuit", label: "NASA Spacesuit" },
];

const SURVIVAL_DATA: Record<PlanetId, Record<OutfitId, SurvivalResult>> = {
  venus: {
    tshirt: {
      seconds: 0.8,
      headline: "Less than 1 second!",
      explanation:
        "Venus has crushing air pressure 92 times stronger than Earth—like being 3,000 feet underwater—plus oven-hot 464 °C heat that burns instantly. Your lungs and body would collapse in less than one second.",
    },
    scuba: {
      seconds: 1.5,
      headline: "About 1.5 seconds",
      explanation:
        "Even with an oxygen tank, scuba gear is built for water, not 464 °C acid clouds and 92 times Earth air pressure. The mask and hoses would melt and crush almost immediately.",
    },
    spacesuit: {
      seconds: 42,
      headline: "About 42 seconds",
      explanation:
        "A NASA spacesuit keeps air inside in empty space, but it isn't built to hold back Venus's massive outside pressure pushing inward. Within a minute, the joints would lock up and the helmet visor would crack.",
    },
  },
  mars: {
    tshirt: {
      seconds: 90,
      headline: "15 sec awake · 90 sec max",
      explanation:
        "Mars's air is 100 times thinner than Earth's and has almost no oxygen, so you would pass out in about 15 seconds. Without air pressure, moisture on your tongue and in your lungs would also start bubbling like soda.",
    },
    scuba: {
      seconds: 28,
      headline: "About 28 seconds",
      explanation:
        "Scuba gear only pushes air into your lungs at the pressure around you, and Mars's air is far too thin for your lungs to absorb oxygen. The freezing -63 °C cold would also numb exposed skin right away.",
    },
    spacesuit: {
      seconds: 28800,
      headline: "8 full hours (28,800 seconds)",
      explanation:
        "A NASA spacesuit creates its own cozy bubble of oxygen and keeps your body warm against the freezing Martian air. You could walk around comfortably for 8 hours until your air tanks and batteries run low.",
    },
  },
  titan: {
    tshirt: {
      seconds: 1.8,
      headline: "About 1.8 seconds",
      explanation:
        "Titan is a freezing -179 °C with thick nitrogen and methane air that pulls heat out of your body super fast. Taking even one breath would freeze your throat and lungs solid in under two seconds.",
    },
    scuba: {
      seconds: 6.0,
      headline: "About 6 seconds",
      explanation:
        "Your scuba tank gives you a couple of warm breaths, so you last a few seconds longer than in normal clothes. However, the -179 °C cold quickly freezes the metal breathing valves shut and freezes your body.",
    },
    spacesuit: {
      seconds: 14400,
      headline: "4 full hours (14,400 seconds)",
      explanation:
        "Titan's thick freezing air drains the spacesuit's electric heaters twice as fast as empty space does. You stay safe and warm inside for about 4 hours before the suit's heater batteries run out.",
    },
  },
  europa: {
    tshirt: {
      seconds: 14,
      headline: "About 14 seconds",
      explanation:
        "Europa has almost no air at all—just like outer space—so you lose consciousness in about 14 seconds from lack of oxygen. On top of that, its icy surface is -160 °C and gets hit by strong radiation from Jupiter.",
    },
    scuba: {
      seconds: 22,
      headline: "About 22 seconds",
      explanation:
        "In a near-vacuum, a scuba mask cannot hold pressure around your eyes or face, and the cold rapidly freezes exposed skin. You would pass out in under half a minute.",
    },
    spacesuit: {
      seconds: 7200,
      headline: "2 hours (7,200 seconds)",
      explanation:
        "A NASA spacesuit handles the vacuum and freezing ice easily, giving you air and warmth. Unfortunately, Jupiter blasts Europa with intense radiation, limiting how long you can safely stay outside to about 2 hours.",
    },
  },
  jupiter: {
    tshirt: {
      seconds: 0.5,
      headline: "Half a second!",
      explanation:
        "Jupiter has no solid ground to stand on—you fall straight into 300+ mph ammonia storms with gravity more than twice as strong as Earth's. The freezing winds and fast-rising pressure crush you in half a second.",
    },
    scuba: {
      seconds: 0.9,
      headline: "Less than 1 second",
      explanation:
        "Jupiter's strong gravity pulls you deep into thick hydrogen gas where the pressure skyrockets every second. Scuba gear breaks apart almost immediately under the violent winds and crushing weight.",
    },
    spacesuit: {
      seconds: 3.5,
      headline: "About 3.5 seconds",
      explanation:
        "Even a tough NASA spacesuit can't survive falling into a gas giant. As Jupiter's gravity pulls you deeper, the squeezing pressure multiplies rapidly until the helmet and suit buckle in just a few seconds.",
    },
  },
};

function formatSecondsDisplay(sec: number): string {
  if (sec >= 3600) {
    return Math.round(sec).toLocaleString();
  }
  return sec.toFixed(1);
}

interface SurvivalCalculatorProps {
  isLight: boolean;
}

export const SurvivalCalculator: React.FC<SurvivalCalculatorProps> = ({ isLight }) => {
  const [planet, setPlanet] = useState<PlanetId>("venus");
  const [outfit, setOutfit] = useState<OutfitId>("tshirt");
  const [remaining, setRemaining] = useState<number>(SURVIVAL_DATA.venus.tshirt.seconds);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);

  const lastBeepRef = useRef(0);
  const info = SURVIVAL_DATA[planet][outfit];
  const isLongDuration = info.seconds > 120;
  const simSpeed = isLongDuration ? 600 : 1;

  useEffect(() => {
    setRunning(false);
    setFinished(false);
    setRemaining(SURVIVAL_DATA[planet][outfit].seconds);
  }, [planet, outfit]);

  useEffect(() => {
    if (!running) return;
    let lastTs = performance.now();
    let rafId = 0;

    const tick = (now: number) => {
      const dt = ((now - lastTs) / 1000) * simSpeed;
      lastTs = now;

      setRemaining((prev) => {
        const next = Math.max(0, prev - dt);
        if (now - lastBeepRef.current > 350 && next > 0) {
          lastBeepRef.current = now;
          soundEngine.playCountdownTick(next < 5 || !isLongDuration);
        }
        if (next <= 0) {
          setRunning(false);
          setFinished(true);
          soundEngine.playStamp("BUSTED");
          return 0;
        }
        return next;
      });

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [running, simSpeed, isLongDuration]);

  const handleStart = () => {
    soundEngine.playClick();
    if (finished || remaining <= 0) {
      setRemaining(info.seconds);
      setFinished(false);
    }
    setRunning(true);
  };

  const handleReset = () => {
    soundEngine.playClick();
    setRunning(false);
    setFinished(false);
    setRemaining(info.seconds);
  };

  const pct = Math.max(0, Math.min(100, (remaining / info.seconds) * 100));

  return (
    <div
      className={`rounded-2xl p-6 md:p-8 border shadow-sm transition-colors ${
        isLight
          ? "bg-white border-slate-300 text-[#0F172A]"
          : "bg-[#0B1020] border-[#00F0FF]/40 text-white shadow-[0_0_28px_rgba(0,240,255,0.06)]"
      }`}
    >
      <div className={`mb-6 pb-5 border-b flex flex-col gap-2 md:flex-row md:items-end md:justify-between ${isLight ? "border-slate-200" : "border-slate-800"}`}>
        <div>
          <span className={`text-xs font-mono uppercase tracking-wider ${isLight ? "text-indigo-600 font-semibold" : "text-[#00F0FF]"}`}>
            Tool 3 · &ldquo;How Long Would You Survive?&rdquo; Planet Tester
          </span>
          <h3 className={`mt-1 text-2xl font-bold ${isLight ? "text-[#0F172A]" : "text-white"}`}>
            Test Different Worlds &amp; Outfits
          </h3>
        </div>
        <p className={`text-sm max-w-lg ${isLight ? "text-slate-600" : "text-slate-300"}`}>
          <span className={`font-semibold ${isLight ? "text-indigo-600" : "text-[#00F0FF]"}`}>How to play:</span> Pick a planet and an outfit using the two dropdown menus, then press <span className={`font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>Start Countdown</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 flex flex-col justify-between gap-5">
          <div className="space-y-5">
            <div>
              <label htmlFor="planet-select" className={`block text-sm font-semibold mb-2 ${isLight ? "text-[#0F172A]" : "text-white"}`}>
                1. Pick a Planet or Moon
              </label>
              <select
                id="planet-select"
                value={planet}
                onChange={(e) => {
                  soundEngine.playClick();
                  setPlanet(e.target.value as PlanetId);
                }}
                className={`w-full rounded-xl border px-4 py-3 text-sm sm:text-base focus:outline-none cursor-pointer ${
                  isLight
                    ? "bg-[#F8FAFC] border-slate-300 text-[#0F172A] focus:border-indigo-600"
                    : "bg-[#060913] border-[#00F0FF]/45 text-white focus:border-[#00F0FF]"
                }`}
              >
                {PLANET_OPTIONS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="outfit-select" className={`block text-sm font-semibold mb-2 ${isLight ? "text-[#0F172A]" : "text-white"}`}>
                2. Pick Your Outfit
              </label>
              <select
                id="outfit-select"
                value={outfit}
                onChange={(e) => {
                  soundEngine.playClick();
                  setOutfit(e.target.value as OutfitId);
                }}
                className={`w-full rounded-xl border px-4 py-3 text-sm sm:text-base focus:outline-none cursor-pointer ${
                  isLight
                    ? "bg-[#F8FAFC] border-slate-300 text-[#0F172A] focus:border-indigo-600"
                    : "bg-[#060913] border-[#A855F7]/45 text-white focus:border-[#A855F7]"
                }`}
              >
                {OUTFIT_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            {!running ? (
              <button
                type="button"
                onClick={handleStart}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-colors cursor-pointer ${
                  isLight
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-[#00F0FF] text-[#060913] hover:bg-cyan-300"
                }`}
              >
                <Play className="h-4 w-4" />
                <span>{finished ? "Replay Countdown" : "Start Countdown"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setRunning(false);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer"
              >
                <Pause className="h-4 w-4" />
                <span>Pause Timer</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              aria-label="Reset countdown"
              className={`p-3 rounded-xl border cursor-pointer ${
                isLight ? "border-slate-300 bg-[#F8FAFC] text-slate-800 hover:bg-slate-100" : "border-slate-700 bg-[#060913] text-slate-200 hover:border-slate-500"
              }`}
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className={`lg:col-span-7 rounded-xl border p-6 flex flex-col justify-between gap-5 ${isLight ? "bg-[#F8FAFC] border-slate-300" : "bg-[#060913] border-slate-800"}`}>
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b ${isLight ? "border-slate-200" : "border-slate-800"}`}>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mb-1">
                <Timer className={`h-4 w-4 ${isLight ? "text-indigo-600" : "text-[#00F0FF]"}`} />
                <span>Survival Countdown</span>
              </div>
              <div
                className={`font-mono text-4xl sm:text-5xl font-bold tracking-tight ${
                  finished || remaining < 5
                    ? "text-rose-500 dark:text-rose-400"
                    : info.seconds >= 3600
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-300"
                }`}
              >
                {formatSecondsDisplay(remaining)}
                <span className="ml-2 text-lg font-normal text-slate-500 dark:text-slate-400">seconds</span>
              </div>
              {isLongDuration && (
                <p className="mt-1 text-xs font-mono text-emerald-600 dark:text-emerald-300">
                  Total time: {info.headline} (countdown sped up 600× to preview)
                </p>
              )}
            </div>

            <div className="sm:text-right">
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 block">Result</span>
              <span className={`text-lg font-bold ${isLight ? "text-[#0F172A]" : "text-white"}`}>{info.headline}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className={`h-2.5 w-full rounded-full border overflow-hidden ${isLight ? "bg-slate-200 border-slate-300" : "bg-[#0B1020] border-slate-800"}`}>
              <div
                className={`h-full transition-all duration-100 ${
                  pct > 50 ? "bg-emerald-500" : pct > 20 ? "bg-amber-500" : "bg-rose-500"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div>
            <p className={`text-xs font-mono uppercase tracking-wider mb-2 ${isLight ? "text-purple-700 font-semibold" : "text-[#A855F7]"}`}>
              Why Would That Happen?
            </p>
            <p className={`text-base leading-relaxed ${isLight ? "text-slate-700" : "text-slate-200"}`}>{info.explanation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
