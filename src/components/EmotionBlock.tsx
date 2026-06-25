import React from "react";

export type EmotionType =
  | "Excited" | "Focused" | "Happy" | "Proud" | "Energetic" | "Inspired" | "Playful" | "Motivated" | "Euphoric" | "Empowered" | "Confident"
  | "Anxious" | "Stressed" | "Frustrated" | "Angry" | "Overwhelmed" | "Panicked" | "Irritated" | "Jittery" | "Furious" | "Restless" | "Defensive" | "Tense"
  | "Calm" | "Relaxed" | "Peaceful" | "Grateful" | "Satisfied" | "Serene" | "Content" | "Thoughtful" | "Cozy" | "Mellow" | "Reflective" | "Valued" | "Sympathetic" | "Chill" | "Comfortable"
  | "Tired" | "Bored" | "Sad" | "Lonely" | "Disappointed" | "Exhausted" | "Gloomy" | "Apathetic" | "Numb" | "Drained" | "Hopeless" | "Insecure" | "Fatigued" | "Disengaged";

interface EmotionBlockProps {
  emotion: string | EmotionType;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  animate?: boolean;
}

interface BlockDefinition {
  colors: string;
}

export const EMOTION_BLOCK_MAP: Record<string, BlockDefinition> = {
  // Yellows / Oranges
  Happy: { colors: "from-yellow-300 via-amber-400 to-amber-500" },
  Upbeat: { colors: "from-yellow-300 via-amber-400 to-amber-500" },
  Excited: { colors: "from-amber-400 via-orange-400 to-red-500" },
  Focused: { colors: "from-purple-500 via-indigo-500 to-cyan-500" },
  Proud: { colors: "from-orange-400 via-pink-500 to-purple-600" },
  Energetic: { colors: "from-red-500 via-orange-500 to-yellow-500" },
  Inspired: { colors: "from-purple-400 via-pink-400 to-amber-300" },
  Playful: { colors: "from-pink-400 via-orange-400 to-yellow-400" },
  Motivated: { colors: "from-amber-400 via-orange-500 to-rose-500" },
  Euphoric: { colors: "from-yellow-400 via-amber-500 to-rose-500" },
  Empowered: { colors: "from-amber-500 via-orange-600 to-red-600" },
  Confident: { colors: "from-orange-400 via-rose-400 to-purple-500" },

  // Greens / Teals
  Valued: { colors: "from-emerald-400 via-green-400 to-teal-400" },
  Peaceful: { colors: "from-emerald-400 via-green-400 to-teal-400" },
  Calm: { colors: "from-emerald-400 via-teal-500 to-sky-500" },
  Relaxed: { colors: "from-teal-300 via-cyan-400 to-emerald-400" },
  Grateful: { colors: "from-green-400 via-emerald-400 to-yellow-300" },
  Satisfied: { colors: "from-emerald-500 via-teal-600 to-cyan-600" },
  Serene: { colors: "from-sky-300 via-cyan-300 to-teal-400" },
  Content: { colors: "from-teal-400 via-emerald-400 to-lime-300" },
  Thoughtful: { colors: "from-indigo-400 via-sky-400 to-teal-400" },
  Cozy: { colors: "from-amber-200 via-orange-300 to-rose-300" },
  Mellow: { colors: "from-teal-200 via-emerald-300 to-green-400" },
  Reflective: { colors: "from-indigo-300 via-purple-400 to-sky-400" },
  Sympathetic: { colors: "from-emerald-300 via-teal-400 to-cyan-400" },
  Chill: { colors: "from-emerald-300 via-teal-400 to-cyan-400" },
  Comfortable: { colors: "from-emerald-300 via-teal-400 to-cyan-400" },

  // Reds / Pinks
  Tense: { colors: "from-red-500 via-rose-500 to-pink-500" },
  Anxious: { colors: "from-rose-400 via-pink-500 to-red-500" },
  Stressed: { colors: "from-red-600 via-rose-500 to-orange-600" },
  Frustrated: { colors: "from-orange-600 via-red-500 to-rose-600" },
  Angry: { colors: "from-red-700 via-rose-600 to-slate-900" },
  Overwhelmed: { colors: "from-violet-600 via-pink-500 to-indigo-700" },
  Panicked: { colors: "from-red-500 via-pink-600 to-purple-800" },
  Irritated: { colors: "from-orange-500 via-red-500 to-slate-800" },
  Jittery: { colors: "from-yellow-600 via-orange-600 to-red-700" },
  Furious: { colors: "from-red-700 via-red-800 to-black" },
  Restless: { colors: "from-rose-500 via-orange-500 to-amber-600" },
  Defensive: { colors: "from-slate-700 via-red-900 to-rose-900" },

  // Blues / Slates
  Insecure: { colors: "from-blue-400 via-indigo-500 to-blue-600" },
  Lonely: { colors: "from-blue-500 via-indigo-400 to-blue-400" },
  Tired: { colors: "from-indigo-500 via-blue-500 to-slate-600" },
  Bored: { colors: "from-slate-500 via-indigo-400 to-slate-700" },
  Sad: { colors: "from-blue-600 via-indigo-600 to-slate-800" },
  Disappointed: { colors: "from-slate-400 via-blue-500 to-slate-600" },
  Exhausted: { colors: "from-slate-700 via-slate-800 to-black" },
  Gloomy: { colors: "from-blue-800 via-indigo-900 to-slate-900" },
  Apathetic: { colors: "from-cyan-400 via-blue-400 to-sky-400" },
  Numb: { colors: "from-slate-400 via-slate-500 to-slate-600" },
  Drained: { colors: "from-zinc-600 via-slate-700 to-slate-800" },
  Hopeless: { colors: "from-blue-900 via-slate-900 to-black" },
  Fatigued: { colors: "from-cyan-400 via-blue-400 to-sky-400" },
  Disengaged: { colors: "from-cyan-400 via-blue-400 to-sky-400" },
};

const DEFAULT_BLOCK: BlockDefinition = {
  colors: "from-slate-400 to-slate-600",
};

function getSpecificEmotionSvg(emotion: string): string {
  // SVG primitive generators mimicking the exact video shapes
  const teardrop = (sharp: "tl" | "tr" | "br" | "bl") => {
    let d = `M 50 15 `;
    if (sharp === "tr") d += `L 85 15 L 85 50 `; else d += `A 35 35 0 0 1 85 50 `;
    if (sharp === "br") d += `L 85 85 L 50 85 `; else d += `A 35 35 0 0 1 50 85 `;
    if (sharp === "bl") d += `L 15 85 L 15 50 `; else d += `A 35 35 0 0 1 15 50 `;
    if (sharp === "tl") d += `L 15 15 L 50 15 `; else d += `A 35 35 0 0 1 50 15 `;
    return `<path d="${d} Z" />`;
  };
  const cloud = () => `<path d="M 25 80 L 75 80 A 15 15 0 0 0 85 55 A 25 25 0 0 0 75 25 A 30 30 0 0 0 25 25 A 25 25 0 0 0 15 55 A 15 15 0 0 0 25 80 Z" />`;
  const clover = () => `<circle cx="35" cy="35" r="22" /><circle cx="65" cy="35" r="22" /><circle cx="35" cy="65" r="22" /><circle cx="65" cy="65" r="22" /><rect x="35" y="35" width="30" height="30" />`;
  const dip = () => `<path d="M 15 25 Q 50 60 85 25 L 85 50 A 35 35 0 0 1 15 50 Z" />`;
  const bite = (bites: string[]) => {
    let d = `M 50 15 `;
    if (bites.includes("tr")) d += `L 70 15 A 15 15 0 0 0 85 30 `; else d += `L 85 15 `;
    if (bites.includes("br")) d += `L 85 70 A 15 15 0 0 0 70 85 `; else d += `L 85 85 `;
    if (bites.includes("bl")) d += `L 30 85 A 15 15 0 0 0 15 70 `; else d += `L 15 85 `;
    if (bites.includes("tl")) d += `L 15 30 A 15 15 0 0 0 30 15 `; else d += `L 15 15 `;
    return `<path d="${d} Z" />`;
  };
  const circle = () => `<circle cx="50" cy="50" r="40" />`;
  const squircle = () => `<rect x="15" y="15" width="70" height="70" rx="20" ry="20" />`;
  const pillH = () => `<rect x="10" y="30" width="80" height="40" rx="20" />`;
  const pillV = () => `<rect x="30" y="10" width="40" height="80" rx="20" />`;
  const peanut = () => `<circle cx="35" cy="50" r="25"/><circle cx="65" cy="50" r="25"/>`;
  const diamond = () => `<path d="M 50 10 L 90 50 L 50 90 L 10 50 Z" />`;
  const starburst = () => `<path d="M 50 10 L 60 30 L 85 25 L 70 45 L 90 65 L 65 70 L 75 90 L 50 75 L 25 90 L 35 70 L 10 65 L 30 45 L 15 25 L 40 30 Z" />`;
  const hexagon = () => `<path d="M 30 15 L 70 15 L 90 50 L 70 85 L 30 85 L 10 50 Z" />`;
  const hexagonV = () => `<path d="M 50 10 L 85 30 L 85 70 L 50 90 L 15 70 L 15 30 Z" />`;
  const triangleUp = () => `<path d="M 50 15 L 90 80 L 10 80 Z" />`;
  const bowtie = () => `<path d="M 15 15 L 85 15 L 50 50 L 85 85 L 15 85 L 50 50 Z" />`;
  const crown = () => `<path d="M 15 80 L 85 80 L 85 20 L 65 40 L 50 15 L 35 40 L 15 20 Z" />`;
  const zigzag = () => `<path d="M 20 20 L 80 20 L 70 35 L 85 50 L 70 65 L 80 80 L 20 80 L 30 65 L 15 50 L 30 35 Z" />`;
  const slanted = () => `<path d="M 30 20 L 90 20 L 70 80 L 10 80 Z" />`;

  switch (emotion) {
    // Yellows
    case "Excited": return starburst();
    case "Focused": return teardrop("tr");
    case "Happy": return circle();
    case "Proud": return teardrop("tl");
    case "Energetic": return teardrop("tl");
    case "Inspired": return teardrop("tl");
    case "Playful": return teardrop("tl");
    case "Motivated": return teardrop("tr");
    case "Euphoric": return starburst();
    case "Empowered": return circle();
    case "Confident": return teardrop("tl");
    case "Upbeat": return teardrop("tl");

    // Greens
    case "Valued": return cloud();
    case "Peaceful": return cloud();
    case "Calm": return cloud();
    case "Relaxed": return cloud();
    case "Grateful": return cloud();
    case "Satisfied": return circle();
    case "Serene": return circle();
    case "Content": return pillH();
    case "Thoughtful": return clover();
    case "Cozy": return cloud();
    case "Mellow": return circle();
    case "Reflective": return clover();
    case "Sympathetic": return cloud();
    case "Chill": return cloud();
    case "Comfortable": return cloud();

    // Reds
    case "Tense": return starburst();
    case "Anxious": return triangleUp();
    case "Stressed": return hexagon();
    case "Frustrated": return bowtie();
    case "Angry": return diamond();
    case "Overwhelmed": return hexagonV();
    case "Panicked": return crown();
    case "Irritated": return zigzag();
    case "Jittery": return starburst();
    case "Furious": return slanted();
    case "Restless": return hexagon();
    case "Defensive": return hexagon();

    // Blues
    case "Lonely": return dip();
    case "Tired": return dip();
    case "Bored": return squircle();
    case "Sad": return dip();
    case "Disappointed": return bite(["tr", "bl"]);
    case "Exhausted": return dip();
    case "Gloomy": return bite(["bl", "br"]);
    case "Apathetic": return circle();
    case "Numb": return bite(["bl", "br"]);
    case "Drained": return dip();
    case "Hopeless": return bite(["tl", "br"]);
    case "Insecure": return bite(["tl", "br"]);
    case "Fatigued": return dip();
    case "Disengaged": return bite(["tl", "bl"]);

    default: return circle();
  }
}

export const EmotionBlock: React.FC<EmotionBlockProps> = ({
  emotion,
  size = "md",
  className = "",
  animate = true,
}) => {
  const normalizedEmotion = emotion ? emotion.trim() : "";
  const def = EMOTION_BLOCK_MAP[normalizedEmotion] || DEFAULT_BLOCK;

  const sizeClasses = {
    xs: "w-5 h-5",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  };
  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  const innerSvg = getSpecificEmotionSvg(normalizedEmotion);
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${innerSvg}</svg>`;
  const encodedSvg = `url("data:image/svg+xml;utf8,${encodeURIComponent(svgString)}")`;

  return (
    <div
      title={normalizedEmotion}
      className={`relative select-none shrink-0 bg-gradient-to-br ${def.colors} ${currentSizeClass} ${
        animate ? "hover:scale-110 transition-transform duration-300" : ""
      } ${className}`}
      style={{
        WebkitMaskImage: encodedSvg,
        WebkitMaskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskImage: encodedSvg,
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
      }}
    />
  );
};
