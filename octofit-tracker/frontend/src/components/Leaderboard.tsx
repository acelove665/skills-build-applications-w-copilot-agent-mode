import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  return <CapabilityCard<LeaderboardEntry>
    title="Leaderboard"
    description="Compare team point totals."
    path="/api/leaderboard"
    dataKey="leaderboard"
    emptyMessage="No leaderboard entries yet."
    getKey={(entry) => `${entry.rank}-${entry.teamName}`}
    renderItem={(entry) => `#${entry.rank} ${entry.teamName}: ${entry.totalPoints} points`}
  />;
}
