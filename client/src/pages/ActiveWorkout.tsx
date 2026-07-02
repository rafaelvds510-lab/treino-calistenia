/**
 * Active Workout page - Execute workout with timer and tracking
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation, useParams } from "wouter";
import { ChevronLeft, Play, Pause, RotateCcw, CheckCircle, Volume2, Loader2 } from "lucide-react";
import { initialWorkouts, initialExercises } from "@/lib/data";
import { formatTime } from "@/lib/utils-calistenia";
import { useScheduledSessions, useUserStats } from "@/hooks/useAppState";
import { toast } from "sonner";

interface AudioContextType extends AudioContext {
  createOscillator: () => OscillatorNode;
  createGain: () => GainNode;
}

export default function ActiveWorkout() {
  const [, navigate] = useLocation();
  const { workoutId } = useParams<{ workoutId: string }>();
  const { updateSession } = useScheduledSessions();
  const { updateStats } = useUserStats();
  
  const completeWorkoutMutation = { isPending: false };

  const workout = initialWorkouts.find(w => w.id === workoutId);

  if (!workout) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Treino não encontrado</p>
          <Button onClick={() => navigate("/workouts")} className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-background">
            Voltar aos Treinos
          </Button>
        </div>
      </div>
    );
  }

  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [currentSeriesIdx, setCurrentSeriesIdx] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [workoutStartTime] = useState(new Date());

  const currentExerciseConfig = workout.exercícios[currentExerciseIdx];
  const currentExercise = initialExercises.find(e => e.id === currentExerciseConfig.exerciseId);
  const isLastExercise = currentExerciseIdx === workout.exercícios.length - 1;
  const isLastSeries = currentSeriesIdx === currentExerciseConfig.séries - 1;

  // Initialize timer
  useEffect(() => {
    if (currentExerciseConfig.tempo) {
      setTimerSeconds(currentExerciseConfig.tempo);
    } else if (currentExerciseConfig.repetições) {
      setTimerSeconds(currentExerciseConfig.repetições * 2); // ~2 seconds per rep
    }
  }, [currentExerciseIdx, currentSeriesIdx, currentExerciseConfig]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isRunning) {
      playSound();
      setIsRunning(false);
      if (!isResting && !isLastSeries) {
        setIsResting(true);
        setTimerSeconds(currentExerciseConfig.descanso || 60);
      } else if (isResting) {
        setIsResting(false);
        moveToNextExercise();
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timerSeconds, isResting, isLastSeries, currentExerciseConfig]);

  const playSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const moveToNextExercise = () => {
    if (isLastExercise && isLastSeries) {
      completeWorkout();
    } else if (isLastSeries) {
      setCurrentExerciseIdx(prev => prev + 1);
      setCurrentSeriesIdx(0);
    } else {
      setCurrentSeriesIdx(prev => prev + 1);
    }
  };

  const completeWorkout = () => {
    const workoutEndTime = new Date();
    const durationMinutes = Math.round((workoutEndTime.getTime() - workoutStartTime.getTime()) / 60000);

    updateStats({
      total_treinos: 1,
      total_exercícios_completados: workout.exercícios.length,
      tempo_total_treino: durationMinutes,
    });

    toast.success('Treino concluído com sucesso!');
    navigate("/calendar");
  };

  const handleSkipExercise = () => {
    setIsRunning(false);
    if (!completedExercises.includes(currentExerciseConfig.exerciseId)) {
      setCompletedExercises(prev => [...prev, currentExerciseConfig.exerciseId]);
    }
    moveToNextExercise();
  };

  const handleCompleteSet = () => {
    setIsRunning(false);
    if (isLastSeries && !completedExercises.includes(currentExerciseConfig.exerciseId)) {
      setCompletedExercises(prev => [...prev, currentExerciseConfig.exerciseId]);
    }

    if (!isLastSeries) {
      setIsResting(true);
      setTimerSeconds(currentExerciseConfig.descanso || 60);
    } else {
      moveToNextExercise();
    }
  };

  const toggleExerciseCheck = (exerciseId: string) => {
    if (completedExercises.includes(exerciseId)) {
      setCompletedExercises(prev => prev.filter(id => id !== exerciseId));
    } else {
      setCompletedExercises(prev => [...prev, exerciseId]);
    }
  };

  const progressPercent = ((currentExerciseIdx + (currentSeriesIdx / currentExerciseConfig.séries)) / workout.exercícios.length) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/workouts")}
              className="hover:bg-card"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>
              {workout.nome}
            </h1>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Exercício {currentExerciseIdx + 1} de {workout.exercícios.length}
            </p>
            <p className="text-sm font-medium text-muted-foreground">
              Série {currentSeriesIdx + 1} de {currentExerciseConfig.séries}
            </p>
          </div>
          <div className="w-full h-2 bg-card/50 rounded-full overflow-hidden border border-border/30">
            <div
              className="h-full bg-gradient-to-r from-[#00FF88] to-[#00D9FF] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Main Timer Section */}
        <Card className="neon-border p-8 mb-8 text-center">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">{currentExercise?.nome}</h2>
            <p className="text-muted-foreground mb-4">{currentExercise?.descrição}</p>
            {currentExercise?.imagem && (
              <div className="flex justify-center mb-4">
                <img 
                  src={currentExercise.imagem} 
                  alt={currentExercise.nome} 
                  className="rounded-lg max-h-64 object-cover border border-border/50"
                />
              </div>
            )}
          </div>

          {/* Timer Display */}
          <div className="mb-8">
            <div className="text-7xl font-bold font-display tracking-wider mb-4 text-[#00FF88]">
              {formatTime(timerSeconds)}
            </div>
            <p className="text-muted-foreground">
              {isResting ? 'DESCANSO' : currentExerciseConfig.repetições ? `${currentExerciseConfig.repetições} repetições` : `${currentExerciseConfig.tempo}s`}
            </p>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-4 justify-center mb-8">
            <Button
              onClick={() => setIsRunning(!isRunning)}
              className={`gap-2 ${isRunning ? 'bg-[#FF006E] hover:bg-[#FF006E]/90' : 'bg-[#00FF88] hover:bg-[#00FF88]/90'} text-background`}
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Iniciar
                </>
              )}
            </Button>
            <Button
              onClick={() => setTimerSeconds(0)}
              variant="outline"
              className="gap-2 border-[#00D9FF]/50 text-[#00D9FF] hover:bg-[#00D9FF]/10"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              onClick={handleCompleteSet}
              className="gap-2 bg-green-500 hover:bg-green-600 text-white"
            >
              <CheckCircle className="h-4 w-4" />
              Série OK
            </Button>
          </div>

          {/* Skip Button */}
          <Button
            onClick={handleSkipExercise}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            Pular Exercício
          </Button>
        </Card>

        {/* Exercise Details */}
        <Card className="neon-border p-6">
          <h3 className="text-lg font-semibold mb-4">Detalhes do Exercício</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Séries</p>
              <p className="text-2xl font-bold text-[#00FF88]">{currentExerciseConfig.séries}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Repetições</p>
              <p className="text-2xl font-bold text-[#00D9FF]">{currentExerciseConfig.repetições}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Descanso</p>
              <p className="text-2xl font-bold text-[#FF006E]">{currentExerciseConfig.descanso}s</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dificuldade</p>
              <p className="text-2xl font-bold text-[#FFB81C]">{currentExercise?.dificuldade}</p>
            </div>
          </div>
        </Card>

        {/* Exercises Checklist */}
        <Card className="neon-border p-6 mt-8">
          <h3 className="text-lg font-semibold mb-4">Lista de Exercícios</h3>
          <div className="space-y-3">
            {workout.exercícios.map((exConfig, idx) => {
              const exDetails = initialExercises.find(e => e.id === exConfig.exerciseId);
              const isCompleted = completedExercises.includes(exConfig.exerciseId);
              const isCurrent = idx === currentExerciseIdx;
              return (
                <div 
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 cursor-pointer ${
                    isCurrent ? 'border-[#00D9FF] bg-[#00D9FF]/10' : 
                    isCompleted ? 'border-[#00FF88]/50 bg-card' : 'border-border/30 bg-card/50 hover:bg-card'
                  }`}
                  onClick={() => toggleExerciseCheck(exConfig.exerciseId)}
                >
                  <div 
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isCompleted ? 'border-[#00FF88] bg-[#00FF88] text-background' : 'border-muted-foreground'
                    }`}
                  >
                    {isCompleted && <CheckCircle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${isCompleted ? 'text-muted-foreground line-through' : ''}`}>
                      {exDetails?.nome}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {exConfig.séries} séries x {exConfig.repetições ? `${exConfig.repetições} reps` : `${exConfig.tempo}s`}
                    </p>
                  </div>
                  {isCurrent && (
                    <span className="text-xs font-semibold px-2 py-1 bg-[#00D9FF]/20 text-[#00D9FF] rounded">
                      Atual
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Complete Workout Button */}
        {completedExercises.length === workout.exercícios.length && (
          <div className="mt-8 flex justify-center">
            <Button
              onClick={completeWorkout}
              disabled={completeWorkoutMutation.isPending}
              className="gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-6 text-lg"
            >
              {completeWorkoutMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Finalizar Treino
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
