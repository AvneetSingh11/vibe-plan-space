import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { tasks, habits, timeOfDay } = req.body;
  const timePhrase = timeOfDay || "morning";

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
}
