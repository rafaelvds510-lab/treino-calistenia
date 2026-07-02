/**
 * Exercise Library page with filtering by muscle group and objective
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { ChevronLeft, Filter } from "lucide-react";
import {
  initialExercises,
  MuscleGroup,
  WorkoutObjective,
  DifficultyLevel,
} from "@/lib/data";
import {
  getMuscleGroupLabel,
  getObjectiveLabel,
  getDifficultyLabel,
  muscleGroupColors,
  difficultyColors,
} from "@/lib/utils-calistenia";

export default function ExerciseLibrary() {
  const [, navigate] = useLocation();
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | "all">("all");
  const [selectedObjective, setSelectedObjective] = useState<WorkoutObjective | "all">("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | "all">("all");

  const muscleGroups: MuscleGroup[] = ["peito", "costas", "pernas", "ombros", "core", "braços", "antebraços"];
  const objectives: WorkoutObjective[] = ["resistência", "isometria", "cardio"];
  const difficulties: DifficultyLevel[] = ["iniciante", "intermediário", "avançado", "elite"];

  const filteredExercises = initialExercises.filter(exercise => {
    const matchesMuscle = selectedMuscleGroup === "all" || exercise.grupos_musculares.includes(selectedMuscleGroup);
    const matchesObjective = selectedObjective === "all" || exercise.objetivo === selectedObjective;
    const matchesDifficulty = selectedDifficulty === "all" || exercise.dificuldade === selectedDifficulty;
    return matchesMuscle && matchesObjective && matchesDifficulty;
  });

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
          <h1 className="text-2xl font-bold font-display tracking-wider">EXERCÍCIOS</h1>
        </div>
      </header>

      <div className="container py-8">
        {/* Filters */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-[#00FF88]" />
            <h2 className="text-lg font-semibold">Filtros</h2>
          </div>

          <div className="space-y-4">
            {/* Muscle Groups */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Grupo Muscular</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedMuscleGroup === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMuscleGroup("all")}
                  className={selectedMuscleGroup === "all" ? "bg-[#00FF88] text-background" : "neon-border"}
                >
                  Todos
                </Button>
                {muscleGroups.map(group => (
                  <Button
                    key={group}
                    variant={selectedMuscleGroup === group ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedMuscleGroup(group)}
                    className={selectedMuscleGroup === group ? "bg-[#00FF88] text-background" : "neon-border"}
                  >
                    {getMuscleGroupLabel(group)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Objectives */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Objetivo</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedObjective === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedObjective("all")}
                  className={selectedObjective === "all" ? "bg-[#00FF88] text-background" : "neon-border"}
                >
                  Todos
                </Button>
                {objectives.map(obj => (
                  <Button
                    key={obj}
                    variant={selectedObjective === obj ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedObjective(obj)}
                    className={selectedObjective === obj ? "bg-[#00FF88] text-background" : "neon-border"}
                  >
                    {getObjectiveLabel(obj)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Dificuldade</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedDifficulty === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDifficulty("all")}
                  className={selectedDifficulty === "all" ? "bg-[#00FF88] text-background" : "neon-border"}
                >
                  Todas
                </Button>
                {difficulties.map(diff => (
                  <Button
                    key={diff}
                    variant={selectedDifficulty === diff ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDifficulty(diff)}
                    className={selectedDifficulty === diff ? "bg-[#00FF88] text-background" : "neon-border"}
                  >
                    {getDifficultyLabel(diff)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            {filteredExercises.length} exercício{filteredExercises.length !== 1 ? "s" : ""} encontrado{filteredExercises.length !== 1 ? "s" : ""}
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map(exercise => (
              <Card
                key={exercise.id}
                className="neon-border-hover p-6 transition-all duration-300 hover:bg-card/80"
              >
                {/* Exercise Header */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">{exercise.nome}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{exercise.descrição}</p>
                  {exercise.imagem && (
                    <div className="flex justify-center mb-4">
                      <img 
                        src={exercise.imagem} 
                        alt={exercise.nome} 
                        className="rounded-lg h-32 w-full object-cover border border-border/50"
                      />
                    </div>
                  )}
                </div>

                {/* Muscle Groups */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">GRUPOS MUSCULARES</p>
                  <div className="flex flex-wrap gap-1">
                    {exercise.grupos_musculares.map(group => (
                      <span
                        key={group}
                        className="px-2 py-1 text-xs rounded bg-card/50 border border-border/50"
                        style={{ borderColor: muscleGroupColors[group] + "40" }}
                      >
                        {getMuscleGroupLabel(group)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{getObjectiveLabel(exercise.objetivo)}</span>
                  <span
                    className="px-2 py-1 rounded bg-card/50 border border-border/50"
                    style={{ borderColor: difficultyColors[exercise.dificuldade] + "40" }}
                  >
                    {getDifficultyLabel(exercise.dificuldade)}
                  </span>
                </div>

                {/* Exercise Details */}
                {exercise.repetições_padrão && (
                  <p className="text-xs text-[#00FF88] mt-3">
                    Reps padrão: {exercise.repetições_padrão}
                  </p>
                )}
                {exercise.duração_padrão && (
                  <p className="text-xs text-[#00D9FF] mt-3">
                    Tempo padrão: {exercise.duração_padrão}s
                  </p>
                )}

                {/* Tips */}
                {exercise.dicas && exercise.dicas.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/30">
                    <p className="text-xs font-medium text-muted-foreground mb-2">DICAS</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {exercise.dicas.slice(0, 2).map((tip, idx) => (
                        <li key={idx}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {filteredExercises.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Nenhum exercício encontrado com os filtros selecionados</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedMuscleGroup("all");
                  setSelectedObjective("all");
                  setSelectedDifficulty("all");
                }}
                className="neon-border-hover"
              >
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
