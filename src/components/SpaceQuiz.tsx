import React, { useState } from "react";
import { Award, CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import { soundEngine } from "../utils/soundEngine";

interface QuestionItem {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuestionItem[] = [
  {
    id: 1,
    question: "Can you see the Great Wall of China from the Moon with the naked eye?",
    options: [
      "Yes, it glows brightly at night",
      "No, it is far too narrow to see without powerful telescopes",
      "Only during a solar eclipse",
    ],
    correctIndex: 1,
    explanation:
      "The Great Wall is about as wide as a highway lane, making it practically invisible from space without high-magnification lenses.",
  },
  {
    id: 2,
    question: "What happens to a cup of water dumped out in the vacuum of space?",
    options: [
      "It instantly boils into vapor and then freezes into ice crystals",
      "It stays together as a floating ball of liquid forever",
      "It catches fire from solar radiation",
    ],
    correctIndex: 0,
    explanation:
      "Without air pressure holding it together, liquid water immediately boils into gas and then freezes into tiny sparkling ice crystals.",
  },
  {
    id: 3,
    question: "Does the Sun look yellow or white when viewed from outer space?",
    options: [
      "Bright yellow like a school bus",
      "Pure white because it emits all rainbow colors evenly",
      "Fiery red",
    ],
    correctIndex: 1,
    explanation:
      "Earth's atmosphere scatters blue light away, making the Sun appear yellow from the ground; from space, it shines pure white.",
  },
  {
    id: 4,
    question: "How long do goldfish memories actually last?",
    options: [
      "Only 3 seconds",
      "About 24 hours",
      "Months—they can even learn mazes and colors",
    ],
    correctIndex: 2,
    explanation:
      "Experiments prove goldfish have strong memories lasting months, easily remembering feeding times and obstacle courses.",
  },
  {
    id: 5,
    question: "What causes Earth's changing seasons?",
    options: [
      "Earth's tilt on its axis as it orbits the Sun",
      "Earth getting closer to and farther from the Sun during its year",
      "The Moon blocking sunlight",
    ],
    correctIndex: 0,
    explanation:
      "Seasons happen because Earth is tilted at 23.5 degrees, causing different hemispheres to receive direct or slanted sunlight throughout the year.",
  },
];

interface SpaceQuizProps {
  isLight: boolean;
}

export const SpaceQuiz: React.FC<SpaceQuizProps> = ({ isLight }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const q = QUIZ_QUESTIONS[currentIndex];

  const handleSelect = (idx: number) => {
    if (showExplanation || isFinished) return;
    soundEngine.playClick();
    setSelectedOption(idx);
    setShowExplanation(true);

    const isCorrect = idx === q.correctIndex;
    if (isCorrect) {
      setScore((s) => s + 1);
      soundEngine.playStamp("CONFIRMED");
    } else {
      soundEngine.playStamp("BUSTED");
    }
  };

  const handleNext = () => {
    soundEngine.playClick();
    if (currentIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
    }
  };

  const restartQuiz = () => {
    soundEngine.playClick();
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setShowExplanation(false);
    setIsFinished(false);
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
          <span className={`text-xs font-mono uppercase tracking-wider ${isLight ? "text-indigo-600 font-semibold" : "text-[#00F0FF]"}`}>
            Tool 5 · Rapid-Fire Space Myth Quiz
          </span>
          <h3 className={`mt-1 text-2xl font-bold ${isLight ? "text-[#0F172A]" : "text-white"}`}>
            Test Your Knowledge (5 Questions)
          </h3>
        </div>
        {!isFinished && (
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Question {currentIndex + 1} of {QUIZ_QUESTIONS.length}
          </span>
        )}
      </div>

      {!isFinished ? (
        <div className="space-y-6">
          <h4 className={`text-lg sm:text-xl font-bold leading-snug ${isLight ? "text-[#0F172A]" : "text-white"}`}>
            {q.question}
          </h4>

          <div className="grid grid-cols-1 gap-3">
            {q.options.map((opt, idx) => {
              let btnStyle = isLight
                ? "border-slate-300 bg-[#F8FAFC] text-slate-800 hover:border-indigo-600 hover:bg-slate-100"
                : "border-slate-700 bg-[#060913] text-slate-200 hover:border-[#00F0FF]";
              if (showExplanation) {
                if (idx === q.correctIndex) {
                  btnStyle = "border-emerald-500 bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 font-semibold";
                } else if (idx === selectedOption) {
                  btnStyle = "border-rose-500 bg-rose-500/20 text-rose-900 dark:text-rose-200";
                } else {
                  btnStyle = isLight ? "border-slate-200 bg-slate-100 text-slate-400" : "border-slate-800 bg-[#060913]/50 text-slate-500";
                }
              }

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={showExplanation}
                  onClick={() => handleSelect(idx)}
                  className={`w-full text-left rounded-xl border px-4 py-3.5 text-sm sm:text-base transition-colors cursor-pointer flex items-center justify-between gap-3 ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {showExplanation && idx === q.correctIndex && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                  {showExplanation && idx === selectedOption && idx !== q.correctIndex && (
                    <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className={`rounded-xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn ${isLight ? "border-indigo-200 bg-indigo-50/50" : "border-[#00F0FF]/30 bg-[#060913]"}`}>
              <div>
                <p className={`text-xs font-mono mb-1 ${isLight ? "text-indigo-700 font-semibold" : "text-[#00F0FF]"}`}>Plain-English Explanation</p>
                <p className={`text-sm leading-relaxed ${isLight ? "text-slate-700" : "text-slate-200"}`}>{q.explanation}</p>
              </div>
              <button
                type="button"
                onClick={handleNext}
                className={`rounded-xl px-6 py-3 text-sm font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isLight ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-[#00F0FF] text-[#060913] hover:bg-cyan-300"
                }`}
              >
                {currentIndex + 1 < QUIZ_QUESTIONS.length ? "Next Question →" : "See Final Score"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="py-8 text-center flex flex-col items-center justify-center space-y-5">
          <div className={`h-20 w-20 rounded-2xl border flex items-center justify-center ${isLight ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-[#00F0FF]/15 border-[#00F0FF]/40 text-[#00F0FF]"}`}>
            <Award className="h-10 w-10" />
          </div>

          <div>
            <span className={`text-xs font-mono uppercase tracking-wider ${isLight ? "text-purple-700 font-semibold" : "text-[#A855F7]"}`}>
              Quiz Completed
            </span>
            <h4 className={`mt-1 text-3xl font-bold ${isLight ? "text-[#0F172A]" : "text-white"}`}>
              Score: {score} / {QUIZ_QUESTIONS.length}
            </h4>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl border border-purple-300 dark:border-[#A855F7]/60 bg-purple-50 dark:bg-[#A855F7]/15 px-4 py-2 text-sm font-bold text-purple-700 dark:text-[#A855F7]">
            <span>🏆 Badge Earned: Chief MythBuster</span>
          </div>

          <p className={`text-sm max-w-md ${isLight ? "text-slate-600" : "text-slate-300"}`}>
            {score >= 4
              ? "Fantastic work! You have top-tier space telemetry instincts."
              : "Good effort! Review the gallery and try again to master all space facts."}
          </p>

          <button
            type="button"
            onClick={restartQuiz}
            className={`inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold transition-colors cursor-pointer ${
              isLight ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-[#00F0FF] text-[#060913] hover:bg-cyan-300"
            }`}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Play Again</span>
          </button>
        </div>
      )}
    </div>
  );
};
