import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../types';

export default function AuraDashboard({
  userName = "Guest User",
  userMantra = "Ascending daily orbits with peak compliance.",
  tasks = [],
  onNavigate
}: {
  userName?: string;
  userMantra?: string;
  tasks?: Task[];
  onNavigate: (tab: string) => void;
  timerMode: 'standby' | 'running' | 'paused';
  timeLeft: number;
  totalTime: number;
  toggleTimer: () => void;
  setTimerDuration: (minutes: number) => void;
}) {
  // Timer State (Hoisted to App.tsx)
  
  // Audio State
  const [rainVolume, setRainVolume] = useState(0);
  const [oceanVolume, setOceanVolume] = useState(0);
  const [cafeVolume, setCafeVolume] = useState(0);

  // Custom Timer Modal State
  const [showCustomTimerModal, setShowCustomTimerModal] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('30');

  // Audio Refs
  const rainAudioRef = useRef<HTMLAudioElement | null>(null);
  const oceanAudioRef = useRef<HTMLAudioElement | null>(null);
  const cafeAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize real audio elements with local files
    rainAudioRef.current = new Audio('/sounds/rain.mp3');
    rainAudioRef.current.loop = true;
    rainAudioRef.current.volume = 0;

    oceanAudioRef.current = new Audio('/sounds/ocean.mp3');
    oceanAudioRef.current.loop = true;
    oceanAudioRef.current.volume = 0;

    cafeAudioRef.current = new Audio('/sounds/stream.mp3');
    cafeAudioRef.current.loop = true;
    cafeAudioRef.current.volume = 0;

    return () => {
      // Cleanup audio
      rainAudioRef.current?.pause();
      oceanAudioRef.current?.pause();
      cafeAudioRef.current?.pause();
    };
  }, []);

  // Timer Logic (Hoisted to App.tsx)

  const handleWheel = (e: React.WheelEvent<HTMLInputElement>, setter: (v: number) => void, currentVolume: number, audioRef: React.RefObject<HTMLAudioElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -5 : 5;
    const newVolume = Math.min(Math.max(currentVolume + delta, 0), 100);
    setter(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
      if (newVolume > 0 && audioRef.current.paused) audioRef.current.play().catch(() => {});
      else if (newVolume === 0) audioRef.current.pause();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // setTimerDuration is now passed as a prop

  // Productivity Insight calculations (Focus on Today's activity)
  const todayStr = new Date().toDateString();
  const todaysTasks = tasks.filter(t => {
    // Include if created today, deadline is today/past, or completed today (approximation)
    const isToday = new Date(t.createdAt).toDateString() === todayStr;
    const isDeadlineToday = t.deadline ? new Date(t.deadline).toDateString() === todayStr : false;
    return isToday || isDeadlineToday || t.completed; // Keep it simple: show progress on active/completed tasks
  });
  
  const pendingTasks = todaysTasks.filter(t => !t.completed).length;
  const completedTasks = todaysTasks.filter(t => t.completed).length;
  const totalTasks = todaysTasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <>
    <div className="aura-theme flex flex-col gap-6 w-full animate-rise pb-12">
      <style>{`
        .aura-theme {
          font-family: 'Space Grotesk', sans-serif;
        }
        
        .aura-theme input[type=range] {
            -webkit-appearance: none;
            width: 100%;
            background: transparent;
        }
        .aura-theme input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 12px;
            width: 12px;
            border-radius: 50%;
            background: #4682B4;
            cursor: pointer;
            margin-top: -4px;
            box-shadow: 0 0 10px rgba(70, 130, 180, 0.8);
        }
        .aura-theme input[type=range]::-webkit-slider-runnable-track {
            width: 100%;
            height: 4px;
            cursor: pointer;
            background: rgba(70, 130, 180, 0.2);
            border-radius: 2px;
        }
        .font-mono {
            font-family: 'JetBrains Mono', monospace;
        }
      `}</style>
      
        {/* Header Text */}
        <div className="w-full mb-4">
          <div className="text-[10px] font-mono text-primary-fixed-dim uppercase tracking-widest mb-1 flex items-center gap-1">
             <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed-dim animate-ping"></span>
             ORBIT COMMAND CENTER
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Good day, {userName.split(' ')[0]}</h1>
          <p className="text-sm text-gray-400 italic">"{userMantra}"</p>
        </div>

        {/* 3D Tilted Card Container */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 h-auto lg:min-h-[calc(100vh-280px)]">
          {/* Left Side: Prime Objectives */}
          <div className="lg:col-span-4 abyssal-card p-8 flex flex-col">
            <div className="flex items-center gap-3 mb-12">
              <span className="material-symbols-outlined text-primary-fixed-dim">check_box</span>
              <h2 className="text-xl font-semibold text-white">Today's Prime Objectives</h2>
            </div>
            <div className="flex-grow flex flex-col items-center justify-center space-y-4">
              {pendingTasks === 0 ? (
                <p className="text-gray-400 text-sm text-center">Nothing pending for today. A clear orbit.</p>
              ) : (
                <div className="text-center">
                  <div className="text-5xl font-bold text-white steel-glow font-mono tracking-tighter mb-2">{pendingTasks}</div>
                  <p className="text-gray-400 text-sm uppercase tracking-widest">Tasks Pending</p>
                  <button 
                    onClick={() => onNavigate("matrix")}
                    className="mt-6 px-4 py-2 border border-primary/40 rounded-full text-xs text-primary-fixed-dim hover:bg-primary/10 transition-all"
                  >
                    View Matrix →
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Right Side: Timer & Widgets */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* Deep Work Session Timer */}
            <div className="abyssal-card flex-grow p-8 flex flex-col items-center justify-center relative min-h-[400px]">
              <div className="text-center mb-6 z-10">
                <h3 className="text-lg font-medium text-gray-300 mb-2">Deep Work Session</h3>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setTimerDuration(totalTime / 60); }} 
                className="absolute top-6 right-6 p-2 rounded-full border border-glass-stroke text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer z-50 flex items-center justify-center"
                title="Reset Timer"
              >
                <span className="material-symbols-outlined text-[20px]">refresh</span>
              </button>
              <div className="relative w-80 h-80 flex items-center justify-center mb-8 cursor-pointer" onClick={toggleTimer}>
                {/* Timer Ring */}
                <svg className="absolute inset-0 w-full h-full rotate-[-90deg] ring-glow">
                  <circle cx="160" cy="160" fill="none" r="150" stroke="rgba(70, 130, 180, 0.1)" strokeWidth="4"></circle>
                  <circle 
                    className={timerMode === 'running' ? "pulse-glow-effect transition-all duration-1000" : "transition-all duration-500"} 
                    cx="160" cy="160" fill="none" r="150" 
                    stroke="var(--color-primary)" 
                    strokeDasharray="942" 
                    strokeDashoffset={942 - (942 * (timeLeft / totalTime))} 
                    strokeWidth="8" style={{ strokeLinecap: 'round' }}></circle>
                </svg>
                {/* Timer Display */}
                <div className="text-center z-10 flex flex-col items-center">
                  <div className={`text-7xl font-bold text-white steel-glow mb-2 font-mono tracking-tighter ${timerMode === 'paused' ? 'opacity-50' : ''}`}>
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-[10px] font-mono text-gray-400 tracking-[0.2em] uppercase mt-2">
                    {timerMode === 'standby' ? 'Tap to start / Standby' : timerMode === 'running' ? 'Running - Tap to Pause' : 'Paused - Tap to Resume'}
                  </div>
                </div>
              </div>
              {/* Timer Controls */}
              <div className="flex gap-4 relative z-50 flex-wrap justify-center pointer-events-auto min-h-[38px] items-center">
                {showCustomTimerModal ? (
                  <div className="flex gap-2 items-center animate-in fade-in zoom-in-95 duration-200">
                    <div className="relative">
                      <input 
                        type="number"
                        min="1"
                        max="999"
                        value={customMinutes}
                        onChange={(e) => setCustomMinutes(e.target.value)}
                        className="w-24 bg-black/40 border border-white/10 rounded-full px-4 py-1.5 text-white font-mono text-center text-sm focus:outline-none focus:border-primary-fixed-dim transition-colors"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = Number(customMinutes);
                            if (val > 0) {
                              setTimerDuration(val);
                              setShowCustomTimerModal(false);
                            }
                          }
                        }}
                      />
                    </div>
                    <button 
                      onClick={() => {
                        const val = Number(customMinutes);
                        if (val > 0) {
                          setTimerDuration(val);
                          setShowCustomTimerModal(false);
                        }
                      }}
                      className="px-4 py-1.5 rounded-full border border-primary-fixed-dim text-xs font-mono text-white bg-primary-fixed-dim/20 hover:bg-primary-fixed-dim/40 transition-all select-none cursor-pointer"
                    >
                      Set
                    </button>
                    <button 
                      onClick={() => setShowCustomTimerModal(false)}
                      className="px-4 py-1.5 rounded-full border border-glass-stroke text-xs font-mono text-gray-400 hover:text-white hover:bg-white/5 transition-all select-none cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <button type="button" onClick={() => setTimerDuration(15)} className={`px-5 py-2 rounded-full border text-xs font-mono transition-all select-none cursor-pointer ${totalTime === 15 * 60 ? 'bg-primary/20 border-primary-fixed-dim text-white shadow-[0_0_15px_rgba(70,130,180,0.4)]' : 'border-glass-stroke text-gray-300 hover:bg-white/5'}`}>15m</button>
                    <button type="button" onClick={() => setTimerDuration(25)} className={`px-5 py-2 rounded-full border text-xs font-mono transition-all select-none cursor-pointer ${totalTime === 25 * 60 ? 'bg-primary/20 border-primary-fixed-dim text-white shadow-[0_0_15px_rgba(70,130,180,0.4)]' : 'border-glass-stroke text-gray-300 hover:bg-white/5'}`}>25m</button>
                    <button type="button" onClick={() => setTimerDuration(45)} className={`px-5 py-2 rounded-full border text-xs font-mono transition-all select-none cursor-pointer ${totalTime === 45 * 60 ? 'bg-primary/20 border-primary-fixed-dim text-white shadow-[0_0_15px_rgba(70,130,180,0.4)]' : 'border-glass-stroke text-gray-300 hover:bg-white/5'}`}>45m</button>
                    <button type="button" onClick={() => setTimerDuration(60)} className={`px-5 py-2 rounded-full border text-xs font-mono transition-all select-none cursor-pointer ${totalTime === 60 * 60 ? 'bg-primary/20 border-primary-fixed-dim text-white shadow-[0_0_15px_rgba(70,130,180,0.4)]' : 'border-glass-stroke text-gray-300 hover:bg-white/5'}`}>60m</button>
                    <button type="button" onClick={() => setShowCustomTimerModal(true)} className="px-5 py-2 rounded-full border border-glass-stroke text-xs font-mono text-gray-300 hover:bg-white/5 transition-all select-none cursor-pointer">+ Custom</button>
                  </>
                )}
              </div>
            </div>
            {/* Bottom Widgets Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-auto md:h-48">
              {/* Ambient Sound Controls */}
              <div className="abyssal-card p-6 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary-fixed-dim text-sm">volume_up</span>
                  <h4 className="font-medium text-white text-sm">Ambient Sound Controls</h4>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400 w-12">Rain</span>
                    <input className="flex-grow" max="100" min="0" type="range" value={rainVolume} onWheel={(e) => handleWheel(e, setRainVolume, rainVolume, rainAudioRef)} onChange={(e) => {
                      const val = Number(e.target.value);
                      setRainVolume(val);
                      if (rainAudioRef.current) {
                        rainAudioRef.current.volume = val / 100;
                        if (val > 0 && rainAudioRef.current.paused) rainAudioRef.current.play().catch(() => {});
                        else if (val === 0) rainAudioRef.current.pause();
                      }
                    }}/>
                    <span className="material-symbols-outlined text-gray-500 text-xs cursor-pointer hover:text-white" onClick={() => {
                      setRainVolume(0);
                      if (rainAudioRef.current) { rainAudioRef.current.volume = 0; rainAudioRef.current.pause(); }
                    }}>volume_down</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400 w-12">Ocean</span>
                    <input className="flex-grow" max="100" min="0" type="range" value={oceanVolume} onWheel={(e) => handleWheel(e, setOceanVolume, oceanVolume, oceanAudioRef)} onChange={(e) => {
                      const val = Number(e.target.value);
                      setOceanVolume(val);
                      if (oceanAudioRef.current) {
                        oceanAudioRef.current.volume = val / 100;
                        if (val > 0 && oceanAudioRef.current.paused) oceanAudioRef.current.play().catch(() => {});
                        else if (val === 0) oceanAudioRef.current.pause();
                      }
                    }}/>
                    <span className="material-symbols-outlined text-gray-500 text-xs cursor-pointer hover:text-white" onClick={() => {
                      setOceanVolume(0);
                      if (oceanAudioRef.current) { oceanAudioRef.current.volume = 0; oceanAudioRef.current.pause(); }
                    }}>volume_down</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-400 w-12">Stream</span>
                    <input className="flex-grow" max="100" min="0" type="range" value={cafeVolume} onWheel={(e) => handleWheel(e, setCafeVolume, cafeVolume, cafeAudioRef)} onChange={(e) => {
                      const val = Number(e.target.value);
                      setCafeVolume(val);
                      if (cafeAudioRef.current) {
                        cafeAudioRef.current.volume = val / 100;
                        if (val > 0 && cafeAudioRef.current.paused) cafeAudioRef.current.play().catch(() => {});
                        else if (val === 0) cafeAudioRef.current.pause();
                      }
                    }}/>
                    <span className="material-symbols-outlined text-gray-500 text-xs cursor-pointer hover:text-white" onClick={() => {
                      setCafeVolume(0);
                      if (cafeAudioRef.current) { cafeAudioRef.current.volume = 0; cafeAudioRef.current.pause(); }
                    }}>volume_down</span>
                  </div>
                </div>
              </div>
              {/* Productivity Insight */}
              <div className="abyssal-card p-6 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary-fixed-dim text-sm">trending_up</span>
                  <h4 className="font-medium text-white text-sm">Productivity Insight</h4>
                </div>
                <div className="flex items-center justify-center h-full">
                  {totalTasks === 0 ? (
                     <p className="text-sm text-gray-400 text-center">Data compiling.<br/>No tasks added yet.</p>
                  ) : (
                     <div className="w-full">
                        <div className="flex justify-between text-xs text-gray-400 mb-2 font-mono">
                          <span>{completedTasks} completed</span>
                          <span>{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-black/50 h-3 rounded-full overflow-hidden border border-glass-stroke">
                          <div className="h-full bg-primary-fixed-dim transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                        <p className="text-xs text-center text-gray-400 mt-4 italic">
                          {progressPercent === 100 ? "Orbit complete. Perfect score." : progressPercent > 50 ? "Making good progress through the matrix." : "Time to dive into deep work."}
                        </p>
                     </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
    </>
  );
}
