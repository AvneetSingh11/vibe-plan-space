import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { text } = req.body;
  if (!text || typeof text !== "string" || text.trim() === "") {
    return res.status(400).json({ error: "Text is required" });
  }

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
    } catch (err) {
      console.error("Failed to initialize Gemini API client:", err);
    }
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
- title: The name of the task, stripped of action words like "add a task to" or "remind me to".
- urgent: Boolean. True if keywords like "urgent", "last minute", "asap", "due soon", "quick" are present.
- important: Boolean. True if keywords like "important", "crucial", "critical", "major", "grade" are present.
- estimatedMinutes: Integer. Default to 30 if not mentioned.
- deadline: String in YYYY-MM-DD format if a date like 'tomorrow' or 'next week' is mentioned.

For "breakdown", extract:
- goal: The target goal string.

Return a JSON object conforming exactly to this structure:
{
  "action": "add_task" | "get_briefing" | "breakdown" | "unknown",
  "taskDetails": { "title": "string", "urgent": true/false, "important": true/false, "estimatedMinutes": 30, "deadline": "YYYY-MM-DD" },
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
                  estimatedMinutes: { type: Type.INTEGER },
                  deadline: { type: Type.STRING }
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
    let cleanedTitle = text.replace(/add a task of completing|add a task of|add a task to|add task|add a task|remind me to|create task|add|remind/gi, "").trim();
    const isUrgent = lowerText.includes("urgent") || lowerText.includes("asap") || lowerText.includes("fast") || lowerText.includes("soon");
    const isImportant = lowerText.includes("important") || lowerText.includes("crucial") || lowerText.includes("critical") || lowerText.includes("major");
    
    let deadline: string | undefined = undefined;
    if (lowerText.includes("tomorrow")) {
        const tmrw = new Date();
        tmrw.setDate(tmrw.getDate() + 1);
        deadline = tmrw.toISOString().split("T")[0];
        cleanedTitle = cleanedTitle.replace(/till tomorrow|by tomorrow|tomorrow/gi, "").trim();
    } else if (lowerText.includes("today")) {
        deadline = new Date().toISOString().split("T")[0];
        cleanedTitle = cleanedTitle.replace(/for today|by today|today/gi, "").trim();
    }

    cleanedTitle = cleanedTitle.replace(/urgent|important/gi, "").replace(/\s+/g, " ").trim();
    
    result = {
      action: "add_task",
      taskDetails: {
        title: cleanedTitle || "Voice Added Task",
        urgent: isUrgent,
        important: isImportant,
        estimatedMinutes: 30,
        deadline: deadline
      },
      explanation: `Task added: ${cleanedTitle || "Voice Added Task"}`
    };
  }

  return res.json({ result, source: "simulation" });
}
