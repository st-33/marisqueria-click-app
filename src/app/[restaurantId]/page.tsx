"use client";

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChefHat, Users, Settings, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function RoleSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('restaurantId');
    router.push('/');
  };

  if (!isClient) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary to-blue-800 p-4 w-full">
            <Card className="w-full max-w-sm text-center bg-card/90 backdrop-blur-sm">
                <CardHeader>
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-[68px] w-full" />
                    <Skeleton className="h-[68px] w-full" />
                    <Skeleton className="h-[68px] w-full" />
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary to-blue-800 p-4 w-full">
      <Card className="w-full max-w-sm text-center bg-card/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold text-card-foreground capitalize">{restaurantId.replace(/-/g, ' ')}</CardTitle>
          <CardDescription>
            Selecciona tu rol para comenzar a gestionar el restaurante.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button asChild className="w-full py-8 text-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-transform hover:scale-105" size="lg">
            <Link href={`/${restaurantId}/waiter`}>
              <Users className="mr-3" />
              Mesero
            </Link>
          </Button>
          <Button asChild className="w-full py-8 text-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-transform hover:scale-105" size="lg">
            <Link href={`/${restaurantId}/kitchen`}>
              <ChefHat className="mr-3" />
              Cocina
            </Link>
          </Button>
          <Button asChild className="w-full py-8 text-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-transform hover:scale-105" size="lg">
            <Link href={`/${restaurantId}/admin`}>
              <Settings className="mr-3" />
              Admin
            </Link>
          </Button>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Cambiar de Restaurante
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
