import React, { useEffect, useRef, useState } from "react";
import { Compass, RotateCcw, Send, Sparkles } from "lucide-react";
import { soundEngine } from "../utils/soundEngine";

interface ChatMessage {
  role: "user" | "model";
  text: string;
  stance?: "SKEPTICAL" | "INTRIGUED" | "ASTONISHED";
  ancientMythReferenced?: string;
}

const QUICK_ARGUMENTS = [
  "Air actually has weight and pushes down on everything around us.",
  "The Earth orbits the Sun, not the Sun orbiting the Earth.",
  "Heavy and light objects fall at the exact same rate without air resistance.",
  "Lightning is an electrical discharge in storm clouds, not divine fire.",
];

interface FallbackResponse {
  keywords: string[];
  reply: string;
  stance: "SKEPTICAL" | "INTRIGUED" | "ASTONISHED";
  beliefScore: number;
  ancientMythReferenced: string;
}

const FALLBACK_LIBRARY: FallbackResponse[] = [
  {
    keywords: ["weight", "air", "pushes", "pressure"],
    reply: "Wait—you are saying invisible air has actual weight? In 1624, everyone knows air is just empty space that cannot weigh anything!",
    stance: "SKEPTICAL",
    beliefScore: 20,
    ancientMythReferenced: "Air Has No Weight",
  },
  {
    keywords: ["orbit", "sun", "earth", "revolves"],
    reply: "Hold on! The Earth moves around the Sun? In 1624, we believe the Earth stands completely still while the Sun circles us!",
    stance: "SKEPTICAL",
    beliefScore: 10,
    ancientMythReferenced: "Earth Is Standing Still",
  },
  {
    keywords: ["fall", "rate", "resistance", "heavy", "light"],
    reply: "Surely a heavy cannonball falls much faster than a feather? That is just common sense!",
    stance: "SKEPTICAL",
    beliefScore: 25,
    ancientMythReferenced: "Heavy Objects Fall Faster",
  },
  {
    keywords: ["lightning", "electrical", "discharge", "storm"],
    reply: "Lightning is a flash of divine fire sent from the heavens! How could tiny sparks in clouds cause such thunder?",
    stance: "SKEPTICAL",
    beliefScore: 15,
    ancientMythReferenced: "Storms Are Divine Fire",
  },
  {
    keywords: ["telescope", "glass", "lens", "observe"],
    reply: "You look through curved glass to see moons around Jupiter? That sounds like pure magic rather than real science!",
    stance: "INTRIGUED",
    beliefScore: 58,
    ancientMythReferenced: "Magical Glass Lenses",
  },
  {
    keywords: ["blood", "circulate", "heart"],
    reply: "Blood pumps in a complete circle through our bodies? In 1624, we think the liver constantly makes fresh blood from food!",
    stance: "INTRIGUED",
    beliefScore: 65,
    ancientMythReferenced: "Liver Makes Blood",
  },
  {
    keywords: ["vacuum", "void", "space"],
    reply: "A complete vacuum where absolutely nothing exists? Nature hates empty space and fills it instantly!",
    stance: "SKEPTICAL",
    beliefScore: 12,
    ancientMythReferenced: "Nature Hates Empty Space",
  },
  {
    keywords: ["experiment", "proof", "measure"],
    reply: "If you tested this many times with careful measurements, maybe your future science is actually right!",
    stance: "ASTONISHED",
    beliefScore: 90,
    ancientMythReferenced: "Modern Testing",
  },
];

interface ScholarDebateProps {
  isLight: boolean;
}

export const ScholarDebate: React.FC<ScholarDebateProps> = ({ isLight }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "Hello from the year 1624! I am Magister Vance. Tell me a modern science fact, and I will tell you why it sounds crazy to us!",
      stance: "SKEPTICAL",
      ancientMythReferenced: "Old 1624 Beliefs",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [beliefScore, setBeliefScore] = useState(15);
  const [stance, setStance] = useState<"SKEPTICAL" | "INTRIGUED" | "ASTONISHED">("SKEPTICAL");
  const [mythLabel, setMythLabel] = useState("Old 1624 Beliefs");
  const [usedIndices, setUsedIndices] = useState<number[]>([]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading]);

  const getUniqueFallback = (userMsg: string): FallbackResponse => {
    const lower = userMsg.toLowerCase();
    const matchedIdx = FALLBACK_LIBRARY.findIndex(
      (item, idx) => !usedIndices.includes(idx) && item.keywords.some((kw) => lower.includes(kw))
    );

    let chosenIdx = matchedIdx;
    if (chosenIdx === -1) {
      const available = FALLBACK_LIBRARY.map((_, i) => i).filter((i) => !usedIndices.includes(i));
      if (available.length === 0) {
        setUsedIndices([]);
        chosenIdx = 0;
      } else {
        chosenIdx = available[Math.floor(Math.random() * available.length)];
      }
    }

    setUsedIndices((prev) => [...prev, chosenIdx]);
    return FALLBACK_LIBRARY[chosenIdx];
  };

  const sendArgument = async (textOverride?: string) => {
    const outgoing = (textOverride !== undefined ? textOverride : input).trim();
    if (!outgoing || loading) return;

    soundEngine.playClick();
    setError(null);
    const updatedHistory = [...messages, { role: "user" as const, text: outgoing }];
    setMessages(updatedHistory);
    if (textOverride === undefined) setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: messages.map((m) => ({ role: m.role, text: m.text })),
          message: outgoing,
        }),
      });

      const data = (await response.json()) as {
        reply?: string;
        stance?: "SKEPTICAL" | "INTRIGUED" | "ASTONISHED";
        beliefScore?: number;
        ancientMythReferenced?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Rate limit reached");
      }

      const nextStance = data.stance ?? "SKEPTICAL";
      setStance(nextStance);
      setBeliefScore(data.beliefScore ?? 35);
      setMythLabel(data.ancientMythReferenced || "1624 Belief");
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: data.reply || "That is quite a claim! Tell me how you proved it.",
          stance: nextStance,
          ancientMythReferenced: data.ancientMythReferenced,
        },
      ]);
      soundEngine.playRadarPing();
    } catch {
      const fb = getUniqueFallback(outgoing);
      setStance(fb.stance);
      setBeliefScore(fb.beliefScore);
      setMythLabel(fb.ancientMythReferenced);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: fb.reply,
          stance: fb.stance,
          ancientMythReferenced: fb.ancientMythReferenced,
        },
      ]);
      soundEngine.playRadarPing();
    } finally {
      setLoading(false);
    }
  };

  const resetDebate = () => {
    soundEngine.playClick();
    setMessages([
      {
        role: "model",
        text: "Hello again from 1624! Try another modern fact and let us see what I think.",
        stance: "SKEPTICAL",
        ancientMythReferenced: "Old 1624 Beliefs",
      },
    ]);
    setBeliefScore(15);
    setStance("SKEPTICAL");
    setMythLabel("Old 1624 Beliefs");
    setUsedIndices([]);
    setError(null);
  };

  const stanceMeta = {
    SKEPTICAL: { label: "Skeptical", color: "text-amber-500 dark:text-amber-400" },
    INTRIGUED: { label: "Intrigued", color: "text-indigo-600 dark:text-[#00F0FF]" },
    ASTONISHED: { label: "Astonished", color: "text-emerald-600 dark:text-emerald-400" },
  }[stance];

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
          <span className={`text-xs font-mono uppercase tracking-wider ${isLight ? "text-purple-700 font-semibold" : "text-[#A855F7]"}`}>
            Tool 4 · &ldquo;Convince a 1600s Scholar&rdquo; Mini-Chat
          </span>
          <h3 className={`mt-1 text-2xl font-bold ${isLight ? "text-[#0F172A]" : "text-white"}`}>
            Debate Magister Aurelius Vance (Year 1624)
          </h3>
        </div>
        <p className={`text-sm max-w-lg ${isLight ? "text-slate-600" : "text-slate-300"}`}>
          <span className={`font-semibold ${isLight ? "text-purple-700" : "text-[#A855F7]"}`}>How to play:</span> Type any modern scientific fact or click a quick suggestion below to see how a 17th-century philosopher reacts in plain English!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className={`lg:col-span-4 rounded-xl border p-5 flex flex-col justify-between gap-5 ${isLight ? "bg-[#F8FAFC] border-slate-300" : "bg-[#060913] border-slate-800"}`}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-xl border flex items-center justify-center shrink-0 ${isLight ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-[#A855F7]/15 border-[#A855F7]/40 text-[#A855F7]"}`}>
                <Compass className="h-6 w-6" />
              </div>
              <div>
                <h4 className={`font-bold ${isLight ? "text-[#0F172A]" : "text-white"}`}>Magister Aurelius Vance</h4>
                <p className="text-xs font-mono text-slate-500 dark:text-slate-400">Natural Philosopher · 1624</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 dark:text-slate-400">Scholar Belief</span>
                <span className={`font-semibold ${stanceMeta.color}`}>
                  {stanceMeta.label} · {beliefScore}%
                </span>
              </div>
              <div className={`h-2.5 w-full rounded-full border overflow-hidden ${isLight ? "bg-slate-200 border-slate-300" : "bg-[#0B1020] border-slate-800"}`}>
                <div
                  className="h-full bg-purple-600 dark:bg-[#A855F7] transition-all duration-300"
                  style={{ width: `${beliefScore}%` }}
                />
              </div>
              <div className={`pt-2 border-t flex items-center justify-between text-xs ${isLight ? "border-slate-200" : "border-slate-800"}`}>
                <span className="font-mono text-slate-500 dark:text-slate-400">1624 Belief</span>
                <span className={`font-medium truncate max-w-[170px] ${isLight ? "text-slate-800" : "text-slate-200"}`}>{mythLabel}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={resetDebate}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
              isLight ? "border-slate-300 bg-white text-slate-800 hover:bg-slate-50" : "border-slate-700 bg-[#0B1020] text-slate-200 hover:border-slate-500"
            }`}
          >
            <RotateCcw className={`h-4 w-4 ${isLight ? "text-indigo-600" : "text-[#00F0FF]"}`} />
            <span>Reset Debate</span>
          </button>
        </div>

        <div className={`lg:col-span-8 rounded-xl border flex flex-col overflow-hidden min-h-[380px] max-h-[500px] ${isLight ? "bg-[#F8FAFC] border-slate-300" : "bg-[#060913] border-slate-800"}`}>
          <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div className="mb-1 flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                  <span>{msg.role === "user" ? "You (21st Century)" : "Magister Vance (1624)"}</span>
                  {msg.ancientMythReferenced && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className={isLight ? "text-purple-700 font-medium" : "text-[#A855F7]"}>{msg.ancientMythReferenced}</span>
                    </>
                  )}
                </div>
                <div
                  className={`max-w-[88%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? isLight
                        ? "bg-indigo-50 border border-indigo-300 text-indigo-950 font-medium"
                        : "bg-[#00F0FF]/15 border border-[#00F0FF]/35 text-white"
                      : isLight
                        ? "bg-white border border-slate-300 text-slate-900 shadow-sm"
                        : "bg-[#0B1020] border border-slate-800 text-slate-200"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex flex-col items-start">
                <span className="mb-1 text-xs font-mono text-slate-500 dark:text-slate-400">Magister Vance (1624)</span>
                <div className={`rounded-xl border px-4 py-3 text-sm font-mono ${isLight ? "bg-white border-slate-300 text-slate-600" : "bg-[#0B1020] border-slate-800 text-slate-400"}`}>
                  Thinking about 1624...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className={`px-4 py-2.5 border-t ${isLight ? "border-slate-200 bg-slate-100" : "border-slate-800 bg-[#0B1020]/60"}`}>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-2">Quick Modern Claims to Test:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_ARGUMENTS.map((arg) => (
                <button
                  key={arg}
                  type="button"
                  disabled={loading}
                  onClick={() => void sendArgument(arg)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors cursor-pointer disabled:opacity-50 text-left ${
                    isLight
                      ? "border-slate-300 bg-white text-slate-800 hover:border-indigo-600 hover:text-indigo-600"
                      : "border-slate-700 bg-[#060913] text-slate-200 hover:border-[#00F0FF] hover:text-[#00F0FF]"
                  }`}
                >
                  <Sparkles className={`h-3 w-3 shrink-0 ${isLight ? "text-indigo-600" : "text-[#00F0FF]"}`} />
                  <span className="truncate max-w-[240px]">{arg}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mx-4 my-2 rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-200">
              {error}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendArgument();
            }}
            className={`p-3 border-t flex items-center gap-3 ${isLight ? "border-slate-200 bg-white" : "border-slate-800 bg-[#0B1020]"}`}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a scientific fact or argument..."
              className={`flex-1 min-w-0 rounded-xl border px-4 py-2.5 text-sm focus:outline-none ${
                isLight
                  ? "bg-[#F8FAFC] border-slate-300 text-[#0F172A] placeholder:text-slate-400 focus:border-indigo-600"
                  : "bg-[#060913] border-slate-700 text-white placeholder:text-slate-500 focus:border-[#00F0FF]"
              }`}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                isLight
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                  : "bg-[#00F0FF] text-[#060913] hover:bg-cyan-300 disabled:opacity-50"
              }`}
            >
              <Send className="h-4 w-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
