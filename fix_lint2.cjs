const fs = require('fs');

let content = fs.readFileSync('./src/App.tsx', 'utf8');

// Fix generateUniqueId
content = content.replace('const generateUniqueId = () => Math.random().toString(36).substr(2, 9);', 
                          'const generateUniqueId = (prefix?: string) => Math.random().toString(36).substr(2, 9);');

// Fix ContextNotification timestamp
content = content.replace('timestamp: number;', 'timestamp: number | string;');

fs.writeFileSync('./src/App.tsx', content);
console.log('Lint fixes round 2 applied');
