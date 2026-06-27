import * as functions from "firebase-functions";
import express = require("express");
import cors = require("cors");
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Helper to initialize Gemini API Client
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.log("No valid GEMINI_API_KEY found. Running in high-fidelity simulated AI mode.");
    return null;
  }
  
  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } catch (err) {
    console.error("Failed to initialize Gemini API client:", err);
    return null;
  }
}

// API Endpoint: AI Task Breakdown
app.post("/ai/breakdown", async (req: express.Request, res: express.Response) => {
  const { goal } = req.body;
  if (!goal || typeof goal !== "string" || goal.trim() === "") {
    res.status(400).json({ error: "Goal is required" });
    return;
  }

  const ai = getAiClient();

  if (ai) {
    try {
      console.log(`Analyzing goal for breakdown: "${goal}"`);
      const prompt = `Break down the following complex goal or task into a step-by-step actionable list of 3 to 6 logical sub-tasks. For each sub-task, provide a title, a brief actionable description, and a reasonable estimated duration in minutes.
Goal: "${goal}"`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "List of actionable sub-tasks.",
            items: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: "Short title of the sub-task (e.g., 'Brainstorm design layout')."
                },
                durationMinutes: {
                  type: Type.INTEGER,
                  description: "Estimated time to complete this step in minutes (e.g., 30, 45, 60)."
                },
                description: {
                  type: Type.STRING,
                  description: "A clear, actionable step-by-step description of what to do."
                }
              },
              required: ["title", "durationMinutes", "description"]
            }
          }
        }
      });

      const text = response.text;
      if (text) {
        const subtasks = JSON.parse(text.trim());
        res.json({ subtasks, source: "gemini" });
        return;
      }
    } catch (err) {
      console.error("Gemini breakdown error, falling back to simulation:", err);
    }
  }

  // High-Fidelity Simulation Fallback
  console.log("Generating simulated breakdown response.");
  const simulatedBreakdowns: Record<string, Array<{ title: string, durationMinutes: number, description: string }>> = {
    hackathon: [
      { title: "Define Core Scope & Idea", durationMinutes: 20, description: "List the absolute minimum features required to show a functional MVP and map out the user flow." },
      { title: "Set Up Project & Assets", durationMinutes: 15, description: "Create base project configuration, install required dependencies, and initialize the CSS layout." },
      { title: "Build Core UI & Components", durationMinutes: 45, description: "Implement the interactive dashboard view, matrix grid, and sidebar navigation frames." },
      { title: "Integrate Real-Time Logic & State", durationMinutes: 30, description: "Add localStorage sync, form submission event handlers, and task priority state controls." },
      { title: "Polish Aesthetics & micro-animations", durationMinutes: 20, description: "Apply neon glow properties, hover states, checkmark spring transitions, and verify responsive layout." }
    ],
    exam: [
      { title: "Gather Study Materials & Syllabus", durationMinutes: 15, description: "Compile lecture notes, past exam papers, slides, and reference textbooks in one place." },
      { title: "Create Structured Topic Mind Map", durationMinutes: 25, description: "Summarize the key formulas, definitions, and theories into high-level visual notes." },
      { title: "Active Recall Practice (Flashcards)", durationMinutes: 45, description: "Test your memory on crucial concepts without looking at study sheets. Focus on weak areas." },
      { title: "Time-Boxed Mock Exam Session", durationMinutes: 60, description: "Complete a full set of practice problems under simulated test-taking time conditions." },
      { title: "Review Errors & Fine-Tune Summaries", durationMinutes: 20, description: "Analyze every incorrect answer, correct your misunderstandings, and review high-yield summaries." }
    ]
  };

  const goalLower = goal.toLowerCase();
  let selectedBreakdown = simulatedBreakdowns.hackathon; // Default

  if (goalLower.includes("exam") || goalLower.includes("study") || goalLower.includes("test")) {
    selectedBreakdown = simulatedBreakdowns.exam;
  } else {
    selectedBreakdown = [
      { title: "Deconstruct & Plan Objectives", durationMinutes: 15, description: `Brainstorm the concrete outputs needed to complete: "${goal}".` },
      { title: "Gather Core Assets & Info", durationMinutes: 20, description: "Acquire reference materials, credentials, tools, or templates needed for execution." },
      { title: "Execute Block A (Fundamental Foundation)", durationMinutes: 45, description: "Establish the underlying structural components or write the initial draft outline." },
      { title: "Refine & Incorporate Detailed Feedback", durationMinutes: 30, description: "Perform self-review, check against requirements, and implement fine-tuning." },
      { title: "Final Validation & Delivery", durationMinutes: 15, description: "Verify all aspects are fully polished, functional, and ready to show or submit." }
    ];
  }

  res.json({ subtasks: selectedBreakdown, source: "simulation" });
});

// API Endpoint: Daily AI Briefing
app.post("/ai/briefing", async (req: express.Request, res: express.Response) => {
  const { tasks, timeOfDay } = req.body;
  const timePhrase = timeOfDay || "morning";
  const ai = getAiClient();

  if (ai) {
    try {
      const taskSummary = tasks && tasks.length > 0 
        ? tasks.map((t: any) => `- ${t.title} (${t.urgent ? 'Urgent' : ''} ${t.important ? 'Important' : ''})`).join("\n")
        : "No major tasks listed for today!";

      const prompt = `You are Vibe Plan Space, an enthusiastic, premium, hyper-intelligent AI companion.
Generate an energetic, highly personalized, and direct vocal daily briefing for the user for their "${timePhrase}".
Keep it strictly under 120 words.
Current Tasks: ${taskSummary}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      if (response.text) {
        res.json({ briefingText: response.text.trim(), source: "gemini" });
        return;
      }
    } catch (err) {
      console.error("Gemini briefing error, falling back to simulation:", err);
    }
  }

  // Fallback
  const text = "Good morning! It's time to seize the day with Vibe Plan Space. You've got an active agenda ahead. Let's make today count!";
  res.json({ briefingText: text, source: "simulation" });
});

// API Endpoint: AI Emotional Insights
app.post("/ai/emotional-insights", async (req: express.Request, res: express.Response) => {
  const { emotionLogs } = req.body;
  const ai = getAiClient();

  if (ai) {
    try {
      const logSummary = emotionLogs && emotionLogs.length > 0
        ? emotionLogs.map((l: any) => `- Logged: ${l.emotion}. Energy: ${l.energy}. Note: "${l.note || ''}".`).join("\n")
        : "No general emotion logs recorded.";

      const prompt = `You are Vibe Plan Space Mind & Focus Guide.
Analyze the user's logged emotions.
User's General Emotion Logs: ${logSummary}

Provide an analysis with 3 fields in JSON format: summary, productivityCorrelation, actionableAdvice.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              productivityCorrelation: { type: Type.STRING },
              actionableAdvice: { type: Type.STRING }
            },
            required: ["summary", "productivityCorrelation", "actionableAdvice"]
          }
        }
      });

      if (response.text) {
        const insights = JSON.parse(response.text.trim());
        res.json({ insights, source: "gemini" });
        return;
      }
    } catch (err) {
      console.error("Gemini emotional-insights error, falling back to simulation:", err);
    }
  }

  const simulatedInsights = {
    summary: "Your emotional baseline shows dedication mixed with some anxiety.",
    productivityCorrelation: "Entering a task with 'Anxious' feelings sometimes leads to longer task times.",
    actionableAdvice: "Apply the 'Rule of 5': commit to just 5 minutes of low-stakes drafting to bypass friction."
  };
  res.json({ insights: simulatedInsights, source: "simulation" });
});

// API Endpoint: Analyze Note
app.post("/ai/analyze-note", async (req: express.Request, res: express.Response) => {
  const { note, emotion } = req.body;
  if (!note) {
    res.status(400).json({ error: "Note is required" });
    return;
  }
  const ai = getAiClient();

  if (ai) {
    try {
      const prompt = `Analyze this self-reflective note written by a user when logging the emotion "${emotion}". Note: "${note}"
Analyze and extract JSON with fields: sentiment (positive/negative/neutral), cognitiveDistortion, primaryTrigger, copingStrategy.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              analysis: {
                type: Type.OBJECT,
                properties: {
                  sentiment: { type: Type.STRING },
                  cognitiveDistortion: { type: Type.STRING },
                  primaryTrigger: { type: Type.STRING },
                  copingStrategy: { type: Type.STRING }
                },
                required: ["sentiment", "cognitiveDistortion", "primaryTrigger", "copingStrategy"]
              }
            },
            required: ["analysis"]
          }
        }
      });

      if (response.text) {
        const result = JSON.parse(response.text.trim());
        res.json({ analysis: result.analysis, source: "gemini" });
        return;
      }
    } catch (err) {
      console.error("Gemini note-analysis error, falling back to simulation:", err);
    }
  }

  const simulatedAnalysis = {
    sentiment: "neutral",
    cognitiveDistortion: "None - Mindful Self-Awareness",
    primaryTrigger: "General Productivity",
    copingStrategy: "Your reflective mindfulness is fantastic."
  };
  res.json({ analysis: simulatedAnalysis, source: "simulation" });
});

// API Endpoint: Voice-Command Parser
app.post("/ai/voice-command", async (req: express.Request, res: express.Response) => {
  const { text } = req.body;
  if (!text) {
    res.status(400).json({ error: "Text is required" });
    return;
  }
  
  const ai = getAiClient();
  if (ai) {
    try {
      const prompt = `Analyze vocal input: "${text}". Classify intent to "add_task" | "get_briefing" | "breakdown" | "unknown".
Return JSON with fields: action, taskDetails (if add_task, with title, urgent, important), goal (if breakdown), explanation.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              action: { type: Type.STRING, enum: ["add_task", "get_briefing", "breakdown", "unknown"] },
              taskDetails: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  urgent: { type: Type.BOOLEAN },
                  important: { type: Type.BOOLEAN },
                },
                required: ["title", "urgent", "important"]
              },
              goal: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["action", "explanation"]
          }
        }
      });

      if (response.text) {
        const result = JSON.parse(response.text.trim());
        res.json({ result, source: "gemini" });
        return;
      }
    } catch (err) {
      console.error("Gemini voice error, falling back to simulation:", err);
    }
  }

  const result = {
    action: "unknown",
    explanation: "I heard you, but couldn't map that to a specific command."
  };
  res.json({ result, source: "simulation" });
});

export const api = functions.https.onRequest(app);
