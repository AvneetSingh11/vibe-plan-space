import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { tasks, emotionLogs } = req.body;

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
      const taskSummary = tasks && tasks.length > 0
        ? tasks.map((t: any) => `- Task: "${t.title}". Completed: ${t.completed ? 'Yes' : 'No'}. Emotion Before: ${t.emotionBefore || 'None'}. Emotion After: ${t.emotionAfter || 'None'}.`).join("\n")
        : "No specific tasks logged with emotions.";

      const logSummary = emotionLogs && emotionLogs.length > 0
        ? emotionLogs.map((l: any) => {
            let entry = `- Logged: ${l.emotion} (${l.emoji}). Stage: ${l.stage}. Energy: ${l.energy}. Pleasantness: ${l.pleasantness}. Note: "${l.note || ''}".`;
            if (l.analysis) {
              entry += ` AI Note Analysis -> Sentiment: ${l.analysis.sentiment}, Trigger: ${l.analysis.primaryTrigger}, Pattern: ${l.analysis.cognitiveDistortion}.`;
            }
            return entry;
          }).join("\n")
        : "No general emotion logs recorded.";

      const prompt = `You are Vibe Plan Space Mind & Focus Guide, a warm, professional, and hyper-intelligent cognitive psychologist and productivity expert.
Analyze the user's logged emotions, their self-reflective notes (including triggers and patterns extracted from them), alongside their task completions to find deep correlations between their mood, energy levels, and execution capability.

User's Task Data:
${taskSummary}

User's General Emotion Logs (with reflective notes & AI extracted themes):
${logSummary}

Provide an analysis of their mood and productivity. You must return exactly 3 fields:
1. "summary": A concise overview of their current emotional baseline, primary triggers, and overall focus health (2-3 sentences).
2. "productivityCorrelation": A deep insight on how their feelings (e.g. anxiety vs. excitement, low vs. high energy) and their mental habits (like specific cognitive distortions) directly impact their completion rates and focus blocks. Focus on what triggers high performance and what triggers procrastination.
3. "actionableAdvice": 2-3 specific, scientifically-backed, tactical suggestions (like cognitive reframing, micro-meditations, shifting task priorities, Pomodoro scheduling, or physical movement) to optimize their daily flow based on these emotional patterns.

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
    summary: "Your emotional baseline shows a high level of dedication mixed with performance anxiety. Your self-reflective notes reveal recurring triggers around deadlines and work commitments.",
    productivityCorrelation: "Our records suggest a clear pattern: entering a task with 'Anxious' or 'Stressed' feelings sometimes leads to longer task times. However, when you actively reframe your thoughts in your self-reflective notes, it marks a massive release of cognitive tension, resetting your focus window.",
    actionableAdvice: "First, when starting a task labeled as 'Anxious' or 'Stressed', apply the 'Rule of 5': commit to just 5 minutes of low-stakes drafting to bypass the friction. Second, schedule a 3-minute green-zone transition (like deep abdominal breathing) to step down your high-energy unpleasant states before entering a new Pomodoro cycle."
  };
  return res.json({ insights: simulatedInsights, source: "simulation" });
}
