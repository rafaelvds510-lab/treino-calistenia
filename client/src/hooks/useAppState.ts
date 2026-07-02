import { useState, useEffect, useCallback } from 'react';
import { ScheduledSession, UserStats } from '@/lib/data';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

const SESSIONS_KEY = 'calistenia_sessions';
const STATS_KEY = 'calistenia_stats';

const defaultStats: UserStats = {
  streak: 0,
  total_treinos: 0,
  total_exercícios_completados: 0,
  tempo_total_treino: 0,
};

export function useScheduledSessions() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  // Local state as primary/offline fallback
  const [localSessions, setLocalSessions] = useState<ScheduledSession[]>(() => {
    try {
      const saved = localStorage.getItem(SESSIONS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Query database if authenticated
  const { data: dbSessions, isLoading } = trpc.workouts.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const scheduleMutation = trpc.workouts.schedule.useMutation({
    onSuccess: () => utils.workouts.list.invalidate(),
  });

  const completeMutation = trpc.workouts.complete.useMutation({
    onSuccess: () => {
      utils.workouts.list.invalidate();
      utils.workouts.getStats.invalidate();
    },
  });

  // Use DB sessions if authenticated, else use local offline sessions
  const sessions = isAuthenticated && dbSessions ? dbSessions : localSessions;

  const saveSessions = useCallback((newSessions: ScheduledSession[]) => {
    if (!isAuthenticated) {
      setLocalSessions(newSessions);
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(newSessions));
    }
  }, [isAuthenticated]);

  const addSession = useCallback(async (session: ScheduledSession) => {
    if (isAuthenticated) {
      await scheduleMutation.mutateAsync({
        workoutId: session.workoutId,
        sessionDate: session.data,
        status: session.status,
      });
    } else {
      setLocalSessions(prev => {
        const updated = [...prev, session];
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [isAuthenticated, scheduleMutation]);

  const updateSession = useCallback(async (id: string, updates: Partial<ScheduledSession>) => {
    if (isAuthenticated) {
      if (updates.status === 'concluído') {
        await completeMutation.mutateAsync({
          sessionId: id,
          durationMinutes: updates.durationMinutes || 30, // Default duration if not specified
        });
      }
    } else {
      setLocalSessions(prev => {
        const updated = prev.map(s => s.id === id ? { ...s, ...updates } : s);
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [isAuthenticated, completeMutation]);

  const deleteSession = useCallback((id: string) => {
    // Note: server workouts model doesn't have a direct delete, so we just filter locally
    // If needed in a full implementation, we could add deleteSession in tRPC. For now, filter locally is fine or offline sync.
    setLocalSessions(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
    sessions,
    loading: isAuthenticated ? isLoading : false,
    saveSessions,
    addSession,
    updateSession,
    deleteSession,
  };
}

export function useUserStats() {
  const { isAuthenticated } = useAuth();

  const [localStats, setLocalStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STATS_KEY);
      return saved ? JSON.parse(saved) : defaultStats;
    } catch {
      return defaultStats;
    }
  });

  const { data: dbStats, isLoading } = trpc.workouts.getStats.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Map dbStats to local UserStats structure
  const stats: UserStats = isAuthenticated && dbStats ? {
    streak: dbStats.currentStreak,
    total_treinos: dbStats.totalWorkouts,
    total_exercícios_completados: dbStats.totalExercisesCompleted,
    tempo_total_treino: dbStats.totalTrainingTime,
  } : localStats;

  const updateStats = useCallback((updates: Partial<UserStats>) => {
    if (!isAuthenticated) {
      setLocalStats(prev => {
        const updated = { ...prev, ...updates };
        localStorage.setItem(STATS_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [isAuthenticated]);

  return { 
    stats, 
    loading: isAuthenticated ? isLoading : false, 
    updateStats 
  };
}

export function useStreak(sessions: ScheduledSession[]) {
  const completed = sessions.filter(s => s.status === 'concluído');
  if (completed.length === 0) return 0;

  const sorted = [...completed].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  let streak = 0;
  let current = new Date();
  current.setHours(0, 0, 0, 0);

  for (const session of sorted) {
    const sessionDate = new Date(session.data);
    sessionDate.setHours(0, 0, 0, 0);
    const diff = (current.getTime() - sessionDate.getTime()) / 86400000;
    if (diff <= 1) {
      streak++;
      current = sessionDate;
    } else {
      break;
    }
  }

  return streak;
}

export function useWeeklySchedule() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const [localSchedule, setLocalSchedule] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem('calistenia_weekly_schedule');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const scheduleMutation = trpc.users.updateProfile.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
    },
  });

  const schedule = isAuthenticated && user ? (user.weeklySchedule as Record<number, string> || {}) : localSchedule;

  const updateSchedule = useCallback(async (day: number, workoutId: string | null) => {
    const newSchedule = { ...schedule };
    if (workoutId === null) {
      delete newSchedule[day];
    } else {
      newSchedule[day] = workoutId;
    }

    if (isAuthenticated) {
      await scheduleMutation.mutateAsync({
        weeklySchedule: newSchedule,
      });
    } else {
      setLocalSchedule(newSchedule);
      localStorage.setItem('calistenia_weekly_schedule', JSON.stringify(newSchedule));
    }
  }, [isAuthenticated, schedule, scheduleMutation]);

  return {
    schedule,
    updateSchedule,
    loading: isAuthenticated ? scheduleMutation.isPending : false,
  };
}
