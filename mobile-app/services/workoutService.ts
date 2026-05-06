import apiClient from './apiClient';

export interface WorkoutExercise {
  name: string;
  sets: string | number;
  reps: string | number;
  weight: string | number;
  notes?: string;
}

export interface WorkoutLogForm {
  memberId: number;
  notes: string;
  energyLevel: string;
  nutrition: string;
  exercises: WorkoutExercise[];
  bookingId?: number;
}

export const workoutService = {
  getHistory: (memberId: string | number) => apiClient.get(`/workout/${memberId}`).then(res => res.data),
  save: (data: WorkoutLogForm) => apiClient.post('/workout', data).then(res => res.data),
};
