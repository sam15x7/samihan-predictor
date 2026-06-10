// [WC2026 ENHANCEMENT — Task 3]

export function computeMatchStatus(match: any, nowUTC = new Date()) {
  const kickoff = new Date(match.utc);
  const msToKickoff = kickoff.getTime() - nowUTC.getTime();
  const msSinceKickoff = nowUTC.getTime() - kickoff.getTime();

  if (match.status && ['LIVE','HT','FT','ET','PENS','AET'].includes(match.status)) {
    return match.status;
  }

  if (msToKickoff > 24 * 60 * 60 * 1000) return 'UPCOMING';
  if (msToKickoff > 60 * 60 * 1000)      return 'TODAY';
  if (msToKickoff > 0)                   return 'SOON';       // < 1h away
  if (msSinceKickoff < 115 * 60 * 1000) return 'LIVE';       // within 115 min
  return 'FT';
}
