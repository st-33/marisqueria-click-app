
"use client";

import * as React from 'react';
import type { Table, OrderItem, MenuItem, TableStatus, Menu, CompletedOrder, OrderItemStatus, InventoryItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Send, Receipt, Check, Trash2, ChefHat, Pencil, Mic, Loader2, Package, Timer as TimerIcon, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MenuModal } from '@/components/app/MenuModal';
import { AccountModal } from '@/components/app/AccountModal';
import { BackButton } from '@/components/app/BackButton';
import { ScrollArea } from '@/components/ui/scroll-area';
import useRealtimeData from '@/hooks/useRealtimeData';
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/app/ThemeToggle';
import { ConnectionStatus } from '@/components/app/ConnectionStatus';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { initialMenu, initialCompletedOrders, initialTables, initialInventory } from '@/lib/data';
import { useParams } from 'next/navigation';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import type { ParseVoiceOrderOutput } from '@/ai/flows/parse-voice-order';

const tableStatusConfig: Record<TableStatus, { color: string; text: string }> = {
  libre: { color: 'bg-[hsl(var(--chart-2))] hover:bg-[hsl(var(--chart-2))]/90', text: 'Libre' },
  ocupada: { color: 'bg-destructive hover:bg-destructive/90', text: 'Ocupada' },
  esperando_cuenta: { color: 'bg-accent hover:bg-accent/90', text: 'Cuenta' },
};

const TableTimer = ({ startTime }: { startTime: string }) => {
  const [elapsedTime, setElapsedTime] = React.useState("00:00");

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
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  return (
    <div className="absolute bottom-0.5 right-0.5 flex items-center gap-1 text-xs bg-black/50 text-white rounded-bl-md rounded-tr-md px-1 py-0.5">
      <TimerIcon className="h-3 w-3" />
      {elapsedTime}
    </div>
  );
};

export default function WaiterPage() {
  const { toast } = useToast();
  const params = useParams();
  const restaurantId = params.restaurantId as string;

  const handleDbError = React.useCallback((error: Error) => {
    toast({ title: "Error de Conexión", description: error.message, variant: "destructive" });
  }, [toast]);
  
  const [tables, updateTables, tablesLoading, isConnected] = useRealtimeData<Table[]>(restaurantId, 'tables', initialTables, handleDbError);
  const [menu, , menuLoading] = useRealtimeData<Menu>(restaurantId, 'menu', initialMenu, handleDbError);
  const [ , updateCompletedOrders] = useRealtimeData<CompletedOrder[]>(restaurantId, 'completed_orders', initialCompletedOrders, handleDbError);
  const [inventory, updateInventory, inventoryLoading] = useRealtimeData<InventoryItem[]>(restaurantId, 'inventory', initialInventory, handleDbError);
  
  const [selectedTableId, setSelectedTableId] = React.useState<number | null>(null);
  const [isMenuModalOpen, setMenuModalOpen] = React.useState(false);
  const [isAccountModalOpen, setAccountModalOpen] = React.useState(false);
  const [itemToEditPrice, setItemToEditPrice] = React.useState<OrderItem | null>(null);
  const [newPrice, setNewPrice] = React.useState<string>("");
  
  const [isVoiceModalOpen, setVoiceModalOpen] = React.useState(false);
  const [voiceOrderItems, setVoiceOrderItems] = React.useState<ParseVoiceOrderOutput['items']>([]);

  const { isListening, isProcessing, transcript, startListening, stopListening } = useVoiceRecognition({
    menu,
    onParseComplete: setVoiceOrderItems,
    onError: (title, description) => toast({ title, description, variant: 'destructive' }),
  });

  const selectedTable = React.useMemo(() => tables?.find(t => t.id === selectedTableId), [tables, selectedTableId]);
  
  const menuItems = React.useMemo(() => {
    if (!menu) return [];
    return [...(menu.platillos || []), ...(menu.bebidas_postres || [])];
  }, [menu]);

  const statusOrder: OrderItemStatus[] = ['listo_servir', 'nueva', 'en_preparacion', 'enviada_cocina', 'entregado'];
  const statusLabels: Record<OrderItemStatus, string> = {
    listo_servir: 'Listo para Entregar',
    nueva: 'Nuevos en Comanda',
    en_preparacion: 'En Preparación',
    enviada_cocina: 'Enviado a Cocina',
    entregado: 'Ya Entregados'
  };

  const groupedOrder = React.useMemo(() => {
    if (!selectedTable?.order) return {};
    return (selectedTable.order || []).reduce((acc, item) => {
      const status = item.status;
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(item);
      return acc;
    }, {} as Record<OrderItemStatus, OrderItem[]>);
  }, [selectedTable?.order]);
  
  const calculateOrderTotal = React.useCallback(() => {
    if (!selectedTable) return 0;
    return (selectedTable.order || []).reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [selectedTable]);

  const handleTableSelect = (tableId: number) => {
    setSelectedTableId(tableId);
    const table = tables?.find(t => t.id === tableId);
    if (table?.status === 'libre' && (table.order || []).length === 0) {
      setMenuModalOpen(true);
    }
  };
  
  const addOrderItem = async (item: Omit<OrderItem, 'id' | 'status' | 'sentToKitchenAt'>, silent = false) => {
    if (!selectedTableId) return;

    if (item.price === 0) {
        toast({
            title: "Precio Requerido",
            description: `Por favor, establece el precio para "${item.name}" usando el ícono del lápiz.`,
            variant: "destructive",
        });
        return;
    }

    const newOrderItem: OrderItem = {
      ...item,
      id: `${item.name.replace(/\s/g, '-')}-${Date.now()}`,
      status: 'nueva',
    };

    try {
      await updateTables(currentTables => {
        const newTables = JSON.parse(JSON.stringify(currentTables || []));
        const tableIndex = newTables.findIndex((t: Table) => t.id === selectedTableId);
        if (tableIndex === -1) return newTables;
        
        const table = newTables[tableIndex];
        if (!table.order) table.order = [];
        table.order.push(newOrderItem);
        
        if (table.status === 'libre' && table.id !== 99) {
          table.status = 'ocupada';
          table.occupiedAt = new Date().toISOString();
        }

        return newTables;
      });

      if (!silent && item.price > 0) {
        toast({ title: "Producto Agregado", description: `${item.qty}x ${item.name} añadido a la mesa #${selectedTableId}.` });
      }
      setMenuModalOpen(false);

    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };
  
  const removeOrderItem = async (itemId: string) => {
    if (!selectedTableId) return;

    const table = tables?.find(t => t.id === selectedTableId);
    const item = table?.order?.find(i => i.id === itemId);

    if (item && item.status !== 'nueva') {
        toast({
            title: "Acción no permitida",
            description: "No se puede eliminar un producto que ya fue enviado a cocina o entregado.",
            variant: "destructive",
        });
        return;
    }

    try {
      await updateTables((currentTables) => {
        const newTables = JSON.parse(JSON.stringify(currentTables || []));
        const tableIndex = newTables.findIndex((t: Table) => t.id === selectedTableId);
        if (tableIndex === -1) return newTables;

        const tableToUpdate = newTables[tableIndex];
        tableToUpdate.order = (tableToUpdate.order || []).filter((i: OrderItem) => i.id !== itemId);
        
        if (tableToUpdate.order.length === 0 && tableToUpdate.status !== 'esperando_cuenta' && tableToUpdate.id !== 99) {
          tableToUpdate.status = 'libre';
          delete tableToUpdate.occupiedAt;
        }
        
        return newTables;
      });
      toast({ title: "Producto Eliminado", description: "El producto ha sido eliminado de la comanda." });
    } catch(error: any) {
       toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const updateOrderItemStatus = async (tableId: number, itemId: string, newStatus: OrderItem['status']) => {
    try {
      await updateTables((currentTables) => {
        const newTables = JSON.parse(JSON.stringify(currentTables || []));
        const tableIndex = newTables.findIndex((t: Table) => t.id === tableId);
        if (tableIndex === -1) return newTables;
        
        const order = newTables[tableIndex].order || [];
        const orderItemIndex = order.findIndex((i: OrderItem) => i.id === itemId);
        if (orderItemIndex === -1) return newTables;

        newTables[tableIndex].order[orderItemIndex].status = newStatus;
        return newTables;
      });
      toast({ title: "Producto Entregado", description: "El estado del producto ha sido actualizado." });
    } catch (error: any) {
       toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const sendOrderToKitchen = async () => {
    if (!selectedTableId) return;
    
    const table = tables?.find(t => t.id === selectedTableId);
    const itemsToSend = (table?.order || []).filter(item => item.status === 'nueva' && (item.category ?? 'platillos') === 'platillos');

    if (itemsToSend.some(item => item.price === 0)) {
        toast({
            title: "Acción no permitida",
            description: "Hay platillos con precio sin definir. Por favor, establece todos los precios antes de enviar a cocina.",
            variant: "destructive",
        });
        return;
    }

    if (itemsToSend.length > 0) {
        try {
          await updateTables((currentTables) => {
            const newTables = JSON.parse(JSON.stringify(currentTables || []));
            const tableIndex = newTables.findIndex((t: Table) => t.id === selectedTableId);
            if (tableIndex === -1) return newTables;

            const order = newTables[tableIndex].order || [];
            order.forEach((item: OrderItem) => {
                if (item.status === 'nueva' && (item.category ?? 'platillos') === 'platillos') {
                    item.status = 'enviada_cocina';
                    item.sentToKitchenAt = new Date().toISOString();
                }
            });
            newTables[tableIndex].order = order;
            return newTables;
          });
          toast({
              title: "Orden Enviada",
              description: `${itemsToSend.length} platillo(s) nuevo(s) han sido enviados a la cocina.`,
          });
        } catch (error: any) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    } else {
        toast({
            title: "Sin platillos nuevos",
            description: "No hay platillos nuevos en la comanda para enviar a cocina.",
        });
    }
  };

  const requestBill = async () => {
    if (!selectedTableId || !selectedTable || (selectedTable.order || []).length === 0) return;

    if ((selectedTable.order || []).some(item => item.price === 0)) {
        toast({
            title: "Acción no permitida",
            description: "No se puede pedir la cuenta si hay productos con precio sin definir.",
            variant: "destructive",
        });
        return;
    }

    const hasUnsentItems = (selectedTable.order || []).some(item => item.status === 'nueva' && (item.category ?? 'platillos') === 'platillos');
    if (hasUnsentItems) {
      toast({
        title: "Acción no permitida",
        description: "No se puede pedir la cuenta si hay platillos nuevos sin enviar a cocina.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateTables(currentTables => {
        const newTables = JSON.parse(JSON.stringify(currentTables || []));
        const tableIndex = newTables.findIndex((t: Table) => t.id === selectedTableId);
        if (tableIndex !== -1 && newTables[tableIndex].id !== 99) {
            newTables[tableIndex].status = 'esperando_cuenta';
        }
        return newTables;
      });
      setAccountModalOpen(true);
    } catch(error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const markAsPaid = async () => {
    if (!selectedTableId || !selectedTable) return;

    const inventoryDeductions = new Map<string, number>();
    (selectedTable.order || []).forEach(orderItem => {
      const menuItem = menuItems.find(mi => mi.id === orderItem.menuItemId);
      if (menuItem?.recipe) {
        menuItem.recipe.forEach(ingredient => {
          const currentDeduction = inventoryDeductions.get(ingredient.inventoryItemId) || 0;
          inventoryDeductions.set(
            ingredient.inventoryItemId,
            currentDeduction + (ingredient.amount * orderItem.qty)
          );
        });
      }
    });

    try {
      const newCompletedOrder: CompletedOrder = {
        id: `order-${Date.now()}-${selectedTableId}`,
        tableId: selectedTable.id,
        order: selectedTable.order || [],
        total: calculateOrderTotal(),
        date: new Date().toISOString(),
      };
      await updateCompletedOrders(currentOrders => {
         const newOrders = Array.isArray(currentOrders) ? [...currentOrders] : [];
         newOrders.push(newCompletedOrder);
         return newOrders;
      });

      await updateTables(currentTables => {
        const newTables = JSON.parse(JSON.stringify(currentTables || []));
        const tableIndex = newTables.findIndex((t: Table) => t.id === selectedTableId);
        if (tableIndex !== -1) {
          newTables[tableIndex].status = 'libre';
          newTables[tableIndex].order = [];
          delete newTables[tableIndex].occupiedAt;
        }
        return newTables;
      });

      if (inventoryDeductions.size > 0) {
        await updateInventory(currentInventory => {
          const newInventory = JSON.parse(JSON.stringify(currentInventory || []));
          newInventory.forEach((invItem: InventoryItem) => {
            if (inventoryDeductions.has(invItem.id)) {
              invItem.stock -= inventoryDeductions.get(invItem.id)!;
            }
          });
          return newInventory;
        });
      }

      setAccountModalOpen(false);
      setSelectedTableId(null);
      
      const toastDescription = inventoryDeductions.size > 0
        ? "La mesa ha sido liberada y el inventario actualizado."
        : "La mesa ha sido liberada. No había items con receta para descontar del inventario.";
      
      toast({ title: `Mesa #${newCompletedOrder.tableId} Pagada`, description: toastDescription });

    } catch (error: any) {
      toast({ title: "Error al Pagar", description: error.message, variant: "destructive" });
    }
  };
  
  const handleOpenEditPriceModal = (item: OrderItem) => {
    setItemToEditPrice(item);
    setNewPrice(item.price > 0 ? item.price.toString() : "");
  };
  
  const handleUpdatePrice = async () => {
    if (!itemToEditPrice || !selectedTableId) return;
    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) {
        toast({ title: "Precio inválido", description: "Por favor, ingresa un número mayor a cero.", variant: "destructive" });
        return;
    }
    
    try {
        await updateTables(currentTables => {
            const tables = JSON.parse(JSON.stringify(currentTables || []));
            const table = tables.find((t: Table) => t.id === selectedTableId);
            if (!table) return tables;
            
            const item = table.order.find((i: OrderItem) => i.id === itemToEditPrice.id);
            if (!item) return tables;
            
            item.price = price;
            return tables;
        });
        
        setItemToEditPrice(null);
        setNewPrice("");
        toast({ title: "Precio Actualizado", description: `El precio para ${itemToEditPrice.name} ha sido establecido.` });
    } catch(error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };
  
  const handleVoiceModalOpen = () => {
      setVoiceOrderItems([]);
      setVoiceModalOpen(true);
      startListening();
  };
  
  const handleConfirmVoiceOrder = async () => {
    if (voiceOrderItems.length === 0) return;

    const itemsToAdd = voiceOrderItems.map(pItem => {
        const menuItem = menuItems.find(m => m.name.toLowerCase() === pItem.name.toLowerCase());
        if (!menuItem) {
            toast({ title: "Platillo no encontrado", description: `"${pItem.name}" no se encontró en el menú.`});
            return null;
        }

        let finalPrice = menuItem.price;
        if (menuItem.variantPrices) {
            pItem.variants.forEach(variant => {
                if (menuItem.variantPrices && menuItem.variantPrices[variant]) {
                    finalPrice += menuItem.variantPrices[variant];
                }
            });
        }
        
        const category = menu!.platillos.some(p => p.id === menuItem.id) ? 'platillos' : 'bebidas_postres';

        return {
            name: menuItem.name,
            price: finalPrice,
            qty: pItem.qty,
            variants: pItem.variants,
            category: category,
            menuItemId: menuItem.id
        };
    }).filter(Boolean);

    if (itemsToAdd.length > 0) {
      for (const item of itemsToAdd) {
        await addOrderItem(item as Omit<OrderItem, 'id' | 'status'>, true);
      }
      toast({ title: "Orden Agregada", description: `${itemsToAdd.length} tipo(s) de producto(s) agregados a la comanda.`});
    }

    setVoiceModalOpen(false);
  };

  const renderVariants = (variants: string[]) => {
    if (!variants || variants.length === 0) return null;
    
    const isMixto = variants.some(v => v.startsWith('Prep'));
    
    if (isMixto) {
      return (
        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
          {variants.map((variant, index) => (
            <div key={index}>
              <span className="font-semibold">{variant.split(':')[0]}:</span>
              <span className="pl-1">{variant.split(':')[1]}</span>
            </div>
          ))}
        </div>
      );
    }
    
    return (
        <span className="text-xs text-muted-foreground break-words">
            ({variants.join(', ')})
        </span>
    );
  };

  const orderItemStatusConfig: Record<OrderItem['status'], { text: string, color: string }> = {
    nueva: { text: "Nueva", color: "text-muted-foreground" },
    enviada_cocina: { text: "En Cocina", color: "text-muted-foreground" },
    en_preparacion: { text: "Preparando", color: "text-accent" },
    listo_servir: { text: "Listo", color: "text-primary" },
    entregado: { text: "Entregado", color: "text-[hsl(var(--chart-2))]" },
  };

  if (tablesLoading || menuLoading || inventoryLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-lg text-foreground">Conectando al restaurante...</p>
          </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen h-screen flex flex-col relative bg-secondary">
        <BackButton />
        <ThemeToggle />
        
        <header className="p-4 border-b bg-background shadow-sm">
          <div className="flex justify-center items-center mb-4 relative">
            <h1 className="text-xl font-bold text-center capitalize">{restaurantId.replace(/-/g, ' ')} - Mesas</h1>
            <div className="absolute right-0">
               <ConnectionStatus isConnected={isConnected} />
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2 max-w-lg mx-auto">
              {tables && tables.sort((a,b) => a.id - b.id).map(table => {
                  const isFoodReady = (table.order || []).some(item => item.status === 'listo_servir');
                  const isTakeaway = !!table.name;
                  const hasOrders = (table.order || []).length > 0;
                  const displayStatus = isTakeaway && hasOrders ? 'ocupada' : table.status;
                  
                  return (
                      <button
                          key={table.id}
                          onClick={() => handleTableSelect(table.id)}
                          className={cn(
                              "relative flex flex-col items-center justify-center rounded-lg shadow-md text-white font-bold transform transition-all duration-200 aspect-square hover:scale-105",
                              isTakeaway ? (hasOrders ? 'bg-sky-600 hover:bg-sky-600/90' : 'bg-sky-500 hover:bg-sky-500/90') : tableStatusConfig[displayStatus].color,
                              selectedTableId === table.id ? "ring-4 ring-offset-2 ring-primary ring-offset-background" : "ring-0"
                          )}
                      >
                          {isTakeaway ? 
                            <Package className="h-7 w-7 mb-1" /> :
                            <span className="text-2xl font-extrabold">{table.id}</span>
                          }
                          <span className="text-xs text-center font-semibold uppercase tracking-wider px-1">
                            {isTakeaway ? table.name : tableStatusConfig[displayStatus].text}
                          </span>
                          {isFoodReady && (
                              <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-1 h-6 w-6 flex items-center justify-center text-xs font-bold animate-bounce">
                                  <ChefHat size={14} />
                              </div>
                          )}
                          {table.status !== 'libre' && table.occupiedAt && (
                            <TableTimer startTime={table.occupiedAt} />
                          )}
                      </button>
                  )
              })}
          </div>
        </header>
        
        <main className="flex-1 flex flex-col overflow-y-hidden min-h-0">
          {selectedTable ? (
            <Card className="flex flex-col h-full w-full rounded-none border-0 shadow-none bg-background">
              <CardHeader className="border-b">
                  <CardTitle className="text-2xl">Comanda {selectedTable.name ? selectedTable.name : `Mesa #${selectedTable.id}`}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0 min-h-0">
                  <ScrollArea className="h-full">
                      <div className="p-4">
                      {(selectedTable.order || []).length > 0 ? (
                          <div className="space-y-4">
                            {statusOrder.map(status => (
                              groupedOrder[status] && groupedOrder[status].length > 0 && (
                                <div key={status}>
                                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">{statusLabels[status]}</h3>
                                  <div className="space-y-3">
                                    {groupedOrder[status].map(item => {
                                        const originalMenuItem = menuItems.find(mi => mi.id === item.menuItemId);
                                        const isVariablePrice = originalMenuItem ? originalMenuItem.price === 0 : false;
                                      return (
                                        <div key={item.id} className="flex items-center gap-2 bg-secondary p-3 rounded-lg shadow-sm transition-transform hover:scale-[1.01]">
                                          <div className="flex flex-1 items-center gap-3 min-w-0">
                                              <span className="font-bold text-lg text-foreground">{item.qty}x</span>
                                              <div className="flex-grow min-w-0">
                                                <span className="font-semibold text-foreground leading-tight block">{item.name}</span>
                                                {renderVariants(item.variants)}
                                                <span className={cn("text-sm font-medium", orderItemStatusConfig[item.status].color)}>
                                                    {orderItemStatusConfig[item.status].text}
                                                </span>
                                              </div>
                                          </div>
                                          <div className="flex flex-shrink-0 items-center space-x-1">
                                              <span className={cn("font-bold text-lg text-foreground w-20 text-right", item.price === 0 && 'text-destructive')}>
                                                  {item.price > 0 ? `$${(item.price * item.qty).toFixed(2)}` : 'S/P'}
                                              </span>
                                              
                                              {isVariablePrice && (
                                                  <Tooltip>
                                                      <TooltipTrigger asChild>
                                                          <Button variant="outline" size="icon" className="border-accent text-accent hover:bg-accent/10 shrink-0 h-8 w-8" onClick={() => handleOpenEditPriceModal(item)}>
                                                              <Pencil className="h-4 w-4" />
                                                          </Button>
                                                      </TooltipTrigger>
                                                      <TooltipContent>
                                                      <p>Establecer Precio Manual</p>
                                                      </TooltipContent>
                                                  </Tooltip>
                                              )}

                                              {item.status === 'listo_servir' && (
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <Button variant="outline" size="icon" className="border-primary text-primary hover:bg-primary/10 shrink-0 h-8 w-8" onClick={() => updateOrderItemStatus(selectedTable.id, item.id, 'entregado')}>
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                  </TooltipTrigger>
                                                  <TooltipContent>
                                                    <p>Marcar Platillo como Entregado</p>
                                                  </TooltipContent>
                                                </Tooltip>
                                              )}

                                              {(item.category === 'bebidas_postres' && item.status === 'nueva') && (
                                                <Tooltip>
                                                  <TooltipTrigger asChild>
                                                    <Button variant="outline" size="icon" className="border-[hsl(var(--chart-2))] text-[hsl(var(--chart-2))] hover:bg-[hsl(var(--chart-2))]/10 shrink-0 h-8 w-8" onClick={() => updateOrderItemStatus(selectedTable.id, item.id, 'entregado')}>
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                  </TooltipTrigger>
                                                  <TooltipContent>
                                                    <p>Marcar como Entregado</p>
                                                  </TooltipContent>
                                                </Tooltip>
                                              )}
                                              
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <div className="shrink-0">
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90 h-8 w-8" onClick={() => removeOrderItem(item.id)} disabled={item.status !== 'nueva'}>
                                                      <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                  </div>
                                                </TooltipTrigger>
                                                {item.status !== 'nueva' && (
                                                  <TooltipContent>
                                                    <p>No se puede eliminar un item ya procesado.</p>
                                                  </TooltipContent>
                                                )}
                                              </Tooltip>

                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )
                            ))}
                          </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center bg-background text-muted-foreground p-8 text-center h-full">
                            <ChefHat className="h-16 w-16 mb-4 text-muted-foreground/50" />
                            <h2 className="text-2xl font-bold">Comanda Vacía</h2>
                            <p>Añade productos a la comanda usando el menú.</p>
                        </div>
                      )}
                      </div>
                  </ScrollArea>
              </CardContent>
              <CardFooter className="flex-col !p-4 border-t bg-card">
                <div className="flex justify-between items-center w-full mb-4">
                    <span className="text-xl font-bold">TOTAL:</span>
                    <span className="text-3xl font-extrabold text-primary">${calculateOrderTotal().toFixed(2)}</span>
                </div>
                 <div className="grid grid-cols-4 gap-3 w-full">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="lg" variant="secondary" onClick={() => setMenuModalOpen(true)} className="h-14">
                        <Plus className="h-6 w-6"/>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Añadir Producto</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="lg" variant="secondary" onClick={handleVoiceModalOpen} className="h-14">
                        <Mic className="h-6 w-6"/>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Tomar Orden por Voz</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="lg" onClick={sendOrderToKitchen} className="h-14">
                        <Send className="h-6 w-6"/>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Enviar a Cocina</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                       <Button size="lg" className="bg-accent hover:bg-accent/90 h-14" onClick={requestBill}>
                        <Receipt className="h-6 w-6"/>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Pedir Cuenta</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardFooter>
            </Card>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-background text-muted-foreground p-8 text-center m-4 border-2 border-dashed rounded-lg">
              <ChefHat className="h-16 w-16 mb-4 text-muted-foreground/50" />
              <h2 className="text-2xl font-bold">Selecciona una mesa</h2>
              <p>Elige una mesa de la lista de arriba para ver los detalles de su comanda.</p>
            </div>
          )}
        </main>

        <MenuModal
          isOpen={isMenuModalOpen}
          onClose={() => setMenuModalOpen(false)}
          menu={menu}
          onAddItem={(item) => addOrderItem(item)}
        />

        <AccountModal
          isOpen={isAccountModalOpen}
          onClose={() => setAccountModalOpen(false)}
          table={selectedTable}
          total={calculateOrderTotal()}
          onMarkAsPaid={markAsPaid}
        />

        <Dialog open={isVoiceModalOpen} onOpenChange={setVoiceModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <Mic className={cn("mr-2 h-5 w-5", isListening && "text-destructive animate-pulse")} />
                        Tomar Orden por Voz
                    </DialogTitle>
                     <DialogDescription>
                        {isListening 
                            ? "Escuchando... Presiona el botón para detener." 
                            : "Presiona el micrófono para empezar a dictar la orden."
                        }
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="min-h-[60px] bg-secondary p-3 rounded-md">
                        <p className="text-muted-foreground text-sm">Transcripción:</p>
                        <p>{transcript || "..."}</p>
                    </div>

                    {isProcessing && (
                      <div className="flex items-center justify-center text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                        <span>Procesando con IA...</span>
                      </div>
                    )}

                    {voiceOrderItems.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-2">Platillos Detectados:</h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {voiceOrderItems.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between bg-secondary p-2 rounded">
                                        <span><span className="font-bold">{item.qty}x</span> {item.name}</span>
                                        <span className="text-sm text-muted-foreground">({item.variants.join(', ') || 'sin variantes'})</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter className="gap-2 sm:justify-between">
                    <Button variant="ghost" onClick={() => setVoiceModalOpen(false)}>Cancelar</Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={isListening ? stopListening : startListening}
                        disabled={isProcessing}
                      >
                        {isListening ? (
                           <Square className="mr-2 h-4 w-4" />
                        ) : (
                           <Mic className="mr-2 h-4 w-4"/>
                        )}
                        {isListening ? "Detener" : "Grabar de Nuevo"}
                      </Button>
                      <Button onClick={handleConfirmVoiceOrder} disabled={voiceOrderItems.length === 0 || isProcessing}>
                          Confirmar y Agregar
                      </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={!!itemToEditPrice} onOpenChange={(isOpen) => !isOpen && setItemToEditPrice(null)}>
            <DialogContent className="max-w-xs">
                <DialogHeader>
                    <DialogTitle>Establecer Precio para {itemToEditPrice?.name}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Input 
                        type="number"
                        value={newPrice}
                        onChange={e => setNewPrice(e.target.value)}
                        placeholder="Ej: 150.00"
                        className="text-lg text-center"
                        autoFocus
                    />
                </div>
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => setItemToEditPrice(null)}>Cancelar</Button>
                    <Button onClick={handleUpdatePrice}>Guardar Precio</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

      </div>
    </TooltipProvider>
  );
}
