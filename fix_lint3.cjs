const fs = require('fs');

let content = fs.readFileSync('./src/App.tsx', 'utf8');

content = content.replace('type: "success" | "suggestion" | "alert";', 'type: "success" | "suggestion" | "alert";\n  read?: boolean;');

fs.writeFileSync('./src/App.tsx', content);
console.log('Lint fixes round 3 applied');
