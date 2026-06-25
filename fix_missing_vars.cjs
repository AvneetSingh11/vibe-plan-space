const fs = require('fs');

let content = fs.readFileSync('./src/App.tsx', 'utf8');

const missingVars = `
  const [emotionState, setEmotionState] = React.useState({ energy: 3, pleasantness: 3, notes: '' });
  const [emotionLogs, setEmotionLogs] = React.useState<{id: string, energy: number, pleasantness: number, notes: string, timestamp: number}[]>([]);
  const [isAnalyzingEmotion, setIsAnalyzingEmotion] = React.useState(false);
  const [emotionInsight, setEmotionInsight] = React.useState<string | null>(null);

  const handleEmotionLog = () => {
    setEmotionLogs([{ ...emotionState, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() }, ...emotionLogs]);
    setEmotionState({ energy: 3, pleasantness: 3, notes: '' });
  };

  const handleAnalyzeEmotions = async () => {
    setIsAnalyzingEmotion(true);
    try {
      const response = await fetch("http://localhost:5000/api/ai/emotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs: emotionLogs })
      });
      const data = await response.json();
      setEmotionInsight(data.insight);
    } catch(e) {
      console.error(e);
      setEmotionInsight("Could not analyze emotions at this time.");
    }
    setIsAnalyzingEmotion(false);
  };

  const [voiceCommandResult, setVoiceCommandResult] = React.useState<string | null>(null);
  const handleVoiceCommand = async (cmdString: string | any) => {
    // If it's an event (from button click without input), just use a test string or ignore
    const cmd = typeof cmdString === 'string' ? cmdString : "analyze my current matrix priorities";
    
    setVoiceCommandResult("Running: " + cmd + "...");
    try {
      const response = await fetch("http://localhost:5000/api/ai/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd, context: { tasks, habits } })
      });
      const data = await response.json();
      setVoiceCommandResult(data.message || data.result || "Command executed successfully.");
    } catch (e) {
      console.error(e);
      setVoiceCommandResult("Could not connect to the Acoustic Parse Portal.");
    }
  };
`;

content = content.replace('  const [voiceSummary, setVoiceSummary] = React.useState<string | null>(null);', missingVars + '\n  const [voiceSummary, setVoiceSummary] = React.useState<string | null>(null);');

fs.writeFileSync('./src/App.tsx', content);
console.log('Added missing variables to App scope.');
