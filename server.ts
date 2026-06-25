import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

// Initialize GoogleGenAI client lazily or handle missing API key gracefully
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API client initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini API client:", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY found. Running in high-fidelity simulated AI mode.");
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Endpoint: AI Task Breakdown
  app.post("/api/ai/breakdown", async (req, res) => {
    const { goal } = req.body;
    if (!goal || typeof goal !== "string" || goal.trim() === "") {
      return res.status(400).json({ error: "Goal is required" });
    }

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
          return res.json({ subtasks, source: "gemini" });
        }
      } catch (err) {
        console.error("Gemini breakdown error, falling back to simulation:", err);
      }
    }

    // High-Fidelity Simulation Fallback (in case API is unavailable or limits reached)
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
      ],
      presentation: [
        { title: "Outline Storyboard & Message Arc", durationMinutes: 20, description: "Determine the main hook, the standard problem statement, the core solution pitch, and the CTA." },
        { title: "Draft Slide Copy & Visual Plan", durationMinutes: 30, description: "Write concise, impact-oriented bullet points for each slide and sketch out diagrams or screenshots." },
        { title: "Design High-Contrast Slide Deck", durationMinutes: 40, description: "Implement a dark/light visual theme, pair clear Sans-Serif headers, and add screenshots or illustrations." },
        { title: "Dry Run Practice (Loud Delivery)", durationMinutes: 25, description: "Rehearse the presentation out loud, tracking your vocal pacing and slide transitions to hit the 10-minute limit." },
        { title: "Optimize Q&A Response Cards", durationMinutes: 15, description: "Anticipate the 3 hardest questions the audience/judges might ask and prepare solid answers." }
      ]
    };

    const goalLower = goal.toLowerCase();
    let selectedBreakdown = simulatedBreakdowns.hackathon; // Default

    if (goalLower.includes("exam") || goalLower.includes("study") || goalLower.includes("test") || goalLower.includes("learn") || goalLower.includes("school")) {
      selectedBreakdown = simulatedBreakdowns.exam;
    } else if (goalLower.includes("presentation") || goalLower.includes("slide") || goalLower.includes("pitch") || goalLower.includes("talk") || goalLower.includes("deck")) {
      selectedBreakdown = simulatedBreakdowns.presentation;
    } else if (goalLower.includes("code") || goalLower.includes("build") || goalLower.includes("develop") || goalLower.includes("hackathon") || goalLower.includes("app")) {
      selectedBreakdown = simulatedBreakdowns.hackathon;
    } else {
      // Dynamic simulated generation for generic goals
      selectedBreakdown = [
        { title: "Deconstruct & Plan Objectives", durationMinutes: 15, description: `Brainstorm the concrete outputs needed to complete: "${goal}".` },
        { title: "Gather Core Assets & Info", durationMinutes: 20, description: "Acquire reference materials, credentials, tools, or templates needed for execution." },
        { title: "Execute Block A (Fundamental Foundation)", durationMinutes: 45, description: "Establish the underlying structural components or write the initial draft outline." },
        { title: "Refine & Incorporate Detailed Feedback", durationMinutes: 30, description: "Perform self-review, check against requirements, and implement fine-tuning." },
        { title: "Final Validation & Delivery", durationMinutes: 15, description: "Verify all aspects are fully polished, functional, and ready to show or submit." }
      ];
    }

    return res.json({ subtasks: selectedBreakdown, source: "simulation" });
  });

  // API Endpoint: Daily AI Briefing
  app.post("/api/ai/briefing", async (req, res) => {
    const { tasks, habits, timeOfDay } = req.body;
    const timePhrase = timeOfDay || "morning";

    if (ai) {
      try {
        const taskSummary = tasks && tasks.length > 0 
          ? tasks.map((t: any) => `- ${t.title} (${t.urgent ? 'Urgent' : ''} ${t.important ? 'Important' : ''})`).join("\n")
          : "No major tasks listed for today! A perfect time to plan ahead.";

        const habitSummary = habits && habits.length > 0
          ? habits.map((h: any) => `- ${h.name} (${h.streak} day streak, ${h.completed ? 'Completed' : 'Pending'})`).join("\n")
          : "No active habits configured yet.";

        const prompt = `You are Vibe Plan Space, an enthusiastic, premium, hyper-intelligent, and proactive AI companion.
Generate an energetic, highly personalized, and direct vocal daily briefing for the user for their "${timePhrase}".
Keep it strictly under 120 words. No flowery greetings. Get straight to motivating actionable tips.

Current Tasks:
${taskSummary}

Habit Streaks:
${habitSummary}

Create a highly focused briefing that highlights what to tackle first, reminds them of their habit streaks, and offers a proactive 'The Last-Minute Life Saver' productivity hack. Keep it in a conversational format suitable for speech synthesis.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
        });

        if (response.text) {
          return res.json({ briefingText: response.text.trim(), source: "gemini" });
        }
      } catch (err) {
        console.error("Gemini briefing error, falling back to simulation:", err);
      }
    }

    // High-Fidelity Simulation Fallback
    const briefings = {
      morning: "Good morning! It's time to seize the day with Vibe Plan Space. You've got an active agenda ahead. Prioritize that high-impact 'Urgent & Important' task first to free up cognitive bandwidth. Remember to lock in your daily habit triggers early so they don't slide. Let's make today count!",
      afternoon: "Hey there, keeping up the momentum? You've powered through the morning. Let's tackle your quick 15-minute goals now while your energy is steady. Try a quick context-aware sprint on a secondary priority. Don't let late-day fatigue push your deadlines. Focus, take a deep breath, and let's wrap this up!",
      evening: "Good evening! It's winding down time, but let's secure the wins. Check off any remaining habits to keep your hard-earned streaks burning bright. Prepare your list for tomorrow so you can sleep with a completely clear mind. Great job pushing through today!"
    };

    const selectedBriefing = briefings[timePhrase as keyof typeof briefings] || briefings.morning;
    return res.json({ briefingText: selectedBriefing, source: "simulation" });
  });

  // API Endpoint: AI Emotional Insights
  app.post("/api/ai/emotional-insights", async (req, res) => {
    const { tasks, emotionLogs } = req.body;

    if (ai) {
      try {
        const taskSummary = tasks && tasks.length > 0
          ? tasks.map((t: any) => `- Task: "${t.title}". Completed: ${t.completed ? 'Yes' : 'No'}. Emotion Before: ${t.emotionBefore || 'None'}. Emotion After: ${t.emotionAfter || 'None'}.`).join("\n")
          : "No specific tasks logged with emotions.";

        const logSummary = emotionLogs && emotionLogs.length > 0
          ? emotionLogs.map((l: any) => `- Logged: ${l.emotion} (${l.emoji}). Stage: ${l.stage}. Energy: ${l.energy}. Pleasantness: ${l.pleasantness}. Note: "${l.note || ''}".`).join("\n")
          : "No general emotion logs recorded.";

        const prompt = `You are Vibe Plan Space Mind & Focus Guide, a warm, professional, and hyper-intelligent cognitive psychologist and productivity expert.
Analyze the user's logged emotions alongside their task completions to find deep correlations between their mood, energy levels, and execution capability.

User's Task Data:
${taskSummary}

User's General Emotion Logs:
${logSummary}

Provide an analysis of their mood and productivity. You must return exactly 3 fields:
1. "summary": A concise overview of their current emotional baseline and overall focus health (2-3 sentences).
2. "productivityCorrelation": A deep insight on how their feelings (e.g. anxiety vs. excitement, low vs. high energy) directly impact their completion rates and focus blocks. Focus on what triggers high performance and what triggers procrastination.
3. "actionableAdvice": 2-3 specific, scientifically-backed, tactical suggestions (like micro-meditations, shifting task priorities, Pomodoro scheduling, or physical movement) to optimize their daily flow based on these emotional patterns.

Format the response strictly as a JSON object with those 3 keys.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: {
                  type: Type.STRING,
                  description: "Summary of the user's current emotional state and mental bandwidth."
                },
                productivityCorrelation: {
                  type: Type.STRING,
                  description: "Correlation between emotional energy/pleasantness and task execution."
                },
                actionableAdvice: {
                  type: Type.STRING,
                  description: "Highly customized actionable advice to improve mood-to-focus transition."
                }
              },
              required: ["summary", "productivityCorrelation", "actionableAdvice"]
            }
          }
        });

        if (response.text) {
          const insights = JSON.parse(response.text.trim());
          return res.json({ insights, source: "gemini" });
        }
      } catch (err) {
        console.error("Gemini emotional-insights error, falling back to simulation:", err);
      }
    }

    // High-fidelity fallback
    const simulatedInsights = {
      summary: "Your emotional baseline shows a high level of dedication mixed with performance anxiety. You actively log emotions before high-impact items, which demonstrates superb self-awareness.",
      productivityCorrelation: "Our records suggest a clear pattern: entering a task with 'Anxious' or 'Stressed' feelings sometimes leads to longer task times or delayed completion. However, once completed, your transition to 'Satisfied' or 'Relieved' marks a massive release of cognitive tension, resetting your focus window.",
      actionableAdvice: "First, when starting a task labeled as 'Anxious' or 'Stressed', apply the 'Rule of 5': commit to just 5 minutes of low-stakes drafting to bypass the friction. Second, schedule a 3-minute green-zone transition (like deep abdominal breathing) to step down your high-energy unpleasant states before entering a new Pomodoro cycle."
    };
    return res.json({ insights: simulatedInsights, source: "simulation" });
  });

  // API Endpoint: Voice-Command Parser
  app.post("/api/ai/voice-command", async (req, res) => {
    const { text } = req.body;
    if (!text || typeof text !== "string" || text.trim() === "") {
      return res.status(400).json({ error: "Text is required" });
    }

    if (ai) {
      try {
        const prompt = `Analyze the user's vocal input: "${text}" and parse their intent.
The app is Vibe Plan Space, a productivity tracker.
Classify the intent into one of four actions:
1. "add_task": The user wants to add a new task (e.g., "add task write homework", "remind me to buy groceries", "new task finish presentation").
2. "get_briefing": The user is asking for a daily summary, briefing, update, or briefing speech (e.g., "give me my briefing", "read today's briefing", "how is my day looking", "briefing").
3. "breakdown": The user wants to break down a larger goal into steps (e.g., "break down finish exam preparation", "autonomous plan for build website").
4. "unknown": If the intent is unclear.

For "add_task", extract:
- title: The name of the task
- urgent: Boolean. True if keywords like "urgent", "last minute", "asap", "due soon", "quick" are present.
- important: Boolean. True if keywords like "important", "crucial", "critical", "major", "grade" are present.
- estimatedMinutes: Integer. Default to 30 if not mentioned.

For "breakdown", extract:
- goal: The target goal string.

Return a JSON object conforming exactly to this structure:
{
  "action": "add_task" | "get_briefing" | "breakdown" | "unknown",
  "taskDetails": { "title": "string", "urgent": true/false, "important": true/false, "estimatedMinutes": 30 },
  "goal": "string",
  "explanation": "A short, user-friendly feedback statement (e.g., 'Adding Urgent task: Finish slides')"
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                action: {
                  type: Type.STRING,
                  enum: ["add_task", "get_briefing", "breakdown", "unknown"]
                },
                taskDetails: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    urgent: { type: Type.BOOLEAN },
                    important: { type: Type.BOOLEAN },
                    estimatedMinutes: { type: Type.INTEGER }
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
          return res.json({ result, source: "gemini" });
        }
      } catch (err) {
        console.error("Gemini voice parsing error, falling back to simulation:", err);
      }
    }

    // High-Fidelity Simulation Fallback for Voice Commands
    const lowerText = text.toLowerCase();
    let result: any = {
      action: "unknown",
      explanation: "I heard you, but couldn't map that to a specific command. Try saying 'give me a briefing' or 'add urgent task finish homework'."
    };

    if (lowerText.includes("briefing") || lowerText.includes("brief") || lowerText.includes("today") || lowerText.includes("how is my day") || lowerText.includes("schedule")) {
      result = {
        action: "get_briefing",
        explanation: "Sure! Let me prepare your daily productivity briefing right now."
      };
    } else if (lowerText.includes("break down") || lowerText.includes("breakdown") || lowerText.includes("plan") || lowerText.includes("decompose")) {
      const goalPart = text.replace(/break down|breakdown|plan|for/gi, "").trim();
      result = {
        action: "breakdown",
        goal: goalPart || "My Complex Goal",
        explanation: `Starting autonomous planning to break down: "${goalPart || "My Complex Goal"}"`
      };
    } else if (lowerText.includes("add") || lowerText.includes("remind") || lowerText.includes("create") || lowerText.includes("task") || lowerText.includes("todo")) {
      // Extract a plausible title
      let cleanedTitle = text.replace(/add task|remind me to|create task|add|remind/gi, "").trim();
      const isUrgent = lowerText.includes("urgent") || lowerText.includes("asap") || lowerText.includes("fast") || lowerText.includes("soon");
      const isImportant = lowerText.includes("important") || lowerText.includes("crucial") || lowerText.includes("critical") || lowerText.includes("major");
      
      cleanedTitle = cleanedTitle.replace(/urgent|important/gi, "").replace(/\s+/g, " ").trim();
      
      result = {
        action: "add_task",
        taskDetails: {
          title: cleanedTitle || "Voice Added Task",
          urgent: isUrgent,
          important: isImportant,
          estimatedMinutes: 30
        },
        explanation: `Added task: "${cleanedTitle || "Voice Added Task"}" (${isUrgent ? 'Urgent' : 'Normal'} & ${isImportant ? 'Important' : 'Standard'}).`
      };
    }

    return res.json({ result, source: "simulation" });
  });

  // Vite Integration for Dev vs. Prod Environments
  if (process.env.NODE_ENV !== "production") {
    app.use((req, res, next) => {
      console.log('Request URL:', req.url);
      next();
    });
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    app.use(async (req, res, next) => {
      try {
        const fs = await import('fs');
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Vibe Plan Space server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
