import React from "react";
import { Bell, Info, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { ContextNotification } from "../types";

interface NotificationCenterProps {
  notifications: ContextNotification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
}

export default function NotificationCenter({ notifications, onMarkRead, onClearAll }: NotificationCenterProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div id="notification-center-panel" className="glass-card p-5 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-5 h-5 text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-display">Context Nudges</h2>
            <p className="text-xs text-slate-400">Time-sensitive, context-aware advice</p>
          </div>
        </div>
        
        {notifications.length > 0 && (
          <button
            id="clear-notifications-btn"
            onClick={onClearAll}
            className="text-[10px] uppercase font-bold tracking-wider text-slate-500 hover:text-slate-300 cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
        {notifications.map((notif) => {
          let iconColor = "text-purple-400 bg-purple-500/10 border-purple-500/20";
          let Icon = Info;
          
          if (notif.type === "alert") {
            iconColor = "text-red-400 bg-red-500/10 border-red-500/20";
            Icon = AlertTriangle;
          } else if (notif.type === "success") {
            iconColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
            Icon = CheckCircle2;
          }

          return (
            <div
              key={notif.id}
              id={`notification-row-${notif.id}`}
              className={`p-3 rounded-xl border flex gap-3 relative group transition-all duration-200 ${
                notif.read 
                  ? "bg-slate-900/20 border-slate-800/40 opacity-60" 
                  : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700/60"
              }`}
            >
              <div className={`p-1.5 h-fit rounded-lg border ${iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-200 truncate">{notif.title}</h4>
                  <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">{notif.timestamp}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {notif.message}
                </p>
              </div>

              {!notif.read && (
                <button
                  id={`mark-notif-read-${notif.id}`}
                  onClick={() => onMarkRead(notif.id)}
                  className="absolute top-2 right-2 text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Mark as read"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {notifications.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">
            No notification alerts at the moment. You're fully in the zone!
          </div>
        )}
      </div>
    </div>
  );
}
