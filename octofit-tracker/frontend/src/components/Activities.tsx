import { getJson } from '../api/client.js';
import { CapabilityCard, useApiData } from './CapabilityCard.js';

type ActivityRecord = { _id?: string; type: string; minutes: number; points: number };

function loadActivities() {
  return getJson<{ activities: ActivityRecord[] }>('/api/activities').then((response) => response.activities);
}

export default function Activities() {
  const state = useApiData(loadActivities);
  return <CapabilityCard<ActivityRecord>
    title="Activities"
    description="Track student activity minutes and points."
    state={state}
    emptyMessage="No activities yet."
    getKey={(activity, index) => activity._id ?? `${activity.type}-${index}`}
    renderItem={(activity) => `${activity.type}: ${activity.minutes} minutes, ${activity.points} points`}
  />;
}
