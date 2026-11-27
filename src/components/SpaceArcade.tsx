import React, { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, Trophy, CheckCircle2, XCircle, Zap } from "lucide-react";
import { soundEngine } from "../utils/soundEngine";

interface SpaceArcadeProps {
  isLight: boolean;
}

interface ArcadeItem {
  id: number;
  text: string;
  isTrue: boolean;
  x: number;
  y: number;
  speed: number;
  width: number;
  height: number;
}

interface Laser {
  x: number;
  y: number;
  speed: number;
}

interface BustedRecord {
  text: string;
  isTrue: boolean;
  action: "caught" | "busted" | "missed";
}

const ARCADE_STATEMENTS: { text: string; isTrue: boolean }[] = [
  { text: "Venus spins backwards on its axis", isTrue: true },
  { text: "Sound travels effortlessly through deep space", isTrue: false },
  { text: "A day on Mercury is longer than its year", isTrue: true },
  { text: "Great Wall of China is visible from the Moon", isTrue: false },
  { text: "Water ice exists in shadowed craters on the Moon", isTrue: true },
  { text: "Dark side of the Moon is in permanent darkness", isTrue: false },
  { text: "Neutron stars can rotate over 600 times per second", isTrue: true },
  { text: "Humans would instantly explode in a space vacuum", isTrue: false },
  { text: "The Sun emits pure white light when viewed from space", isTrue: true },
  { text: "Black holes act like giant cosmic vacuum cleaners", isTrue: false },
  { text: "Olympus Mons on Mars is 3x taller than Mount Everest", isTrue: true },
  { text: "Polaris is the absolute brightest star in the night sky", isTrue: false },
];

export const SpaceArcade: React.FC<SpaceArcadeProps> = ({ isLight }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">("idle");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(30);
  const [roundHistory, setRoundHistory] = useState<BustedRecord[]>([]);

  // Refs for animation loop mutable state
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const scoreRef = useRef(score);
  scoreRef.current = score;

  const livesRef = useRef(lives);
  livesRef.current = lives;

  const timeLeftRef = useRef(timeLeft);
  timeLeftRef.current = timeLeft;

  const playerXRef = useRef(400);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const itemsRef = useRef<ArcadeItem[]>([]);
  const lasersRef = useRef<Laser[]>([]);
  const historyRef = useRef<BustedRecord[]>([]);
  const spawnTimerRef = useRef(0);

  // Start Game
  const startGame = () => {
    soundEngine.playClick();
    setScore(0);
    setLives(3);
    setTimeLeft(30);
    setRoundHistory([]);
    historyRef.current = [];
    itemsRef.current = [];
    lasersRef.current = [];
    playerXRef.current = 400;
    setGameState("playing");
  };

  // Keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStateRef.current !== "playing") return;
      keysRef.current[e.key] = true;
      if (e.key === " " || e.key === "ArrowUp") {
        e.preventDefault();
        // Fire laser
        const canvas = canvasRef.current;
        if (canvas) {
          soundEngine.playMovieLaser();
          lasersRef.current.push({
            x: playerXRef.current,
            y: canvas.height - 45,
            speed: 12,
          });
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gameState !== "playing") return;

    const timerInterval = setInterval(() => {
      if (timeLeftRef.current <= 1) {
        setGameState("gameover");
        soundEngine.playStamp("CONFIRMED");
        clearInterval(timerInterval);
      } else {
        setTimeLeft((t) => {
          const next = t - 1;
          if (next <= 5) {
            soundEngine.playCountdownTick(true);
          } else {
            soundEngine.playCountdownTick(false);
          }
          return next;
        });
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [gameState]);

  // Main Game Loop
  useEffect(() => {
    if (gameState !== "playing") return;

    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const updateAndDraw = () => {
      if (gameStateRef.current !== "playing") return;

      // 1. Clear background
      ctx.clearRect(0, 0, width, height);

      // Draw subtle grid / starfield background in canvas
      ctx.fillStyle = isLight ? "#F1F5F9" : "#060913";
      ctx.fillRect(0, 0, width, height);

      // Draw grid lines
      ctx.strokeStyle = isLight ? "rgba(99, 102, 241, 0.08)" : "rgba(0, 240, 255, 0.06)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Move player based on keys
      const moveSpeed = 7;
      if (keysRef.current["ArrowLeft"] || keysRef.current["a"] || keysRef.current["A"]) {
        playerXRef.current = Math.max(50, playerXRef.current - moveSpeed);
      }
      if (keysRef.current["ArrowRight"] || keysRef.current["d"] || keysRef.current["D"]) {
        playerXRef.current = Math.min(width - 50, playerXRef.current + moveSpeed);
      }

      // 3. Spawn items
      spawnTimerRef.current++;
      if (spawnTimerRef.current > 55) {
        spawnTimerRef.current = 0;
        const randItem = ARCADE_STATEMENTS[Math.floor(Math.random() * ARCADE_STATEMENTS.length)];
        const itemWidth = 160;
        const itemHeight = 44;
        const randomX = Math.random() * (width - itemWidth - 100) + 50;
        itemsRef.current.push({
          id: Date.now() + Math.random(),
          text: randItem.text,
          isTrue: randItem.isTrue,
          x: randomX,
          y: -50,
          speed: 1.8 + Math.random() * 1.2,
          width: itemWidth,
          height: itemHeight,
        });
      }

      // 4. Update & Draw Lasers
      ctx.fillStyle = "#00F0FF";
      ctx.shadowColor = "#00F0FF";
      ctx.shadowBlur = 12;
      for (let i = lasersRef.current.length - 1; i >= 0; i--) {
        const laser = lasersRef.current[i];
        laser.y -= laser.speed;
        ctx.fillRect(laser.x - 2, laser.y, 4, 16);

        if (laser.y < 0) {
          lasersRef.current.splice(i, 1);
        }
      }
      ctx.shadowBlur = 0;

      // 5. Update & Draw Falling Items (Pods)
      const playerY = height - 55;
      const playerHalfW = 45;

      for (let i = itemsRef.current.length - 1; i >= 0; i--) {
        const item = itemsRef.current[i];
        item.y += item.speed;

        // Draw Pod / Card
        ctx.save();
        ctx.translate(item.x, item.y);

        // Card background
        ctx.fillStyle = item.isTrue
          ? isLight ? "#EEF2FF" : "#0F172A"
          : isLight ? "#FEF2F2" : "#1E1B18";
        ctx.strokeStyle = item.isTrue ? "#6366F1" : "#EF4444";
        ctx.lineWidth = 2;
        ctx.shadowColor = item.isTrue ? "rgba(99, 102, 241, 0.3)" : "rgba(239, 68, 68, 0.3)";
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.roundRect(0, 0, item.width, item.height, 8);
        ctx.fill();
        ctx.stroke();

        // Badge pill top
        ctx.fillStyle = item.isTrue ? "#6366F1" : "#EF4444";
        ctx.beginPath();
        ctx.roundRect(8, 6, item.isTrue ? 36 : 40, 16, 4);
        ctx.fill();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 9px monospace";
        ctx.fillText(item.isTrue ? "FACT" : "MYTH", 14, 18);

        // Statement text
        ctx.fillStyle = isLight ? "#0F172A" : "#F8FAFC";
        ctx.font = "11px system-ui, sans-serif";
        const maxTextW = item.width - 16;
        let displayTxt = item.text;
        if (ctx.measureText(displayTxt).width > maxTextW) {
          while (ctx.measureText(displayTxt + "...").width > maxTextW && displayTxt.length > 0) {
            displayTxt = displayTxt.slice(0, -1);
          }
          displayTxt += "...";
        }
        ctx.fillText(displayTxt, 10, 36);

        ctx.restore();

        // Check laser collision with item
        let itemDestroyed = false;
        for (let l = lasersRef.current.length - 1; l >= 0; l--) {
          const laser = lasersRef.current[l];
          if (
            laser.x >= item.x &&
            laser.x <= item.x + item.width &&
            laser.y >= item.y &&
            laser.y <= item.y + item.height
          ) {
            lasersRef.current.splice(l, 1);
            itemDestroyed = true;

            if (!item.isTrue) {
              soundEngine.playStamp("BUSTED");
              setScore((s) => s + 50);
              const rec: BustedRecord = { text: item.text, isTrue: false, action: "busted" };
              historyRef.current = [rec, ...historyRef.current];
              setRoundHistory([...historyRef.current]);
            } else {
              soundEngine.playClick();
              setScore((s) => Math.max(0, s - 15));
              const rec: BustedRecord = { text: item.text, isTrue: true, action: "missed" };
              historyRef.current = [rec, ...historyRef.current];
              setRoundHistory([...historyRef.current]);
            }
            break;
          }
        }

        if (itemDestroyed) {
          itemsRef.current.splice(i, 1);
          continue;
        }

        // Check player collision (at bottom)
        if (
          item.y + item.height >= playerY &&
          item.y <= playerY + 30 &&
          item.x + item.width >= playerXRef.current - playerHalfW &&
          item.x <= playerXRef.current + playerHalfW
        ) {
          itemsRef.current.splice(i, 1);

          if (item.isTrue) {
            soundEngine.playStamp("CONFIRMED");
            setScore((s) => s + 100);
            const rec: BustedRecord = { text: item.text, isTrue: true, action: "caught" };
            historyRef.current = [rec, ...historyRef.current];
            setRoundHistory([...historyRef.current]);
          } else {
            soundEngine.playMovieExplosion();
            const nextLives = livesRef.current - 1;
            setLives(nextLives);
            const rec: BustedRecord = { text: item.text, isTrue: false, action: "missed" };
            historyRef.current = [rec, ...historyRef.current];
            setRoundHistory([...historyRef.current]);

            if (nextLives <= 0) {
              setGameState("gameover");
              return;
            }
          }
          continue;
        }

        if (item.y > height) {
          itemsRef.current.splice(i, 1);
        }
      }

      // 6. Draw Player Spaceship
      ctx.save();
      ctx.translate(playerXRef.current, playerY);

      ctx.shadowColor = "#00F0FF";
      ctx.shadowBlur = 18;
      ctx.fillStyle = "#00F0FF";
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(playerHalfW, 16);
      ctx.lineTo(-playerHalfW, 16);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(12, 10);
      ctx.lineTo(-12, 10);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      animationFrameId = requestAnimationFrame(updateAndDraw);
    };

    animationFrameId = requestAnimationFrame(updateAndDraw);

    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, isLight]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || gameState !== "playing") return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;
    playerXRef.current = Math.max(50, Math.min(canvas.width - 50, mouseX));
  };

  const handleCanvasClick = () => {
    if (gameState !== "playing") return;
    const canvas = canvasRef.current;
    if (canvas) {
      soundEngine.playMovieLaser();
      lasersRef.current.push({
        x: playerXRef.current,
        y: canvas.height - 45,
        speed: 12,
      });
    }
  };

  return (
    <div
      className={`rounded-2xl p-6 md:p-8 border shadow-sm transition-colors ${
        isLight
          ? "bg-white border-slate-300 text-[#0F172A]"
          : "bg-[#0B1020] border-[#00F0FF]/45 text-white shadow-[0_0_28px_rgba(0,240,255,0.06)]"
      }`}
    >
      <div className={`mb-6 pb-5 border-b flex flex-col gap-2 md:flex-row md:items-end md:justify-between ${isLight ? "border-slate-200" : "border-slate-800"}`}>
        <div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-mono uppercase tracking-wider ${isLight ? "text-indigo-600 font-semibold" : "text-[#00F0FF]"}`}>
              Lab Module 06 · Space Arcade
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              READY
            </span>
          </div>
          <h3 className={`mt-1 text-2xl font-bold ${isLight ? "text-[#0F172A]" : "text-white"}`}>
            Myth or Fact? Space Arcade (30s Challenge)
          </h3>
        </div>

        {gameState === "playing" && (
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className={`px-3 py-1.5 rounded-lg border ${isLight ? "bg-slate-100 border-slate-200" : "bg-slate-900 border-slate-700"}`}>
              Score: <strong className="text-cyan-400">{score}</strong>
            </div>
            <div className={`px-3 py-1.5 rounded-lg border ${isLight ? "bg-slate-100 border-slate-200" : "bg-slate-900 border-slate-700"}`}>
              Time: <strong className="text-amber-400">{timeLeft}s</strong>
            </div>
            <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-1 ${isLight ? "bg-slate-100 border-slate-200" : "bg-slate-900 border-slate-700"}`}>
              Shields:{" "}
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className={i < lives ? "text-rose-500" : "text-slate-600"}>
                  ♥
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {gameState === "idle" && (
        <div className="text-center py-12 px-4 space-y-6">
          <div className="max-w-md mx-auto space-y-3">
            <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center border shadow-inner ${isLight ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-[#00F0FF]/10 border-[#00F0FF]/30 text-[#00F0FF]"}`}>
              <Gamepad2 className="w-8 h-8" />
            </div>
            <h4 className={`text-xl font-bold ${isLight ? "text-[#0F172A]" : "text-white"}`}>
              Catch True Facts &amp; Bust Fake Myths!
            </h4>
            <p className={`text-sm ${isLight ? "text-slate-600" : "text-slate-300"}`}>
              Use <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-xs">A/D</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-xs">Arrow Keys</kbd> to move your shield, click or press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-xs">Spacebar</kbd> to fire lasers. Catch <strong className="text-indigo-500">TRUE FACTS</strong> (+100 pts) and shoot <strong className="text-rose-500">FAKE MYTHS</strong> (+50 pts) before they hit your shields!
            </p>
          </div>
          <button
            type="button"
            onClick={startGame}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg cursor-pointer ${
              isLight
                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
                : "bg-[#00F0FF] text-[#060913] hover:bg-[#00d4e0] shadow-[0_0_20px_rgba(0,240,255,0.3)]"
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start 30s Arcade Challenge</span>
          </button>
        </div>
      )}

      {gameState === "playing" && (
        <div className="relative rounded-xl overflow-hidden border border-slate-700 shadow-inner bg-black">
          <canvas
            ref={canvasRef}
            width={800}
            height={420}
            onMouseMove={handleCanvasMouseMove}
            onClick={handleCanvasClick}
            className="w-full h-auto aspect-[40/21] cursor-crosshair block"
          />
          <div className="absolute bottom-2 left-3 text-[11px] font-mono text-slate-400 pointer-events-none bg-black/60 px-2 py-1 rounded backdrop-blur">
            Tip: Move mouse or use A/D keys to steer. Click or Space to shoot laser!
          </div>
        </div>
      )}

      {gameState === "gameover" && (
        <div className="text-center py-10 px-4 space-y-6">
          <div className="max-w-md mx-auto space-y-3">
            <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center border ${score > 300 ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"}`}>
              <Trophy className="w-8 h-8" />
            </div>
            <h4 className={`text-2xl font-bold ${isLight ? "text-[#0F172A]" : "text-white"}`}>
              Mission Time Complete!
            </h4>
            <p className={`text-sm ${isLight ? "text-slate-600" : "text-slate-300"}`}>
              Final Score: <strong className="text-cyan-400 text-lg font-mono">{score} points</strong>
            </p>
          </div>

          {roundHistory.length > 0 && (
            <div className={`max-w-lg mx-auto text-left rounded-xl p-4 border ${isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900 border-slate-800"}`}>
              <h5 className={`text-xs font-mono uppercase tracking-wider mb-3 ${isLight ? "text-indigo-600" : "text-[#00F0FF]"}`}>
                Statements Busted &amp; Caught This Round ({roundHistory.length})
              </h5>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {roundHistory.map((item, idx) => (
                  <div key={idx} className={`text-xs p-2.5 rounded-lg border flex items-center justify-between gap-3 ${isLight ? "bg-white border-slate-200" : "bg-slate-950 border-slate-800"}`}>
                    <div className="flex items-center gap-2">
                      {item.action === "caught" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : item.action === "busted" ? (
                        <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                      <span className={isLight ? "text-slate-700" : "text-slate-200"}>{item.text}</span>
                    </div>
                    <span className={`font-mono text-[10px] px-2 py-0.5 rounded ${
                      item.action === "caught"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : item.action === "busted"
                        ? "bg-amber-500/15 text-amber-400"
                        : "bg-rose-500/15 text-rose-400"
                    }`}>
                      {item.action.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={startGame}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg cursor-pointer ${
                isLight
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
                  : "bg-[#00F0FF] text-[#060913] hover:bg-[#00d4e0] shadow-[0_0_20px_rgba(0,240,255,0.3)]"
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function Gamepad2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="6" y1="12" x2="10" y2="12" />
      <line x1="8" y1="10" x2="8" y2="14" />
      <line x1="15" y1="13" x2="15.01" y2="13" />
      <line x1="18" y1="11" x2="18.01" y2="11" />
      <rect width="20" height="12" x="2" y="6" rx="2" />
    </svg>
  );
}
