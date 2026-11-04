import { CapabilityCard } from './CapabilityCard.js';

type ActivityRecord = { _id?: string; type: string; minutes: number; points: number };

export default function Activities() {
  return <CapabilityCard<ActivityRecord>
    title="Activities"
    description="Track student activity minutes and points."
    path="/api/activities"
    dataKey="activities"
    emptyMessage="No activities yet."
    getKey={(activity, index) => activity._id ?? `${activity.type}-${index}`}
    renderItem={(activity) => `${activity.type}: ${activity.minutes} minutes, ${activity.points} points`}
  />;
}
