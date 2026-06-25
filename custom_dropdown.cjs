const fs = require('fs');

let content = fs.readFileSync('./src/components/HowWeFeelHub.tsx', 'utf8');

// Add ChevronDown to imports
content = content.replace(
  'ChevronRight,',
  'ChevronRight,\n  ChevronDown,'
);

// Add CustomSelect component definition before HowWeFeelHub
const customSelectCode = `
const CustomSelect = ({ value, onChange, options, placeholder, className = "" }: { value: string, onChange: (val: string) => void, options: {value: string, label: string}[], placeholder: string, className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value);

  return (
    <div className={\`relative \${className}\`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-[10px] sm:text-xs rounded-xl text-left flex items-center justify-between bg-slate-950/60 border border-slate-800 hover:border-purple-500/50 transition-colors cursor-pointer text-slate-200"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                className="w-full text-left px-3 py-2 text-[10px] sm:text-xs text-slate-200 hover:bg-purple-600/20 hover:text-purple-300 transition-colors first:rounded-t-xl last:rounded-b-xl truncate"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export const HowWeFeelHub`;

content = content.replace('export const HowWeFeelHub', customSelectCode);

// Replace associatedTaskId select
const associatedTaskSelectRegex = /<select[\s\S]*?value=\{associatedTaskId\}[\s\S]*?onChange=\{\(e\) => setAssociatedTaskId\(e\.target\.value\)\}[\s\S]*?className="[^"]*"[\s\S]*?>[\s\S]*?<option value="">No specific task \(general log\)<\/option>[\s\S]*?\{tasks\.map\(t => \([\s\S]*?<option key=\{t\.id\} value=\{t\.id\}>[\s\S]*?\{t\.completed \? "✓" : "⏰"\} \{t\.title\}[\s\S]*?<\/option>[\s\S]*?\)\}[\s\S]*?<\/select>/;

const associatedTaskCustomSelect = `<CustomSelect
                    value={associatedTaskId}
                    onChange={setAssociatedTaskId}
                    placeholder="No specific task (general log)"
                    options={[
                      { value: "", label: "No specific task (general log)" },
                      ...tasks.map(t => ({ value: t.id, label: \`\${t.completed ? "✓" : "⏰"} \${t.title}\` }))
                    ]}
                  />`;

content = content.replace(associatedTaskSelectRegex, associatedTaskCustomSelect);

// Replace taskBeforeEmotion select
const taskBeforeRegex = /<select[\s\S]*?value=\{taskBeforeEmotion\}[\s\S]*?onChange=\{\(e\) => setTaskBeforeEmotion\(e\.target\.value\)\}[\s\S]*?className="[^"]*"[\s\S]*?>[\s\S]*?<option value="">Choose...<\/option>[\s\S]*?<option value="Anxious">😰 Anxious<\/option>[\s\S]*?<option value="Focused">🧠 Focused<\/option>[\s\S]*?<option value="Stressed">🤯 Stressed<\/option>[\s\S]*?<option value="Calm">🧘 Calm<\/option>[\s\S]*?<option value="Tired">🥱 Tired<\/option>[\s\S]*?<option value="Excited">⚡ Excited<\/option>[\s\S]*?<\/select>/;

const taskBeforeCustomSelect = `<CustomSelect
                              value={taskBeforeEmotion}
                              onChange={setTaskBeforeEmotion}
                              placeholder="Choose..."
                              options={[
                                { value: "Anxious", label: "😰 Anxious" },
                                { value: "Focused", label: "🧠 Focused" },
                                { value: "Stressed", label: "🤯 Stressed" },
                                { value: "Calm", label: "🧘 Calm" },
                                { value: "Tired", label: "🥱 Tired" },
                                { value: "Excited", label: "⚡ Excited" }
                              ]}
                              className="w-[110px]"
                            />`;

content = content.replace(taskBeforeRegex, taskBeforeCustomSelect);


// Replace taskAfterEmotion select
const taskAfterRegex = /<select[\s\S]*?value=\{taskAfterEmotion\}[\s\S]*?onChange=\{\(e\) => setTaskAfterEmotion\(e\.target\.value\)\}[\s\S]*?className="[^"]*"[\s\S]*?>[\s\S]*?<option value="">Choose...<\/option>[\s\S]*?<option value="Satisfied">💚 Satisfied<\/option>[\s\S]*?<option value="Relieved">😌 Relieved<\/option>[\s\S]*?<option value="Tired">🥱 Tired<\/option>[\s\S]*?<option value="Calm">🧘 Calm<\/option>[\s\S]*?<option value="Excited">⚡ Excited<\/option>[\s\S]*?<option value="Disappointed">🥺 Disappointed<\/option>[\s\S]*?<\/select>/;

const taskAfterCustomSelect = `<CustomSelect
                                value={taskAfterEmotion}
                                onChange={setTaskAfterEmotion}
                                placeholder="Choose..."
                                options={[
                                  { value: "Satisfied", label: "💚 Satisfied" },
                                  { value: "Relieved", label: "😌 Relieved" },
                                  { value: "Tired", label: "🥱 Tired" },
                                  { value: "Calm", label: "🧘 Calm" },
                                  { value: "Excited", label: "⚡ Excited" },
                                  { value: "Disappointed", label: "🥺 Disappointed" }
                                ]}
                                className="w-[110px]"
                              />`;

content = content.replace(taskAfterRegex, taskAfterCustomSelect);

fs.writeFileSync('./src/components/HowWeFeelHub.tsx', content);
console.log('Custom dropdown successfully implemented!');
