import { getJson } from '../api/client.js';
import { CapabilityCard, useApiData } from './CapabilityCard.js';

type TeamRecord = { _id?: string; name: string; members?: unknown[] };

function loadTeams() {
  return getJson<{ teams: TeamRecord[] }>('/api/teams').then((response) => response.teams);
}

export default function Teams() {
  const state = useApiData(loadTeams);
  return <CapabilityCard<TeamRecord>
    title="Teams"
    description="Manage teams and members."
    state={state}
    emptyMessage="No teams yet."
    getKey={(team, index) => team._id ?? `${team.name}-${index}`}
    renderItem={(team) => `${team.name} (${team.members?.length ?? 0} members)`}
  />;
}
