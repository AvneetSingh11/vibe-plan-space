const fs = require('fs');

let appContent = fs.readFileSync('./src/App.tsx', 'utf8');

// A. Import IntegrationsHub
const importVoice = `import VoiceAssistant from "./components/VoiceAssistant";`;
const importIntegrations = `import VoiceAssistant from "./components/VoiceAssistant";\nimport IntegrationsHub from "./components/IntegrationsHub";`;

if (!appContent.includes("import IntegrationsHub")) {
  appContent = appContent.replace(importVoice, importIntegrations);
}

// B. Render IntegrationsHub
const voiceTabEnd = `    {/* Voice Tab */}
    {activeTab === "command" && (
      <VoiceAssistant
        onAddTask={addTask}
        onTriggerBriefing={handleTriggerBriefing}
        onSetBreakdownGoal={setBreakdownGoal}
        onAddNotification={addNotification}
      />
    )}`;

const integrationsTabRender = `    {/* Voice Tab */}
    {activeTab === "command" && (
      <VoiceAssistant
        onAddTask={addTask}
        onTriggerBriefing={handleTriggerBriefing}
        onSetBreakdownGoal={setBreakdownGoal}
        onAddNotification={addNotification}
      />
    )}

    {/* Integrations Tab */}
    {activeTab === "integrations" && (
      <IntegrationsHub
        onAddTasks={(newTasks) => {
          const formattedTasks = newTasks.map(t => ({
            id: Math.random().toString(36).substr(2, 9),
            title: t.title || "Imported Task",
            urgent: t.urgent || false,
            important: t.important || false,
            completed: false,
            quadrant: t.urgent && t.important ? "Q1" : !t.urgent && t.important ? "Q2" : t.urgent && !t.important ? "Q3" : "Q4",
            estimatedMinutes: t.estimatedMinutes || 30,
            deadline: t.deadline,
            createdAt: new Date().toISOString()
          }));
          setTasks([...formattedTasks, ...tasks]);
          addNotification({
            id: Math.random().toString(36).substr(2, 9),
            title: "Sync Complete",
            message: \`Successfully imported \${formattedTasks.length} tasks from your connected accounts.\`,
            timestamp: new Date().toISOString(),
            type: "success",
            read: false
          });
        }}
      />
    )}`;

if (!appContent.includes("<IntegrationsHub")) {
  appContent = appContent.replace(voiceTabEnd, integrationsTabRender);
}

fs.writeFileSync('./src/App.tsx', appContent);
console.log('Successfully injected IntegrationsHub!');
