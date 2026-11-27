import React from "react";
import { CheckCircle2, FlaskConical, SearchCheck } from "lucide-react";

interface AboutSectionProps {
  isLight: boolean;
}

const STEPS = [
  {
    title: "1. Spot a Rumor",
    description:
      "Saw a wild space photo or heard a strange science fact online? Type the claim or upload a screenshot right into our scanner.",
    icon: SearchCheck,
  },
  {
    title: "2. Test the Physics",
    description:
      "Flip between Movie Magic and Real Space to watch what really happens with explosions, asteroids, and lasers. You can even test your survival odds on other planets.",
    icon: FlaskConical,
  },
  {
    title: "3. Know the Truth",
    description:
      "Get a clear BUSTED, CONFIRMED, or MISLEADING stamp backed by real facts. Every answer is explained in plain English without confusing jargon.",
    icon: CheckCircle2,
  },
];

export const AboutSection: React.FC<AboutSectionProps> = ({ isLight }) => {
  return (
    <section id="about" className="scroll-mt-24">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <p className={`text-xs font-mono uppercase tracking-wider ${isLight ? "text-indigo-600 font-semibold" : "text-[#00F0FF]"}`}>
          How It Works
        </p>
        <h2 className={`mt-2 text-3xl md:text-4xl font-bold tracking-tight text-balance ${isLight ? "text-[#0F172A]" : "text-white"}`}>
          Three Simple Steps to Bust Any Myth
        </h2>
        <p className={`mt-3 text-base ${isLight ? "text-slate-600" : "text-slate-300"}`}>
          Anyone can explore our mission control lab in seconds—no science degree required.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className={`rounded-2xl p-7 flex flex-col gap-4 transition-transform duration-200 hover:-translate-y-0.5 border ${
                isLight
                  ? "bg-white border-slate-200 shadow-sm"
                  : "bg-[#0B1020] border-[#00F0FF]/30 shadow-[0_0_20px_rgba(0,240,255,0.04)]"
              }`}
            >
              <div
                className={`h-14 w-14 rounded-xl border flex items-center justify-center ${
                  isLight
                    ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                    : "bg-[#00F0FF]/10 border-[#00F0FF]/30 text-[#00F0FF]"
                }`}
              >
                <Icon className="h-7 w-7" />
              </div>

              <h3 className={`text-xl font-bold ${isLight ? "text-[#0F172A]" : "text-white"}`}>{step.title}</h3>
              <p className={`text-sm sm:text-base leading-relaxed ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
