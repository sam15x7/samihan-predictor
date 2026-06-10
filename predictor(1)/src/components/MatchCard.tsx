import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Share2, Activity, CalendarPlus } from 'lucide-react';
import { getCountryCode, getTeamStrength, getTeamTier, calculateWinProbability, generateICS } from '../lib/fifa-utils';
import { format as formatDFNS, differenceInSeconds } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { toPng } from 'html-to-image';
import { computeMatchStatus } from '../utils/matchStatus';

export default function MatchCard({ match, timezone, timeFormat, isFinal, isKnockout }: any) {
  const [showH2H, setShowH2H] = useState(false);
  const [now, setNow] = useState(new Date());
  
  useEffect(() => {
    // 1-second interval to allow countdowns to work
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const cardRef = React.useRef<HTMLDivElement>(null);

  const homeCode = getCountryCode(match.home);
  const awayCode = getCountryCode(match.away);
  const status = computeMatchStatus(match, now);

  const formatMatchTime = (utc: string) => {
    const zoned = toZonedTime(new Date(utc), timezone);
    if (timeFormat === '24h') return formatDFNS(zoned, 'HH:mm');
    if (timeFormat === 'ISO') return zoned.toISOString().split('T')[1].substring(0, 5) + 'Z';
    return formatDFNS(zoned, 'hh:mm a');
  };

  const prob = calculateWinProbability(match.home, match.away);

  const handleShare = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, quality: 1, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `match-${match.home}-${match.away}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
    }
  };

  const diffSecs = Math.max(0, differenceInSeconds(new Date(match.utc), now));
  const countdownMinutes = Math.floor(diffSecs / 60);
  const countdownSeconds = diffSecs % 60;

  // Visual logic
  let cardBorder = isFinal ? 'border-amber-500/50 shadow-md shadow-amber-900/10' : isKnockout ? 'border-fuchsia-500/30' : 'border-[var(--border-color)]';
  let cardBg = 'bg-[var(--card-bg)]';
  let isDimmed = false;
  
  if (status === 'LIVE' || status === 'HT') {
    cardBorder = 'border-[3px] border-[#4ade80]';
    cardBg = 'bg-gradient-to-br from-[#4ade80]/10 to-[var(--card-bg)]';
  } else if (status === 'SOON') {
    cardBorder = 'border border-fuchsia-500/60';
    cardBg = 'bg-[var(--card-bg)]';
  } else if (status === 'TODAY') {
    cardBorder = 'border border-fuchsia-500/35';
  } else if (status === 'FT' || status === 'AET' || status === 'PENS') {
    cardBorder = 'border border-purple-900/15';
    isDimmed = true;
  }

  return (
    <div 
      ref={cardRef}
      className={`match-card rounded-xl border relative transition-all ${cardBorder} ${cardBg} ${isDimmed ? 'opacity-65' : ''}`}
    >
      {(status === 'LIVE' || status === 'HT') && <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#4ade80] rounded-l-xl z-20"></div>}

      <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => generateICS(match)} title="Add to Calendar" className="p-1.5 text-slate-500 hover:text-fuchsia-500 hover:bg-[var(--bg-color)] rounded-md">
          <CalendarPlus size={14} />
        </button>
        <button onClick={handleShare} title="Share as Image" className="p-1.5 text-slate-500 hover:text-fuchsia-500 hover:bg-[var(--bg-color)] rounded-md">
          <Share2 size={14} />
        </button>
      </div>

      <div className="flex flex-col gap-3 p-4">
         <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2 text-[11px] font-mono text-[var(--muted-text)] relative z-10">
            <div className="flex gap-2 items-center">
              {(status === 'LIVE' || status === 'HT') && <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse"></span>}
              {status === 'SOON' && <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse shadow-[0_0_6px_#d946ef]"></span>}
              
              <span className={isFinal ? 'text-amber-500 font-bold' : ''}>#{match.id}</span>
              {match.group && (
                <span className="font-bold text-fuchsia-500 bg-fuchsia-500/10 px-1.5 py-0.5 rounded">
                  GRP {match.group}
                </span>
              )}
            </div>
            <div className="text-right truncate max-w-[150px]">{match.venue} · {match.city}</div>
         </div>

         <div className="flex items-center justify-between group relative z-10">
            <div className="flex flex-col items-center gap-1.5 w-[35%] overflow-hidden">
               <img src={`https://flagcdn.com/w80/${homeCode}.png`} alt={match.home} className="w-10 h-10 object-contain drop-shadow-lg" />
               <div className={`font-semibold truncate w-full text-center ${isFinal ? 'text-amber-500' : 'text-[var(--text-color)]'}`}>
                 {match.home}
               </div>
            </div>
            
            <div className="flex flex-col items-center justify-center shrink-0 mx-2">
               {(status === 'LIVE' || status === 'HT') ? (
                 <>
                   <div className="text-[9px] font-mono text-[#4ade80] bg-[#4ade80]/15 border border-[#4ade80]/40 px-1.5 py-0.5 rounded mb-1">
                     {status}
                   </div>
                   <div className="font-bold font-mono text-lg px-2 py-1 rounded bg-[var(--bg-color)] text-white border border-[var(--border-color)] shadow-sm">
                     {match.score || '0 - 0'}
                   </div>
                 </>
               ) : status === 'SOON' ? (
                 <>
                   <div className="text-[10px] font-mono text-fuchsia-500 mb-1">KICKOFF IN</div>
                   <div className="font-bold font-mono text-sm px-2 py-1 rounded bg-[var(--bg-color)] text-fuchsia-500 border border-[var(--border-color)] shadow-sm">
                     {countdownMinutes.toString().padStart(2, '0')}:{countdownSeconds.toString().padStart(2, '0')}
                   </div>
                 </>
               ) : isDimmed ? (
                 <>
                   <div className="text-[10px] font-mono text-[var(--muted-text)] mb-1">FT</div>
                   <div className="font-bold font-mono text-sm px-2 py-1 rounded bg-[var(--bg-color)] text-[var(--muted-text)] border border-[var(--border-color)] shadow-sm">
                     {match.score || 'vs'}
                   </div>
                 </>
               ) : (
                 <>
                   <div className="text-[10px] font-mono text-[var(--muted-text)] mb-1 flex items-center gap-1">
                     {status === 'TODAY' && <span className="text-[8px] bg-fuchsia-500/10 text-fuchsia-500 px-1 rounded border border-fuchsia-500/30">TODAY</span>}
                     VS
                   </div>
                   <div className={`font-bold font-mono text-sm px-2 py-1 rounded bg-[var(--bg-color)] ${status === 'TODAY' ? 'text-fuchsia-500' : isFinal ? 'text-amber-500' : 'text-purple-400'} border border-[var(--border-color)] shadow-sm`}>
                     {formatMatchTime(match.utc)}
                   </div>
                 </>
               )}
            </div>

            <div className="flex flex-col items-center gap-1.5 w-[35%] overflow-hidden">
               <img src={`https://flagcdn.com/w80/${awayCode}.png`} alt={match.away} className="w-10 h-10 object-contain drop-shadow-lg" />
               <div className={`font-semibold truncate w-full text-center ${isFinal ? 'text-amber-500' : 'text-[var(--text-color)]'}`}>
                 {match.away}
               </div>
            </div>
         </div>
      </div>

      <div className="border-t border-[var(--border-color)] px-4 py-2 bg-[var(--bg-color)]/30 rounded-b-xl relative z-10">
         <div className="flex flex-col">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mb-1">
              <span title={`TSI: ${getTeamStrength(match.home)} - ${getTeamTier(getTeamStrength(match.home))}`}>TSI: {getTeamStrength(match.home)}</span>
              <button 
                onClick={() => setShowH2H(!showH2H)} 
                className="text-fuchsia-500 hover:underline flex items-center gap-1"
              >
                <Activity size={10}/> Predictions & H2H
              </button>
              <span title={`TSI: ${getTeamStrength(match.away)} - ${getTeamTier(getTeamStrength(match.away))}`}>TSI: {getTeamStrength(match.away)}</span>
            </div>
            {showH2H && (
              <div className="mt-2 text-xs fade-in border-t border-[var(--border-color)] pt-2 pb-1">
                <div className="mb-2 text-center text-[10px] font-mono text-[var(--muted-text)]">Win Probability Model</div>
                <div className="flex h-2 rounded-full overflow-hidden mb-1">
                  <div style={{ width: `${prob.home}%` }} className="bg-blue-500" title={`Home: ${prob.home}%`}></div>
                  <div style={{ width: `${prob.draw}%` }} className="bg-slate-500" title={`Draw: ${prob.draw}%`}></div>
                  <div style={{ width: `${prob.away}%` }} className="bg-rose-500" title={`Away: ${prob.away}%`}></div>
                </div>
                <div className="flex justify-between text-[10px] font-mono font-bold">
                  <span className="text-blue-500">{prob.home}%</span>
                  <span className="text-slate-500">{prob.draw}%</span>
                  <span className="text-rose-500">{prob.away}%</span>
                </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}
