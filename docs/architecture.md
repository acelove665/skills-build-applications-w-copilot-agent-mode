# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Keep route-specific rendering in React components and HTTP concerns in the shared API client. Each capability must render API data and expose loading, meaningful empty, and accessible error states; components do not access MongoDB or implement business rules.
- Logic tier decision: Keep HTTP parsing, request validation, status codes, and response shapes in Express routes. Use services for capability behavior so persistence details do not leak into the presentation tier.
- Data tier decision: Enforce required fields and useful defaults in Mongoose schemas. Keep seed operations repeatable and preserve unrelated records and existing relationships.
- Activity tracking approach: Validate activity type, positive minutes, and well-formed IDs; verify referenced users and teams exist before writing. Compute points and occurrence time on the server, and return a deliberate 4xx for invalid or missing references rather than a cast-error 500.
- Team management approach: Require a team name, preserve its name and mascot in create/list responses, default members to an empty array, and maintain membership references when adding members.
- Leaderboard approach: Aggregate activity points by team, sort by total points descending, and assign 1-based ranks in the returned order.
- Workout suggestions approach: Find the user by email, use their fitness goal and recent activity to select matching stored workouts, include a concise reason for the top suggestion, and return a deliberate 4xx for unknown users.

## Test plan

Check MongoDB before integration tests with `ps aux | grep '[m]ongod'`. Install each tier's locked dependencies with `npm ci --prefix octofit-tracker/backend` and `npm ci --prefix octofit-tracker/frontend`.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend`: failures indicate model validation/default or seed integrity/idempotency regressions.
- API command: `npm run test:api --prefix octofit-tracker/backend`: failures indicate request validation, status/response shape, or capability behavior regressions.
- Frontend command: `npm test --prefix octofit-tracker/frontend`: failures indicate route rendering, API request, loading, empty-state, or accessible error-state regressions.
- Backend build command: `npm run build --prefix octofit-tracker/backend`: failures indicate TypeScript or backend compilation errors.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend`: failures indicate TypeScript or frontend production-build errors.

Baseline on 2026-11-04, after installing both tiers' dependencies with MongoDB running:

- `npm test --prefix octofit-tracker/backend`: failed; 8 failed and 1 passed. Four data-contract failures cover required model fields; four API-contract failures cover invalid-input statuses, leaderboard results, and workout-suggestion reasons. The seed contract passed.
- `npm test --prefix octofit-tracker/frontend`: failed; all 15 presentation contract tests failed, covering API-backed rendering and per-route loading, empty, and error behavior.
- The data/API focused commands and both build commands above have not been run individually yet.
