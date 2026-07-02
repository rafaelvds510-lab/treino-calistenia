/**
 * Dashboard page with statistics and progress tracking
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ChevronLeft, Flame, Dumbbell, Clock, TrendingUp } from "lucide-react";
import { useScheduledSessions, useUserStats, useStreak } from "@/hooks/useAppState";
import { formatDuration } from "@/lib/utils-calistenia";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { sessions } = useScheduledSessions();
  const { stats } = useUserStats();
  const streak = useStreak(sessions);

  const completedSessions = stats.total_treinos || sessions.filter(s => s.status === 'concluído').length;

  const stats_items = [
    {
      label: "Streak",
      value: streak,
      icon: Flame,
      color: "text-[#FF006E]",
      unit: "dias",
    },
    {
      label: "Treinos",
      value: completedSessions,
      icon: Dumbbell,
      color: "text-[#00FF88]",
      unit: "concluídos",
    },
    {
      label: "Tempo Total",
      value: formatDuration((stats.tempo_total_treino || 0) * 60 * 1000),
      icon: Clock,
      color: "text-[#00D9FF]",
      unit: "",
    },
    {
      label: "Exercícios",
      value: stats.total_exercícios_completados || 0,
      icon: TrendingUp,
      color: "text-[#FFB81C]",
      unit: "completados",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="hover:bg-card"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>DASHBOARD</h1>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats_items.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className="neon-border-hover p-6 relative overflow-hidden"
              >
                <div className="absolute inset-0 opacity-10">
                  <Icon className="h-24 w-24 absolute -right-4 -bottom-4 opacity-20" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>
                      {stat.value}
                    </span>
                    {stat.unit && <span className="text-xs text-muted-foreground">{stat.unit}</span>}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Space Mono', monospace" }}>
            Atividade Recente
          </h2>

          {sessions.length === 0 ? (
            <Card className="neon-border p-8 text-center">
              <p className="text-muted-foreground mb-4">Nenhuma sessão de treino registrada ainda</p>
              <Button
                onClick={() => navigate("/calendar")}
                className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-background font-semibold"
              >
                Agendar Treino
              </Button>
            </Card>
          ) : (
            <div className="space-y-2">
              {sessions
                .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                .slice(0, 5)
                .map(session => (
                  <Card
                    key={session.id}
                    className="neon-border p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{new Date(session.data).toLocaleDateString('pt-BR')}</p>
                      <p className="text-sm text-muted-foreground">
                        Status: <span className={session.status === 'concluído' ? 'text-[#00FF88]' : 'text-muted-foreground'}>
                          {session.status === 'concluído' ? '✓ Concluído' : 'Pendente'}
                        </span>
                      </p>
                    </div>
                  </Card>
                ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Button
            onClick={() => navigate("/exercises")}
            variant="outline"
            className="neon-border-hover p-6 h-auto flex flex-col items-center gap-2"
          >
            <Dumbbell className="h-6 w-6 text-[#00FF88]" />
            <span>Explorar Exercícios</span>
          </Button>

          <Button
            onClick={() => navigate("/calendar")}
            variant="outline"
            className="neon-border-hover p-6 h-auto flex flex-col items-center gap-2"
          >
            <Clock className="h-6 w-6 text-[#00D9FF]" />
            <span>Ver Calendário</span>
          </Button>

          <Button
            onClick={() => navigate("/workouts")}
            variant="outline"
            className="neon-border-hover p-6 h-auto flex flex-col items-center gap-2"
          >
            <TrendingUp className="h-6 w-6 text-[#FF006E]" />
            <span>Criar Treino</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
