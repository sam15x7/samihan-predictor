import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Search, Loader, ShieldAlert } from 'lucide-react';
import axios from 'axios';

const dummyData = [
  { team: 'France', xG: 12.4, goals: 11 },
  { team: 'Argentina', xG: 11.2, goals: 13 },
  { team: 'Brazil', xG: 10.8, goals: 9 },
  { team: 'England', xG: 10.1, goals: 10 },
  { team: 'Spain', xG: 9.5, goals: 8 },
  { team: 'Germany', xG: 8.9, goals: 9 },
];

export default function MatchDashboard() {
  const [query, setQuery] = useState('');
  const [playerData, setPlayerData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [standings, setStandings] = useState<any[]>([]);

  React.useEffect(() => {
    axios.get('/api/standings').then(res => {
      if (res.data && res.data.response && res.data.response.length > 0) {
        setStandings(res.data.response[0].league.standings);
      }
    }).catch(console.error);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setPlayerData(null);
      setError(false);
      return;
    }
    setLoading(true);
    setError(false);

    try {
      const res = await axios.get(`/api/player?search=${encodeURIComponent(query)}`);
      if (res.data && res.data.response && res.data.response.length > 0) {
        setPlayerData(res.data.response[0]);
      } else {
        setPlayerData(null);
        setError(true);
      }
    } catch(err) {
      setError(true);
      setPlayerData(null);
    } finally {
      setLoading(false);
    }
  };

  const mapPlayerStats = (stats: any[]) => {
    if (!stats || stats.length === 0) return [];
    const mainStat = stats[0];
    
    return [
      { name: 'Goals', value: mainStat.goals?.total || 0, fill: '#d946ef' },
      { name: 'Assists', value: mainStat.goals?.assists || 0, fill: '#8b5cf6' },
      { name: 'Shots (On Target)', value: mainStat.shots?.on || 0, fill: '#3b82f6' },
      { name: 'Key Passes', value: mainStat.passes?.key || 0, fill: '#10b981' },
      { name: 'Tackles', value: mainStat.tackles?.total || 0, fill: '#f59e0b' },
      { name: 'Dribbles', value: mainStat.dribbles?.success || 0, fill: '#ec4899' },
    ];
  };

  return (
    <div className="space-y-6 fade-in">
      
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-[0_0_15px_rgba(217,70,239,0.05)]">
        <h2 className="font-bold text-lg font-mono text-[var(--test-color)] hidden md:block">Player Database</h2>
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search for a player (e.g. mbappe, ronaldo)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!e.target.value) setPlayerData(null);
            }}
            className="w-full bg-[var(--bg-color)] border border-[var(--border-color)] rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-fuchsia-500 transition-colors font-mono shadow-inner"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-text)]" size={18} />
          {loading && <Loader className="absolute right-3 top-1/2 -translate-y-1/2 text-fuchsia-500 animate-spin" size={18} />}
        </form>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-rose-500 flex items-center gap-3 font-mono text-sm">
          <ShieldAlert size={18} /> Could not find stats for "{query}". Try a different name.
        </div>
      )}

      {playerData && !loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 fade-in">
          
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-[0_0_15px_rgba(217,70,239,0.1)] relative overflow-hidden">
            <div className="absolute top-0 w-full h-24 bg-gradient-to-b from-fuchsia-500/20 to-transparent"></div>
            <img 
              src={playerData.player.photo} 
              alt={playerData.player.name} 
              className="w-32 h-32 rounded-xl object-contain bg-[var(--bg-color)] border-2 border-[var(--border-color)] shadow-xl relative z-10 mb-4"
              onError={(e) => (e.currentTarget.src = "https://media.api-sports.io/football/players/276.png")}
            />
            <h2 className="text-2xl font-bold font-mono text-white relative z-10">{playerData.player.name}</h2>
            <p className="text-fuchsia-400 font-mono text-sm mb-4 relative z-10">{playerData.player.nationality}</p>
            
            {playerData.statistics && playerData.statistics[0] && (
               <div className="flex items-center gap-2 bg-[var(--bg-color)] border border-[var(--border-color)] px-4 py-2 rounded-lg relative z-10 w-full justify-center">
                 <img src={playerData.statistics[0].team.logo} className="w-6 h-6 object-contain" alt="" />
                 <span className="font-semibold text-sm">{playerData.statistics[0].team.name}</span>
               </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 w-full mt-6 relative z-10">
              <div className="bg-[var(--bg-color)] border border-[var(--border-color)] p-3 rounded-xl">
                 <div className="text-[10px] text-slate-500 font-mono uppercase">Age</div>
                 <div className="font-bold">{playerData.player.age}</div>
              </div>
              <div className="bg-[var(--bg-color)] border border-[var(--border-color)] p-3 rounded-xl">
                 <div className="text-[10px] text-slate-500 font-mono uppercase">Height</div>
                 <div className="font-bold">{playerData.player.height || '-'}</div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6">
            <div className="text-sm font-bold font-mono uppercase tracking-widest mb-6 border-b border-[var(--border-color)] pb-3 text-fuchsia-400">
              {playerData.player.lastname} — Performance Metrics
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mapPlayerStats(playerData.statistics)} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'rgba(217,70,239,0.3)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
        </div>
      ) : (
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-6 shadow-lg fade-in">
          <div className="text-sm font-bold font-mono uppercase tracking-widest mb-6 border-b border-[var(--border-color)] pb-3 flex justify-between items-center text-fuchsia-400">
            <span>FIFA World Cup 2026 — Team Standings</span>
          </div>

          {!standings || standings.length === 0 ? (
             <div className="text-center py-12 text-[var(--muted-text)] font-mono text-sm">
               Standings not available yet.
             </div>
          ) : (
            <div className="space-y-8">
              {standings.map((group: any, idx: number) => (
                <div key={idx} className="overflow-x-auto">
                  <div className="text-xs font-bold font-mono uppercase text-slate-400 mb-3">{group[0].group}</div>
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[var(--bg-color)] text-[var(--muted-text)] font-mono text-[10px] uppercase">
                      <tr>
                        <th className="px-4 py-2 rounded-l-lg">Team</th>
                        <th className="px-4 py-2 text-center">MP</th>
                        <th className="px-4 py-2 text-center">W</th>
                        <th className="px-4 py-2 text-center">D</th>
                        <th className="px-4 py-2 text-center">L</th>
                        <th className="px-4 py-2 text-center">GF</th>
                        <th className="px-4 py-2 text-center">GA</th>
                        <th className="px-4 py-2 text-center">GD</th>
                        <th className="px-4 py-2 text-center font-bold rounded-r-lg">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.map((teamRow: any) => (
                        <tr key={teamRow.team.id} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-color)]/50 transition-colors">
                          <td className="px-4 py-3 flex items-center gap-3">
                            <span className="text-[10px] text-[var(--muted-text)] font-mono w-4">{teamRow.rank}</span>
                            <img src={teamRow.team.logo} alt={teamRow.team.name} className="w-5 h-5 object-contain" />
                            <span className="font-semibold">{teamRow.team.name}</span>
                          </td>
                          <td className="px-4 py-3 text-center">{teamRow.all.played}</td>
                          <td className="px-4 py-3 text-center">{teamRow.all.win}</td>
                          <td className="px-4 py-3 text-center">{teamRow.all.draw}</td>
                          <td className="px-4 py-3 text-center">{teamRow.all.lose}</td>
                          <td className="px-4 py-3 text-center">{teamRow.all.goals.for}</td>
                          <td className="px-4 py-3 text-center">{teamRow.all.goals.against}</td>
                          <td className="px-4 py-3 text-center">{teamRow.goalsDiff}</td>
                          <td className="px-4 py-3 text-center font-bold text-fuchsia-500">{teamRow.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
