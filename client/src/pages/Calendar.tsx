/**
 * Calendar page - Schedule and manage workout sessions
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, Plus, CheckCircle } from "lucide-react";
import { useScheduledSessions, useWeeklySchedule } from "@/hooks/useAppState";
import { initialWorkouts } from "@/lib/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateId, getTodayDateString } from "@/lib/utils-calistenia";
import { toast } from "sonner";

export default function Calendar() {
  const [, navigate] = useLocation();
  const { sessions, addSession, updateSession } = useScheduledSessions();
  const { schedule: weeklySchedule, updateSchedule } = useWeeklySchedule();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
    return date.toISOString().split('T')[0];
  });

  const getSessionForDate = (date: string) => sessions.find(s => s.data === date);

  const handleScheduleWorkout = (date: string) => {
    if (!selectedWorkoutId) return;

    const existing = getSessionForDate(date);
    if (existing) {
      updateSession(existing.id, { workoutId: selectedWorkoutId });
    } else {
      addSession({
        id: generateId(),
        data: date,
        workoutId: selectedWorkoutId,
        status: 'pendente',
      });
    }
    setSelectedWorkoutId(null);
    toast.success('Treino agendado com sucesso!');
  };

  const handleCompleteSession = (date: string) => {
    const session = getSessionForDate(date);
    if (session && session.status !== 'concluído') {
      updateSession(session.id, {
        status: 'concluído',
        completado_em: new Date().toISOString(),
      });
      toast.success('Treino marcado como concluído!');
    }
  };

  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const today = getTodayDateString();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="container flex items-center gap-4 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="hover:bg-card"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>CALENDÁRIO</h1>
        </div>
      </header>

      <div className="container py-8">
        {/* Workout Selector */}
        <Card className="neon-border p-6 mb-8">
          <p className="text-sm font-medium text-muted-foreground mb-3">SELECIONE UM TREINO</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {initialWorkouts.map((workout) => (
              <Button
                key={workout.id}
                onClick={() => setSelectedWorkoutId(workout.id)}
                variant={selectedWorkoutId === workout.id ? "default" : "outline"}
                className={selectedWorkoutId === workout.id ? "bg-[#00FF88] text-background" : ""}
              >
                {workout.nome}
              </Button>
            ))}
          </div>
        </Card>

        {/* Série Fixa Semanal */}
        <Card className="neon-border p-6 mb-8">
          <p className="text-sm font-medium text-muted-foreground mb-4">SÉRIE FIXA SEMANAL</p>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((dayName, index) => (
              <div key={dayName} className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-center">{dayName}</span>
                <Select
                  value={weeklySchedule[index] || "none"}
                  onValueChange={(val) => updateSchedule(index, val === "none" ? null : val)}
                >
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue placeholder="Sem treino" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Descanso</SelectItem>
                    {initialWorkouts.map((w) => (
                      <SelectItem key={w.id} value={w.id}>{w.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </Card>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-bold capitalize">{monthName}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <Card className="neon-border p-6">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Empty cells for days before month starts */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Days of month */}
            {days.map((date) => {
              const session = getSessionForDate(date);
              const isToday = date === today;
              
              // dayOfWeek in JS: 0 = Sun, 6 = Sat. Parse date as local time.
              const dateObj = new Date(date + "T12:00:00");
              const dayOfWeek = dateObj.getDay();
              const fixedWorkoutId = weeklySchedule[dayOfWeek];
              
              const activeWorkoutId = session ? session.workoutId : fixedWorkoutId;
              const workout = activeWorkoutId ? initialWorkouts.find(w => w.id === activeWorkoutId) : null;
              
              const isFixed = !session && !!fixedWorkoutId;

              return (
                <div
                  key={date}
                  className={`aspect-square border rounded-lg p-2 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                    isToday ? 'border-[#00FF88] bg-[#00FF88]/10' : 'border-border/50 hover:border-[#00D9FF]'
                  } ${session?.status === 'concluído' ? 'bg-green-500/10' : ''} ${isFixed ? 'border-dashed border-muted-foreground/50' : ''}`}
                  onClick={() => {
                    if (selectedWorkoutId) {
                      handleScheduleWorkout(date);
                    } else if (session) {
                      handleCompleteSession(date);
                    } else if (isFixed) {
                      addSession({
                        id: generateId(),
                        data: date,
                        workoutId: fixedWorkoutId,
                        status: 'pendente',
                      });
                      toast.success('Treino fixo adicionado aos agendamentos!');
                    }
                  }}
                >
                  <div className="text-xs font-semibold mb-1">{date.split('-')[2]}</div>
                  {workout && (
                    <div className="text-xs text-muted-foreground truncate w-full px-1">
                      {workout.nome}
                      {isFixed && " (Fixo)"}
                    </div>
                  )}
                  {session?.status === 'concluído' && (
                    <CheckCircle className="h-3 w-3 text-green-400 mt-1" />
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <Button
            onClick={() => {
              if (!selectedWorkoutId) {
                toast.error('Selecione um treino primeiro');
                return;
              }
              handleScheduleWorkout(today);
            }}
            className="gap-2 bg-[#00FF88] hover:bg-[#00FF88]/90 text-background"
          >
            <Plus className="h-4 w-4" />
            Agendar Hoje
          </Button>
        </div>
      </div>
    </div>
  );
}
