require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Safety override keywords — these bypass AI and force emergency
const EMERGENCY_KEYWORDS = [
  "chest pain",
  "breathing difficulty",
  "difficulty breathing",
  "can't breathe",
  "cannot breathe",
  "unconscious",
  "not breathing",
  "heart attack",
  "stroke",
  "severe bleeding",
  "unresponsive",
];

function checkEmergencyOverride(symptoms) {
  const lower = symptoms.toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
}

function parseJsonFromAiText(rawText) {
  const cleaned = String(rawText || "").replace(/```json|```/gi, "").trim();

  // Fast path when model returns pure JSON.
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    // Fall back to extracting the first balanced JSON object from text.
  }

  const start = cleaned.indexOf("{");
  if (start === -1) {
    throw new Error("No JSON object found in AI response");
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < cleaned.length; i += 1) {
    const ch = cleaned[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        const candidate = cleaned.slice(start, i + 1);
        return JSON.parse(candidate);
      }
    }
  }

  throw new Error("Could not extract valid JSON from AI response");
}

app.post("/triage", async (req, res) => {
  const { symptoms, age, duration } = req.body;

  if (!symptoms || symptoms.trim() === "") {
    return res.status(400).json({ error: "Symptoms field is required." });
  }

  // Safety layer — override before calling AI
  if (checkEmergencyOverride(symptoms)) {
    return res.json({
      severity: "high",
      action: "emergency",
      reason:
        "Your symptoms include critical warning signs (such as chest pain, breathing difficulty, or loss of consciousness). Do NOT wait — call 112 immediately or go to the nearest emergency room right now.",
    });
  }

  const prompt = `You are MediRoute, a medical triage AI assistant for rural India.
A patient has provided the following information:
- Symptoms: ${symptoms}
- Age: ${age || "Not specified"}
- Duration of symptoms: ${duration || "Not specified"}

Based on this, provide a structured medical triage recommendation.
Respond ONLY with a valid JSON object — no markdown, no backticks, no extra text.
The JSON must have exactly these three fields:
{
  "severity": "low" | "medium" | "high",
  "action": "self-care" | "clinic" | "emergency",
  "reason": "A clear, simple 2-3 sentence explanation of your assessment written for a non-medical person. Include what they should do, any warning signs to watch for, and when to escalate care."
}

Rules:
- "low" severity + "self-care": mild symptoms manageable at home
- "medium" severity + "clinic": needs a doctor visit within 24-48 hours
- "high" severity + "emergency": needs immediate medical attention
- Write the reason in simple English, empathetic and direct
- Never diagnose — only triage
- When in doubt, escalate to a higher severity level`;

  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is missing in environment");
    }

    const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 512,
      }),
    });

    if (!aiResponse.ok) {
      const errBody = await aiResponse.text();
      throw new Error(`Groq API error ${aiResponse.status}: ${errBody}`);
    }

    const aiPayload = await aiResponse.json();
    const rawText = aiPayload?.choices?.[0]?.message?.content || "";

    const parsed = parseJsonFromAiText(rawText);

    // Validate the response shape
    const validSeverities = ["low", "medium", "high"];
    const validActions = ["self-care", "clinic", "emergency"];

    if (
      !validSeverities.includes(parsed.severity) ||
      !validActions.includes(parsed.action) ||
      typeof parsed.reason !== "string"
    ) {
      throw new Error("Invalid response shape from AI");
    }

    return res.json(parsed);
  } catch (err) {
    console.error("Triage error:", err.message);
    return res.status(500).json({
      error: "Something went wrong while analyzing your symptoms. Please try again.",
    });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "MediRoute API" });
});

app.listen(PORT, () => {
  console.log(`MediRoute backend running on http://localhost:${PORT}`);
});
