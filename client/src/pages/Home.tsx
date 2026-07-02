/**
 * Home page - Landing and main navigation
 * Dark Performance Lab aesthetic
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Activity, Dumbbell, Calendar, BarChart3, Zap } from "lucide-react";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { UserProfile } from "@/components/UserProfile";

export default function Home() {
  const [, navigate] = useLocation();

  const features = [
    {
      icon: Dumbbell,
      title: "Biblioteca de Exercícios",
      description: "Acesse uma biblioteca completa de exercícios de calistenia com filtros por grupo muscular e objetivo",
      action: () => navigate("/exercises"),
      color: "text-[#00FF88]",
    },
    {
      icon: Activity,
      title: "Criar Treinos",
      description: "Monte seus próprios treinos personalizados combinando exercícios",
      action: () => navigate("/workouts"),
      color: "text-[#00D9FF]",
    },
    {
      icon: Calendar,
      title: "Calendário",
      description: "Organize seus treinos no calendário e acompanhe sua consistência",
      action: () => navigate("/calendar"),
      color: "text-[#FF006E]",
    },
    {
      icon: BarChart3,
      title: "Dashboard",
      description: "Visualize suas estatísticas, streak e progresso em tempo real",
      action: () => navigate("/dashboard"),
      color: "text-[#FFB81C]",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <img 
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663530783232/DiZ8zvcYN3WMpHDLCUkdxN/logo-calistenia-gkfsiZkDZK3F8yabAAPuK3.webp" 
              alt="Calistenia Trainer" 
              className="h-10 w-10"
            />
            <h1 className="text-xl font-bold font-display tracking-wider">CALISTENIA</h1>
          </div>
          <div className="flex items-center gap-4">
            <PWAInstallButton />
            <Button 
              onClick={() => navigate("/dashboard")}
              variant="outline"
              className="neon-border-hover"
            >
              Dashboard
            </Button>
            <UserProfile />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00FF88]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FF006E]/20 rounded-full blur-3xl" />
        </div>

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold font-display tracking-wider mb-6">
              O Cockpit de Treino
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Transforme calistenia em ciência. Controle total, feedback imediato, progresso visível.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button 
                size="lg"
                onClick={() => navigate("/exercises")}
                className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-background font-semibold"
              >
                <Zap className="mr-2 h-5 w-5" />
                Começar Agora
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate("/calendar")}
                className="neon-border-hover"
              >
                Ver Calendário
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative h-96 rounded-xl overflow-hidden border border-border/50 neon-border">
            <img 
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663530783232/DiZ8zvcYN3WMpHDLCUkdxN/hero-dashboard-cmreNzjU9N7gRcWr6vmhVV.webp"
              alt="Dashboard Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-card/30">
        <div className="container">
          <h3 className="text-3xl font-bold font-display tracking-wide mb-12 text-center">
            Funcionalidades
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.title}
                  className="neon-border-hover p-6 cursor-pointer transition-all duration-300 hover:bg-card/80"
                  onClick={feature.action}
                >
                  <div className="flex items-start gap-4">
                    <Icon className={`h-8 w-8 mt-1 flex-shrink-0 ${feature.color}`} />
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-2">{feature.title}</h4>
                      <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container max-w-2xl mx-auto text-center">
          <h3 className="text-3xl font-bold font-display tracking-wide mb-4">
            Pronto para Treinar?
          </h3>
          <p className="text-muted-foreground mb-8">
            Acesse a biblioteca de exercícios e comece sua jornada de calistenia hoje mesmo.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate("/exercises")}
            className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-background font-semibold"
          >
            <Dumbbell className="mr-2 h-5 w-5" />
            Explorar Exercícios
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 bg-card/20">
        <div className="container text-center text-muted-foreground text-sm">
          <p>Calistenia Trainer © 2026 • Discipline. Strength. Freedom.</p>
        </div>
      </footer>
    </div>
  );
}
