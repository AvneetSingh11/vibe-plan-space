import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ArrowLeft } from 'lucide-react';
import { EmotionBlock } from './EmotionBlock';
import { EMOTION_TEMPLATES } from './HowWeFeelHub';

interface QuadrantEmotionPickerProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  className?: string;
  align?: 'left' | 'right';
}

export const QuadrantEmotionPicker = ({ 
  value, 
  onChange, 
  placeholder, 
  className = "",
  align = "right"
}: QuadrantEmotionPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dynamicAlign, setDynamicAlign] = useState<'left' | 'right'>(align);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceOnRight = window.innerWidth - rect.left;
      const spaceOnLeft = rect.right;
      
      // If a 290px dropdown would overflow the right edge of the screen,
      // and we have more space on the left, align to the right (grows leftwards).
      if (spaceOnRight < 310 && spaceOnLeft > spaceOnRight) {
        setDynamicAlign('right');
      } else {
        setDynamicAlign('left');
      }
    }
  }, [isOpen, align]);

  const selectedTemplate = EMOTION_TEMPLATES.find(e => e.emotion === value);

  // Derive quadrants from templates
  const getQuadrantEmotions = (quadrant: string) => {
    switch (quadrant) {
      case 'Q1': return EMOTION_TEMPLATES.filter(t => t.energy === 'high' && t.pleasantness === 'pleasant');
      case 'Q2': return EMOTION_TEMPLATES.filter(t => t.energy === 'high' && t.pleasantness === 'unpleasant');
      case 'Q3': return EMOTION_TEMPLATES.filter(t => t.energy === 'low' && t.pleasantness === 'pleasant');
      case 'Q4': return EMOTION_TEMPLATES.filter(t => t.energy === 'low' && t.pleasantness === 'unpleasant');
      default: return [];
    }
  };

  const handleSelect = (emotion: string) => {
    onChange(emotion);
    setIsOpen(false);
    setSelectedQuadrant(null);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-[10px] sm:text-xs rounded-xl text-left flex items-center justify-between bg-slate-950/60 border border-slate-800 hover:border-slate-500/50 transition-colors cursor-pointer text-slate-200"
      >
        <div className="flex items-center gap-1.5 truncate min-w-0">
          {selectedTemplate ? (
            <>
              <EmotionBlock emotion={selectedTemplate.emotion} size="xs" animate={false} />
              <span className="truncate">{selectedTemplate.emotion}</span>
            </>
          ) : (
            <span className="truncate">{placeholder}</span>
          )}
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => { setIsOpen(false); setSelectedQuadrant(null); }}
          />
          <div className={`absolute z-50 mt-1 w-[290px] bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden ${dynamicAlign === 'right' ? 'right-0' : 'left-0'} animate-in fade-in zoom-in-95 duration-200`}>
            {!selectedQuadrant ? (
              <div className="p-2 grid grid-cols-2 grid-rows-2 gap-1.5">
                {/* Q1: High/Pleasant (Yellow) */}
                <button
                  type="button"
                  onClick={() => setSelectedQuadrant('Q1')}
                  className="p-3 flex flex-col items-center justify-center text-center rounded-lg bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-yellow-400">High Energy</span>
                  </div>
                  <span className="text-[9px] text-yellow-500/80">Pleasant</span>
                </button>
                {/* Q2: High/Unpleasant (Red) */}
                <button
                  type="button"
                  onClick={() => setSelectedQuadrant('Q2')}
                  className="p-3 flex flex-col items-center justify-center text-center rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-red-400">High Energy</span>
                  </div>
                  <span className="text-[9px] text-red-500/80">Unpleasant</span>
                </button>
                {/* Q3: Low/Pleasant (Green) */}
                <button
                  type="button"
                  onClick={() => setSelectedQuadrant('Q3')}
                  className="p-3 flex flex-col items-center justify-center text-center rounded-lg bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-green-400">Low Energy</span>
                  </div>
                  <span className="text-[9px] text-green-500/80">Pleasant</span>
                </button>
                {/* Q4: Low/Unpleasant (Blue) */}
                <button
                  type="button"
                  onClick={() => setSelectedQuadrant('Q4')}
                  className="p-3 flex flex-col items-center justify-center text-center rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-blue-400">Low Energy</span>
                  </div>
                  <span className="text-[9px] text-blue-500/80">Unpleasant</span>
                </button>
              </div>
            ) : (
              <div className="p-2">
                <div className="flex items-center mb-2 px-1">
                  <button 
                    type="button"
                    onClick={() => setSelectedQuadrant(null)}
                    className="p-1 hover:bg-slate-800 rounded-md text-slate-400 mr-2 cursor-pointer shrink-0"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-bold text-slate-300 uppercase truncate">Select Emotion</span>
                </div>
                <div className="max-h-48 overflow-y-auto pr-1 space-y-1">
                  {getQuadrantEmotions(selectedQuadrant).map(item => (
                    <button
                      key={item.emotion}
                      type="button"
                      onClick={() => handleSelect(item.emotion)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800 transition-colors text-left cursor-pointer"
                    >
                      <div className="shrink-0">
                        <EmotionBlock emotion={item.emotion} size="xs" animate={false} />
                      </div>
                      <span className="text-xs text-slate-200 truncate">{item.emotion}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
