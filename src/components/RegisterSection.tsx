import React, { useState } from "react";
import { CheckCircle2, Mail, Rocket, Send } from "lucide-react";
import { soundEngine } from "../utils/soundEngine";

interface RegisterSectionProps {
  isLight: boolean;
}

export const RegisterSection: React.FC<RegisterSectionProps> = ({ isLight }) => {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [topic, setTopic] = useState("Space Explosions & Vacuum Physics");
  const [email, setEmail] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regConfirmation, setRegConfirmation] = useState<string | null>(null);

  const [senderName, setSenderName] = useState("");
  const [mythText, setMythText] = useState("");
  const [mythLoading, setMythLoading] = useState(false);
  const [mythError, setMythError] = useState<string | null>(null);
  const [mythConfirmation, setMythConfirmation] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playClick();
    setRegError(null);
    setRegConfirmation(null);
    setRegLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, grade, topic, email }),
      });
      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Could not complete registration.");
      }
      setRegConfirmation(data.message || "You are registered for our next Space Workshop!");
      soundEngine.playStamp("CONFIRMED");
      setName("");
      setGrade("");
      setEmail("");
    } catch (err) {
      setRegError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setRegLoading(false);
    }
  };

  const handleMythSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playClick();
    setMythError(null);
    setMythConfirmation(null);
    setMythLoading(true);

    try {
      const response = await fetch("/api/submit-myth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderName, mythText }),
      });
      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Could not send your myth.");
      }
      setMythConfirmation(data.message || "Myth received! Our science team will test it soon.");
      soundEngine.playRadarPing();
      setSenderName("");
      setMythText("");
    } catch (err) {
      setMythError(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setMythLoading(false);
    }
  };

  return (
    <section id="register" className="scroll-mt-24">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <p className={`text-xs font-mono uppercase tracking-wider ${isLight ? "text-indigo-600 font-semibold" : "text-[#00F0FF]"}`}>
          Join &amp; Contribute
        </p>
        <h2 className={`mt-2 text-3xl md:text-4xl font-bold tracking-tight text-balance ${isLight ? "text-[#0F172A]" : "text-white"}`}>
          Register for Workshops or Send a Myth
        </h2>
        <p className={`mt-3 text-base ${isLight ? "text-slate-600" : "text-slate-300"}`}>
          Sign up for live student space sessions or challenge our lab with a rumor you want us to test next.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Column 1: Register for Space Workshops */}
        <div className={`rounded-2xl border p-6 md:p-8 flex flex-col justify-between shadow-sm ${isLight ? "bg-white border-slate-300 text-[#0F172A]" : "bg-[#0B1020] border-[#00F0FF]/45 text-white"}`}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${isLight ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-[#00F0FF]/10 border-[#00F0FF]/35 text-[#00F0FF]"}`}>
                <Rocket className="h-5 w-5" />
              </div>
              <h3 className={`text-xl font-bold ${isLight ? "text-[#0F172A]" : "text-white"}`}>Register for Space Workshops</h3>
            </div>
            <p className={`text-sm mb-6 ${isLight ? "text-slate-600" : "text-slate-300"}`}>
              Reserve your spot for hands-on space experiments, telescope nights, and live myth-busting demos.
            </p>

            <form onSubmit={(e) => void handleRegister(e)} className="space-y-4">
              <div>
                <label htmlFor="reg-name" className={`block text-sm font-medium mb-1.5 ${isLight ? "text-slate-700" : "text-slate-200"}`}>
                  Student Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none ${
                    isLight
                      ? "bg-[#F8FAFC] border-slate-300 text-[#0F172A] placeholder:text-slate-400 focus:border-indigo-600"
                      : "bg-[#060913] border-slate-700 text-white placeholder:text-slate-500 focus:border-[#00F0FF]"
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-grade" className={`block text-sm font-medium mb-1.5 ${isLight ? "text-slate-700" : "text-slate-200"}`}>
                    Grade / Class
                  </label>
                  <input
                    id="reg-grade"
                    type="text"
                    required
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="e.g., Grade 9B"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none ${
                      isLight
                        ? "bg-[#F8FAFC] border-slate-300 text-[#0F172A] placeholder:text-slate-400 focus:border-indigo-600"
                        : "bg-[#060913] border-slate-700 text-white placeholder:text-slate-500 focus:border-[#00F0FF]"
                    }`}
                  />
                </div>

                <div>
                  <label htmlFor="reg-topic" className={`block text-sm font-medium mb-1.5 ${isLight ? "text-slate-700" : "text-slate-200"}`}>
                    Favorite Topic
                  </label>
                  <select
                    id="reg-topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none ${
                      isLight
                        ? "bg-[#F8FAFC] border-slate-300 text-[#0F172A] focus:border-indigo-600"
                        : "bg-[#060913] border-slate-700 text-white focus:border-[#00F0FF]"
                    }`}
                  >
                    <option>Space Explosions &amp; Vacuum Physics</option>
                    <option>Planets &amp; Survival Science</option>
                    <option>Spotting Fake Space Photos</option>
                    <option>Rocket Launches &amp; Orbits</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" className={`block text-sm font-medium mb-1.5 ${isLight ? "text-slate-700" : "text-slate-200"}`}>
                  Email Address
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@school.edu"
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none ${
                    isLight
                      ? "bg-[#F8FAFC] border-slate-300 text-[#0F172A] placeholder:text-slate-400 focus:border-indigo-600"
                      : "bg-[#060913] border-slate-700 text-white placeholder:text-slate-500 focus:border-[#00F0FF]"
                  }`}
                />
              </div>

              {regError && (
                <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-700 dark:text-rose-200">
                  {regError}
                </div>
              )}

              {regConfirmation && (
                <div className="rounded-xl border border-emerald-500/60 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200 flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{regConfirmation}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={regLoading}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-colors cursor-pointer ${
                  isLight ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-[#00F0FF] text-[#060913] hover:bg-cyan-300"
                }`}
              >
                <Rocket className="h-4 w-4" />
                <span>{regLoading ? "Registering..." : "Reserve Workshop Seat"}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Column 2: Send Us a Myth to Test */}
        <div className={`rounded-2xl border p-6 md:p-8 flex flex-col justify-between shadow-sm ${isLight ? "bg-white border-slate-300 text-[#0F172A]" : "bg-[#0B1020] border-[#A855F7]/45 text-white"}`}>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${isLight ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-[#A855F7]/10 border-[#A855F7]/35 text-[#A855F7]"}`}>
                <Mail className="h-5 w-5" />
              </div>
              <h3 className={`text-xl font-bold ${isLight ? "text-[#0F172A]" : "text-white"}`}>Send Us a Myth to Test</h3>
            </div>
            <p className={`text-sm mb-6 ${isLight ? "text-slate-600" : "text-slate-300"}`}>
              Heard something weird in a sci-fi movie or online? Drop it here so our club can put it to the test next week!
            </p>

            <form onSubmit={(e) => void handleMythSubmit(e)} className="space-y-4">
              <div>
                <label htmlFor="myth-sender" className={`block text-sm font-medium mb-1.5 ${isLight ? "text-slate-700" : "text-slate-200"}`}>
                  Your Name (Optional)
                </label>
                <input
                  id="myth-sender"
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Enter your name or nickname"
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none ${
                    isLight
                      ? "bg-[#F8FAFC] border-slate-300 text-[#0F172A] placeholder:text-slate-400 focus:border-purple-600"
                      : "bg-[#060913] border-slate-700 text-white placeholder:text-slate-500 focus:border-[#A855F7]"
                  }`}
                />
              </div>

              <div>
                <label htmlFor="myth-message" className={`block text-sm font-medium mb-1.5 ${isLight ? "text-slate-700" : "text-slate-200"}`}>
                  Myth or Question to Investigate
                </label>
                <textarea
                  id="myth-message"
                  rows={5}
                  required
                  value={mythText}
                  onChange={(e) => setMythText(e.target.value)}
                  placeholder="Example: Can you really hear anything inside a spaceship during a meteor storm? Or does zero gravity make you taller?"
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm resize-none focus:outline-none ${
                    isLight
                      ? "bg-[#F8FAFC] border-slate-300 text-[#0F172A] placeholder:text-slate-400 focus:border-purple-600"
                      : "bg-[#060913] border-slate-700 text-white placeholder:text-slate-500 focus:border-[#A855F7]"
                  }`}
                />
              </div>

              {mythError && (
                <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-700 dark:text-rose-200">
                  {mythError}
                </div>
              )}

              {mythConfirmation && (
                <div className="rounded-xl border border-emerald-500/60 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200 flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{mythConfirmation}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={mythLoading}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-colors cursor-pointer ${
                  isLight ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-[#A855F7] text-white hover:bg-purple-400"
                }`}
              >
                <Send className="h-4 w-4" />
                <span>{mythLoading ? "Sending..." : "Send Myth to Lab"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
