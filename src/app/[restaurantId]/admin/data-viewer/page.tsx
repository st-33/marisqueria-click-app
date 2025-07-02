
"use client";

import * as React from 'react';
import { useParams } from 'next/navigation';
import { initialCompletedOrders } from '@/lib/data';
import type { CompletedOrder, OrderItem } from '@/lib/types';
import useRealtimeData from '@/hooks/useRealtimeData';
import { useToast } from "@/hooks/use-toast";
import { BackButton } from '@/components/app/BackButton';
import { ThemeToggle } from '@/components/app/ThemeToggle';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ServerCrash, Receipt } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
  
  const sortedOrders = React.useMemo(() => {
    if (!completedOrders || !Array.isArray(completedOrders)) return [];
    return [...completedOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [completedOrders]);

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
                        Aquí puedes ver el registro de todas las órdenes que han sido pagadas y cerradas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {sortedOrders.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                           {sortedOrders.map((order) => (
                               <AccordionItem value={order.id} key={order.id}>
                                   <AccordionTrigger>
                                       <div className="flex justify-between w-full pr-4">
                                           <div className="text-left">
                                               <span className="font-bold">Mesa #{order.tableId}</span>
                                               <span className="text-muted-foreground text-sm ml-4">{format(new Date(order.date), "dd MMM yyyy, h:mm a", { locale: es })}</span>
                                           </div>
                                           <span className="font-bold text-primary">${order.total.toFixed(2)}</span>
                                       </div>
                                   </AccordionTrigger>
                                   <AccordionContent>
                                       <Table>
                                           <TableHeader>
                                               <TableRow>
                                                   <TableHead className="w-[50px]">Cant.</TableHead>
                                                   <TableHead>Producto</TableHead>
                                                   <TableHead className="text-right">Precio</TableHead>
                                               </TableRow>
                                           </TableHeader>
                                           <TableBody>
                                               {order.order.map((item: OrderItem) => (
                                                   <TableRow key={item.id}>
                                                       <TableCell>{item.qty}</TableCell>
                                                       <TableCell>
                                                          {item.name}
                                                          {item.variants && item.variants.length > 0 && (
                                                            <span className="text-xs text-muted-foreground ml-2">({item.variants.join(', ')})</span>
                                                          )}
                                                       </TableCell>
                                                       <TableCell className="text-right">${(item.price * item.qty).toFixed(2)}</TableCell>
                                                   </TableRow>
                                               ))}
                                           </TableBody>
                                       </Table>
                                   </AccordionContent>
                               </AccordionItem>
                           ))}
                        </Accordion>
                    ) : (
                       <div className="text-center py-16 text-muted-foreground">
                            <Receipt className="mx-auto h-12 w-12 mb-4" />
                            <h3 className="text-xl font-semibold">Sin Órdenes</h3>
                            <p>Aún no se ha completado ninguna orden.</p>
                       </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}

    