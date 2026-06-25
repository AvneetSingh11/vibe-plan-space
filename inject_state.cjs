const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('const [newTaskDate, setNewTaskDate]')) {
  content = content.replace(
    'export default function App() {',
    'export default function App() {\n  const [newTaskDate, setNewTaskDate] = useState<string | undefined>(undefined);'
  );
  fs.writeFileSync('src/App.tsx', content);
  console.log('Injected newTaskDate');
} else {
  console.log('Already exists');
}
