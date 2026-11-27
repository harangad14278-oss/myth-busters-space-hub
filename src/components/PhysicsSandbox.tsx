import React, { useEffect, useRef, useState } from "react";
import { Flame, Orbit, Volume2, VolumeX, Zap } from "lucide-react";
import { soundEngine } from "../utils/soundEngine";

type SimId = "explosion" | "asteroids" | "laser";
type PhysicsMode = "movie" | "real";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  maxLife: number;
  color: string;
  kind: "flame" | "spark" | "gas" | "debris";
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface Asteroid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  angle: number;
  spin: number;
  vertices: number[];
}

interface LaserBolt {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  angle: number;
  life: number;
}

const EXPLANATIONS: Record<SimId, { title: string; movie: string; real: string }> = {
  explosion: {
    title: "1. Explosion in Space",
    movie:
      "In movies, space explosions make a huge booming sound and giant fiery clouds because directors want them to feel dramatic—just like explosions on Earth.",
    real:
      "In real space, there is no air to carry sound waves, so even a massive explosion is 100% silent. Without oxygen, there is no bright swirling fire—just a quick flash and an expanding ring of gas.",
  },
  asteroids: {
    title: "2. Asteroid Belt",
    movie:
      "Sci-fi movies pack rocks right next to each other so spaceships have to dodge and weave like race cars in heavy traffic.",
    real:
      "In the real solar system, asteroids are spread out across millions of miles of empty space. NASA probes fly straight through the Asteroid Belt without ever coming close to hitting a rock.",
  },
  laser: {
    title: "3. Laser Blasters",
    movie:
      "Movie blasters fire glowing bolts slow enough for you to watch them streak across the screen, paired with loud 'pew!' sound effects.",
    real:
      "Real lasers move at the speed of light—hitting their target in a tiny fraction of a blink. Because space has no dust or air to bounce light sideways, the beam is completely invisible until it hits.",
  },
};

interface PhysicsSandboxProps {
  isLight: boolean;
}

export const PhysicsSandbox: React.FC<PhysicsSandboxProps> = ({ isLight }) => {
  const [activeSim, setActiveSim] = useState<SimId>("explosion");
  const [mode, setMode] = useState<PhysicsMode>("movie");
  const [statusLine, setStatusLine] = useState(
    "Movie Magic is ON — press 'Explosion in Space' or click the screen to test!"
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modeRef = useRef<PhysicsMode>(mode);
  const simRef = useRef<SimId>(activeSim);

  const stateRef = useRef({
    stars: Array.from({ length: 80 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 1.6 + 0.5,
      alpha: Math.random() * 0.6 + 0.25,
    })),
    particles: [] as Particle[],
    shockwaves: [] as Shockwave[],
    movieAsteroids: [] as Asteroid[],
    realAsteroids: [] as Asteroid[],
    bolts: [] as LaserBolt[],
    shake: 0,
    shipT: 0,
    targetHitFlash: 0,
    emitterFlash: 0,
    targetPos: { x: 0.78, y: 0.5 },
  });

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    simRef.current = activeSim;
  }, [activeSim]);

  const initAsteroids = (width: number, height: number) => {
    const makeRock = (dense: boolean): Asteroid => {
      const vertices = Array.from({ length: 8 }, () => 0.72 + Math.random() * 0.45);
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: dense ? -(1.5 + Math.random() * 2.6) : -(0.2 + Math.random() * 0.25),
        vy: dense ? (Math.random() - 0.5) * 1.0 : (Math.random() - 0.5) * 0.06,
        r: dense ? 11 + Math.random() * 18 : 2.5 + Math.random() * 2,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * (dense ? 0.05 : 0.01),
        vertices,
      };
    };
    stateRef.current.movieAsteroids = Array.from({ length: 44 }, () => makeRock(true));
    stateRef.current.realAsteroids = Array.from({ length: 2 }, () => makeRock(false));
  };

  const triggerExplosion = (nx?: number, ny?: number, overrideMode?: PhysicsMode) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const x = nx !== undefined ? nx : canvas.width * 0.5;
    const y = ny !== undefined ? ny : canvas.height * 0.5;
    const s = stateRef.current;
    const activeMode = overrideMode ?? modeRef.current;

    if (activeMode === "movie") {
      soundEngine.playMovieExplosion();
      s.shake = 16;
      s.shockwaves.push({ x, y, radius: 8, maxRadius: 200, alpha: 0.95, color: "#fb923c" });
      s.shockwaves.push({ x, y, radius: 4, maxRadius: 140, alpha: 0.85, color: "#fde047" });
      for (let i = 0; i < 60; i++) {
        const ang = Math.random() * Math.PI * 2;
        const speed = 1.2 + Math.random() * 5.0;
        const isSpark = i % 3 === 0;
        s.particles.push({
          x,
          y,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed,
          radius: isSpark ? 2.5 : 10 + Math.random() * 16,
          life: 1,
          maxLife: isSpark ? 45 : 42,
          color: isSpark ? "#fef08a" : i % 2 === 0 ? "#f97316" : "#ef4444",
          kind: isSpark ? "spark" : "flame",
        });
      }
      setStatusLine("Movie Magic: LOUD boom played + fiery orange explosion!");
    } else {
      s.shake = 0;
      s.shockwaves.push({ x, y, radius: 4, maxRadius: 220, alpha: 0.9, color: "#00F0FF" });
      for (let i = 0; i < 38; i++) {
        const ang = (i / 38) * Math.PI * 2;
        const speed = 3.4;
        s.particles.push({
          x,
          y,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed,
          radius: i % 4 === 0 ? 2 : 4.5,
          life: 1,
          maxLife: 65,
          color: i % 4 === 0 ? "#ffffff" : "rgba(0, 240, 255, 0.7)",
          kind: i % 4 === 0 ? "debris" : "gas",
        });
      }
      setStatusLine("Real Space: Complete silence (0 sound) + clean expanding gas ring!");
    }
  };

  const triggerLaser = (tx?: number, ty?: number, overrideMode?: PhysicsMode) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const s = stateRef.current;
    const activeMode = overrideMode ?? modeRef.current;
    const emitterX = 68;
    const emitterY = canvas.height * 0.5;
    const targetX = tx !== undefined ? tx : canvas.width * s.targetPos.x;
    const targetY = ty !== undefined ? ty : canvas.height * s.targetPos.y;
    const angle = Math.atan2(targetY - emitterY, targetX - emitterX);

    if (activeMode === "movie") {
      soundEngine.playMovieLaser();
      s.bolts.push({
        x: emitterX + Math.cos(angle) * 26,
        y: emitterY + Math.sin(angle) * 26,
        vx: Math.cos(angle) * 8.5,
        vy: Math.sin(angle) * 8.5,
        tx: targetX,
        ty: targetY,
        angle,
        life: 90,
      });
      setStatusLine("Movie Magic: Slow glowing red laser bolt + 'pew!' sound effect!");
    } else {
      s.emitterFlash = 1;
      s.targetHitFlash = 1;
      for (let i = 0; i < 14; i++) {
        const ang = Math.random() * Math.PI * 2;
        s.particles.push({
          x: targetX,
          y: targetY,
          vx: Math.cos(ang) * (1.2 + Math.random() * 2.8),
          vy: Math.sin(ang) * (1.2 + Math.random() * 2.8),
          radius: 1.8,
          life: 1,
          maxLife: 24,
          color: "#00F0FF",
          kind: "spark",
        });
      }
      setStatusLine("Real Space: Instant hit at light speed—and the beam is invisible in space!");
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = 330;
      initAsteroids(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    let rafId = 0;
    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const s = stateRef.current;
      const currentSim = simRef.current;
      const currentMode = modeRef.current;

      ctx.save();
      if (s.shake > 0.2) {
        ctx.translate((Math.random() - 0.5) * s.shake, (Math.random() - 0.5) * s.shake);
        s.shake *= 0.88;
      } else {
        s.shake = 0;
      }

      ctx.fillStyle = "#040711";
      ctx.fillRect(0, 0, w, h);

      for (const star of s.stars) {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fillRect(star.x * w, star.y * h, star.size, star.size);
      }

      if (currentSim === "explosion") {
        const cx = w * 0.5;
        const cy = h * 0.5;
        ctx.strokeStyle = "rgba(0, 240, 255, 0.28)";
        ctx.beginPath();
        ctx.arc(cx, cy, 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(cx - 12, cy - 8, 24, 16);
      }

      if (currentSim === "asteroids") {
        const list = currentMode === "movie" ? s.movieAsteroids : s.realAsteroids;
        s.shipT += 0.04;
        const shipY =
          currentMode === "movie"
            ? h * 0.5 + Math.sin(s.shipT * 2.2) * 54
            : h * 0.5;

        for (const rock of list) {
          rock.x += rock.vx;
          rock.y += rock.vy;
          rock.angle += rock.spin;
          if (rock.x < -30) rock.x = w + 30;
          if (rock.y < -30) rock.y = h + 30;
          if (rock.y > h + 30) rock.y = -30;

          ctx.save();
          ctx.translate(rock.x, rock.y);
          ctx.rotate(rock.angle);
          ctx.beginPath();
          rock.vertices.forEach((v, idx) => {
            const ang = (idx / rock.vertices.length) * Math.PI * 2;
            const px = Math.cos(ang) * rock.r * v;
            const py = Math.sin(ang) * rock.r * v;
            if (idx === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.closePath();
          ctx.fillStyle = "#334155";
          ctx.strokeStyle = "#94a3b8";
          ctx.lineWidth = 1.2;
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }

        // Spaceship
        ctx.save();
        ctx.translate(w * 0.22, shipY);
        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.lineTo(-12, -10);
        ctx.lineTo(-7, 0);
        ctx.lineTo(-12, 10);
        ctx.closePath();
        ctx.fillStyle = currentMode === "movie" ? "#A855F7" : "#00F0FF";
        ctx.fill();
        ctx.restore();
      }

      if (currentSim === "laser") {
        const emitterX = 68;
        const emitterY = h * 0.5;
        const targetX = w * s.targetPos.x;
        const targetY = h * s.targetPos.y;

        ctx.fillStyle = "#1e293b";
        ctx.strokeStyle = "#64748b";
        ctx.beginPath();
        ctx.arc(emitterX, emitterY, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#475569";
        ctx.fillRect(emitterX + 6, emitterY - 5, 22, 10);

        if (s.emitterFlash > 0.02) {
          ctx.fillStyle = `rgba(0, 240, 255, ${s.emitterFlash})`;
          ctx.beginPath();
          ctx.arc(emitterX + 28, emitterY, 9, 0, Math.PI * 2);
          ctx.fill();
          s.emitterFlash *= 0.72;
        }

        ctx.save();
        ctx.translate(targetX, targetY);
        ctx.strokeStyle = s.targetHitFlash > 0.05 ? "#00F0FF" : "#64748b";
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fillStyle = s.targetHitFlash > 0.05 ? "#00F0FF" : "#f43f5e";
        ctx.fill();
        ctx.restore();

        if (s.targetHitFlash > 0.02) {
          ctx.strokeStyle = `rgba(0, 240, 255, ${s.targetHitFlash})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(targetX, targetY, 26 + (1 - s.targetHitFlash) * 18, 0, Math.PI * 2);
          ctx.stroke();
          s.targetHitFlash *= 0.82;
        }

        for (let i = s.bolts.length - 1; i >= 0; i--) {
          const b = s.bolts[i];
          b.x += b.vx;
          b.y += b.vy;
          b.life -= 1;

          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.rotate(b.angle);
          ctx.shadowColor = "#f43f5e";
          ctx.shadowBlur = 14;
          ctx.fillStyle = "#fda4af";
          ctx.fillRect(-16, -2.5, 32, 5);
          ctx.restore();

          if (Math.hypot(b.x - b.tx, b.y - b.ty) < 24 || b.life <= 0) {
            s.targetHitFlash = 1;
            s.bolts.splice(i, 1);
          }
        }
      }

      for (let i = s.shockwaves.length - 1; i >= 0; i--) {
        const sw = s.shockwaves[i];
        sw.radius += (sw.maxRadius - sw.radius) * 0.08 + 2.5;
        sw.alpha *= 0.94;
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = Math.max(0, sw.alpha);
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        if (sw.alpha < 0.03 || sw.radius >= sw.maxRadius) s.shockwaves.splice(i, 1);
      }

      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.kind === "flame") {
          p.vx *= 0.96;
          p.vy *= 0.96;
        }
        p.life -= 1 / p.maxLife;
        if (p.life <= 0) {
          s.particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * (p.kind === "flame" ? p.life : 1), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.restore();
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handleTestButton = (sim: SimId) => {
    setActiveSim(sim);
    simRef.current = sim;
    if (sim === "explosion") {
      triggerExplosion(undefined, undefined, mode);
    } else if (sim === "asteroids") {
      soundEngine.playClick();
      setStatusLine(
        mode === "movie"
          ? "Movie Magic: Space rocks crowded together—watch the ship weave!"
          : "Real Space: Vast empty distance—spaceships glide straight through safely."
      );
    } else {
      triggerLaser(undefined, undefined, mode);
    }
  };

  const handleModeToggle = (nextMode: PhysicsMode) => {
    soundEngine.playClick();
    setMode(nextMode);
    modeRef.current = nextMode;
    if (activeSim === "explosion") {
      triggerExplosion(undefined, undefined, nextMode);
    } else if (activeSim === "laser") {
      triggerLaser(undefined, undefined, nextMode);
    } else {
      setStatusLine(
        nextMode === "movie"
          ? "Movie Magic: Crowded asteroid chaos!"
          : "Real Space: Almost completely empty space!"
      );
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    if (activeSim === "explosion") {
      triggerExplosion(x, y);
    } else if (activeSim === "laser") {
      stateRef.current.targetPos = {
        x: Math.max(0.35, Math.min(0.92, x / canvas.width)),
        y: Math.max(0.15, Math.min(0.85, y / canvas.height)),
      };
      triggerLaser(x, y);
    }
  };

  const currentInfo = EXPLANATIONS[activeSim];

  return (
    <div
      className={`rounded-2xl p-6 md:p-8 border shadow-sm transition-colors ${
        isLight
          ? "bg-white border-slate-300 text-[#0F172A]"
          : "bg-[#0B1020] border-[#A855F7]/45 text-white shadow-[0_0_28px_rgba(168,85,247,0.08)]"
      }`}
    >
      <div className={`mb-6 pb-5 border-b flex flex-col gap-2 md:flex-row md:items-end md:justify-between ${isLight ? "border-slate-200" : "border-slate-800"}`}>
        <div>
          <span className={`text-xs font-mono uppercase tracking-wider ${isLight ? "text-indigo-600 font-semibold" : "text-[#A855F7]"}`}>
            Tool 2 · &ldquo;Movies vs. Real Space&rdquo; Simulator
          </span>
          <h3 className={`mt-1 text-2xl font-bold ${isLight ? "text-[#0F172A]" : "text-white"}`}>
            Compare Hollywood Tricks vs. Real Physics
          </h3>
        </div>
        <p className={`text-sm max-w-lg ${isLight ? "text-slate-600" : "text-slate-300"}`}>
          <span className={`font-semibold ${isLight ? "text-indigo-600" : "text-[#A855F7]"}`}>How to play:</span> Flip the big switch between <span className={`font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>Movie Magic</span> and <span className={`font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>Real Space</span>, then press any of the 3 test buttons below.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className={`inline-grid grid-cols-2 p-1.5 rounded-xl border self-start ${isLight ? "bg-slate-100 border-slate-300" : "bg-[#060913] border-slate-700"}`}>
          <button
            type="button"
            onClick={() => handleModeToggle("movie")}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
              mode === "movie"
                ? "bg-purple-600 text-white shadow-sm"
                : isLight
                  ? "text-slate-700 hover:text-slate-900"
                  : "text-slate-300 hover:text-white"
            }`}
          >
            Movie Magic
          </button>
          <button
            type="button"
            onClick={() => handleModeToggle("real")}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
              mode === "real"
                ? "bg-indigo-600 text-white shadow-sm"
                : isLight
                  ? "text-slate-700 hover:text-slate-900"
                  : "text-slate-300 hover:text-white"
            }`}
          >
            Real Space
          </button>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => handleTestButton("explosion")}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSim === "explosion"
                ? isLight
                  ? "border-indigo-600 bg-indigo-50 text-indigo-900 font-bold"
                  : "border-[#00F0FF] bg-[#00F0FF]/15 text-white"
                : isLight
                  ? "border-slate-300 bg-[#F8FAFC] text-slate-700 hover:bg-slate-100"
                  : "border-slate-700 bg-[#060913] text-slate-200 hover:border-slate-500"
            }`}
          >
            <Flame className="h-4 w-4 text-amber-500 shrink-0" />
            <span>1. Explosion in Space</span>
          </button>

          <button
            type="button"
            onClick={() => handleTestButton("asteroids")}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSim === "asteroids"
                ? isLight
                  ? "border-indigo-600 bg-indigo-50 text-indigo-900 font-bold"
                  : "border-[#00F0FF] bg-[#00F0FF]/15 text-white"
                : isLight
                  ? "border-slate-300 bg-[#F8FAFC] text-slate-700 hover:bg-slate-100"
                  : "border-slate-700 bg-[#060913] text-slate-200 hover:border-slate-500"
            }`}
          >
            <Orbit className={`h-4 w-4 shrink-0 ${isLight ? "text-indigo-600" : "text-[#00F0FF]"}`} />
            <span>2. Asteroid Belt</span>
          </button>

          <button
            type="button"
            onClick={() => handleTestButton("laser")}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSim === "laser"
                ? isLight
                  ? "border-indigo-600 bg-indigo-50 text-indigo-900 font-bold"
                  : "border-[#00F0FF] bg-[#00F0FF]/15 text-white"
                : isLight
                  ? "border-slate-300 bg-[#F8FAFC] text-slate-700 hover:bg-slate-100"
                  : "border-slate-700 bg-[#060913] text-slate-200 hover:border-slate-500"
            }`}
          >
            <Zap className="h-4 w-4 text-rose-500 shrink-0" />
            <span>3. Laser Blasters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-800 bg-[#040711] flex flex-col">
          <div className="px-4 py-2.5 border-b border-slate-800 bg-[#060913] flex items-center justify-between gap-3 text-xs font-mono">
            <span className={mode === "movie" ? "text-purple-400 font-bold" : "text-[#00F0FF] font-bold"}>
              {mode === "movie" ? "MODE: MOVIE MAGIC" : "MODE: REAL SPACE"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-300">
              {mode === "real" ? (
                <>
                  <VolumeX className="h-3.5 w-3.5 text-[#00F0FF]" />
                  <span>Total Silence (No Air)</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3.5 w-3.5 text-purple-400" />
                  <span>Sci-Fi Sound Effects</span>
                </>
              )}
            </span>
          </div>

          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full h-[330px] block cursor-crosshair"
          />

          <div className="px-4 py-2.5 border-t border-slate-800 bg-[#060913] text-xs font-mono text-slate-300">
            {statusLine}
          </div>
        </div>

        <div className={`lg:col-span-4 rounded-xl border p-5 flex flex-col justify-between gap-4 ${isLight ? "bg-[#F8FAFC] border-slate-300" : "bg-[#060913] border-slate-800"}`}>
          <div>
            <h4 className={`text-lg font-bold ${isLight ? "text-[#0F172A]" : "text-white"}`}>{currentInfo.title}</h4>

            <div className="mt-4 space-y-4">
              <div
                className={`rounded-xl border p-4 transition-colors ${
                  mode === "movie"
                    ? isLight
                      ? "border-purple-300 bg-purple-50"
                      : "border-[#A855F7]/70 bg-[#A855F7]/10"
                    : isLight
                      ? "border-slate-200 bg-white opacity-70"
                      : "border-slate-800 bg-[#0B1020]/50 opacity-75"
                }`}
              >
                <p className={`text-xs font-mono font-bold mb-1 ${isLight ? "text-purple-700" : "text-[#A855F7]"}`}>
                  What Movies Show
                </p>
                <p className={`text-sm leading-relaxed ${isLight ? "text-slate-700" : "text-slate-200"}`}>{currentInfo.movie}</p>
              </div>

              <div
                className={`rounded-xl border p-4 transition-colors ${
                  mode === "real"
                    ? isLight
                      ? "border-indigo-300 bg-indigo-50"
                      : "border-[#00F0FF]/70 bg-[#00F0FF]/10"
                    : isLight
                      ? "border-slate-200 bg-white opacity-70"
                      : "border-slate-800 bg-[#0B1020]/50 opacity-75"
                }`}
              >
                <p className={`text-xs font-mono font-bold mb-1 ${isLight ? "text-indigo-700" : "text-[#00F0FF]"}`}>
                  What Actually Happens
                </p>
                <p className={`text-sm leading-relaxed ${isLight ? "text-slate-700" : "text-slate-200"}`}>{currentInfo.real}</p>
              </div>
            </div>
          </div>

          {(activeSim === "explosion" || activeSim === "laser") && (
            <button
              type="button"
              onClick={() => handleTestButton(activeSim)}
              className={`w-full rounded-xl px-4 py-2.5 text-sm font-bold transition-colors cursor-pointer ${
                mode === "movie"
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {activeSim === "explosion" ? "Trigger Explosion Again" : "Fire Blaster Again"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
