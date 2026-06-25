const fs = require('fs');

let content = fs.readFileSync('./src/components/EmotionBlock.tsx', 'utf8');

const replacement = `export const EmotionBlock: React.FC<EmotionBlockProps> = ({
  emotion,
  size = "md",
  className = "",
  animate = true,
}) => {
  const normalizedEmotion = emotion ? emotion.trim() : "";
  const def = EMOTION_BLOCK_MAP[normalizedEmotion] || DEFAULT_BLOCK;

  // Map abstract sizes
  const sizeClasses = {
    xs: "w-4 h-4",
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      title={normalizedEmotion}
      className={\`relative select-none shrink-0 rounded-md shadow-sm bg-gradient-to-br \${def.colors} \${currentSizeClass} \${
        animate ? "hover:scale-110 transition-transform duration-300" : ""
      } \${className}\`}
    />
  );
};
`;

const startIndex = content.indexOf('export const EmotionBlock: React.FC<EmotionBlockProps> =');
if (startIndex !== -1) {
  content = content.substring(0, startIndex) + replacement;
  fs.writeFileSync('./src/components/EmotionBlock.tsx', content);
  console.log('Successfully updated EmotionBlock component!');
} else {
  console.error('Could not find EmotionBlock definition.');
}
