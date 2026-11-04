import { getJson } from '../api/client.js';
import { CapabilityCard, useApiData } from './CapabilityCard.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };

function loadLeaderboard() {
  return getJson<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard').then((response) => response.leaderboard);
}

export default function Leaderboard() {
  const state = useApiData(loadLeaderboard);
  return <CapabilityCard<LeaderboardEntry>
    title="Leaderboard"
    description="Compare team point totals."
    state={state}
    emptyMessage="No leaderboard entries yet."
    getKey={(entry) => `${entry.rank}-${entry.teamName}`}
    renderItem={(entry) => `#${entry.rank} ${entry.teamName}: ${entry.totalPoints} points`}
  />;
}
