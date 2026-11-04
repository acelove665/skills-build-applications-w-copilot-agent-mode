import { CapabilityCard } from './CapabilityCard.js';

type TeamRecord = { _id?: string; name: string; members?: unknown[] };

export default function Teams() {
  return <CapabilityCard<TeamRecord>
    title="Teams"
    description="Manage teams and members."
    path="/api/teams"
    dataKey="teams"
    emptyMessage="No teams yet."
    getKey={(team, index) => team._id ?? `${team.name}-${index}`}
    renderItem={(team) => `${team.name} (${team.members?.length ?? 0} members)`}
  />;
}
