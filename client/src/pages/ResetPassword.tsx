import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dumbbell, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    if (!tokenParam) {
      setError("Token de redefinição ausente ou inválido");
    } else {
      setToken(tokenParam);
    }
  }, []);

  // Redireciona automaticamente para o login após reset bem-sucedido
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setLocation("/login"), 2500);
    return () => clearTimeout(timer);
  }, [success, setLocation]);

  const resetMutation = trpc.auth.resetPassword.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Token inválido");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres");
      return;
    }

    try {
      await resetMutation.mutateAsync({
        token,
        newPassword: password,
      });

      setSuccess(true);
      toast.success("Senha redefinida com sucesso!");
    } catch (err: any) {
      const message =
        err?.data?.message ||
        err?.message ||
        "Token inválido ou expirado";
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
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Nova Senha</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Defina uma nova senha para sua conta
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
                  Sua senha foi atualizada com sucesso! Redirecionando para o login...
                </AlertDescription>
              </Alert>
            )}

            {!success && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={!token}
                      autoComplete="new-password"
                      className="bg-background/50 text-xs py-1.5 pr-9"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="confirmPassword" className="text-xs font-semibold text-muted-foreground">Confirmar Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={!token}
                      autoComplete="new-password"
                      className="bg-background/50 text-xs py-1.5 pr-9"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showConfirmPassword ? "Esconder confirmação" : "Mostrar confirmação"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            {!success ? (
              <Button type="submit" className="w-full text-xs font-semibold" disabled={resetMutation.isPending || !token}>
                {resetMutation.isPending ? "Redefinindo..." : "Redefinir senha"}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => setLocation("/login")}
                className="w-full text-xs font-semibold"
              >
                Ir para o Login
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
