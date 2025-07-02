"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ref, get, child } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function AccessCodePage() {
  const [code, setCode] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isVerifying, setIsVerifying] = React.useState(true);
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    // Check if there's already a restaurantId in localStorage
    const savedRestaurantId = localStorage.getItem('restaurantId');
    if (savedRestaurantId) {
      router.replace(`/${savedRestaurantId}`);
    } else {
      setIsVerifying(false); // No saved ID, stop verifying and show the form
    }
  }, [router]);

  const handleAccess = async () => {
    if (!code.trim()) {
      toast({
        title: "Código Requerido",
        description: "Por favor, ingresa tu código de acceso.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);

    if (!database) {
      toast({
        title: "Error de Conexión",
        description: "No se pudo conectar a la base de datos. Revisa tu conexión.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, `access_codes/${code.trim()}`));

      if (snapshot.exists()) {
        const restaurantId = snapshot.val();
        localStorage.setItem('restaurantId', restaurantId);
        toast({
          title: "Acceso Correcto",
          description: `¡Bienvenido! Redirigiendo a ${restaurantId}...`,
        });
        router.push(`/${restaurantId}`);
      } else {
        toast({
          title: "Código Inválido",
          description: "El código de acceso no es correcto. Por favor, verifica.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error verifying access code:", error);
      toast({
        title: "Error de Verificación",
        description: "Ocurrió un error al verificar el código. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-primary mx-auto" />
          <p className="mt-4 text-lg text-foreground">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary to-blue-800 p-4">
      <Card className="w-full max-w-sm text-center bg-card/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold text-card-foreground">MarisqueriaClick</CardTitle>
          <CardDescription>
            Introduce tu código de acceso para ingresar a tu restaurante.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="text"
            placeholder="CÓDIGO-DE-ACCESO"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyUp={(e) => e.key === 'Enter' && handleAccess()}
            className="text-center font-mono text-lg"
            disabled={isLoading}
          />
          <Button onClick={handleAccess} className="w-full py-6 text-lg" size="lg" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "Entrar"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
