
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChefHat, Users, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function RoleSelection() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary to-blue-800 p-4 w-full">
      <Card className="w-full max-w-sm text-center bg-card/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold text-card-foreground">MarisqueriaClick</CardTitle>
          <CardDescription>
            Selecciona tu rol para comenzar a gestionar el restaurante.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button asChild className="w-full py-8 text-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-transform hover:scale-105" size="lg">
            <Link href="/waiter">
              <Users className="mr-3" />
              Mesero
            </Link>
          </Button>
          <Button asChild className="w-full py-8 text-lg bg-accent text-accent-foreground hover:bg-accent/90 transition-transform hover:scale-105" size="lg">
            <Link href="/kitchen">
              <ChefHat className="mr-3" />
              Cocina
            </Link>
          </Button>
          <Button asChild className="w-full py-8 text-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-transform hover:scale-105" size="lg">
            <Link href="/admin">
              <Settings className="mr-3" />
              Admin
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
