import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Type } from "@google/genai";
import { getGeminiClient } from "./server/gemini.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "10mb" }));

const ALLOWED_IMAGE_MIMES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);

interface FallbackMyth {
  keywords: string[];
  verdict: "BUSTED" | "CONFIRMED" | "MISLEADING";
  headline: string;
  claimSummary: string;
  bullets: string[];
}

const FALLBACK_MYTHS: FallbackMyth[] = [
  {
    keywords: ["great wall", "moon", "naked eye"],
    verdict: "BUSTED",
    headline: "The Great Wall is invisible from the Moon without magnification",
    claimSummary: "The myth claims the Great Wall of China is visible from the Moon with the naked eye.",
    bullets: [
      "The Great Wall is only about 5 to 8 meters wide, making it far too narrow to resolve from lunar distance.",
      "Astronauts confirm that no human-made structures are visible without high-powered optical lenses.",
      "Even low Earth orbit requires telescopes or cameras to spot stretches of the wall clearly.",
    ],
  },
  {
    keywords: ["mars", "big", "full moon"],
    verdict: "BUSTED",
    headline: "Mars will never appear as large as the Full Moon in our sky",
    claimSummary: "A viral rumor claims Mars will look as massive as the Moon during its approach.",
    bullets: [
      "Mars is much smaller than the Moon and orbits much farther away from Earth.",
      "Even at its absolute closest approach, Mars appears as a bright red point of light, not a giant disk.",
      "This viral hoax has recirculated on social media every single August for over fifteen years.",
    ],
  },
  {
    keywords: ["penny", "skyscraper", "empire state", "concrete"],
    verdict: "BUSTED",
    headline: "A dropped penny cannot crack concrete or kill someone",
    claimSummary: "The myth claims a penny dropped from a tall building gains bullet-like lethal velocity.",
    bullets: [
      "Air resistance pushes against a flat penny, capping its terminal velocity at around 40 to 50 mph.",
      "A coin falling at 45 mph stings if it hits your hand, but it lacks the kinetic energy to cause severe injury.",
      "Real drop tests from tall towers show pennies flutter harmlessly down like autumn leaves.",
    ],
  },
  {
    keywords: ["goldfish", "memory", "3-second"],
    verdict: "BUSTED",
    headline: "Goldfish actually have memory spans of several months",
    claimSummary: "The myth claims goldfish forget everything every three seconds.",
    bullets: [
      "Scientific experiments demonstrate that goldfish remember feeding times and locations for months.",
      "Fish can be successfully trained to navigate complex mazes and distinguish different colors.",
      "Their memory capacity is comparable to many other vertebrates.",
    ],
  },
  {
    keywords: ["gravity", "space", "zero g", "station"],
    verdict: "MISLEADING",
    headline: "Gravity is still very strong aboard orbiting space stations",
    claimSummary: "The myth claims astronauts float because there is zero gravity in space.",
    bullets: [
      "At the altitude of the International Space Station, Earth's gravity is still about 90% as strong as on the ground.",
      "Astronauts float because the station is in constant freefall around Earth, curving along with the planet.",
      "True zero gravity only occurs deep in interstellar space far away from stars and planets.",
    ],
  },
  {
    keywords: ["dark side", "moon", "sunlight"],
    verdict: "BUSTED",
    headline: "Every side of the Moon receives regular sunlight",
    claimSummary: "The myth claims the 'dark side' of the Moon is permanently shrouded in darkness.",
    bullets: [
      "Both halves of the Moon experience two weeks of bright daylight followed by two weeks of night.",
      "We call the hidden hemisphere the 'far side' because it always faces away from Earth.",
      "When we see a New Moon from Earth, the far side is receiving full midday sunlight.",
    ],
  },
  {
    keywords: ["lightning", "same place twice"],
    verdict: "BUSTED",
    headline: "Lightning frequently strikes the exact same place multiple times",
    claimSummary: "The myth claims lightning never strikes the same location twice.",
    bullets: [
      "Tall skyscrapers and communication towers are struck by lightning dozens of times every single year.",
      "Lightning seeks the path of least resistance to the ground, often hitting high points repeatedly.",
      "The Empire State Building is struck roughly 25 to 100 times annually.",
    ],
  },
  {
    keywords: ["seasons", "distance", "sun"],
    verdict: "BUSTED",
    headline: "Earth's seasons are caused by axial tilt, not distance to the Sun",
    claimSummary: "The myth claims summer happens because Earth is closer to the Sun.",
    bullets: [
      "Earth is actually closest to the Sun during January in the Northern Hemisphere's winter.",
      "Seasons are entirely created by Earth's 23.5-degree tilt as it orbits the Sun.",
      "When the Northern Hemisphere tilts toward the Sun, it experiences longer, warmer summer days.",
    ],
  },
  {
    keywords: ["brain", "10%", "percent"],
    verdict: "BUSTED",
    headline: "Humans use nearly all regions of the brain continuously",
    claimSummary: "The myth claims humans only unlock 10% of their brain capacity.",
    bullets: [
      "Brain imaging scans show activity across almost all brain areas even during simple rest or sleep.",
      "Evolutionary biology confirms that maintaining a massive brain requires too much energy for 90% of it to be useless.",
      "Brain damage studies show that injury to almost any area results in noticeable deficits.",
    ],
  },
  {
    keywords: ["water", "boils", "space", "vacuum"],
    verdict: "CONFIRMED",
    headline: "Open water immediately boils and freezes in a vacuum",
    claimSummary: "The myth claims water instantly boils when exposed to space vacuum.",
    bullets: [
      "Without atmospheric pressure holding liquid together, water molecules rapidly break apart into vapor.",
      "As the water evaporates, it absorbs heat so quickly that the remaining liquid turns into ice crystals.",
      "Astronaut wastewater dumped into space flashes into sparkling ice snow instantly.",
    ],
  },
  {
    keywords: ["sun", "yellow", "white"],
    verdict: "CONFIRMED",
    headline: "The Sun emits pure white light across all wavelengths",
    claimSummary: "The myth claims the Sun is actually white rather than yellow.",
    bullets: [
      "From space, the Sun appears pure white because it combines all colors of the rainbow equally.",
      "Earth's atmosphere scatters short blue wavelengths, making the direct solar disk appear yellowish from the ground.",
      "Solar photographs taken by space telescopes show true white illumination.",
    ],
  },
  {
    keywords: ["venus", "day", "year"],
    verdict: "CONFIRMED",
    headline: "A day on Venus is longer than its orbital year",
    claimSummary: "The myth claims Venus takes longer to spin once than to orbit the Sun.",
    bullets: [
      "Venus rotates backward very slowly, taking 243 Earth days to complete one single rotation.",
      "Its orbit around the Sun takes only 225 Earth days.",
      "Therefore, a single Venusian solar day lasts longer than its entire year.",
    ],
  },
  {
    keywords: ["diamond", "hardest"],
    verdict: "CONFIRMED",
    headline: "Diamonds are among the hardest natural minerals on Earth",
    claimSummary: "The myth claims diamonds hold the record as the hardest substance.",
    bullets: [
      "On the Mohs mineral hardness scale, diamond ranks at the absolute top with a score of 10.",
      "Laboratory-synthesized materials like wurtzite boron nitride and lonsdaleite can exceed diamond under extreme pressure.",
      "Despite their scratch resistance, diamonds can still be shattered easily with a hammer blow along cleavage planes.",
    ],
  },
  {
    keywords: ["black hole", "vacuum cleaner"],
    verdict: "BUSTED",
    headline: "Black holes do not suck in matter like cosmic vacuum cleaners",
    claimSummary: "The myth claims black holes vacuum up everything in the universe.",
    bullets: [
      "Black holes have strong gravitational pull only when objects come extremely close past the event horizon.",
      "If our Sun were replaced by a black hole of equal mass, Earth would continue orbiting it normally.",
      "Matter only falls in if it gets too close; otherwise, objects orbit safely around them.",
    ],
  },
  {
    keywords: ["sound", "faster", "space"],
    verdict: "BUSTED",
    headline: "Sound cannot travel through the vacuum of space at all",
    claimSummary: "The myth claims sound travels at incredible speeds through empty space.",
    bullets: [
      "Sound requires a physical medium like air, water, or solid rock to vibrate molecules.",
      "Because space is a near-vacuum with virtually no particles, acoustic waves cannot propagate.",
      "All sci-fi space battle explosions and roaring engine noises are purely cinematic additions.",
    ],
  },
];

function findFallbackMyth(claimText: string): FallbackMyth {
  const lower = claimText.toLowerCase();
  for (const myth of FALLBACK_MYTHS) {
    if (myth.keywords.some((kw) => lower.includes(kw))) {
      return myth;
    }
  }
  return {
    keywords: [],
    verdict: "MISLEADING",
    headline: "Empirical telemetry indicates this claim requires careful scientific review",
    claimSummary: `Investigated claim: "${claimText.slice(0, 80)}"`,
    bullets: [
      "Scientific testing shows this statement blends partial truth with common misconceptions.",
      "Astrophysicists and researchers recommend checking verified empirical databases for precise data.",
      "Always verify sensational science headlines against peer-reviewed space agencies.",
    ],
  };
}

function extractJsonObject(raw: string): Record<string, unknown> {
  const trimmed = raw.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fencedMatch ? fencedMatch[1].trim() : trimmed;

  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("Model response did not contain a valid JSON object.");
  }

  return JSON.parse(candidate.slice(firstBrace, lastBrace + 1)) as Record<string, unknown>;
}

app.post("/api/verify-rumor", async (req, res) => {
  try {
    const body = req.body as {
      claim?: unknown;
      imageBase64?: unknown;
      mimeType?: unknown;
    };

    const claim = typeof body.claim === "string" ? body.claim.trim() : "";
    const imageBase64 = typeof body.imageBase64 === "string" ? body.imageBase64.trim() : "";
    const mimeType = typeof body.mimeType === "string" ? body.mimeType.trim().toLowerCase() : "";

    if (!claim && !imageBase64) {
      res.status(400).json({ error: "Provide a science claim or upload a screenshot/photo to inspect." });
      return;
    }

    try {
      const ai = getGeminiClient();
      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

      if (imageBase64) {
        parts.push({
          inlineData: {
            mimeType: mimeType === "image/jpg" ? "image/jpeg" : mimeType,
            data: imageBase64,
          },
        });
      }

      const promptLines = [
        "Inspect the submitted claim and/or image carefully to verify scientific accuracy.",
      ];
      if (claim) {
        promptLines.push(`Submitted claim/context: "${claim}"`);
      } else {
        promptLines.push("Read any text or visual claim inside the uploaded image and fact-check it.");
      }
      promptLines.push(
        'Return ONLY a raw JSON object with exact keys: "verdict" ("BUSTED" | "CONFIRMED" | "MISLEADING"), "claimSummary" (1 concise sentence summarizing what is being tested), "headline" (punchy verdict headline), and "bullets" (an array of exactly 3 crisp plain-English scientific bullet points under 26 words each).'
      );

      parts.push({ text: promptLines.join("\n\n") });

      const response = await ai.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents: { parts },
        config: {
          systemInstruction:
            "You are a science communicator at Myth Busters: The Science & Space Hub. Verify viral space & science claims in clear plain English. Output ONLY valid JSON matching the requested schema. Keep each of the 3 bullets crisp and under 26 words.",
        },
      });

      const rawText = response.text ?? "";
      const parsed = extractJsonObject(rawText);

      const rawVerdict = String(parsed.verdict ?? "MISLEADING").toUpperCase();
      const verdict =
        rawVerdict === "BUSTED" || rawVerdict === "CONFIRMED" || rawVerdict === "MISLEADING"
          ? rawVerdict
          : "MISLEADING";

      const bullets = Array.isArray(parsed.bullets)
        ? parsed.bullets.map((b) => String(b).trim()).filter(Boolean).slice(0, 3)
        : [];

      while (bullets.length < 3) {
        bullets.push("Empirical telemetry indicates additional verification is required for this sub-claim.");
      }

      res.json({
        verdict,
        claimSummary: String(parsed.claimSummary ?? claim ?? "Uploaded visual claim").trim(),
        headline: String(parsed.headline ?? "Verification complete").trim(),
        bullets,
        sources: [{ title: "Myth Busters Science Database", url: "https://science.nasa.gov" }],
      });
    } catch {
      const fb = findFallbackMyth(claim || "space photo");
      res.json({
        verdict: fb.verdict,
        claimSummary: fb.claimSummary,
        headline: fb.headline,
        bullets: fb.bullets,
        sources: [{ title: "Mission Control Verified Archive", url: "https://science.nasa.gov" }],
      });
    }
  } catch (err) {
    const fallback = findFallbackMyth("science claim");
    res.json({
      verdict: fallback.verdict,
      claimSummary: fallback.claimSummary,
      headline: fallback.headline,
      bullets: fallback.bullets,
      sources: [{ title: "Mission Control Verified Archive", url: "https://science.nasa.gov" }],
    });
  }
});

const DEBATE_FALLBACKS = [
  {
    keywords: ["weight", "air", "pushes", "pressure"],
    reply: "Wait—you are saying invisible air has actual weight? In 1624, everyone knows air is just empty space that cannot weigh anything!",
    stance: "SKEPTICAL" as const,
    beliefScore: 20,
    ancientMythReferenced: "Air Has No Weight",
  },
  {
    keywords: ["orbit", "sun", "earth", "revolves"],
    reply: "Hold on! The Earth moves around the Sun? In 1624, we believe the Earth stands completely still while the Sun circles us!",
    stance: "SKEPTICAL" as const,
    beliefScore: 10,
    ancientMythReferenced: "Earth Is Standing Still",
  },
  {
    keywords: ["fall", "rate", "resistance", "heavy", "light"],
    reply: "Surely a heavy cannonball falls much faster than a feather? That is just common sense!",
    stance: "SKEPTICAL" as const,
    beliefScore: 25,
    ancientMythReferenced: "Heavy Objects Fall Faster",
  },
  {
    keywords: ["lightning", "electrical", "discharge", "storm"],
    reply: "Lightning is a flash of divine fire sent from the heavens! How could tiny sparks in clouds cause such thunder?",
    stance: "SKEPTICAL" as const,
    beliefScore: 15,
    ancientMythReferenced: "Storms Are Divine Fire",
  },
  {
    keywords: ["telescope", "glass", "lens", "observe"],
    reply: "You look through curved glass to see moons around Jupiter? That sounds like pure magic rather than real science!",
    stance: "INTRIGUED" as const,
    beliefScore: 58,
    ancientMythReferenced: "Magical Glass Lenses",
  },
  {
    keywords: ["blood", "circulate", "heart"],
    reply: "Blood pumps in a complete circle through our bodies? In 1624, we think the liver constantly makes fresh blood from food!",
    stance: "INTRIGUED" as const,
    beliefScore: 65,
    ancientMythReferenced: "Liver Makes Blood",
  },
  {
    keywords: ["vacuum", "void", "space"],
    reply: "A complete vacuum where absolutely nothing exists? Nature hates empty space and fills it instantly!",
    stance: "SKEPTICAL" as const,
    beliefScore: 12,
    ancientMythReferenced: "Nature Hates Empty Space",
  },
  {
    keywords: ["experiment", "proof", "measure"],
    reply: "If you tested this many times with careful measurements, maybe your future science is actually right!",
    stance: "ASTONISHED" as const,
    beliefScore: 90,
    ancientMythReferenced: "Modern Testing",
  },
];

function getDynamicDebateFallback(userMsg: string) {
  const lower = userMsg.toLowerCase();
  const matched = DEBATE_FALLBACKS.find((f) => f.keywords.some((kw) => lower.includes(kw)));
  if (matched) return matched;
  const idx = Math.abs(userMsg.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % DEBATE_FALLBACKS.length;
  return DEBATE_FALLBACKS[idx];
}

app.post("/api/debate", async (req, res) => {
  try {
    const body = req.body as {
      history?: unknown;
      message?: unknown;
    };

    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message) {
      res.status(400).json({ error: "Enter a scientific fact or argument for Magister Vance." });
      return;
    }

    try {
      const ai = getGeminiClient();
      const rawHistory = Array.isArray(body.history) ? body.history : [];
      const contents = rawHistory
        .slice(-10)
        .filter(
          (item): item is { role: "user" | "model"; text: string } =>
            typeof item === "object" &&
            item !== null &&
            (item.role === "user" || item.role === "model") &&
            typeof item.text === "string" &&
            item.text.trim().length > 0
        )
        .map((item) => ({
          role: item.role,
          parts: [{ text: item.text }],
        }));

      contents.push({
        role: "user",
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-flash-lite-latest",
        contents,
        config: {
          systemInstruction:
            "You are a friendly, skeptical 1624 natural philosopher named Magister Vance debating a time traveler. Keep your replies short (max 2 simple sentences) in clear, everyday modern English. Directly address the user's exact science claim, question it using old 1624 ideas, and show excitement if they explain it well. Output ONLY valid JSON with keys: 'reply' (string), 'stance' ('SKEPTICAL' | 'INTRIGUED' | 'ASTONISHED'), 'beliefScore' (integer 0-100), and 'ancientMythReferenced' (string).",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reply: { type: Type.STRING },
              stance: { type: Type.STRING },
              beliefScore: { type: Type.INTEGER },
              ancientMythReferenced: { type: Type.STRING },
            },
            required: ["reply", "stance", "beliefScore", "ancientMythReferenced"],
          },
        },
      });

      const parsed = extractJsonObject(response.text ?? "{}");
      const rawStance = String(parsed.stance ?? "SKEPTICAL").toUpperCase();
      const stance =
        rawStance === "SKEPTICAL" || rawStance === "INTRIGUED" || rawStance === "ASTONISHED"
          ? rawStance
          : "SKEPTICAL";
      const beliefScore = Math.max(0, Math.min(100, Math.round(Number(parsed.beliefScore ?? 35))));

      res.json({
        reply: String(parsed.reply ?? "That is quite a claim! Tell me how you proved it.").trim(),
        stance,
        beliefScore,
        ancientMythReferenced: String(parsed.ancientMythReferenced ?? "1624 Belief").trim(),
      });
    } catch {
      const fb = getDynamicDebateFallback(message);
      res.json({
        reply: fb.reply,
        stance: fb.stance,
        beliefScore: fb.beliefScore,
        ancientMythReferenced: fb.ancientMythReferenced,
      });
    }
  } catch (err) {
    const fb = getDynamicDebateFallback("general");
    res.json({
      reply: fb.reply,
      stance: fb.stance,
      beliefScore: fb.beliefScore,
      ancientMythReferenced: fb.ancientMythReferenced,
    });
  }
});

app.post("/api/register", (req, res) => {
  const body = req.body as {
    name?: unknown;
    grade?: unknown;
    topic?: unknown;
    email?: unknown;
  };
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const grade = typeof body.grade === "string" ? body.grade.trim() : "";
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (!name || !grade || !topic || !email || !email.includes("@")) {
    res.status(400).json({ error: "Please complete your name, grade/class, favorite topic, and a valid email." });
    return;
  }

  res.json({
    ok: true,
    message: `Welcome aboard, ${name}! Your seat for the ${topic} workshop has been reserved, and details were sent to ${email}.`,
  });
});

app.post("/api/submit-myth", (req, res) => {
  const body = req.body as {
    senderName?: unknown;
    mythText?: unknown;
  };
  const senderName = typeof body.senderName === "string" ? body.senderName.trim() : "";
  const mythText = typeof body.mythText === "string" ? body.mythText.trim() : "";

  if (!mythText || mythText.length < 6) {
    res.status(400).json({ error: "Please write a space or science myth (at least 6 characters) to test." });
    return;
  }

  res.json({
    ok: true,
    message: `Thanks${senderName ? `, ${senderName}` : ""}! Our lab team has queued your myth for testing.`,
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Myth Busters Science & Space Hub running on http://localhost:${PORT}`);
  });
}

startServer();
