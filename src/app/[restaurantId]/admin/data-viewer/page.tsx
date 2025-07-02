
"use client";

import * as React from 'react';
import { useParams } from 'next/navigation';
import { initialCompletedOrders } from '@/lib/data';
import type { CompletedOrder } from '@/lib/types';
import useRealtimeData from '@/hooks/useRealtimeData';
import { useToast } from "@/hooks/use-toast";
import { BackButton } from '@/components/app/BackButton';
import { ThemeToggle } from '@/components/app/ThemeToggle';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ServerCrash } from 'lucide-react';

export default function DataViewerPage() {
  const { toast } = useToast();
  const params = useParams();
  const restaurantId = params.restaurantId as string;

  const handleDbError = React.useCallback((error: Error) => {
    toast({ title: "Error de Conexión", description: error.message, variant: "destructive" });
  }, [toast]);
  
  const [completedOrders, , completedOrdersLoading] = useRealtimeData<CompletedOrder[]>(restaurantId, 'completed_orders', initialCompletedOrders, handleDbError);

  if (completedOrdersLoading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-foreground">Cargando historial de órdenes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <BackButton />
      <ThemeToggle />
      <main className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Historial de Órdenes Completadas</CardTitle>
                    <CardDescription>
                        Aquí puedes ver el registro crudo en formato JSON de todas las órdenes que han sido pagadas y cerradas. Este es tu historial de ventas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[calc(100vh-20rem)] bg-gray-900 text-gray-200 rounded-md p-4 font-mono text-sm">
                        <pre>
                            <code>
                                {JSON.stringify(completedOrders, null, 2)}
                            </code>
                        </pre>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
