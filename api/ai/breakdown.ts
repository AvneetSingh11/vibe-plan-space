import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { goal } = req.body;
  if (!goal || typeof goal !== "string" || goal.trim() === "") {
    return res.status(400).json({ error: "Goal is required" });
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
}
