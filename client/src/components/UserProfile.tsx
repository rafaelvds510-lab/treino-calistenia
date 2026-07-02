import React, { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Dumbbell, Edit2, Check, X, LogIn, User as UserIcon, Settings } from "lucide-react";
import { useLocation } from "wouter";
import { initialWorkouts, getWorkoutById } from "@/lib/data";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function UserProfile() {
  const { user, logout, refresh } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingWorkout, setIsEditingWorkout] = useState(false);
  const [, setLocation] = useLocation();

  // Fetch custom templates to check the active workout name
  const listTemplatesQuery = trpc.workouts.listTemplates.useQuery(undefined, {
    enabled: !!user,
  });

  const customWorkouts = listTemplatesQuery.data || [];

  const updateProfileMutation = trpc.users.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Treino atualizado com sucesso!");
      setIsEditingWorkout(false);
      refresh();
    },
    onError: () => {
      toast.error("Falha ao atualizar o treino.");
    }
  });

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  // Find current workout from static or custom templates
  const getCurrentWorkout = () => {
    if (!user?.currentWorkoutId) return null;
    const staticW = getWorkoutById(user.currentWorkoutId);
    if (staticW) return staticW;

    const customW = customWorkouts.find(w => String(w.id) === user.currentWorkoutId);
    if (customW) {
      return {
        id: String(customW.id),
        nome: customW.nome,
      };
    }
    return null;
  };

  const currentWorkout = getCurrentWorkout();

  const handleSelectWorkout = (workoutId: string) => {
    updateProfileMutation.mutate({ currentWorkoutId: workoutId });
  };

  // Merge static workouts and custom workouts for the selection list
  const allSelectionWorkouts = [
    ...initialWorkouts.map(w => ({ id: w.id, nome: w.nome })),
    ...customWorkouts.map(w => ({ id: String(w.id), nome: w.nome + " ✦" }))
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none"
      >
        <Avatar className="h-9 w-9 ring-2 ring-primary/30 hover:ring-primary/80 transition-all cursor-pointer">
          {user?.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt={user.name || "User"} />
          ) : null}
          <AvatarFallback className="bg-muted text-foreground text-xs font-bold">
            {user ? getInitials(user.name) : <UserIcon className="h-4 w-4 text-muted-foreground" />}
          </AvatarFallback>
        </Avatar>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false);
              setIsEditingWorkout(false);
            }}
          />
          <div className="absolute right-0 mt-2 w-66 rounded-xl shadow-lg bg-card border border-border/80 text-card-foreground p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header: Photo and Name */}
            <div className="flex items-center gap-3 px-2 py-2 mb-2 border-b border-border/50">
              <Avatar className="h-10 w-10">
                {user?.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.name || "User"} />
                ) : null}
                <AvatarFallback className="bg-muted text-foreground font-bold">
                  {user ? getInitials(user.name) : <UserIcon className="h-5 w-5 text-muted-foreground" />}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate text-foreground">
                  {user ? (user.name || "Usuário") : "Visitante"}
                </p>
                <p className="text-xs truncate text-muted-foreground">
                  {user ? user.email : "Entre para salvar progresso"}
                </p>
              </div>
            </div>

            {/* Current Workout Section */}
            <div className="px-2 py-2 mb-2 border-b border-border/50">
              {user ? (
                !isEditingWorkout ? (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                        <Dumbbell className="h-3 w-3" /> Meu Treino Atual
                      </p>
                      <button 
                        onClick={() => setIsEditingWorkout(true)}
                        className="text-primary hover:text-primary/80"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="text-sm font-medium text-[#00FF88] truncate mt-1">
                      {currentWorkout ? currentWorkout.nome : "Nenhum treino selecionado"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase">Selecionar Treino</p>
                      <button 
                        onClick={() => setIsEditingWorkout(false)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-1 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                      {allSelectionWorkouts.map((workout) => (
                        <button
                          key={workout.id}
                          disabled={updateProfileMutation.isPending}
                          onClick={() => handleSelectWorkout(workout.id)}
                          className={`w-full flex items-center justify-between px-2 py-1.5 text-xs rounded-md transition-colors text-left ${user.currentWorkoutId === workout.id ? 'bg-primary/20 text-primary' : 'hover:bg-muted/50 text-foreground'}`}
                        >
                          <span className="truncate">{workout.nome}</span>
                          {user.currentWorkoutId === workout.id && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              ) : (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1 mb-1">
                    <Dumbbell className="h-3 w-3" /> Treino Atual
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Faça login para selecionar e montar seus treinos.
                  </p>
                </div>
              )}
            </div>

            {/* Footer actions */}
            {user ? (
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setLocation("/workouts");
                  }}
                  className="w-full flex items-center gap-2 px-2 py-2 text-sm text-foreground hover:bg-muted/50 rounded-md transition-colors text-left font-medium"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  Gerenciar Treinos
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-muted/50 rounded-md transition-colors text-left font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsOpen(false);
                  setLocation("/login");
                }}
                className="w-full flex items-center gap-2 px-2 py-2 text-sm text-primary hover:text-primary/80 hover:bg-muted/50 rounded-md transition-colors text-left font-medium"
              >
                <LogIn className="h-4 w-4" />
                Entrar
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
