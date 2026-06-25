const fs = require('fs');
let content = fs.readFileSync('./src/App.tsx', 'utf8');

// The duplicate definition is the second occurrence of `const [emotionLogs, setEmotionLogs]`.
// Let's replace the one from my recent script block with nothing or comment it out.
content = content.replace(/const \[emotionLogs, setEmotionLogs\] = React.useState<\{id: string, energy: number, pleasantness: number, notes: string, timestamp: number\}\[\]>\(\[\]\);/g, (match, offset, str) => {
    // Only replace it if it's past the first 150 lines (where the original should be)
    if (offset > 5000) return '';
    return match;
});

fs.writeFileSync('./src/App.tsx', content);
console.log('Removed duplicate emotionLogs declaration.');
