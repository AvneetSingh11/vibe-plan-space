const fs = require('fs');

let content = fs.readFileSync('./src/App.tsx', 'utf8');

// 1. Change focusSelectedPreset type
content = content.replace(
  'const [focusSelectedPreset, setFocusSelectedPreset] = React.useState<15 | 25 | 45>(25);',
  `const [focusSelectedPreset, setFocusSelectedPreset] = React.useState<number>(25);
  const [showCustomTimer, setShowCustomTimer] = React.useState(false);`
);

// 2. Replace the timer buttons block
const oldButtons = `{([15, 25, 45] as const).map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      setFocusSelectedPreset(mins);
                      setFocusTimeLeft(mins * 60);
                      setFocusTimerActive(false);
                    }}
                    className={\`px-3 py-1.5 rounded-lg transition-all border-none shadow-inner \${
                      focusSelectedPreset === mins 
                        ? "bg-primary shadow-[0_0_10px_rgba(255,255,255,0.1)] border border-none text-pink-300"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface"
                    }\`}
                  >
                    {mins}m
                  </button>
                ))}`;

const newButtons = `{([15, 30, 45] as const).map((mins) => (
                  <button
                    key={mins}
                    onClick={() => {
                      setFocusSelectedPreset(mins);
                      setFocusTimeLeft(mins * 60);
                      setFocusTimerActive(false);
                      setShowCustomTimer(false);
                    }}
                    className={\`px-3 py-1.5 rounded-lg transition-all border-none shadow-inner \${
                      focusSelectedPreset === mins && !showCustomTimer
                        ? "bg-primary shadow-[0_0_10px_rgba(255,255,255,0.1)] border border-none text-pink-300"
                        : "text-muted-foreground hover:text-foreground hover:bg-surface"
                    }\`}
                  >
                    {mins}m
                  </button>
                ))}
                
                {/* Custom Button */}
                {!showCustomTimer ? (
                  <button
                    onClick={() => setShowCustomTimer(true)}
                    className={\`px-3 py-1.5 rounded-lg transition-all border-none shadow-inner text-muted-foreground hover:text-foreground hover:bg-surface\`}
                  >
                    Custom
                  </button>
                ) : (
                  <div className="flex items-center bg-surface px-2 py-1 rounded-lg">
                    <input 
                      type="number" 
                      min="1"
                      max="999"
                      placeholder="min"
                      className="w-12 bg-transparent text-foreground text-center focus:outline-none placeholder:text-muted-foreground/50"
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val > 0) {
                          setFocusSelectedPreset(val);
                          setFocusTimeLeft(val * 60);
                          setFocusTimerActive(false);
                        }
                      }}
                      autoFocus
                    />
                    <span className="text-muted-foreground ml-1">m</span>
                  </div>
                )}`;

content = content.replace(oldButtons, newButtons);

fs.writeFileSync('./src/App.tsx', content);
console.log('Successfully added custom timer logic!');
