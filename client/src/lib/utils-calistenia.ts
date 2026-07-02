/**
 * Utility functions for calistenia trainer app
 */

import { MuscleGroup, WorkoutObjective, DifficultyLevel } from './data';

// Formatting utilities
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateFull(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Muscle group labels
export const muscleGroupLabels: Record<MuscleGroup, string> = {
  peito: 'Peito',
  costas: 'Costas',
  pernas: 'Pernas',
  ombros: 'Ombros',
  core: 'Core',
  braços: 'Braços',
  antebraços: 'Antebraços',
};

export const muscleGroupColors: Record<MuscleGroup, string> = {
  peito: '#FF006E',
  costas: '#00D9FF',
  pernas: '#00FF88',
  ombros: '#FFB81C',
  core: '#FF006E',
  braços: '#00FF88',
  antebraços: '#00D9FF',
};

// Objective labels
export const objectiveLabels: Record<WorkoutObjective, string> = {
  isometria: 'Isometria',
  resistência: 'Resistência',
  cardio: 'Cardio',
};

export const objectiveEmojis: Record<WorkoutObjective, string> = {
  isometria: '⏱️',
  resistência: '💪',
  cardio: '🔥',
};

// Difficulty labels
export const difficultyLabels: Record<DifficultyLevel, string> = {
  iniciante: 'Iniciante',
  intermediário: 'Intermediário',
  avançado: 'Avançado',
  elite: 'Elite',
};

export const difficultyColors: Record<DifficultyLevel, string> = {
  iniciante: '#00FF88',
  intermediário: '#00D9FF',
  avançado: '#FF006E',
  elite: '#FFB81C',
};

// Get muscle group label
export function getMuscleGroupLabel(group: MuscleGroup): string {
  return muscleGroupLabels[group] || group;
}

// Get objective label
export function getObjectiveLabel(objective: WorkoutObjective): string {
  return objectiveLabels[objective] || objective;
}

// Get difficulty label
export function getDifficultyLabel(difficulty: DifficultyLevel): string {
  return difficultyLabels[difficulty] || difficulty;
}

// Calculate total workout time
export function calculateWorkoutTime(
  exercícios: Array<{ séries: number; repetições?: number; tempo?: number; descanso?: number }>
): number {
  let totalSeconds = 0;

  exercícios.forEach(ex => {
    if (ex.tempo) {
      // Isometric: tempo * séries + descanso entre séries
      totalSeconds += ex.tempo * ex.séries + (ex.descanso || 0) * (ex.séries - 1);
    } else if (ex.repetições) {
      // Resistance: ~2 segundos por repetição + descanso
      const timePerRep = 2;
      totalSeconds += timePerRep * ex.repetições * ex.séries + (ex.descanso || 0) * (ex.séries - 1);
    }
  });

  return Math.ceil(totalSeconds / 60); // Convert to minutes
}

// Get today's date as ISO string
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// Get date range for a week
export function getWeekDateRange(startDate?: Date): { start: string; end: string } {
  const date = startDate || new Date();
  const dayOfWeek = date.getDay();
  const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  
  const start = new Date(date.setDate(diff));
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

// Get date range for a month
export function getMonthDateRange(date?: Date): { start: string; end: string } {
  const d = date || new Date();
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
