const fs = require('fs');
let content = fs.readFileSync('./src/App.tsx', 'utf8');

const badDeclaration = "  const [emotionLogs, setEmotionLogs] = React.useState<{id: string, energy: number, pleasantness: number, notes: string, timestamp: number}[]>([]);";

content = content.replace(badDeclaration, '');

fs.writeFileSync('./src/App.tsx', content);
console.log('Fixed duplicate!');
