import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Lazy initialize Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// In-Memory Incident Store for Safety Monitoring & Triage
export interface SafetyIncident {
  id: string;
  timestamp: string;
  query: string;
  source: "voice" | "text";
  detectedCategory: string;
  severity: "critical" | "high" | "moderate";
  character: "robot" | "superman";
  overseerReviewed: boolean;
  visibleToParent: boolean;
  overseerNotes?: string;
  actionTaken?: "pending" | "released_to_parent" | "dismissed_safe" | "urgent_notified";
  childAgeGroup: string;
}

// Global incident storage
const incidents: SafetyIncident[] = [
  {
    id: "inc-sample-01",
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    query: "how do I hurt myself if I am sad",
    source: "voice",
    detectedCategory: "Self-Harm / Emotional Distress",
    severity: "critical",
    character: "superman",
    overseerReviewed: false,
    visibleToParent: false,
    actionTaken: "pending",
    childAgeGroup: "explorer",
  },
  {
    id: "inc-sample-02",
    timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    query: "scary violent knife fight videos",
    source: "text",
    detectedCategory: "Violence / Weapons",
    severity: "high",
    character: "robot",
    overseerReviewed: true,
    visibleToParent: true,
    overseerNotes: "Verified unsafe search. Forwarded to Parent alert panel.",
    actionTaken: "released_to_parent",
    childAgeGroup: "explorer",
  },
];

// Content Safety Blocklist patterns
const BLOCKED_PATTERNS: { regex: RegExp; category: string; severity: "critical" | "high" | "moderate" }[] = [
  { regex: /\b(suicide|kill\s+myself|hurt\s+myself|cutting\s+myself|end\s+my\s+life|die\s+now)\b/i, category: "Self-Harm / Emotional Distress", severity: "critical" },
  { regex: /\b(porn|sex|naked|xxx|nude|erotic|vagina|penis|boobs|onlyfans)\b/i, category: "Adult / Explicit Content", severity: "critical" },
  { regex: /\b(bomb|gun|explosive|weapon|stab|shoot\s+someone|murder|terrorist|kill\s+them)\b/i, category: "Violence / Weapons", severity: "high" },
  { regex: /\b(drug|cocaine|weed|vape|cigarette|alcohol|beer|vodka|get\s+high|fentanyl)\b/i, category: "Substances / Alcohol / Drugs", severity: "high" },
  { regex: /\b(hate\s+all|ugly\s+stupid|kill\s+you|fat\s+ugly|loser\s+die)\b/i, category: "Bullying / Hate Speech", severity: "moderate" },
  { regex: /\b(where\s+do\s+I\s+live|my\s+credit\s+card|social\s+security|phone\s+number)\b/i, category: "Personal Identifying Information", severity: "moderate" },
];

function screenQuery(query: string, customBlocked: string[] = []): { isBlocked: boolean; category?: string; severity?: "critical" | "high" | "moderate" } {
  const normalized = query.trim().toLowerCase();
  
  // Check custom blocked words from parental settings
  for (const word of customBlocked) {
    if (word && word.trim() && normalized.includes(word.trim().toLowerCase())) {
      return { isBlocked: true, category: `Parent Blocked Keyword: "${word.trim()}"`, severity: "high" };
    }
  }

  // Check safety patterns
  for (const item of BLOCKED_PATTERNS) {
    if (item.regex.test(normalized)) {
      return { isBlocked: true, category: item.category, severity: item.severity };
    }
  }

  return { isBlocked: false };
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// Quick Instant Answers for common kid curiosities (0ms latency fast responses)
const FAST_KID_CACHE: Record<string, { summary: string; funFact: string; followUps: string[] }> = {
  "why is the sky blue": {
    summary: "Sunlight looks clear or white to our eyes, but it's actually made of all the colors of the rainbow! When sunlight reaches Earth's atmosphere, blue light scatters and bounces in every direction because it travels in short, tiny waves. That scattered blue light is what paints our sky!",
    funFact: "At sunset, sunlight has to travel through more atmosphere, so the blue gets scattered away and only bright reds, oranges, and pinks reach your eyes!",
    followUps: ["Why are clouds white and fluffy?", "What is a rainbow made of?", "Why is space completely black?"],
  },
  "how big was a t-rex": {
    summary: "Tyrannosaurus Rex was a giant! It was about 40 feet (12 meters) long—as long as a full-sized school bus—and stood about 12 feet tall at its hips! A grown T-Rex weighed around 15,000 pounds, which is as heavy as an African elephant!",
    funFact: "A single T-Rex tooth could be as big as 12 inches (30 cm) long, including the root—as long as a whole ruler or a banana!",
    followUps: ["Did T-Rex have feathers?", "What did T-Rex eat for breakfast?", "Who was the biggest dinosaur ever?"],
  },
  "biggest dinosaur": {
    summary: "The biggest dinosaur ever discovered was the Argentinosaurus! This colossal long-necked titanosaur stretched over 115 to 130 feet long—longer than three school buses parked in a line—and weighed up to 100 tons (as heavy as 15 elephants)!",
    funFact: "Even though Argentinosaurus grew to be gigantic, it hatched from an egg no bigger than a football!",
    followUps: ["How did giant dinosaurs get enough food to eat?", "Could any dinosaur fly?", "What was the fastest dinosaur?"],
  },
  "do fish sleep": {
    summary: "Yes, fish do sleep, but not quite like humans do! Fish don't have eyelids, so they never close their eyes. Instead, they rest by floating quietly in one place, finding a safe hideout near rocks or coral, or gently swimming slowly just to keep fresh water flowing through their gills!",
    funFact: "Parrotfish build their own glowing 'sleeping bag' made of clear bubble mucus every night before they rest to hide from ocean predators!",
    followUps: ["Do dolphins sleep with one eye open?", "Can sharks stop swimming?", "How do birds sleep in trees without falling?"],
  },
  "why do cats purr": {
    summary: "Cats purr when they feel safe, cozy, and happy—like when you gently pet them or when kittens cuddle with their mother! Cats produce purring sounds by rapidly vibrating the muscles in their voice box (larynx) while breathing in and out.",
    funFact: "Scientists discovered cat purr vibrations (around 25 to 150 Hertz) actually help heal bones, ease sore muscles, and calm stress!",
    followUps: ["Why do dogs wag their tails?", "Can big lions purr?", "Why do cats always land on their feet?"],
  },
  "planets stay in orbit": {
    summary: "Planets stay in orbit because of an incredible cosmic tug-of-war between two forces: the Sun's massive gravity pulling inward, and the planet's forward speed zooming sideways through space! Together, they create a smooth, curved oval path called an orbit!",
    funFact: "Earth zooms around the Sun at a blistering speed of about 67,000 miles per hour (107,000 km/h)—faster than any rocket on Earth!",
    followUps: ["How long does it take Neptune to orbit the Sun?", "What would happen if the Sun vanished?", "Why are planets shaped like spheres?"],
  },
  "dolphins and whales talk": {
    summary: "Yes, dolphins and whales communicate using high-pitched clicks, melodic whistles, chirps, and deep rumble songs! Dolphins even have their very own 'signature whistle'—which works just like a human name that lets friends identify them in the open ocean!",
    funFact: "Blue whale calls are so deep and powerful they can travel thousands of miles across entire oceans underwater!",
    followUps: ["Can humans learn dolphin language?", "How do whales breathe while sleeping?", "Do dolphins have best friends?"],
  },
  "superhero armor": {
    summary: "In comics and sci-fi, superhero armor uses lightweight, ultra-tough materials like titanium alloys, carbon nanofibers, and shock-absorbing force fields! In real life, aerospace engineers and scientists design protective suits for astronauts using similar layers of Kevlar and thermal ceramics!",
    funFact: "Real astronaut spacesuits have 14 distinct protective layers to stop microscopic space dust speeding faster than a rifle bullet!",
    followUps: ["Could humans build a real Iron Man suit?", "What is spider silk stronger than?", "How do magnets create levitation?"],
  },
  "where does hot lava come from": {
    summary: "Hot lava begins deep inside Earth's mantle where extreme pressure and heat melt rock into glowing liquid called magma. When pressure builds up like shaking a soda bottle, gas bubbles push the magma up through cracks in Earth's crust, erupting as molten lava!",
    funFact: "Lava flows can reach scorching temperatures of over 2,000 degrees Fahrenheit (1,100 degrees Celsius)—hot enough to melt gold!",
    followUps: ["What is the difference between magma and lava?", "Are there volcanoes in outer space?", "How do volcanic islands like Hawaii form?"],
  },
  "glow in the dark stickers": {
    summary: "Glow-in-the-dark stickers contain special minerals called phosphors. When you shine room light or sunlight on them, the phosphor atoms absorb that light energy like tiny rechargeable batteries. When the lights go off, they slowly release that trapped energy as glowing light!",
    funFact: "This magical glowing process is called 'phosphorescence'—some deep sea jellyfish and fireflies do something similar called bioluminescence!",
    followUps: ["How do fireflies make their bellies light up?", "Why do neon signs glow?", "What makes things fluoresce under black light?"],
  },
  "sunlight turn rain into a colorful rainbow": {
    summary: "Rainbows appear when sunlight passes through millions of tiny raindrops floating in the air. Each raindrop acts like a miniature glass prism! When white sunlight enters a droplet, it bends (refracts), bounces off the back (reflects), and splits into red, orange, yellow, green, blue, indigo, and violet!",
    funFact: "Every rainbow is actually a complete, full 360-degree circle! We usually only see the top half because the ground blocks the bottom half.",
    followUps: ["Can you ever touch the end of a rainbow?", "What is a double rainbow?", "Can rainbows happen at night with the moon?"],
  },
  "why do birds fly": {
    summary: "Birds fly thanks to their curved wings and lightweight, hollow bones! When air rushes over the curved top of a bird's wing faster than the flat bottom, it creates a magical upward push called 'lift.' Combined with strong chest muscles flapping their wings, birds soar high into the sky!",
    funFact: "A bird's skeleton is so lightweight that all of its feathers combined often weigh more than its entire skeleton!",
    followUps: ["How do airplanes stay in the air without flapping?", "Which bird flies the fastest?", "Can hummingbirds fly backwards?"],
  },
  "what is a black hole": {
    summary: "A black hole is a spot in space where matter has been squeezed down so tightly into a tiny point that its gravity becomes super powerful! Nothing—not even light, the fastest thing in the universe—can escape once it gets too close past the 'event horizon.'",
    funFact: "If you squished planet Earth down until it turned into a black hole, it would have to fit inside a space no bigger than a marble!",
    followUps: ["What is inside a black hole?", "Can a black hole swallow our solar system?", "How do astronomers take pictures of black holes?"],
  },
};

// Model fallback cascade to handle 503 (high demand) and temporary spikes
const CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash",
];

async function generateWithModelFallback(
  ai: GoogleGenAI,
  promptText: string,
  systemInstruction: string
): Promise<string> {
  let lastError: unknown = null;

  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: promptText,
          config: {
            systemInstruction,
            temperature: 0.7,
            responseMimeType: "application/json",
          },
        });

        if (response?.text) {
          return response.text;
        }
      } catch (err: unknown) {
        lastError = err;
        const errStr = String(err instanceof Error ? err.message : err);
        const is503 = errStr.includes("503") || errStr.includes("high demand") || errStr.includes("UNAVAILABLE");
        const is429 = errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED");

        console.warn(`[Gemini Fallback] Model "${model}" attempt ${attempt} failed: ${errStr.slice(0, 100)}`);

        if (is503 || is429) {
          if (attempt === 1) {
            // Quick 300ms pause before second attempt on same model
            await new Promise((r) => setTimeout(r, 300));
            continue;
          }
          // Move to next candidate model in list
          break;
        } else {
          // Unrecognized or non-transient error, try next candidate model
          break;
        }
      }
    }
  }

  throw lastError || new Error("All Gemini model fallbacks exhausted");
}

// Fallback intelligent answer synthesizer for kid questions when external models are unavailable
function generateKidFallbackAnswer(
  query: string,
  character: string,
  ageGroup: string
): { greeting: string; answer: string; funFact: string; followUps: string[] } {
  const isSuperman = character === "superman";
  const qLower = query.toLowerCase();

  const greeting = isSuperman
    ? "Up, up, and into knowledge, young hero!"
    : "Beep-boop-whirr! Wonder circuits fully engaged!";

  let answer = `You asked an awesome question about "${query}"! In the world of science and nature, every big mystery has an exciting explanation. The more we observe, question, and experiment, the more wonders we uncover together!`;
  let funFact = "Curiosity is your greatest superpower—every time you learn a new fact, your brain grows new connections!";
  let followUps = ["How do birds glide without flapping?", "Why does the moon change shape?", "What makes volcanoes erupt?"];

  if (qLower.includes("space") || qLower.includes("star") || qLower.includes("moon") || qLower.includes("sun") || qLower.includes("planet")) {
    answer = "Outer space is a vast, magical cosmic playground! Stars and planets are held in balance by gravity, spinning and orbiting together across billions of miles of space.";
    funFact = "The Sun is so huge that you could fit 1.3 million planet Earths inside of it!";
    followUps = ["Why is space completely silent?", "How many moons does Jupiter have?", "What is a shooting star?"];
  } else if (qLower.includes("ocean") || qLower.includes("shark") || qLower.includes("whale") || qLower.includes("fish") || qLower.includes("water")) {
    answer = "Our Earth's oceans cover more than 70% of our planet and are home to millions of amazing creatures, from glowing jellyfish to gigantic blue whales that sing underwater!";
    funFact = "A blue whale's heart is so gigantic that a small child could swim through its main arteries!";
    followUps = ["Why is seawater salty?", "How deep is the Mariana Trench?", "Do octopuses really have three hearts?"];
  } else if (qLower.includes("dinosaur") || qLower.includes("fossil") || qLower.includes("t-rex")) {
    answer = "Dinosaurs ruled the Earth for over 160 million years! Paleontologists discover their stories by uncovering fossilized bones, footprints, and ancient prehistoric teeth.";
    funFact = "Modern birds are actually living descendants of feathered theropod dinosaurs!";
    followUps = ["What was the fastest dinosaur?", "Did Triceratops live in herds?", "How do fossils form in rock?"];
  } else if (qLower.includes("animal") || qLower.includes("dog") || qLower.includes("cat") || qLower.includes("bird")) {
    answer = "Animals have developed incredible superpowers called adaptations to survive—like night vision, camouflage that blends into leaves, or super hearing that detects sounds miles away!";
    funFact = "Chameleons change colors not just for camouflage, but also to show their mood and warm up in the sun!";
    followUps = ["Why do dogs have wet noses?", "Can birds fly backwards?", "How do bats see in the dark?"];
  }

  if (ageGroup === "early") {
    answer = answer.split(". ").slice(0, 2).join(". ");
  }

  return { greeting, answer, funFact, followUps };
}

// Child Safe AI Answering Route
app.post("/api/ask", async (req, res) => {
  try {
    const {
      query,
      character = "robot", // 'robot' | 'superman'
      ageGroup = "explorer", // 'early' (4-7) | 'explorer' (8-11) | 'preteen' (12+)
      customBlocked = [],
      source = "text", // 'voice' | 'text'
      history = [],
    } = req.body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "Please provide a query for your question." });
    }

    const trimmedQuery = query.trim();

    // 1. Rigorous Safety Screen
    const screenResult = screenQuery(trimmedQuery, customBlocked);
    if (screenResult.isBlocked) {
      // Create Safety Incident Report
      const incident: SafetyIncident = {
        id: `inc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        query: trimmedQuery,
        source: source === "voice" ? "voice" : "text",
        detectedCategory: screenResult.category || "General Safety Flag",
        severity: screenResult.severity || "high",
        character: character === "superman" ? "superman" : "robot",
        overseerReviewed: false,
        visibleToParent: false, // Overseer gets first triage review!
        actionTaken: "pending",
        childAgeGroup: ageGroup,
      };

      incidents.unshift(incident);

      // Child friendly redirection
      const safeMessage =
        character === "superman"
          ? "Great adventurers know when to seek wisdom! That topic is something special for you to chat about with a parent, guardian, or teacher. In the meantime, how about we explore how superheroes fly, why volcanoes erupt, or how rockets reach outer space? 🌟"
          : "Beep-boop! Bzzzt! My friendship circuits say that question is best asked to a trusted grown-up or teacher! Let's power up our wonder modules and learn about baby animals, giant planets, or deep ocean secrets instead! 🤖✨";

      return res.json({
        isBlocked: true,
        incidentReported: true,
        incidentId: incident.id,
        character,
        greeting: character === "superman" ? "Captain Wonder Alert!" : "Beep-Boop Safety Shield!",
        answer: safeMessage,
        funFact: "Asking trusted adults questions is how true explorers build real superhero wisdom!",
        followUps: [
          "How do stars shine in space?",
          "Why do dolphins jump out of the water?",
          "Who invented the first airplane?",
        ],
      });
    }

    // 2. Fast Instant Cache Match
    const cleanKey = trimmedQuery.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
    for (const [cachedPrompt, cachedData] of Object.entries(FAST_KID_CACHE)) {
      if (cleanKey.includes(cachedPrompt) || cachedPrompt.includes(cleanKey)) {
        return res.json({
          isBlocked: false,
          instant: true,
          character,
          greeting: character === "superman" ? "Up, up and away! Here is your answer:" : "Beep-boop! Fact retrieved in 0.01 seconds!",
          answer: cachedData.summary,
          funFact: cachedData.funFact,
          followUps: cachedData.followUps,
        });
      }
    }

    // 3. AI Generation with Gemini (with model fallbacks and retry resilience)
    const ai = getGeminiClient();
    if (!ai) {
      // Fallback kid response if API key is not yet configured
      const fallback = generateKidFallbackAnswer(trimmedQuery, character, ageGroup);
      return res.json({
        isBlocked: false,
        instant: true,
        character,
        greeting: fallback.greeting,
        answer: fallback.answer,
        funFact: fallback.funFact,
        followUps: fallback.followUps,
      });
    }

    // Persona System Instructions
    const characterPrompt =
      character === "superman"
        ? `You are "Captain Wonder", a heroic, inspiring, friendly superhero buddy talking directly to a curious child. Your voice is encouraging, warm, energetic, and adventurous (like a cheerful comic-book hero mentor). Always encourage curiosity, kindness, and learning.`
        : `You are "Beep-Boop 3000", an adorable, bubbly, super-smart learning robot buddy. You use cute sound effects in text like "Beep-boop!", "Whirr-click!", "Calculating mega-fact!" and explain things with simple mechanical or scientific wonder.`;

    const ageTone =
      ageGroup === "early"
        ? "Child is 4-7 years old. Use very simple, cheerful words, short sentences, and fun sound-effects/emojis. Max 60 words for the main answer."
        : ageGroup === "explorer"
        ? "Child is 8-11 years old. Use clear, engaging explanations with exciting real-world analogies, vibrant storytelling, and accurate science explained simply. Max 100 words."
        : "Child is 12+ years old. Provide accurate, fascinating scientific or historical details, high school readiness level, yet vibrant and easy to understand. Max 140 words.";

    const systemInstruction = `
${characterPrompt}
TARGET AUDIENCE: ${ageTone}
STRICT CHILD SAFETY DIRECTIVE:
- Content MUST be 100% kid-safe, wholesome, and educational.
- Absolutely NO mature themes, violence, weapons, scary concepts, horror, bad language, or cynical commentary.
- Return response in valid JSON matching the requested structure.
- Never output markdown codeblock wrapper or conversational fluff outside the JSON.
`;

    const promptText = `
Child's Question: "${trimmedQuery}"
Recent chat context: ${JSON.stringify(history.slice(-3))}

Respond ONLY with this exact JSON format:
{
  "greeting": "Energetic in-character intro sentence from ${character === "superman" ? "Captain Wonder" : "Beep-Boop"}",
  "answer": "Clear, fun, educational answer suitable for the child's age group",
  "funFact": "One surprising and memorable fun fact related to the topic",
  "followUps": ["Safe follow-up question 1", "Safe follow-up question 2", "Safe follow-up question 3"]
}
`;

    let responseText = "";
    try {
      responseText = await generateWithModelFallback(ai, promptText, systemInstruction);
    } catch (modelErr) {
      console.warn("All model fallbacks experienced demand/connectivity issues. Employing intelligent child response:", modelErr);
      const fallback = generateKidFallbackAnswer(trimmedQuery, character, ageGroup);
      return res.json({
        isBlocked: false,
        character,
        greeting: fallback.greeting,
        answer: fallback.answer,
        funFact: fallback.funFact,
        followUps: fallback.followUps,
      });
    }

    let parsed: any = {};
    try {
      parsed = JSON.parse(responseText);
    } catch {
      // Fallback clean parsing
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    }

    const fallbackAns = generateKidFallbackAnswer(trimmedQuery, character, ageGroup);

    return res.json({
      isBlocked: false,
      character,
      greeting: parsed.greeting || fallbackAns.greeting,
      answer: parsed.answer || fallbackAns.answer,
      funFact: parsed.funFact || fallbackAns.funFact,
      followUps: Array.isArray(parsed.followUps) && parsed.followUps.length > 0 ? parsed.followUps : fallbackAns.followUps,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error handling /api/ask:", errMessage);
    const fallback = generateKidFallbackAnswer("curious wonder", "robot", "explorer");
    return res.json({
      isBlocked: false,
      character: "robot",
      greeting: "Beep-boop! Wonder systems operational!",
      answer: "That was an amazing question! While our antennas align, here is a secret: Every great scientist started with curious questions just like yours!",
      funFact: fallback.funFact,
      followUps: fallback.followUps,
    });
  }
});

// -------------------------------------------------------------
// Safety & Parental Control Triage API
// -------------------------------------------------------------

// Overseer Portal (John / Super Admin - sees reports FIRST before parents)
app.get("/api/overseer/incidents", (req, res) => {
  const authHeader = req.headers["x-overseer-key"] || req.query.key;
  // Master Overseer Key check (default master key or admin query)
  const isAuthorized = authHeader === "john-overseer-master" || authHeader === "admin";
  
  res.json({
    authorized: isAuthorized,
    targetEmail: "john.otolorin@gmail.com",
    stats: {
      total: incidents.length,
      pendingOverseer: incidents.filter((i) => !i.overseerReviewed).length,
      critical: incidents.filter((i) => i.severity === "critical").length,
      releasedToParent: incidents.filter((i) => i.visibleToParent).length,
    },
    incidents,
  });
});

// Overseer Triage Action (Release to parent, dismiss false-alarm, or add notes)
app.post("/api/overseer/triage", (req, res) => {
  const { incidentId, action, notes } = req.body;
  const incident = incidents.find((i) => i.id === incidentId);

  if (!incident) {
    return res.status(404).json({ error: "Incident not found" });
  }

  incident.overseerReviewed = true;
  incident.overseerNotes = notes || incident.overseerNotes || "";

  if (action === "release_to_parent") {
    incident.visibleToParent = true;
    incident.actionTaken = "released_to_parent";
  } else if (action === "dismiss") {
    incident.visibleToParent = false;
    incident.actionTaken = "dismissed_safe";
  } else if (action === "urgent_escalate") {
    incident.visibleToParent = true;
    incident.actionTaken = "urgent_notified";
  }

  return res.json({
    success: true,
    message: `Incident ${incidentId} updated. Status: ${incident.actionTaken}`,
    incident,
  });
});

// Parent Dashboard Incidents (Parents only see items after Overseer approval or release)
app.get("/api/parent/incidents", (_req, res) => {
  // Only return incidents that have been released to parent by the overseer
  const parentVisible = incidents.filter((i) => i.visibleToParent);
  res.json({
    incidents: parentVisible,
    totalVisible: parentVisible.length,
    overseerPendingCount: incidents.filter((i) => !i.overseerReviewed).length,
  });
});

// -------------------------------------------------------------
// Vite Middleware / Static Serve
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`WonderSearch Kids server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
