const fs = require('fs');
let appContent = fs.readFileSync('./src/App.tsx', 'utf8');

// Fix TabType in useState
appContent = appContent.replace(
  `const [activeTab, setActiveTab] = useState<"dashboard" | "matrix" | "habits" | "mind" | "command">("dashboard");`,
  `const [activeTab, setActiveTab] = useState<"dashboard" | "matrix" | "habits" | "mind" | "command" | "integrations">("dashboard");`
);

// Fix TabType in navItems
appContent = appContent.replace(
  `const navItems: { id: "dashboard" | "matrix" | "habits" | "mind" | "command"; label: string }[] = [`,
  `const navItems: { id: "dashboard" | "matrix" | "habits" | "mind" | "command" | "integrations"; label: string }[] = [`
);

// Fix addNotification call in IntegrationsHub injection
const oldCall = `addNotification({
            id: Math.random().toString(36).substr(2, 9),
            title: "Sync Complete",
            message: \`Successfully imported \${formattedTasks.length} tasks from your connected accounts.\`,
            timestamp: new Date().toISOString(),
            type: "success",
            read: false
          });`;

const newCall = `addNotification("Sync Complete", \`Successfully imported \${formattedTasks.length} tasks from your connected accounts.\`, "success");`;

appContent = appContent.replace(oldCall, newCall);

fs.writeFileSync('./src/App.tsx', appContent);
console.log('Fixed TS errors in App.tsx');
