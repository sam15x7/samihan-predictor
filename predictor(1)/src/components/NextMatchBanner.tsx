import React, { useEffect, useState } from 'react';
import { differenceInSeconds } from 'date-fns';
import { matchData } from '../data';
import { getCountryCode } from '../lib/fifa-utils';
import { cn } from '../lib/utils';
import { Bell } from 'lucide-react';

export default function NextMatchBanner() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const upcomingMatches = matchData.filter((m) => new Date(m.utc) > currentTime);
  const nextMatch = upcomingMatches[0];

  if (!nextMatch) return null;

  const diffSecs = differenceInSeconds(new Date(nextMatch.utc), currentTime);
  const hours = Math.floor(diffSecs / 3600);
  const minutes = Math.floor((diffSecs % 3600) / 60);
  const seconds = diffSecs % 60;

  const isUrgent = diffSecs < 1800; // less than 30 mins
  const isSuperUrgent = diffSecs < 300; // less than 5 mins

  return (
    <div className={cn(
      "sticky top-16 z-40 border-b overflow-hidden transition-colors duration-500",
      isSuperUrgent ? "bg-green-950/40 border-green-500/50" :
      isUrgent ? "bg-amber-950/40 border-amber-500/50" : 
      "bg-fuchsia-950/20 border-fuchsia-900/30"
    )}>
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
         <div className={cn(
           "w-[800px] h-[50px] rounded-full blur-3xl transition-opacity animate-pulse",
           isSuperUrgent ? "bg-green-500 opacity-20" : isUrgent ? "bg-amber-500 opacity-20" : "bg-fuchsia-500 opacity-10"
         )}></div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-2 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-1 sm:gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/40 border border-white/5 font-mono text-[10px] tracking-wider text-slate-300">
            <span className={cn(
              "w-1.5 h-1.5 rounded-full shadow-lg",
              isSuperUrgent ? "bg-green-500 animate-pulse shadow-green-500/50" : 
              isUrgent ? "bg-amber-500 animate-pulse shadow-amber-500/50" : "bg-fuchsia-500 animate-pulse shadow-fuchsia-500/50"
            )}></span>
            NEXT MATCH
          </div>
          <span className="font-mono text-sm tracking-widest font-bold text-white">
            {hours.toString().padStart(2, '0')} : {minutes.toString().padStart(2, '0')} : {seconds.toString().padStart(2, '0')}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold">
          <div className="flex items-center gap-1.5">
            <img src={`https://flagcdn.com/w40/${getCountryCode(nextMatch.home)}.png`} alt="" className="w-5 object-contain" />
            <span className="text-white">{nextMatch.home}</span>
          </div>
          <span className="text-slate-500 font-mono text-xs">vs</span>
          <div className="flex items-center gap-1.5">
            <img src={`https://flagcdn.com/w40/${getCountryCode(nextMatch.away)}.png`} alt="" className="w-5 object-contain" />
            <span className="text-white">{nextMatch.away}</span>
          </div>
          <span className="hidden md:inline text-slate-500 font-mono text-[10px] ml-2">· {nextMatch.venue}</span>
        </div>
        <button 
          title="Notify me before kickoff"
          className="hidden sm:flex text-slate-400 hover:text-fuchsia-400 p-1.5 rounded-md hover:bg-white/5 transition-colors"
          onClick={() => {
            if ('Notification' in window) {
              Notification.requestPermission().then(p => {
                if (p === 'granted') alert('Notifications enabled for this match!');
              });
            }
          }}
        >
          <Bell size={14} />
        </button>
      </div>
    </div>
  );
}
