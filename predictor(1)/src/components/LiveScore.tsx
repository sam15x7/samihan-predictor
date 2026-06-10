import React, { useState, useEffect } from 'react';
import { format, differenceInSeconds } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { matchData } from '../data';
import { getCountryCode } from '../lib/fifa-utils';
import axios from 'axios';

// The live score component fetches from our /api/live-scores proxy
// If there are live matches, it shows them. Otherwise, it shows a countdown to the next match in matchData.

export default function LiveScore({ timezone, timeFormat }: { timezone: string, timeFormat: string }) {
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchLiveScores = async () => {
    try {
      const res = await axios.get('/api/live-scores');
      if (res.data && res.data.response) {
        setLiveMatches(res.data.response);
      }
    } catch (e) {
      console.error('Failed to fetch live scores', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveScores();
    const interval = setInterval(fetchLiveScores, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  const formatMatchTime = (utc: string) => {
    const d = new Date(utc);
    const zoned = toZonedTime(d, timezone);
    const dateStr = format(zoned, 'MMM dd');
    if (timeFormat === '24h') {
      return `${dateStr}, ${format(zoned, 'HH:mm')}`;
    } else if (timeFormat === 'ISO') {
      return zoned.toISOString().split('T')[0].substring(5) + ' ' + zoned.toISOString().split('T')[1].substring(0, 5) + 'Z';
    } else {
      return `${dateStr}, ${format(zoned, 'hh:mm a')}`;
    }
  };

  // Find the next upcoming match
  const nextMatch = matchData.find((m) => new Date(m.utc) > new Date());

  
  if (loading) {
    return <div className="p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl animate-pulse text-center text-sm font-mono opacity-70">Detecting live signals...</div>;
  }

  if (liveMatches.length > 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="text-[10px] font-mono text-rose-500 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          Live Matches
        </div>
        <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-none">
          {liveMatches.map((match, i) => (
            <div key={i} className="min-w-[200px] shrink-0 bg-[var(--card-bg)] border border-rose-500/30 rounded-xl p-3 shadow-md shadow-rose-900/10">
               <div className="text-[10px] font-mono text-rose-400 mb-2">{match.fixture?.status?.elapsed}' MIN</div>
               <div className="flex justify-between items-center mb-1">
                 <span className="font-semibold text-sm">{match.teams?.home?.name}</span>
                 <span className="font-bold text-lg">{match.goals?.home ?? 0}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="font-semibold text-sm">{match.teams?.away?.name}</span>
                 <span className="font-bold text-lg">{match.goals?.away ?? 0}</span>
               </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!nextMatch) {
    return null;
  }

  // Calculate countdown
  const nextMatchDate = new Date(nextMatch.utc);
  const diffSecs = differenceInSeconds(nextMatchDate, currentTime);
  
  const days = Math.floor(diffSecs / (3600 * 24));
  const hours = Math.floor((diffSecs % (3600 * 24)) / 3600);
  const minutes = Math.floor((diffSecs % 3600) / 60);
  const seconds = diffSecs % 60;

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-4 shadow-sm relative overflow-hidden">
       <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-fuchsia-400 to-purple-600"></div>
       <div className="text-[10px] font-mono text-[var(--muted-text)] uppercase tracking-widest mb-3 flex items-center justify-between">
         <span>⏳ Upcoming Match Countdown</span>
         <span className="text-fuchsia-500 font-bold">{formatMatchTime(nextMatch.utc)}</span>
       </div>
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div className="flex items-center gap-3">
           <div className="text-right">
             <div className="font-bold text-lg">{nextMatch.home} <img src={`https://flagcdn.com/w40/${getCountryCode(nextMatch.home)}.png`} alt="" className="inline w-5 ml-1 rounded-[1px] shadow" /></div>
           </div>
           <div className="text-sm font-mono text-slate-500 px-2">VS</div>
           <div className="text-left">
             <div className="font-bold text-lg"><img src={`https://flagcdn.com/w40/${getCountryCode(nextMatch.away)}.png`} alt="" className="inline w-5 mr-1 rounded-[1px] shadow" /> {nextMatch.away}</div>
           </div>
         </div>
         <div className="flex gap-3">
           {[
             { label: 'D', value: Math.max(0, days) },
             { label: 'H', value: Math.max(0, hours) },
             { label: 'M', value: Math.max(0, minutes) },
             { label: 'S', value: Math.max(0, seconds) }
           ].map((unit, i) => (
             <div key={i} className="flex flex-col items-center">
               <div className="bg-[var(--bg-color)] border border-[var(--border-color)] rounded-lg w-10 h-10 flex items-center justify-center font-bold font-mono text-[var(--text-color)]">
                 {unit.value.toString().padStart(2, '0')}
               </div>
               <div className="text-[9px] font-mono text-[var(--muted-text)] mt-1">{unit.label}</div>
             </div>
           ))}
         </div>
       </div>
    </div>
  );
}
