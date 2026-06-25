const fs = require('fs');

// 1. UPDATE EmotionBlock.tsx
let blockContent = fs.readFileSync('./src/components/EmotionBlock.tsx', 'utf8');

// Update EmotionType union
blockContent = blockContent.replace(
  /\| "Motivated"/g,
  '| "Motivated"\n  | "Euphoric"\n  | "Empowered"\n  | "Confident"'
);
blockContent = blockContent.replace(
  /\| "Jittery"/g,
  '| "Jittery"\n  | "Furious"\n  | "Restless"\n  | "Defensive"'
);
blockContent = blockContent.replace(
  /\| "Thoughtful"/g,
  '| "Thoughtful"\n  | "Cozy"\n  | "Mellow"\n  | "Reflective"'
);
blockContent = blockContent.replace(
  /\| "Apathetic";/g,
  '| "Apathetic"\n  | "Numb"\n  | "Drained"\n  | "Hopeless";'
);

// Update EMOTION_BLOCK_MAP
const newBlocks = `
  Euphoric: { colors: "from-yellow-400 via-amber-500 to-rose-500", shape: "circle", borderColors: "", rotation: "", animationClass: "" },
  Empowered: { colors: "from-amber-500 via-orange-600 to-red-600", shape: "circle", borderColors: "", rotation: "", animationClass: "" },
  Confident: { colors: "from-orange-400 via-rose-400 to-purple-500", shape: "circle", borderColors: "", rotation: "", animationClass: "" },

  Furious: { colors: "from-red-700 via-red-800 to-black", shape: "circle", borderColors: "", rotation: "", animationClass: "" },
  Restless: { colors: "from-rose-500 via-orange-500 to-amber-600", shape: "circle", borderColors: "", rotation: "", animationClass: "" },
  Defensive: { colors: "from-slate-700 via-red-900 to-rose-900", shape: "circle", borderColors: "", rotation: "", animationClass: "" },

  Cozy: { colors: "from-amber-200 via-orange-300 to-rose-300", shape: "circle", borderColors: "", rotation: "", animationClass: "" },
  Mellow: { colors: "from-teal-200 via-emerald-300 to-green-400", shape: "circle", borderColors: "", rotation: "", animationClass: "" },
  Reflective: { colors: "from-indigo-300 via-purple-400 to-sky-400", shape: "circle", borderColors: "", rotation: "", animationClass: "" },

  Numb: { colors: "from-slate-400 via-slate-500 to-slate-600", shape: "circle", borderColors: "", rotation: "", animationClass: "" },
  Drained: { colors: "from-zinc-600 via-slate-700 to-slate-800", shape: "circle", borderColors: "", rotation: "", animationClass: "" },
  Hopeless: { colors: "from-blue-900 via-slate-900 to-black", shape: "circle", borderColors: "", rotation: "", animationClass: "" },
`;

blockContent = blockContent.replace('// High Energy, Pleasant (Yellows / Oranges / Violets)', '// High Energy, Pleasant (Yellows / Oranges / Violets)' + newBlocks);

fs.writeFileSync('./src/components/EmotionBlock.tsx', blockContent);


// 2. UPDATE HowWeFeelHub.tsx
let hubContent = fs.readFileSync('./src/components/HowWeFeelHub.tsx', 'utf8');

const newTemplatesHighPleasant = `
  { emotion: "Euphoric", emoji: "🤩", energy: "high", pleasantness: "pleasant", color: "from-yellow-400 to-rose-500", glow: "glow-purple" },
  { emotion: "Empowered", emoji: "🦸", energy: "high", pleasantness: "pleasant", color: "from-amber-500 to-red-600", glow: "glow-purple" },
  { emotion: "Confident", emoji: "😎", energy: "high", pleasantness: "pleasant", color: "from-orange-400 to-purple-500", glow: "glow-purple" },
`;

const newTemplatesHighUnpleasant = `
  { emotion: "Furious", emoji: "🤬", energy: "high", pleasantness: "unpleasant", color: "from-red-700 to-black", glow: "glow-cyan" },
  { emotion: "Restless", emoji: "😬", energy: "high", pleasantness: "unpleasant", color: "from-rose-500 to-amber-600", glow: "glow-cyan" },
  { emotion: "Defensive", emoji: "🛡️", energy: "high", pleasantness: "unpleasant", color: "from-slate-700 to-rose-900", glow: "glow-cyan" },
`;

const newTemplatesLowPleasant = `
  { emotion: "Cozy", emoji: "🍵", energy: "low", pleasantness: "pleasant", color: "from-amber-200 to-rose-300", glow: "glow-green" },
  { emotion: "Mellow", emoji: "🪴", energy: "low", pleasantness: "pleasant", color: "from-teal-200 to-green-400", glow: "glow-green" },
  { emotion: "Reflective", emoji: "🪞", energy: "low", pleasantness: "pleasant", color: "from-indigo-300 to-sky-400", glow: "glow-green" },
`;

const newTemplatesLowUnpleasant = `
  { emotion: "Numb", emoji: "🧊", energy: "low", pleasantness: "unpleasant", color: "from-slate-400 to-slate-600", glow: "" },
  { emotion: "Drained", emoji: "🪫", energy: "low", pleasantness: "unpleasant", color: "from-zinc-600 to-slate-800", glow: "" },
  { emotion: "Hopeless", emoji: "🌌", energy: "low", pleasantness: "unpleasant", color: "from-blue-900 to-black", glow: "" },
`;

hubContent = hubContent.replace(
  '{ emotion: "Motivated", emoji: "🎯", energy: "high", pleasantness: "pleasant", color: "from-amber-400 to-rose-500", glow: "glow-purple" },',
  '{ emotion: "Motivated", emoji: "🎯", energy: "high", pleasantness: "pleasant", color: "from-amber-400 to-rose-500", glow: "glow-purple" },' + newTemplatesHighPleasant
);

hubContent = hubContent.replace(
  '{ emotion: "Jittery", emoji: "🫨", energy: "high", pleasantness: "unpleasant", color: "from-yellow-600 to-red-700", glow: "glow-cyan" },',
  '{ emotion: "Jittery", emoji: "🫨", energy: "high", pleasantness: "unpleasant", color: "from-yellow-600 to-red-700", glow: "glow-cyan" },' + newTemplatesHighUnpleasant
);

hubContent = hubContent.replace(
  '{ emotion: "Thoughtful", emoji: "💬", energy: "low", pleasantness: "pleasant", color: "from-indigo-400 to-teal-400", glow: "glow-green" },',
  '{ emotion: "Thoughtful", emoji: "💬", energy: "low", pleasantness: "pleasant", color: "from-indigo-400 to-teal-400", glow: "glow-green" },' + newTemplatesLowPleasant
);

hubContent = hubContent.replace(
  '{ emotion: "Apathetic", emoji: "💨", energy: "low", pleasantness: "unpleasant", color: "from-zinc-500 to-zinc-700", glow: "" },',
  '{ emotion: "Apathetic", emoji: "💨", energy: "low", pleasantness: "unpleasant", color: "from-zinc-500 to-zinc-700", glow: "" },' + newTemplatesLowUnpleasant
);

fs.writeFileSync('./src/components/HowWeFeelHub.tsx', hubContent);

console.log("Emotions added successfully!");
