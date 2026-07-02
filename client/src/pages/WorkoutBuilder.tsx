/**
 * Workout Builder page - Create and manage custom workouts
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { ChevronLeft, Plus, Trash2, ArrowLeft, Save, Dumbbell, Edit2 } from "lucide-react";
import { initialWorkouts, initialExercises, Workout, WorkoutExercise } from "@/lib/data";
import { getObjectiveLabel, formatDuration } from "@/lib/utils-calistenia";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

export default function WorkoutBuilder() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [view, setView] = useState<"list" | "form">("list");
  const [editingWorkout, setEditingWorkout] = useState<Partial<Workout> | null>(null);

  // Form states
  const [nome, setNome] = useState("");
  const [descriçao, setDescriçao] = useState("");
  const [objetivo, setObjetivo] = useState<"resistência" | "isometria" | "cardio">("resistência");
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>([]);

  // Fetch custom workouts from DB
  const listQuery = trpc.workouts.listTemplates.useQuery(undefined, {
    enabled: !!user,
  });

  const createMutation = trpc.workouts.createTemplate.useMutation({
    onSuccess: () => {
      toast.success("Treino criado com sucesso!");
      utils.workouts.listTemplates.invalidate();
      setView("list");
      resetForm();
    },
    onError: () => toast.error("Erro ao criar treino."),
  });

  const updateMutation = trpc.workouts.updateTemplate.useMutation({
    onSuccess: () => {
      toast.success("Treino atualizado com sucesso!");
      utils.workouts.listTemplates.invalidate();
      setView("list");
      resetForm();
    },
    onError: () => toast.error("Erro ao atualizar treino."),
  });

  const deleteMutation = trpc.workouts.deleteTemplate.useMutation({
    onSuccess: () => {
      toast.success("Treino excluído com sucesso!");
      utils.workouts.listTemplates.invalidate();
    },
    onError: () => toast.error("Erro ao excluir treino."),
  });

  const resetForm = () => {
    setNome("");
    setDescriçao("");
    setObjetivo("resistência");
    setSelectedExercises([]);
    setEditingWorkout(null);
  };

  // Merge static and custom workouts
  const customWorkouts: Workout[] = (listQuery.data || []).map((w) => ({
    id: String(w.id),
    nome: w.nome,
    descrição: w.descrição || "",
    objetivo: w.objetivo as any,
    grupos_musculares_foco: w.gruposMuscularesFoco as any,
    exercícios: w.exercicios as any,
    duração_estimada: w.duraçãoEstimada,
    isCustom: true,
  }));

  const allWorkouts = [...initialWorkouts, ...customWorkouts];

  const handleCreateNew = () => {
    if (!user) {
      toast.error("Você precisa estar logado para criar treinos personalizados!");
      navigate("/login");
      return;
    }
    resetForm();
    setView("form");
  };

  const handleEdit = (workout: Workout) => {
    setEditingWorkout(workout);
    setNome(workout.nome);
    setDescriçao(workout.descrição);
    setObjetivo(workout.objetivo);
    setSelectedExercises(workout.exercícios);
    setView("form");
  };

  const handleDelete = (id: string, isCustom?: boolean) => {
    if (!isCustom) {
      toast.error("Treinos do sistema não podem ser excluídos!");
      return;
    }
    if (confirm("Deseja realmente excluir este treino?")) {
      deleteMutation.mutate({ id: parseInt(id, 10) });
    }
  };

  const handleAddExercise = (exerciseId: string) => {
    const defaultEx = initialExercises.find((e) => e.id === exerciseId);
    if (!defaultEx) return;

    setSelectedExercises((prev) => [
      ...prev,
      {
        exerciseId,
        séries: 3,
        repetições: defaultEx.repetições_padrão || 10,
        tempo: defaultEx.duração_padrão || undefined,
        descanso: 60,
      },
    ]);
  };

  const handleUpdateExerciseField = (index: number, field: keyof WorkoutExercise, value: number) => {
    setSelectedExercises((prev) =>
      prev.map((ex, idx) => (idx === index ? { ...ex, [field]: value || undefined } : ex))
    );
  };

  const handleRemoveExercise = (index: number) => {
    setSelectedExercises((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome) {
      toast.error("O nome do treino é obrigatório!");
      return;
    }
    if (selectedExercises.length === 0) {
      toast.error("Adicione pelo menos um exercício ao treino!");
      return;
    }

    // Determine focused muscle groups based on exercises
    const focusGroups = Array.from(
      new Set(
        selectedExercises.flatMap((se) => {
          const ex = initialExercises.find((e) => e.id === se.exerciseId);
          return ex ? ex.grupos_musculares : [];
        })
      )
    );

    // Calculate dynamic estimated duration: ~5 minutes per exercise series + resting times
    const totalMinutes = Math.max(
      10,
      Math.round(
        selectedExercises.reduce((acc, curr) => {
          const exerciseTime = curr.tempo ? curr.tempo * curr.séries : 40 * (curr.repetições || 10) * curr.séries;
          const restTime = (curr.descanso || 60) * (curr.séries - 1);
          return acc + (exerciseTime + restTime) / 60;
        }, 0)
      )
    );

    const payload = {
      nome,
      descrição: descriçao,
      objetivo,
      gruposMuscularesFoco: focusGroups,
      exercicios: selectedExercises,
      duraçãoEstimada: totalMinutes,
    };

    if (editingWorkout?.id && editingWorkout.isCustom && !isNaN(parseInt(editingWorkout.id, 10))) {
      updateMutation.mutate({
        id: parseInt(editingWorkout.id, 10),
        ...payload,
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (view === "form" ? setView("list") : navigate("/"))}
              className="hover:bg-card"
            >
              {view === "form" ? <ArrowLeft className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
            <h1 className="text-2xl font-bold font-display tracking-wider">
              {view === "form" ? (editingWorkout ? "AJUSTAR TREINO" : "NOVO TREINO") : "TREINOS"}
            </h1>
          </div>
          {view === "list" && (
            <Button
              onClick={handleCreateNew}
              className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-background font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Treino
            </Button>
          )}
        </div>
      </header>

      <div className="container py-8 max-w-4xl">
        {view === "list" ? (
          <div className="space-y-4">
            {allWorkouts.map((workout) => (
              <Card
                key={workout.id}
                className={`neon-border-hover p-6 transition-all duration-300 hover:bg-card/80 ${
                  workout.isCustom ? "border-primary/40 bg-primary/5" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold">{workout.nome}</h3>
                      {workout.isCustom && (
                        <span className="px-2 py-0.5 text-[10px] bg-primary/20 text-primary border border-primary/30 rounded font-semibold">
                          PERSONALIZADO
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">{workout.descrição}</p>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-3 text-xs">
                      <span className="px-2 py-1 bg-card/50 border border-border/50 rounded capitalize">
                        {getObjectiveLabel(workout.objetivo)}
                      </span>
                      <span className="px-2 py-1 bg-card/50 border border-border/50 rounded">
                        {formatDuration(workout.duração_estimada * 60 * 1000)}
                      </span>
                      <span className="px-2 py-1 bg-card/50 border border-border/50 rounded text-[#00FF88]">
                        {workout.exercícios.length} exercício{workout.exercícios.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(workout)}
                      className="text-primary hover:bg-primary/10"
                      title={workout.isCustom ? "Editar Treino" : "Clonar como Personalizado"}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {workout.isCustom && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(workout.id, workout.isCustom)}
                        className="text-[#FF006E] hover:bg-[#FF006E]/10"
                        title="Excluir Treino"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Exercises List */}
                <div className="mt-4 pt-4 border-t border-border/30">
                  <p className="text-xs font-medium text-muted-foreground mb-3 tracking-wide">EXERCÍCIOS</p>
                  <div className="space-y-2">
                    {workout.exercícios.map((ex, idx) => {
                      const exercise = initialExercises.find((e) => e.id === ex.exerciseId);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm p-2 bg-card/30 rounded border border-border/30"
                        >
                          <span className="font-medium">{exercise?.nome}</span>
                          <span className="text-muted-foreground text-xs">
                            {ex.séries}x {ex.repetições ? `${ex.repetições} reps` : ex.tempo ? `${ex.tempo}s` : ""}{" "}
                            (Descanso: {ex.descanso}s)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-2">
                  <Button
                    onClick={() => navigate("/calendar")}
                    className="flex-1 bg-[#00FF88] hover:bg-[#00FF88]/90 text-background font-semibold"
                  >
                    Agendar Treino
                  </Button>
                  <Button
                    onClick={() => navigate("/active/" + workout.id)}
                    variant="outline"
                    className="flex-1 neon-border-hover"
                  >
                    Iniciar Agora
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome do Treino</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Treino de Peito Avançado"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="descriçao">Descrição</Label>
                <Input
                  id="descriçao"
                  placeholder="Ex: Focado em hipertrofia e resistência de braços"
                  value={descriçao}
                  onChange={(e) => setDescriçao(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="objetivo">Objetivo</Label>
                  <select
                    id="objetivo"
                    value={objetivo}
                    onChange={(e) => setObjetivo(e.target.value as any)}
                    className="w-full mt-1 bg-card border border-border p-2 rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="resistência">Resistência</option>
                    <option value="isometria">Isometria</option>
                    <option value="cardio">Cardio</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Exercises Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-primary" /> Exercícios do Treino
                </h3>
              </div>

              {selectedExercises.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-border rounded-lg bg-card/25">
                  <p className="text-muted-foreground text-sm">Nenhum exercício adicionado ainda.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedExercises.map((ex, index) => {
                    const exerciseInfo = initialExercises.find((e) => e.id === ex.exerciseId);
                    const isIsometric = exerciseInfo?.objetivo === "isometria";

                    return (
                      <Card key={index} className="p-4 bg-card/60 relative">
                        <div className="flex items-center justify-between mb-3 pr-8">
                          <h4 className="font-bold text-sm text-foreground">{exerciseInfo?.nome}</h4>
                          <button
                            type="button"
                            onClick={() => handleRemoveExercise(index)}
                            className="absolute top-4 right-4 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div>
                            <Label className="text-[10px] text-muted-foreground">Séries</Label>
                            <Input
                              type="number"
                              min="1"
                              value={ex.séries}
                              onChange={(e) => handleUpdateExerciseField(index, "séries", parseInt(e.target.value, 10))}
                              className="mt-1 py-1 h-8"
                            />
                          </div>

                          {isIsometric ? (
                            <div>
                              <Label className="text-[10px] text-muted-foreground">Tempo (s)</Label>
                              <Input
                                type="number"
                                min="1"
                                value={ex.tempo || 30}
                                onChange={(e) => handleUpdateExerciseField(index, "tempo", parseInt(e.target.value, 10))}
                                className="mt-1 py-1 h-8"
                              />
                            </div>
                          ) : (
                            <div>
                              <Label className="text-[10px] text-muted-foreground">Repetições</Label>
                              <Input
                                type="number"
                                min="1"
                                value={ex.repetições || 10}
                                onChange={(e) => handleUpdateExerciseField(index, "repetições", parseInt(e.target.value, 10))}
                                className="mt-1 py-1 h-8"
                              />
                            </div>
                          )}

                          <div>
                            <Label className="text-[10px] text-muted-foreground">Descanso (s)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={ex.descanso || 60}
                              onChange={(e) => handleUpdateExerciseField(index, "descanso", parseInt(e.target.value, 10))}
                              className="mt-1 py-1 h-8"
                            />
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Add Exercise Trigger */}
              <div className="space-y-1">
                <Label>Adicionar Exercício</Label>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddExercise(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="w-full bg-card border border-border p-2 rounded-md text-sm text-foreground focus:outline-none"
                >
                  <option value="" disabled>Escolha um exercício para adicionar...</option>
                  {initialExercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.nome} ({ex.grupos_musculares.join(", ")})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setView("list");
                  resetForm();
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 bg-[#00FF88] hover:bg-[#00FF88]/90 text-background font-semibold"
              >
                <Save className="h-4 w-4 mr-2" />
                Salvar Treino
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function EditIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
