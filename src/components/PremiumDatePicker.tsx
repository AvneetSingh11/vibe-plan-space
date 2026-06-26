import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface PremiumDatePickerProps {
  value?: string;
  onChange: (dateStr: string) => void;
  className?: string;
  placeholder?: string;
  compact?: boolean;
}

export default function PremiumDatePicker({ value, onChange, className = "", placeholder = "Schedule", compact = false }: PremiumDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, right: 0, alignRight: false });

  // Parse current value or default to today for calendar view
  const initialDate = value ? new Date(value) : new Date();
  const [viewDate, setViewDate] = useState(initialDate);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Adjust position dynamically
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        // If it's on the right half of the screen, align popover's right edge to button's right edge
        const alignRight = rect.left > window.innerWidth / 2;
        setCoords({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          right: window.innerWidth - rect.right,
          alignRight
        });
      }
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const formatDateLabel = (dateStr?: string) => {
    if (!dateStr) return placeholder;
    const d = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleQuickSelect = (daysOffset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    onChange(d.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const handleSelectExactDate = (day: number) => {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(d.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  // Calendar Grid Logic
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const popoverContent = isOpen ? (
    <div 
      ref={popoverRef}
      className="absolute z-[99999] mt-2 p-5 w-72 rounded-2xl bg-card border border-border shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
      style={{
        top: coords.top,
        ...(coords.alignRight ? { right: coords.right } : { left: coords.left })
      }}
    >
      {/* Quick Selects */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button type="button" onClick={() => handleQuickSelect(0)} className="py-1.5 text-xs rounded-md bg-surface hover:bg-surface-elevated border border-border transition cursor-pointer">Today</button>
        <button type="button" onClick={() => handleQuickSelect(1)} className="py-1.5 text-xs rounded-md bg-surface hover:bg-surface-elevated border border-border transition cursor-pointer">Tomorrow</button>
        <button type="button" onClick={() => handleQuickSelect(5)} className="py-1.5 text-xs rounded-md bg-surface hover:bg-surface-elevated border border-border transition cursor-pointer">Next Week</button>
        <button type="button" onClick={() => handleQuickSelect(14)} className="py-1.5 text-xs rounded-md bg-surface hover:bg-surface-elevated border border-border transition cursor-pointer">Later</button>
      </div>

      <hr className="border-border mb-4" />

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={prevMonth} className="p-1 rounded-md hover:bg-surface transition text-muted-foreground cursor-pointer">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-sm font-semibold text-foreground">
          {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        <button type="button" onClick={nextMonth} className="p-1 rounded-md hover:bg-surface transition text-muted-foreground cursor-pointer">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground mb-2">
        <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {blanks.map((b) => (
          <div key={`blank-${b}`} className="p-1"></div>
        ))}
        {days.map((day) => {
          const dStr = new Date(year, month, day).toISOString().split('T')[0];
          const isSelected = value === dStr;
          return (
            <button
              key={day}
              type="button"
              onClick={() => handleSelectExactDate(day)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.5)] scale-110' 
                  : 'hover:bg-surface-elevated hover:scale-105 text-foreground'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  ) : null;

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 rounded-lg bg-surface text-sm transition focus:outline-none focus:ring-0 border-none ring-0 ${compact ? 'p-1.5' : 'px-3 py-1.5'} ${value ? 'text-primary' : 'text-muted-foreground'} hover:bg-surface-elevated hover:text-foreground cursor-pointer active:scale-95`}
      >
        <CalendarIcon className="w-4 h-4" />
        {!compact && formatDateLabel(value)}
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(popoverContent, document.body)}
    </div>
  );
}
