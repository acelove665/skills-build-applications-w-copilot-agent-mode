import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = { _id?: string; title: string; reason?: string };

export default function Workouts() {
  return <CapabilityCard<WorkoutSuggestion>
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    path={`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`}
    dataKey="suggestions"
    emptyMessage="No workout suggestions yet."
    getKey={(workout, index) => workout._id ?? `${workout.title}-${index}`}
    renderItem={(workout) => workout.reason ? `${workout.title}: ${workout.reason}` : workout.title}
  />;
}
