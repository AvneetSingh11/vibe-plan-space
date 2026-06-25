const fs = require('fs');

let content = fs.readFileSync('./src/App.tsx', 'utf8');

const varsToAdd = `
  const [isVoiceLoading, setIsVoiceLoading] = React.useState(false);
  const [voiceSummary, setVoiceSummary] = React.useState<string | null>(null);

  const handleVoiceSummary = async () => {
    setIsVoiceLoading(true);
    setVoiceSummary(null);
    try {
      const response = await fetch("http://localhost:5000/api/ai/briefing");
      const data = await response.json();
      setVoiceSummary(data.summary);
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(data.summary);
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.error(e);
      setVoiceSummary("Could not load AI briefing at this time.");
    }
    setIsVoiceLoading(false);
  };

  const [isDecomposing, setIsDecomposing] = React.useState(false);
  const handleAutonomousBreakdown = async (title: string) => {
    setIsDecomposing(true);
    try {
      const response = await fetch("http://localhost:5000/api/ai/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskTitle: title })
      });
      const data = await response.json();
      if (data.subtasks) {
        setTasks(prev => {
          const newTasks = data.subtasks.map((st: string) => ({
            id: Math.random().toString(36).substr(2, 9),
            title: st,
            quadrant: "Q2",
            completed: false,
            timeEstimate: 15
          }));
          return [...newTasks, ...prev];
        });
      }
    } catch (e) {
      console.error(e);
    }
    setIsDecomposing(false);
  };
`;

content = content.replace('  const [activeTab, setActiveTab]', varsToAdd + '\n  const [activeTab, setActiveTab]');

fs.writeFileSync('./src/App.tsx', content);
console.log('Variables moved to App component scope.');
