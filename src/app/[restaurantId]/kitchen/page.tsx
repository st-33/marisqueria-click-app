
"use client";

import * as React from 'react';
import { useParams } from 'next/navigation';
import { initialTables, initialMenu } from '@/lib/data';
import type { Table, OrderItem, Menu, MenuItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BackButton } from '@/components/app/BackButton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import useRealtimeData from '@/hooks/useRealtimeData';
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from '@/components/app/ThemeToggle';
import { ConnectionStatus } from '@/components/app/ConnectionStatus';
import { Timer, TriangleAlert } from 'lucide-react';

const KitchenTimer = ({ startTime, timeLimitMinutes }: { startTime: string; timeLimitMinutes?: number }) => {
  const [elapsedTime, setElapsedTime] = React.useState("00:00");
  const [isOverTime, setIsOverTime] = React.useState(false);

  React.useEffect(() => {
    const timer = setInterval(() => {
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      const difference = now - start;

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setElapsedTime(
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );

      if (timeLimitMinutes && minutes >= timeLimitMinutes) {
        setIsOverTime(true);
      } else {
        setIsOverTime(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, timeLimitMinutes]);

  return (
    <div className={cn("flex items-center gap-1 text-sm font-semibold rounded-full px-2 py-0.5 mt-2 w-fit", 
      isOverTime ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
    )}>
      {isOverTime ? <TriangleAlert className="h-4 w-4" /> : <Timer className="h-4 w-4" />}
      <span>{elapsedTime}</span>
    </div>
  );
};


export default function KitchenPage() {
  const { toast } = useToast();
  const params = useParams();
  const restaurantId = params.restaurantId as string;
  
  const handleDbError = React.useCallback((error: Error) => {
    toast({ title: "Error de Conexión", description: error.message, variant: "destructive" });
  }, [toast]);
  
  const [tables, updateTables, tablesLoading, isConnected] = useRealtimeData<Table[]>(restaurantId, 'tables', initialTables, handleDbError);
  const [menu, , menuLoading] = useRealtimeData<Menu>(restaurantId, 'menu', initialMenu, handleDbError);

  const menuItems = React.useMemo(() => {
    if (!menu) return [];
    return [...(menu.platillos || []), ...(menu.bebidas_postres || [])];
  }, [menu]);
  
  const updateOrderItemStatus = async (tableId: number, itemId: string, newStatus: OrderItem['status']) => {
    try {
      await updateTables((currentTables) => {
        const newTables = JSON.parse(JSON.stringify(currentTables || []));
        const tableIndex = newTables.findIndex((t: Table) => t.id === tableId);
        if (tableIndex === -1) return newTables;

        const table = newTables[tableIndex];
        if (!table.order) return newTables;

        const orderItemIndex = table.order.findIndex((item: OrderItem) => item.id === itemId);
        if (orderItemIndex === -1) return newTables;
        
        table.order[orderItemIndex].status = newStatus;
        
        return newTables;
      });
    } catch(error: any) {
      toast({ title: "Error al Actualizar", description: error.message, variant: "destructive" });
    }
  };

  const activeOrders = React.useMemo(() => {
    if (!tables) return [];
    return tables
      .map(table => ({
        ...table,
        order: (table.order || []).filter(item => 
            (item.category ?? 'platillos') === 'platillos' && 
            ['enviada_cocina', 'en_preparacion', 'listo_servir'].includes(item.status)
        ),
      }))
      .filter(table => table.order.length > 0);
    }, [tables]
  );
  
  const orderItemStatusConfig: Record<OrderItem['status'], { text: string, color: string }> = {
    nueva: { text: "Nueva", color: "text-muted-foreground" },
    enviada_cocina: { text: "Recibido", color: "text-accent" },
    en_preparacion: { text: "Preparando", color: "text-primary" },
    listo_servir: { text: "Listo para Servir", color: "text-[hsl(var(--chart-2))]" },
    entregado: { text: "Entregado", color: "text-muted-foreground" },
  };

  if (tablesLoading || menuLoading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg text-foreground">Cargando órdenes...</p>
          </div>
      </div>
    );
  }

  const renderVariants = (variants: string[]) => {
    if (!variants || variants.length === 0) return null;

    const isMixto = variants.some(v => v.startsWith('Prep'));

    if (isMixto) {
      return (
        <div className="text-muted-foreground mt-2 space-y-2">
          {variants.map((variant, index) => {
            const [prep, details] = variant.split(/:\s*/);
            const detailItems = details ? details.split(', ') : [];
            return (
              <div key={index}>
                <p className="font-semibold text-lg">{prep}:</p>
                <ul className="list-disc list-inside pl-4 text-base">
                  {detailItems.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      );
    }

    return (
      <p className="text-lg text-muted-foreground mt-1">
        ({variants.join(', ')})
      </p>
    );
  };

  return (
    <div className="min-h-screen bg-secondary">
      <BackButton />
      <ThemeToggle />
      <main className="p-4 md:p-8">
        <div className="flex justify-center items-center mb-8 relative">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground text-center capitalize">{restaurantId.replace(/-/g, ' ')} - Cocina</h1>
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
             <ConnectionStatus isConnected={isConnected} />
          </div>
        </div>

        {activeOrders.length === 0 ? (
          <div className="text-center text-muted-foreground text-lg py-20">
            No hay platillos pendientes en la cocina.
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-screen-2xl mx-auto pb-8">
              {activeOrders.map(table => (
                <Card key={table.id} className="flex flex-col shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl">Mesa #{table.id}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4 p-6">
                    {table.order.map(item => {
                      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
                      return (
                        <div key={item.id} className="bg-background rounded-lg p-4 shadow-sm">
                          <p className="font-semibold text-2xl text-foreground">{item.qty}x {item.name}</p>
                          {renderVariants(item.variants)}
                           {item.sentToKitchenAt && (
                            <KitchenTimer 
                              startTime={item.sentToKitchenAt} 
                              timeLimitMinutes={menuItem?.prepTimeLimit}
                            />
                          )}
                          <p className="text-md mt-2">
                            Estado: <span className={cn("font-bold", orderItemStatusConfig[item.status]?.color || 'text-gray-500')}>
                              {orderItemStatusConfig[item.status]?.text || item.status}
                            </span>
                          </p>
                          <div className="mt-3 flex space-x-2">
                            {item.status === 'enviada_cocina' && (
                              <Button 
                                className="w-full"
                                variant="secondary"
                                onClick={() => updateOrderItemStatus(table.id, item.id, 'en_preparacion')}
                              >
                                Preparar
                              </Button>
                            )}
                            {item.status === 'en_preparacion' && (
                              <Button 
                                className="w-full bg-[hsl(var(--chart-2))] hover:bg-[hsl(var(--chart-2))]/90 text-primary-foreground"
                                onClick={() => updateOrderItemStatus(table.id, item.id, 'listo_servir')}
                              >
                                Listo para Servir
                              </Button>
                            )}
                            {item.status === 'listo_servir' && (
                               <div className="w-full text-center text-sm py-2 text-muted-foreground font-medium rounded-md bg-gray-100 dark:bg-gray-800">
                                  Esperando entrega
                                </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </main>
    </div>
  );
}
