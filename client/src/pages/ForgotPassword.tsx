import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dumbbell } from "lucide-react";
import { toast } from "sonner";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [, setLocation] = useLocation();

  const resetMutation = trpc.auth.requestPasswordReset.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      await resetMutation.mutateAsync({ email });
      setSuccess(true);
      toast.success("Link de recuperação enviado com sucesso!");
    } catch (err: any) {
      const message =
        err?.data?.message ||
        err?.message ||
        "Ocorreu um erro ao processar sua solicitação";
      setError(message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-border/60 bg-card/50 backdrop-blur-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-primary/10 p-3 ring-1 ring-primary/20">
              <Dumbbell className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Recuperar Senha</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Insira o seu e-mail cadastrado e enviaremos um link de redefinição
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="py-2 text-xs">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="py-2 text-xs border-primary/30 bg-primary/5 text-primary">
                <AlertDescription>
                  Se o e-mail informado estiver registrado, você receberá um link para redefinir sua senha em instantes.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="bg-background/50 text-xs py-1.5"
                disabled={success}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            {!success ? (
              <>
                <Button type="submit" className="w-full text-xs font-semibold" disabled={resetMutation.isPending}>
                  {resetMutation.isPending ? "Enviando..." : "Enviar link de recuperação"}
                </Button>
                <div className="text-center text-xs text-muted-foreground">
                  Lembra da sua senha?{" "}
                  <button
                    type="button"
                    onClick={() => setLocation("/login")}
                    className="text-primary hover:underline font-semibold"
                  >
                    Voltar para o Login
                  </button>
                </div>
              </>
            ) : (
              <Button
                type="button"
                onClick={() => setLocation("/login")}
                className="w-full text-xs font-semibold"
              >
                Voltar para o Login
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
