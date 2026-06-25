const fs = require('fs');

let content = fs.readFileSync('./src/App.tsx', 'utf8');

content = content.replace(/handleSynthesizeBriefing/g, 'handleVoiceSummary');
content = content.replace(/isSynthesizing/g, 'isVoiceLoading');
content = content.replace(/aiSummary/g, 'voiceSummary');
content = content.replace(/toggleTaskCompletion\((.*?)\)/g, 'setTasks(tasks.map(t => t.id === $1 ? { ...t, completed: !t.completed } : t))');

const breakdownLogic = `  const [isDecomposing, setIsDecomposing] = React.useState(false);
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

content = content.replace('const [isVoiceLoading, setIsVoiceLoading] = React.useState(false);', breakdownLogic + '\n  const [isVoiceLoading, setIsVoiceLoading] = React.useState(false);');

fs.writeFileSync('./src/App.tsx', content);
console.log('Fixed dashboard variables.');
