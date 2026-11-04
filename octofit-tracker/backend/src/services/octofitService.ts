import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw Object.assign(new Error('Activity input must be an object'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (
    typeof userId !== 'string' || !mongoose.isObjectIdOrHexString(userId) ||
    typeof teamId !== 'string' || !mongoose.isObjectIdOrHexString(teamId) ||
    typeof type !== 'string' || type.trim().length === 0 ||
    typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0
  ) {
    throw Object.assign(new Error('Activity fields are invalid'), { status: 400 });
  }

  const [user, team] = await Promise.all([
    User.findById(userId).select('_id').lean(),
    Team.findById(teamId).select('_id').lean(),
  ]);
  if (!user || !team) {
    throw Object.assign(new Error('Activity user or team was not found'), { status: 404 });
  }

  return Activity.create({
    user: user._id,
    team: team._id,
    type,
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw Object.assign(new Error('Team input must be an object'), { status: 400 });
  }

  const { name, mascot, members = [] } = input as Record<string, unknown>;
  if (
    typeof name !== 'string' || name.trim().length === 0 ||
    typeof mascot !== 'string' || mascot.trim().length === 0 ||
    !Array.isArray(members) ||
    members.some((member) => typeof member !== 'string' || !mongoose.isObjectIdOrHexString(member))
  ) {
    throw Object.assign(new Error('Team fields are invalid'), { status: 400 });
  }

  const memberIds = [...new Set(members as string[])];
  const existingMembers = await User.find({ _id: { $in: memberIds } }).select('_id').lean();
  if (existingMembers.length !== memberIds.length) {
    throw Object.assign(new Error('One or more team members were not found'), { status: 404 });
  }

  const previousTeams = memberIds.length
    ? await Team.find({ members: { $in: memberIds } }).select('_id').lean()
    : [];
  const team = await Team.create({
    name: name.trim(),
    mascot: mascot.trim(),
    members: existingMembers.map((member) => member._id),
  });

  if (memberIds.length) {
    await Promise.all([
      Team.updateMany(
        { _id: { $in: previousTeams.map((previousTeam) => previousTeam._id) } },
        { $pull: { members: { $in: memberIds } } },
      ),
      User.updateMany({ _id: { $in: memberIds } }, { $set: { team: team._id } }),
    ]);
  }

  return team;
}

export async function getLeaderboard() {
  const [teams, activityTotals] = await Promise.all([
    Team.find().select('name').lean(),
    Activity.aggregate([{ $group: { _id: '$team', totalPoints: { $sum: '$points' } } }]),
  ]);
  const pointsByTeam = new Map(activityTotals.map(({ _id, totalPoints }) => [_id.toString(), totalPoints]));

  return teams
    .map((team) => ({
      teamName: team.name,
      totalPoints: pointsByTeam.get(team._id.toString()) ?? 0,
    }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).select('_id fitnessGoal').lean();
  if (!user) {
    throw Object.assign(new Error('User was not found'), { status: 404 });
  }

  const [recentActivities, workouts] = await Promise.all([
    Activity.find({ user: user._id }).select('type occurredAt').sort({ occurredAt: -1 }).limit(10).lean(),
    Workout.find().lean(),
  ]);
  const goal = user.fitnessGoal.toLowerCase();
  const activityFocus = new Map([
    ['run', 'endurance'],
    ['running', 'endurance'],
    ['cycle', 'endurance'],
    ['cycling', 'endurance'],
    ['strength', 'strength'],
    ['walk', 'mobility'],
  ]);

  return workouts
    .map((workout) => {
      const focus = workout.focus.toLowerCase();
      const matchesGoal = focus === goal;
      const matchingActivity = recentActivities.find((activity) =>
        (activityFocus.get(activity.type.toLowerCase()) ?? activity.type.toLowerCase()) === focus,
      );
      return {
        workout,
        score: matchesGoal ? 2 : matchingActivity ? 1 : 0,
        reason: matchesGoal
          ? `Recommended for your ${user.fitnessGoal} fitness goal.`
          : matchingActivity
            ? `Based on your recent ${matchingActivity.type} activity.`
            : `A suggested workout for your ${user.fitnessGoal} goal.`,
      };
    })
    .sort((left, right) => right.score - left.score || left.workout.title.localeCompare(right.workout.title))
    .map(({ workout, reason }) => ({ ...workout, reason }));
}

export { User };
