import { getJson } from '../api/client.js';
import { CapabilityCard, useApiData } from './CapabilityCard.js';

type WorkoutSuggestion = { _id?: string; title: string; reason?: string };

function loadWorkouts() {
  const userEmail = 'mona@example.com';
  return getJson<{ suggestions: WorkoutSuggestion[] }>(`/api/workouts/suggestions/${encodeURIComponent(userEmail)}`)
    .then((response) => response.suggestions);
}

export default function Workouts() {
  const state = useApiData(loadWorkouts);
  return <CapabilityCard<WorkoutSuggestion>
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    state={state}
    emptyMessage="No workout suggestions yet."
    getKey={(workout, index) => workout._id ?? `${workout.title}-${index}`}
    renderItem={(workout) => workout.reason ? `${workout.title}: ${workout.reason}` : workout.title}
  />;
}
