import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { note, emotion } = req.body;
  if (!note || typeof note !== "string" || note.trim() === "") {
    return res.status(400).json({ error: "Note is required" });
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
      console.log(`Analyzing reflective note: "${note}" with emotion: "${emotion}"`);
      const prompt = `You are a clinical psychologist and mindfulness coach. Analyze this self-reflective note written by a user when logging the emotion "${emotion}".
Note: "${note}"

Analyze the text and extract:
1. sentiment: One of "positive", "negative", or "neutral".
2. cognitiveDistortion: The main cognitive distortion or pattern found (e.g., 'Catastrophizing', 'All-or-Nothing', 'Should Statements', 'Emotional Reasoning', 'None - Mindful Self-Awareness', 'None - Positive Reframing', 'None - Self-Compassion').
3. primaryTrigger: The main trigger/domain mentioned (e.g., 'Work/Deadlines', 'Fatigue/Energy', 'Social/Interpersonal', 'General Productivity', 'Personal Well-being', 'Physical Health', 'Unknown/None').
4. copingStrategy: A warm, scientific, highly actionable 1-2 sentence advice or mindfulness coping tip tailored to this specific note.`;

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
                  sentiment: {
                    type: Type.STRING,
                    enum: ["positive", "negative", "neutral"],
                    description: "Overall sentiment of the note."
                  },
                  cognitiveDistortion: {
                    type: Type.STRING,
                    description: "Identified cognitive distortion or mindfulness pattern."
                  },
                  primaryTrigger: {
                    type: Type.STRING,
                    description: "Estimated life trigger domain."
                  },
                  copingStrategy: {
                    type: Type.STRING,
                    description: "1-2 sentence highly customized coping tip or reflection prompt."
                  }
                },
                required: ["sentiment", "cognitiveDistortion", "primaryTrigger", "copingStrategy"]
              }
            },
            required: ["analysis"]
          }
        }
      });

      if (response.text) {
        const analysisResult = JSON.parse(response.text.trim());
        return res.json({ analysis: analysisResult.analysis, source: "gemini" });
      }
    } catch (err) {
      console.error("Gemini note-analysis error, falling back to simulation:", err);
    }
  }

  // High-Fidelity Simulation Fallback for Local/Offline/Simulated mode
  console.log("Analyzing reflective note with high-fidelity simulation.");
  const noteLower = note.toLowerCase();
  
  // Determine trigger
  let trigger = "General Productivity";
  if (noteLower.match(/(deadline|work|task|exam|study|homework|code|class|submit|finish|project)/)) {
    trigger = "Work/Deadlines";
  } else if (noteLower.match(/(tired|sleep|exhausted|lazy|energy|burnout|drained|rest)/)) {
    trigger = "Fatigue/Energy";
  } else if (noteLower.match(/(friend|family|someone|talk|people|relationship|mom|dad|brother|sister|manager|colleague)/)) {
    trigger = "Social/Interpersonal";
  } else if (noteLower.match(/(feel|anxious|sad|happy|peace|mindful|calm)/)) {
    trigger = "Personal Well-being";
  }

  // Determine cognitive distortion / reflection pattern
  let distortion = "None - Mindful Self-Awareness";
  let coping = "Your reflective mindfulness is fantastic. Acknowledging your current state is the first step to active cognitive control.";

  if (noteLower.match(/(never|always|can't|cannot|impossible|worst)/)) {
    distortion = "All-or-Nothing / Overgeneralization";
    coping = "Try to soften absolute terms. Change 'I can never' to 'This is a temporary challenge that I can take step-by-step.'";
  } else if (noteLower.match(/(fail|ruin|disaster|terrible|horrible|doomed)/)) {
    distortion = "Catastrophizing";
    coping = "Catastrophizing magnifies anxiety. Ask yourself: what is the single, most manageable next action you can take right now?";
  } else if (noteLower.match(/(should|must|ought)/)) {
    distortion = "Should Statements";
    coping = "Be gentle with your expectations. Replace shoulds with permission: 'It is okay to work at a sustainable pace.'";
  } else if (noteLower.match(/(good|great|happy|excited|ready|positive|glad|accomplish|done)/)) {
    distortion = "None - Positive Reframing";
    coping = "Savor this positive emotional win! Take a 10-second mental snapshot of this satisfaction to encode it in your long-term memory.";
  }

  // Customize coping tip further by trigger
  if (trigger === "Fatigue/Energy" && distortion === "None - Mindful Self-Awareness") {
    coping = "Honor your body battery. Rest is not a reward for work; it is a requirement for focus. Take a 10-minute offline breather.";
  }

  const simulatedAnalysis = {
    sentiment: noteLower.match(/(good|great|happy|excited|peace|calm|relaxed|love|accomplish|easy)/) ? "positive" : (noteLower.match(/(stress|anxious|fail|hard|bad|worst|scared|sad|angry|hate|ruin)/) ? "negative" : "neutral"),
    cognitiveDistortion: distortion,
    primaryTrigger: trigger,
    copingStrategy: coping
  };

  return res.json({ analysis: simulatedAnalysis, source: "simulation" });
}
