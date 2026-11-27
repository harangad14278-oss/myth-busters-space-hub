import React, { useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ImagePlus,
  Radar,
  Search,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { soundEngine } from "../utils/soundEngine";

export type VerdictType = "BUSTED" | "CONFIRMED" | "MISLEADING";

export interface VerificationResult {
  verdict: VerdictType;
  claimSummary: string;
  headline: string;
  bullets: string[];
  sources: Array<{ title: string; url: string }>;
}

const SAMPLE_MYTHS = [
  {
    label: "Great Wall from the Moon",
    claim: "The Great Wall of China is the only human-made structure visible from the Moon with the naked eye.",
  },
  {
    label: "Mars as Big as the Moon",
    claim: "Mars will look as large as the Full Moon in the sky this August.",
  },
  {
    label: "Penny Drop Danger",
    claim: "A penny dropped from a tall skyscraper can crack concrete or kill someone below.",
  },
];

const verificationCache = new Map<string, VerificationResult>();

async function compressImageFile(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxWidth = 512;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not initialize canvas context"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        const commaIdx = dataUrl.indexOf(",");
        const base64 = commaIdx !== -1 ? dataUrl.slice(commaIdx + 1) : dataUrl;
        resolve({ base64, mimeType: "image/jpeg" });
      };
      img.onerror = () => reject(new Error("Failed to load image for compression"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

interface RumorScannerProps {
  isLight: boolean;
}

export const RumorScanner: React.FC<RumorScannerProps> = ({ isLight }) => {
  const [claim, setClaim] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [stampKey, setStampKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (file: File | undefined) => {
    if (!file) return;
    const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
    if (!allowed.includes(file.type.toLowerCase())) {
      setError("Please upload a PNG, JPG, WEBP, or GIF image.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Image must be under 8 MB.");
      return;
    }

    setError(null);
    setImageName(file.name);

    try {
      const compressed = await compressImageFile(file);
      setImageBase64(compressed.base64);
      setImageMime(compressed.mimeType);
      setImagePreview(`data:${compressed.mimeType};base64,${compressed.base64}`);
    } catch {
      setError("Could not process image. Please try another photo.");
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    setImageMime(null);
    setImageName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const runScan = async (overrideClaim?: string) => {
    const activeClaim = overrideClaim !== undefined ? overrideClaim : claim;
    if (!activeClaim.trim() && !imageBase64) {
      setError("Type a science rumor or upload a photo first.");
      return;
    }

    const cacheKey = `${activeClaim.trim()}_${imageBase64 ? imageBase64.slice(0, 32) : ""}`;
    if (verificationCache.has(cacheKey)) {
      soundEngine.playRadarPing();
      const cached = verificationCache.get(cacheKey)!;
      setResult(cached);
      setStampKey((k) => k + 1);
      soundEngine.playStamp(cached.verdict);
      return;
    }

    soundEngine.playRadarPing();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/verify-rumor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claim: activeClaim.trim(),
          imageBase64: imageBase64 ?? undefined,
          mimeType: imageMime ?? undefined,
        }),
      });

      const data = (await response.json()) as VerificationResult & { error?: string };
      if (!response.ok) {
        throw new Error(data.error || `Fact-check failed (${response.status})`);
      }

      verificationCache.set(cacheKey, data);
      setResult(data);
      setStampKey((k) => k + 1);
      soundEngine.playStamp(data.verdict);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not check rumor right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = (sampleClaim: string) => {
    soundEngine.playClick();
    clearImage();
    setClaim(sampleClaim);
    void runScan(sampleClaim);
  };

  const verdictStyles: Record<
    VerdictType,
    { border: string; text: string; bg: string; icon: React.ReactNode; label: string }
  > = {
    BUSTED: {
      border: "border-rose-500",
      text: "text-rose-500 dark:text-rose-400",
      bg: "bg-rose-500/15",
      icon: <XCircle className="h-5 w-5 text-rose-500 dark:text-rose-400 shrink-0" />,
      label: "BUSTED",
    },
    CONFIRMED: {
      border: "border-emerald-500",
      text: "text-emerald-600 dark:text-emerald-300",
      bg: "bg-emerald-500/15",
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-300 shrink-0" />,
      label: "CONFIRMED",
    },
    MISLEADING: {
      border: "border-amber-500",
      text: "text-amber-600 dark:text-yellow-300",
      bg: "bg-amber-500/15",
      icon: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-yellow-300 shrink-0" />,
      label: "MISLEADING",
    },
  };

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
            Tool 1 · AI Rumor &amp; Photo Fact-Checker
          </span>
          <h3 className={`mt-1 text-2xl font-bold ${isLight ? "text-[#0F172A]" : "text-white"}`}>
            Spot a Rumor or Upload a Photo
          </h3>
        </div>
        <p className={`text-sm max-w-lg ${isLight ? "text-slate-600" : "text-slate-300"}`}>
          <span className={`font-semibold ${isLight ? "text-indigo-600" : "text-[#00F0FF]"}`}>How to play:</span> Type any science rumor or upload a screenshot, then click <span className={`font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>Check Myth</span>—or press one of the 3 sample buttons below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Input Side */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-5">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="rumor-input"
                type="text"
                value={claim}
                onChange={(e) => setClaim(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void runScan();
                  }
                }}
                placeholder="Type a science rumor (example: 'There is no gravity in space')..."
                className={`flex-1 rounded-xl border px-4 py-3 text-sm sm:text-base focus:outline-none transition-colors ${
                  isLight
                    ? "bg-[#F8FAFC] border-slate-300 text-[#0F172A] placeholder:text-slate-400 focus:border-indigo-600"
                    : "bg-[#060913] border-slate-700 text-white placeholder:text-slate-500 focus:border-[#00F0FF]"
                }`}
              />

              <button
                type="button"
                disabled={loading}
                onClick={() => void runScan()}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isLight
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                    : "bg-[#00F0FF] text-[#060913] hover:bg-cyan-300 disabled:opacity-50"
                }`}
              >
                <Search className="h-4 w-4 shrink-0" />
                <span>{loading ? "Checking..." : "Check Myth"}</span>
              </button>
            </div>

            {/* Upload Screenshot Row */}
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                onChange={(e) => void handleFileChange(e.target.files?.[0])}
                className="hidden"
                id="rumor-image-upload"
              />
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  fileInputRef.current?.click();
                }}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  isLight
                    ? "border-slate-300 bg-[#F8FAFC] text-slate-800 hover:bg-slate-100"
                    : "border-[#A855F7]/60 bg-[#060913] text-white hover:border-[#A855F7] hover:bg-[#A855F7]/10"
                }`}
              >
                <ImagePlus className={`h-4 w-4 ${isLight ? "text-indigo-600" : "text-[#A855F7]"}`} />
                <span>{imagePreview ? "Change Screenshot / Photo" : "Upload Screenshot / Photo"}</span>
              </button>

              {imagePreview && (
                <div className={`flex items-center gap-2.5 rounded-xl border px-3 py-1.5 min-w-0 ${isLight ? "bg-slate-50 border-slate-300" : "bg-[#060913] border-slate-700"}`}>
                  <img
                    src={imagePreview}
                    alt="Uploaded rumor preview"
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 rounded object-cover shrink-0 border border-slate-300 dark:border-slate-700"
                  />
                  <span className={`text-xs font-mono truncate max-w-[180px] ${isLight ? "text-slate-700" : "text-slate-200"}`}>
                    {imageName || "uploaded-photo"}
                  </span>
                  <button
                    type="button"
                    onClick={clearImage}
                    aria-label="Remove image"
                    className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 3 One-Click Sample Buttons */}
          <div className={`pt-4 border-t ${isLight ? "border-slate-200" : "border-slate-800"}`}>
            <p className={`text-xs font-mono mb-3 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              Try a Sample Myth (One Click):
            </p>
            <div className="flex flex-wrap gap-2.5">
              {SAMPLE_MYTHS.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  disabled={loading}
                  onClick={() => handleSampleClick(sample.claim)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap ${
                    isLight
                      ? "border-slate-300 bg-[#F8FAFC] text-slate-700 hover:border-indigo-600 hover:text-indigo-600"
                      : "border-[#00F0FF]/35 bg-[#060913] text-slate-100 hover:border-[#00F0FF] hover:text-[#00F0FF]"
                  }`}
                >
                  <Sparkles className={`h-3.5 w-3.5 shrink-0 ${isLight ? "text-indigo-600" : "text-[#00F0FF]"}`} />
                  <span>{sample.label}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-rose-500/60 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-200"
            >
              {error}
            </div>
          )}
        </div>

        {/* Verdict Stamp Side */}
        <div className={`lg:col-span-5 rounded-xl border p-5 md:p-6 flex flex-col justify-between min-h-[260px] ${isLight ? "bg-[#F8FAFC] border-slate-300" : "bg-[#060913] border-slate-800"}`}>
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
              <div className={`relative h-20 w-20 rounded-full border flex items-center justify-center overflow-hidden mb-4 ${isLight ? "border-indigo-500/50 bg-white" : "border-[#00F0FF]/50 bg-[#060913]"}`}>
                <div
                  className="absolute inset-0 animate-radar-sweep-fast"
                  style={{
                    background: isLight
                      ? "conic-gradient(from 0deg, rgba(79,70,229,0.3) 0deg, transparent 85deg)"
                      : "conic-gradient(from 0deg, rgba(0,240,255,0.5) 0deg, transparent 85deg)",
                  }}
                />
                <Radar className={`relative z-10 h-6 w-6 ${isLight ? "text-indigo-600" : "text-[#00F0FF]"}`} />
              </div>
              <p className={`font-display text-base font-bold ${isLight ? "text-[#0F172A]" : "text-white"}`}>
                Scanning Scientific Database...
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Verifying empirical evidence
              </p>
            </div>
          ) : result ? (
            <div className="flex flex-col gap-4 h-full">
              <div className={`flex items-start justify-between gap-3 pb-4 border-b ${isLight ? "border-slate-200" : "border-slate-800"}`}>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400 mb-1">
                    {verdictStyles[result.verdict].icon}
                    <span>Official Verdict</span>
                  </div>
                  <h4 className={`text-lg font-bold leading-snug ${isLight ? "text-[#0F172A]" : "text-white"}`}>
                    {result.headline}
                  </h4>
                </div>

                {/* Big Stamp */}
                <div
                  key={stampKey}
                  className={`animate-stamp-slam shrink-0 border-4 ${verdictStyles[result.verdict].border} ${verdictStyles[result.verdict].bg} ${verdictStyles[result.verdict].text} px-4 py-1.5 rounded-lg font-display text-xl font-bold tracking-wider uppercase select-none`}
                >
                  {verdictStyles[result.verdict].label}
                </div>
              </div>

              <ul className="space-y-2.5 flex-1">
                {result.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm leading-relaxed">
                    <span className={`font-mono text-xs font-bold mt-1 shrink-0 ${isLight ? "text-indigo-600" : "text-[#00F0FF]"}`}>
                      {idx + 1}.
                    </span>
                    <span className={isLight ? "text-slate-700" : "text-slate-200"}>{bullet}</span>
                  </li>
                ))}
              </ul>

              {result.sources.length > 0 && (
                <div className={`pt-3 border-t ${isLight ? "border-slate-200" : "border-slate-800"}`}>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5">Sources Used:</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {result.sources.map((src) => (
                      <a
                        key={src.url}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 text-xs hover:underline max-w-[200px] truncate ${isLight ? "text-indigo-600" : "text-[#00F0FF]"}`}
                      >
                        <span className="truncate">{src.title}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
              <div className={`h-14 w-14 rounded-full border flex items-center justify-center mb-3 ${isLight ? "border-indigo-300 bg-white" : "border-[#00F0FF]/35 bg-[#0B1020]"}`}>
                <Radar className={`h-6 w-6 ${isLight ? "text-indigo-600" : "text-[#00F0FF]"}`} />
              </div>
              <p className={`font-display text-lg font-bold ${isLight ? "text-[#0F172A]" : "text-white"}`}>
                Ready to Bust a Myth
              </p>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                Click any sample button on the left or test your own science rumor to get a BUSTED, CONFIRMED, or MISLEADING stamp.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
