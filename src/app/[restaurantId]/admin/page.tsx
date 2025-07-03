
"use client";

import * as React from 'react';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { initialTables, initialMenu, initialCompletedOrders, initialInventory } from '@/lib/data';
import type { Restaurant, Table, Menu, MenuItem, CompletedOrder, VariantOption, TableStatus, InventoryItem, DisableRule, ShowRule, RecipeIngredient, FeatureSet } from '@/lib/types';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Pencil, Trash2, Plus, Sparkles, X, Package, Eye, BookText, ChevronsUpDown, GitBranchPlus, Combine, Lightbulb, ChefHat, ShieldCheck, History } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import useRealtimeData from '@/hooks/useRealtimeData';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription as DialogDesc,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bar, BarChart, XAxis, YAxis, PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, LabelList } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { ThemeToggle } from '@/components/app/ThemeToggle';
import { Checkbox } from '@/components/ui/checkbox';
import { getDishDescriptionAction, getDailySpecialAction } from '../../actions';
import type { GenerateDailySpecialOutput } from '@/ai/flows/generate-daily-special';
import { ConnectionStatus } from '@/components/app/ConnectionStatus';
import { Table as UiTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { BackButton } from '@/components/app/BackButton';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const PinModal = ({
    isOpen,
    onVerify,
}: {
    isOpen: boolean;
    onVerify: (pin: string) => void;
}) => {
    const [pin, setPin] = React.useState('');

    const handlePinSubmit = () => {
        onVerify(pin);
        setPin('');
    };
    
    return (
        <Dialog open={isOpen}>
            <DialogContent className="max-w-xs" hideCloseButton>
                <DialogHeader>
                    <DialogTitle className="text-center">
                        <ShieldCheck className="mx-auto h-10 w-10 text-primary mb-2"/>
                        Acceso de Administrador
                    </DialogTitle>
                    <DialogDesc className="text-center">
                        Ingresa el PIN de 4 dígitos para continuar.
                    </DialogDesc>
                </DialogHeader>
                <div className="flex justify-center py-4">
                     <Input
                        type="password"
                        maxLength={4}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        onKeyUp={(e) => e.key === 'Enter' && handlePinSubmit()}
                        className="w-48 text-center text-2xl font-mono tracking-[1em]"
                        autoFocus
                    />
                </div>
                <DialogFooter>
                    <Button onClick={handlePinSubmit} className="w-full">Verificar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const DailySpecial = ({ menu, inventory, isLoading }: { menu: Menu, inventory: InventoryItem[], isLoading: boolean }) => {
    const [special, setSpecial] = React.useState<GenerateDailySpecialOutput | null>(null);
    const [isGenerating, setIsGenerating] = React.useState(false);
    const { toast } = useToast();

    const fetchSpecial = async () => {
        setIsGenerating(true);
        try {
            const result = await getDailySpecialAction(menu, inventory);
            if (result.name === 'Error') {
                toast({ title: "Error de IA", description: result.description, variant: "destructive" });
                setSpecial(null);
            } else {
                setSpecial(result);
            }
        } catch (error) {
            toast({ title: "Error", description: "No se pudo generar la sugerencia.", variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
    };
    
    if (isLoading) {
      return (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle><Skeleton className="h-6 w-48" /></CardTitle>
            <CardDescription><Skeleton className="h-4 w-full" /></CardDescription>
          </CardHeader>
          <CardContent><Skeleton className="h-24 w-full" /></CardContent>
          <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
        </Card>
      );
    }

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Lightbulb className="mr-2 h-5 w-5 text-accent" />
                    Sugerencia del Día (IA)
                </CardTitle>
                <CardDescription>
                    Genera una sugerencia estratégica para promocionar un platillo.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isGenerating ? (
                    <div className="flex items-center justify-center h-24">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : special ? (
                    <div className="space-y-3">
                        <h4 className="text-xl font-bold text-primary">{special.name}</h4>
                        <p className="text-sm text-foreground italic">"{special.description}"</p>
                        <p className="text-xs text-muted-foreground"><span className="font-semibold">Razón (Interna):</span> {special.reason}</p>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-4">
                        <p>Haz clic en "Generar" para obtener una sugerencia.</p>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button onClick={fetchSpecial} disabled={isGenerating || isLoading} className="w-full">
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isGenerating ? 'Generando...' : special ? 'Generar Otra' : 'Generar Sugerencia'}
                </Button>
            </CardFooter>
        </Card>
    );
};

const SalesAnalytics = ({ orders, isLoading }: { orders: CompletedOrder[] | null, isLoading: boolean }) => {
    const [salesPeriod, setSalesPeriod] = React.useState("today");

    const salesData = React.useMemo(() => {
        if (!orders || !Array.isArray(orders)) return { totalSales: 0, totalOrders: 0, allItemsSold: [], topItemsByQuantity: [], topItemsByRevenue: [] };
        
        const now = new Date();
        let startDate: Date;
        let endDate: Date = new Date();
        
        switch(salesPeriod) {
            case 'today':
                startDate = new Date(now);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'yesterday':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 1);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(startDate);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'last7days':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'this_month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'last_month':
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                startDate = new Date(lastMonth);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                endDate.setHours(23, 59, 59, 999);
                break;
            default:
                startDate = new Date(now);
                startDate.setHours(0, 0, 0, 0);
        }

        const filteredOrders = orders.filter(o => {
            if (!o || !o.date) return false;
            const orderDate = new Date(o.date);
            return !isNaN(orderDate.getTime()) && orderDate >= startDate && orderDate <= endDate;
        });

        const totalSales = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        const totalOrders = filteredOrders.length;

        const itemCounts = new Map<string, { quantity: number; revenue: number }>();
        filteredOrders.forEach(order => {
            (order.order || []).forEach(item => {
                if(!item || !item.name) return;
                const detailedName = item.variants && item.variants.length > 0
                    ? `${item.name} (${item.variants.join(', ')})`
                    : item.name;
                
                const existing = itemCounts.get(detailedName) || { quantity: 0, revenue: 0 };
                existing.quantity += item.qty || 0;
                existing.revenue += (item.qty || 0) * (item.price || 0);
                itemCounts.set(detailedName, existing);
            });
        });
        
        const allItemsSold = Array.from(itemCounts.entries())
            .map(([detailedName, data]) => ({ name: detailedName, ...data }))
            .sort((a, b) => b.revenue - a.revenue);
            
        const topItemsByQuantity = [...allItemsSold].sort((a,b) => b.quantity - a.quantity).slice(0, 5);
        const topItemsByRevenue = [...allItemsSold].sort((a,b) => b.revenue - a.revenue).slice(0, 5);
        
        return { totalSales, totalOrders, allItemsSold, topItemsByQuantity, topItemsByRevenue };
    }, [orders, salesPeriod]);

    const chartConfigBar = {
      quantity: {
        label: "Cantidad",
        color: "hsl(var(--chart-2))",
      }
    } satisfies ChartConfig;
    
    const chartConfigPie: ChartConfig = salesData.topItemsByRevenue.reduce((acc, item, index) => {
      acc[item.name] = {
        label: item.name,
        color: `hsl(var(--chart-${index + 1}))`
      }
      return acc;
    }, {} as ChartConfig);

    if (isLoading) {
        return (
            <Card className="shadow-lg">
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                    <div>
                        <Skeleton className="h-6 w-1/2 mb-4" />
                        <Skeleton className="min-h-[250px] w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Análisis de Ventas</CardTitle>
                    <Select value={salesPeriod} onValueChange={setSalesPeriod}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Seleccionar periodo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Hoy</SelectItem>
                            <SelectItem value="yesterday">Ayer</SelectItem>
                            <SelectItem value="last7days">Últimos 7 días</SelectItem>
                            <SelectItem value="this_month">Este Mes</SelectItem>
                            <SelectItem value="last_month">Mes Pasado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-sm text-muted-foreground">Ventas Totales</p>
                        <p className="text-2xl font-bold">${salesData.totalSales.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Órdenes Totales</p>
                        <p className="text-2xl font-bold">{salesData.totalOrders}</p>
                    </div>
                </div>
                <Tabs defaultValue="revenue" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="revenue">Top 5 por Ingresos</TabsTrigger>
                    <TabsTrigger value="quantity">Top 5 por Cantidad</TabsTrigger>
                    </TabsList>
                    <TabsContent value="revenue">
                    <ChartContainer config={chartConfigPie} className="min-h-[250px] w-full aspect-square">
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                            <Pie data={salesData.topItemsByRevenue} dataKey="revenue" nameKey="name" innerRadius={60}>
                            {salesData.topItemsByRevenue.map((entry) => (
                                <Cell key={entry.name} fill={chartConfigPie[entry.name]?.color} />
                            ))}
                            </Pie>
                            <Legend content={({ payload }) => (
                            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-4">
                                {payload?.map((entry, index) => (
                                <div key={`item-${index}`} className="flex items-center gap-2 text-xs">
                                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                    <span className="text-muted-foreground">{entry.value}</span>
                                </div>
                                ))}
                            </div>
                            )}/>
                        </PieChart>
                    </ChartContainer>
                    </TabsContent>
                    <TabsContent value="quantity">
                    <ChartContainer config={chartConfigBar} className="min-h-[250px] w-full mt-4">
                        <BarChart accessibilityLayer data={salesData.topItemsByQuantity} layout="vertical" margin={{left: 20, right: 40}}>
                        <YAxis
                            dataKey="name"
                            type="category"
                            tickLine={false}
                            axisLine={false}
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            width={100}
                            tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                        />
                        <XAxis type="number" dataKey="quantity" hide />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Bar dataKey="quantity" layout="vertical" fill="var(--color-quantity)" radius={4}>
                            <LabelList dataKey="quantity" position="right" offset={8} className="fill-foreground" fontSize={12} />
                        </Bar>
                        </BarChart>
                    </ChartContainer>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
};

const menuItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "El nombre es requerido."),
  price: z.preprocess(
    (a) => {
        const value = parseFloat(z.string().parse(a));
        return isNaN(value) ? undefined : value;
    },
    z.number({invalid_type_error: "El precio debe ser un número."}).positive("El precio debe ser mayor a cero.")
  ),
  category: z.enum(["platillos", "bebidas_postres"], {
    required_error: "Debes seleccionar una categoría.",
  }),
  description: z.string().max(200, "La descripción no puede exceder los 200 caracteres.").optional(),
  ingredients: z.string().optional(),
  isMixto: z.boolean().optional(),
  variants: z.array(z.object({
    type: z.string().min(1, "El tipo de variante es requerido."),
    options: z.string().min(1, "Las opciones son requeridas."),
    allowMultiple: z.boolean().optional(),
    isDobleSeleccion: z.boolean().optional(),
    isRequired: z.boolean().optional(),
  })).optional(),
  variantPrices: z.string().optional().refine((val) => {
    if (!val || val.trim() === "" || val.trim() === "{}") return true;
    try {
      const parsed = JSON.parse(val);
      return typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null;
    } catch (e) {
      return false;
    }
  }, { message: 'Debe ser un objeto JSON válido, ej: {"Queso Extra": 20}' }),
  disableRules: z.array(z.object({
    when: z.string().min(1, "La opción 'Cuando' es requerida."),
    disable: z.array(z.string()).min(1, "Debes seleccionar al menos una opción para deshabilitar."),
  })).optional(),
  showRules: z.array(z.object({
    when: z.string().min(1, "La opción 'Cuando' es requerida."),
    show: z.array(z.string()).min(1, "Debes seleccionar al menos un grupo de variantes para mostrar."),
  })).optional(),
  recipe: z.array(z.object({
      inventoryItemId: z.string().min(1, "Selecciona un ingrediente."),
      amount: z.preprocess(
          (a) => parseFloat(z.string().parse(a)),
          z.number({invalid_type_error: "Debe ser un número."}).positive("La cantidad debe ser mayor a 0.")
      ),
  })).optional(),
});

type MenuItemFormValues = z.infer<typeof menuItemSchema>;

const inventoryItemSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "El nombre es requerido."),
    stock: z.preprocess(
      (a) => parseFloat(z.string().parse(a)),
      z.number({invalid_type_error: "El stock debe ser un número."}).min(0, "El stock no puede ser negativo.")
    ),
    unit: z.enum(["kg", "g", "lt", "ml", "pz"]),
    lowStockThreshold: z.preprocess(
      (a) => parseFloat(z.string().parse(a)),
      z.number({invalid_type_error: "El umbral debe ser un número."}).min(0, "El umbral no puede ser negativo.")
    ),
});

type InventoryItemFormValues = z.infer<typeof inventoryItemSchema>;

export default function AdminPage() {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;
  
  const handleDbError = React.useCallback((error: Error) => {
    toast({ title: "Error de Conexión", description: error.message, variant: "destructive" });
  }, [toast]);
  
  const [restaurantData, updateRestaurantData, restaurantDataLoading] = useRealtimeData<Restaurant | null>(restaurantId, '', null, handleDbError);

  const tables = restaurantData?.tables || initialTables;
  const menu = restaurantData?.menu || initialMenu;
  const completedOrders = restaurantData?.completed_orders || initialCompletedOrders;
  const inventory = restaurantData?.inventory || initialInventory;
  const features = restaurantData?.features;
  const pin = restaurantData?.pin;
  const isConnected = !!restaurantData; // Simplified connection check
  const dataLoading = restaurantDataLoading;

  const [itemToDelete, setItemToDelete] = React.useState<{ id: string; category: keyof Menu } | null>(null);
  const [tableToDelete, setTableToDelete] = React.useState<Table | null>(null);
  const [isItemModalOpen, setItemModalOpen] = React.useState(false);
  const [editingMenuItem, setEditingMenuItem] = React.useState<MenuItem | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isInventoryModalOpen, setInventoryModalOpen] = React.useState(false);
  const [editingInventoryItem, setEditingInventoryItem] = React.useState<InventoryItem | null>(null);
  const [isPinVerified, setPinVerified] = React.useState(false);
  const [selectedTableIdForHistory, setSelectedTableIdForHistory] = React.useState<number | null>(null);
  const [isHistorySheetOpen, setIsHistorySheetOpen] = React.useState(false);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = React.useState<CompletedOrder | null>(null);

  const isPinSecurityEnabled = features?.pin_security === true;

  const handlePinVerify = (enteredPin: string) => {
    if (pin && enteredPin === pin) {
        setPinVerified(true);
        toast({ title: "Acceso Concedido", description: "PIN correcto." });
    } else {
        toast({ title: "PIN Incorrecto", description: "El PIN no es válido. Inténtalo de nuevo.", variant: "destructive" });
    }
  };
  
  const handleViewTableHistory = (tableId: number) => {
    setSelectedTableIdForHistory(tableId);
    setIsHistorySheetOpen(true);
  };

  const handleViewOrderDetails = (order: CompletedOrder) => {
    setSelectedOrderForDetail(order);
  };
  
  const filteredCompletedOrders = React.useMemo(() => {
    if (!completedOrders || !selectedTableIdForHistory) return [];
    return completedOrders
        .filter(order => order.tableId === selectedTableIdForHistory)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [completedOrders, selectedTableIdForHistory]);


  const sanitizedMenu = React.useMemo<Menu>(() => {
    return {
        platillos: menu?.platillos || [],
        bebidas_postres: menu?.bebidas_postres || [],
    };
  }, [menu]);

  const menuForm = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      price: undefined,
      category: "platillos",
      description: "",
      ingredients: "",
      isMixto: false,
      variants: [],
      variantPrices: "{}",
      disableRules: [],
      showRules: [],
      recipe: [],
    },
  });
  
  const inventoryForm = useForm<InventoryItemFormValues>({
    resolver: zodResolver(inventoryItemSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control: menuForm.control,
    name: "variants",
  });

  const { fields: disableRulesFields, append: appendDisableRule, remove: removeDisableRule } = useFieldArray({
    control: menuForm.control,
    name: "disableRules",
  });

  const { fields: showRulesFields, append: appendShowRule, remove: removeShowRule } = useFieldArray({
    control: menuForm.control,
    name: "showRules",
  });
  
  const { fields: recipeFields, append: appendRecipe, remove: removeRecipe } = useFieldArray({
    control: menuForm.control,
    name: "recipe",
  });


  const watchedVariants = menuForm.watch("variants");
  
  const allVariantOptions = React.useMemo(() => {
    return (watchedVariants ?? [])
        .flatMap(v => v.options.split(',').map(o => o.trim()))
        .filter(Boolean);
  }, [watchedVariants]);

  const allVariantTypes = React.useMemo(() => {
    return (watchedVariants ?? [])
        .map(v => v.type)
        .filter(Boolean);
  }, [watchedVariants]);

  const tableStats = React.useMemo(() => {
    if (!tables) return { libre: 0, ocupada: 0, esperando_cuenta: 0 };
    return tables.reduce((acc, table) => {
      acc[table.status as TableStatus] = (acc[table.status as TableStatus] || 0) + 1;
      return acc;
    }, { libre: 0, ocupada: 0, esperando_cuenta: 0 } as Record<TableStatus, number>);
  }, [tables]);

  const openAddItemModal = () => {
    setEditingMenuItem(null);
    menuForm.reset({ name: "", price: undefined, category: "platillos", description: "", ingredients: "", isMixto: false, variants: [], variantPrices: "{}", disableRules: [], showRules: [], recipe: [] });
    setItemModalOpen(true);
  };
  
  const openEditItemModal = (item: MenuItem, category: keyof Menu) => {
    setEditingMenuItem(item);
    
    const variantsForForm = (item.variants || []).map(v => ({
        type: v.type,
        options: v.options.join(', '),
        allowMultiple: v.allowMultiple || false,
        isDobleSeleccion: v.isDobleSeleccion || false,
        isRequired: v.isRequired || false,
    }));
    
    menuForm.reset({
        id: item.id,
        name: item.name,
        price: item.price,
        category: category,
        description: item.description || "",
        ingredients: item.ingredients || "",
        isMixto: item.isMixto || false,
        variants: variantsForForm,
        variantPrices: item.variantPrices ? JSON.stringify(item.variantPrices, null, 2) : "{}",
        disableRules: item.disableRules || [],
        showRules: item.showRules || [],
        recipe: item.recipe || [],
    });
    
    setItemModalOpen(true);
  };

  const confirmDeleteItem = (itemId: string, category: keyof Menu) => {
    setItemToDelete({ id: itemId, category });
  };
  
  const handleDeleteItem = async () => {
     if (!itemToDelete) return;
     try {
       await updateRestaurantData(currentData => {
            if (!currentData) throw new Error("No data to update");
            const newMenu = JSON.parse(JSON.stringify(currentData.menu || initialMenu));
            newMenu[itemToDelete.category] = newMenu[itemToDelete.category].filter((item: MenuItem) => item.id !== itemToDelete.id);
            currentData.menu = newMenu;
            return currentData;
        });
       toast({ title: "Platillo Eliminado", description: "El platillo ha sido eliminado del menú." });
     } catch (error: any) {
        toast({ title: "Error al Eliminar", description: error.message, variant: "destructive" });
     } finally {
        setItemToDelete(null);
     }
  };

  async function handleSaveItem(values: MenuItemFormValues) {
    const isEditing = !!editingMenuItem;

    let parsedVariantPrices: { [key: string]: number } | undefined;
    try {
        if (values.variantPrices && values.variantPrices.trim() !== '{}' && values.variantPrices.trim() !== '') {
            parsedVariantPrices = JSON.parse(values.variantPrices);
        }
    } catch (e) {
        menuForm.setError("variantPrices", { message: "JSON inválido."});
        return;
    }

    const actionPromise = updateRestaurantData(currentData => {
        if (!currentData) throw new Error("No data to update");
        const newMenu: Menu = JSON.parse(JSON.stringify(currentData.menu || initialMenu));
        const newCategory = values.category;
        
        let originalCategory: keyof Menu | undefined;
        if (isEditing && editingMenuItem) {
            Object.keys(newMenu).forEach(cat => {
                const categoryKey = cat as keyof Menu;
                const itemExists = newMenu[categoryKey].some(item => item.id === editingMenuItem.id);
                if (itemExists) {
                    originalCategory = categoryKey;
                }
            });
        }
        
        if (isEditing && editingMenuItem && originalCategory) {
             newMenu[originalCategory] = newMenu[originalCategory].filter(
                (item: MenuItem) => item.id !== editingMenuItem.id
            );
        }
        
        const variantsToSave: VariantOption[] = (values.variants || []).map(v => ({
            type: v.type,
            options: v.options.split(',').map(opt => opt.trim()).filter(Boolean),
            allowMultiple: v.allowMultiple || false,
            isDobleSeleccion: v.isDobleSeleccion || false,
            isRequired: v.isRequired || false,
        })).filter(v => v.type && v.options.length > 0);
        
        const itemToSave: MenuItem = {
            id: isEditing && editingMenuItem ? editingMenuItem.id : `${values.name.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`,
            name: values.name,
            price: Number(values.price),
            description: values.description || "",
            ingredients: values.ingredients || "",
            isMixto: values.isMixto || false,
            variants: variantsToSave,
            disableRules: values.disableRules || [],
            showRules: values.showRules || [],
            recipe: values.recipe || [],
        };
        
        if (parsedVariantPrices && Object.keys(parsedVariantPrices).length > 0) {
            itemToSave.variantPrices = parsedVariantPrices;
        }

        if (!newMenu[newCategory]) {
            newMenu[newCategory] = [];
        }
        
        newMenu[newCategory].push(itemToSave);
        newMenu[newCategory].sort((a,b) => a.name.localeCompare(b.name));
        
        currentData.menu = newMenu;
        return currentData;
    });

    try {
        await actionPromise;
        toast({ 
            title: isEditing ? "Platillo Actualizado" : "Platillo Agregado", 
            description: `${values.name} ha sido ${isEditing ? 'actualizado' : 'agregado'}.` 
        });
        setItemModalOpen(false);
        setEditingMenuItem(null);
    } catch (error: any) {
        toast({ title: "Error al Guardar", description: error.message, variant: "destructive" });
    }
  }

  const handleGenerateDescription = async () => {
    const dishName = menuForm.getValues("name");
    if (!dishName) {
      menuForm.setError("name", { type: "manual", message: "Por favor, ingresa un nombre primero." });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await getDishDescriptionAction(dishName);
      menuForm.setValue("description", result, { shouldValidate: true });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo generar la descripción.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddTable = async () => {
    let newTableId: number | undefined;
    try {
      await updateRestaurantData(currentData => {
        if (!currentData) throw new Error("No data to update");
        const tables = currentData.tables || [];
        const newTable: Table = {
          id: tables.length > 0 ? Math.max(...tables.map(t => t.id)) + 1 : 1,
          status: 'libre',
          order: []
        };
        newTableId = newTable.id;
        currentData.tables = [...tables, newTable].sort((a, b) => a.id - b.id);
        return currentData;
      });
      if (newTableId) {
        toast({ title: "Mesa Agregada", description: `La mesa #${newTableId} ha sido agregada.` });
      }
    } catch(error: any) {
      toast({ title: "Error al Agregar Mesa", description: error.message, variant: "destructive" });
    }
  };

  const confirmDeleteTable = (table: Table) => {
      if (table.status !== 'libre') {
        toast({
          title: "Acción no permitida",
          description: "No se puede eliminar una mesa que está ocupada o esperando cuenta.",
          variant: "destructive",
        });
        return;
      }
      setTableToDelete(table);
  };

  const handleDeleteTable = async () => {
      if (!tableToDelete) return;
      const tableIdToDelete = tableToDelete.id;
      try {
        await updateRestaurantData(currentData => {
          if (!currentData) throw new Error("No data to update");
          const tables = currentData.tables || [];
          currentData.tables = tables.filter(t => t.id !== tableIdToDelete);
          return currentData;
        });
        toast({ title: "Mesa Eliminada", description: `La mesa #${tableIdToDelete} ha sido eliminada.` });
      } catch (error: any) {
        toast({ title: "Error al Eliminar Mesa", description: error.message, variant: "destructive" });
      } finally {
        setTableToDelete(null);
      }
  };
  
  const openAddInventoryItemModal = () => {
    setEditingInventoryItem(null);
    inventoryForm.reset({ name: "", stock: 0, unit: "pz", lowStockThreshold: 0});
    setInventoryModalOpen(true);
  };
  
  const openEditInventoryItemModal = (item: InventoryItem) => {
    setEditingInventoryItem(item);
    inventoryForm.reset(item);
    setInventoryModalOpen(true);
  };

  const handleSaveInventoryItem = async (values: InventoryItemFormValues) => {
    const isEditing = !!editingInventoryItem;
    try {
      await updateRestaurantData(currentData => {
        if (!currentData) throw new Error("No data to update");
        let newInventory = currentData.inventory ? [...currentData.inventory] : [];
        if (isEditing && editingInventoryItem) {
          const index = newInventory.findIndex(i => i.id === editingInventoryItem.id);
          if (index !== -1) {
            newInventory[index] = { ...editingInventoryItem, ...values };
          }
        } else {
          const newItem: InventoryItem = {
            id: `${values.name.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`,
            ...values
          };
          newInventory.push(newItem);
        }
        currentData.inventory = newInventory;
        return currentData;
      });
      toast({
          title: isEditing ? "Ingrediente Actualizado" : "Ingrediente Agregado",
          description: `${values.name} ha sido guardado en el inventario.`
      });
      setInventoryModalOpen(false);
    } catch (error: any) {
       toast({ title: "Error al Guardar Ingrediente", description: error.message, variant: "destructive" });
    }
  };

  const handleItemModalOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setItemModalOpen(false);
      setEditingMenuItem(null);
    } else {
      setItemModalOpen(true);
    }
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-foreground">Cargando datos del restaurante...</p>
        </div>
      </div>
    );
  }

  if (isPinSecurityEnabled && !isPinVerified) {
      return <PinModal isOpen={true} onVerify={handlePinVerify} />;
  }

  return (
    <>
      <div className="min-h-screen bg-secondary">
        <BackButton />
        <ThemeToggle />
        <main className="p-4 md:p-8">
          <div className="flex justify-center items-center mb-8 relative">
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground text-center capitalize">{restaurantId.replace(/-/g, ' ')} - Admin</h1>
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <ConnectionStatus isConnected={isConnected} />
            </div>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-1 space-y-8">
              {features?.analytics_dashboard && <DailySpecial menu={sanitizedMenu} inventory={inventory || []} isLoading={dataLoading} />}
              
              {features?.analytics_dashboard && <SalesAnalytics orders={completedOrders} isLoading={dataLoading} />}

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Estadísticas de Mesas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   {dataLoading ? (
                    <>
                      <Skeleton className="h-[72px] w-full" />
                      <Skeleton className="h-[72px] w-full" />
                      <Skeleton className="h-[72px] w-full" />
                    </>
                  ) : (
                    <>
                      <div className="bg-[hsl(var(--chart-2))]/20 p-4 rounded-lg flex justify-between items-center">
                        <span className="text-lg text-[hsl(var(--chart-2))] font-semibold">Mesas Libres</span>
                        <span className="text-3xl font-bold text-[hsl(var(--chart-2))]">{tableStats.libre}</span>
                      </div>
                      <div className="bg-destructive/10 p-4 rounded-lg flex justify-between items-center">
                        <span className="text-lg text-destructive font-semibold">Mesas Ocupadas</span>
                        <span className="text-3xl font-bold text-destructive">{tableStats.ocupada}</span>
                      </div>
                      <div className="bg-accent/20 p-4 rounded-lg flex justify-between items-center">
                        <span className="text-lg text-accent font-semibold">Esperando Cuenta</span>
                        <span className="text-3xl font-bold text-accent">{tableStats.esperando_cuenta}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Gestionar Mesas</CardTitle>
                        <CardDescription>Click en una mesa para ver su historial.</CardDescription>
                    </div>
                  <Button onClick={handleAddTable} size="sm" disabled={dataLoading}>
                      <Plus className="mr-2 h-4 w-4" /> Agregar
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Solo puedes eliminar mesas que estén libres.</p>
                  <ScrollArea className="h-40">
                     {dataLoading ? (
                      <div className="grid grid-cols-5 gap-3 pr-2">
                        {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="aspect-square w-full" />)}
                      </div>
                    ) : (
                      <div className="grid grid-cols-5 gap-3 pr-2">
                        {tables && [...tables].sort((a,b) => a.id - b.id).map(table => (
                          <div key={table.id} className="relative group">
                             <Button
                              variant="outline"
                              className="aspect-square w-full h-auto text-xl font-bold text-secondary-foreground hover:bg-accent/50 focus:ring-2 focus:ring-primary"
                              onClick={() => handleViewTableHistory(table.id)}
                            >
                              {table.id}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                              onClick={() => confirmDeleteTable(table)}
                              disabled={table.status !== 'libre'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

            </div>

            <div className="xl:col-span-2 space-y-8">
              {features?.inventory_management && <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Gestión de Inventario</CardTitle>
                    <CardDescription>Controla el stock de tus ingredientes.</CardDescription>
                  </div>
                  <Button onClick={openAddInventoryItemModal} disabled={dataLoading}>
                      <Package className="mr-2 h-4 w-4" /> Agregar Ingrediente
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <UiTable>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ingrediente</TableHead>
                          <TableHead className="text-right">Stock</TableHead>
                          <TableHead className="text-right">Umbral Bajo</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dataLoading ? (
                           Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                              <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                              <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                              <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                              <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                            </TableRow>
                          ))
                        ) : (inventory || []).length > 0 ? (inventory || []).map(item => (
                          <TableRow key={item.id} className={item.stock <= item.lowStockThreshold ? 'bg-destructive/10' : ''}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-right">{item.stock} {item.unit}</TableCell>
                            <TableCell className="text-right">{item.lowStockThreshold} {item.unit}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => openEditInventoryItemModal(item)}><Pencil className="h-4 w-4"/></Button>
                            </TableCell>
                          </TableRow>
                        )) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                              Aún no hay ingredientes en el inventario.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </UiTable>
                  </ScrollArea>
                </CardContent>
              </Card>}

              <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Gestión de Menú</CardTitle>
                    <CardDescription>Añade o edita los platillos, bebidas y postres.</CardDescription>
                  </div>
                  <Button onClick={openAddItemModal} disabled={dataLoading}>
                      <Plus className="mr-2 h-4 w-4" /> Agregar Platillo
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[calc(100vh-28rem)] pr-4">
                     {dataLoading ? (
                      <div className="space-y-8">
                        <div>
                          <Skeleton className="h-8 w-48 mb-3" />
                          <div className="space-y-3">
                            <Skeleton className="h-[76px] w-full rounded-lg" />
                            <Skeleton className="h-[76px] w-full rounded-lg" />
                            <Skeleton className="h-[76px] w-full rounded-lg" />
                          </div>
                        </div>
                        <div>
                          <Skeleton className="h-8 w-48 mb-3" />
                          <div className="space-y-3">
                            <Skeleton className="h-[76px] w-full rounded-lg" />
                            <Skeleton className="h-[76px] w-full rounded-lg" />
                          </div>
                        </div>
                      </div>
                    ) : (Object.keys(sanitizedMenu) as Array<keyof Menu>).map(categoryKey => (
                      <div key={categoryKey} className="mb-8">
                        <h3 className="text-xl font-semibold text-foreground mb-3 capitalize border-b pb-2">
                          {categoryKey === 'platillos' ? 'Platillos' : 'Bebidas y Postres'}
                        </h3>
                        <div className="space-y-3">
                          {sanitizedMenu[categoryKey] && sanitizedMenu[categoryKey].length > 0 ? sanitizedMenu[categoryKey].map(item => (
                            <div key={item.id} className="flex items-center justify-between bg-background p-3 rounded-lg shadow-sm">
                              <div className="flex-1 overflow-hidden pr-4">
                                <p className="text-lg text-foreground truncate">{item.name} - ${item.price.toFixed(2)}</p>
                                {item.description && <p className="text-sm text-muted-foreground truncate">{item.description}</p>}
                              </div>
                              <div className="flex space-x-2 shrink-0">
                                <Button variant="ghost" size="icon" onClick={() => openEditItemModal(item, categoryKey)}><Pencil className="h-4 w-4"/></Button>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/90" onClick={() => confirmDeleteItem(item.id, categoryKey)}><Trash2 className="h-4 w-4"/></Button>
                              </div>
                            </div>
                          )) : (
                            <p className="text-sm text-muted-foreground">No hay platillos en esta categoría.</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <Sheet open={isHistorySheetOpen} onOpenChange={setIsHistorySheetOpen}>
        <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
                <SheetTitle>Historial de Mesa #{selectedTableIdForHistory}</SheetTitle>
                <SheetDescription>
                    Aquí se muestran todas las cuentas cerradas para esta mesa. Haz clic en una para ver el detalle.
                </SheetDescription>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-80px)] mt-4 pr-4">
              <div className="space-y-3">
                {filteredCompletedOrders.length > 0 ? (
                  filteredCompletedOrders.map(order => (
                    <button key={order.id} className="w-full text-left" onClick={() => handleViewOrderDetails(order)}>
                        <Card className="hover:bg-secondary transition-colors">
                            <CardContent className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{format(new Date(order.date), "dd MMM yyyy", { locale: es })}</p>
                                    <p className="text-sm text-muted-foreground">{format(new Date(order.date), "h:mm a", { locale: es })}</p>
                                </div>
                                <p className="text-lg font-bold text-primary">${order.total.toFixed(2)}</p>
                            </CardContent>
                        </Card>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <History className="mx-auto h-12 w-12 mb-4" />
                    <h3 className="text-xl font-semibold">Sin Historial</h3>
                    <p>Esta mesa aún no tiene órdenes completadas.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
        </SheetContent>
      </Sheet>

      <Dialog open={!!selectedOrderForDetail} onOpenChange={(isOpen) => !isOpen && setSelectedOrderForDetail(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Detalle de la Orden</DialogTitle>
                 {selectedOrderForDetail && <DialogDesc>
                    Mesa #{selectedOrderForDetail.tableId} - {format(new Date(selectedOrderForDetail.date), "dd MMMM yyyy, h:mm a", { locale: es })}
                </DialogDesc>}
            </DialogHeader>
            <div className="mt-2">
                <ScrollArea className="max-h-96">
                    <UiTable>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">Cant.</TableHead>
                                <TableHead>Producto</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {selectedOrderForDetail?.order.map(item => (
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
                    </UiTable>
                </ScrollArea>
            </div>
            <DialogFooter className="mt-4 sm:justify-between items-center border-t pt-4">
                 <div className="text-2xl font-bold">
                    TOTAL: <span className="text-primary">${selectedOrderForDetail?.total.toFixed(2)}</span>
                </div>
                <Button type="button" variant="secondary" onClick={() => setSelectedOrderForDetail(null)}>Cerrar</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>


      <Dialog open={isItemModalOpen} onOpenChange={handleItemModalOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingMenuItem ? "Editar Platillo" : "Agregar Nuevo Platillo"}</DialogTitle>
             <DialogDesc>
              {editingMenuItem ? "Modifica los detalles del platillo." : "Llena los campos para agregar un nuevo platillo al menú."}
            </DialogDesc>
          </DialogHeader>
          <Form {...menuForm}>
            <form onSubmit={menuForm.handleSubmit(handleSaveItem)} className="space-y-4">
              <ScrollArea className="h-[65vh] -mr-4 pr-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={menuForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Platillo</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Tostada de Ceviche" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={menuForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio Base</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="Ej: 70.00" {...field} value={field.value ?? ''} onChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={menuForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={"platillos"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="platillos">Platillos</SelectItem>
                            <SelectItem value="bebidas_postres">Bebidas y Postres</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={menuForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center">
                          <FormLabel>Descripción (Opcional)</FormLabel>
                          <Button type="button" variant="ghost" size="sm" onClick={handleGenerateDescription} disabled={isGenerating}>
                            <Sparkles className="mr-2 h-4 w-4" />
                            {isGenerating ? "Generando..." : "Generar con IA"}
                          </Button>
                        </div>
                        <FormControl>
                          <Textarea placeholder="Describe el platillo para tentar a tus clientes..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={menuForm.control}
                    name="ingredients"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ingredientes (Opcional)</FormLabel>
                         <FormDescription>
                          Escribe los nombres de los ingredientes separados por coma. Ej: camaron,cebolla,tomate
                        </FormDescription>
                        <FormControl>
                          <Textarea placeholder="Ej: camaron,cebolla,tomate,cilantro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={menuForm.control}
                    name="isMixto"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-secondary/50">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center"><Combine className="mr-2 h-4 w-4 text-primary"/>Platillo de Doble Preparación (Mixto)</FormLabel>
                          <FormDescription>
                            Activa esto para que la mesera pueda elegir dos preparaciones distintas para este platillo.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4 p-4 border rounded-lg bg-secondary/50">
                    <div className="space-y-1">
                      <FormLabel>Variantes del Platillo</FormLabel>
                      <FormDescription>Define opciones como tamaño, preparación, extras, etc.</FormDescription>
                    </div>
                    <div className="space-y-3">
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex items-start gap-2 p-3 border rounded-lg bg-background shadow-sm">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-4 flex-grow">
                            <FormField
                              control={menuForm.control}
                              name={`variants.${index}.type`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Tipo de Variante</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Ej: Tamaño, Estilo, S/N" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={menuForm.control}
                              name={`variants.${index}.options`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Opciones (separadas por coma)</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Ej: Chico, Mediano, Grande" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="sm:col-span-2 flex items-center justify-start gap-4 flex-wrap">
                              <FormField
                                control={menuForm.control}
                                name={`variants.${index}.allowMultiple`}
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center space-x-2 space-y-0 mt-2">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      Selección Múltiple
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                               <FormField
                                control={menuForm.control}
                                name={`variants.${index}.isDobleSeleccion`}
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center space-x-2 space-y-0 mt-2">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      Doble Selección
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                               <FormField
                                control={menuForm.control}
                                name={`variants.${index}.isRequired`}
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center space-x-2 space-y-0 mt-2">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal text-primary">
                                      Campo Obligatorio
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                          <Button type="button" variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive/90" onClick={() => remove(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ type: "", options: "", allowMultiple: false, isRequired: false, isDobleSeleccion: false })}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Variante
                    </Button>
                  </div>

                  <div className="space-y-4 p-4 border rounded-lg bg-secondary/50">
                    <FormField
                      control={menuForm.control}
                      name="variantPrices"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precios Adicionales por Variante (Opcional)</FormLabel>
                           <FormDescription>
                            Usa formato JSON. El precio aquí se SUMARÁ al precio base del platillo. Ejemplo: {`{"Queso Gratinado": 25, "Camarones Extra": 40}`}. ¡No pongas coma al final!
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder={'{\n  "Mediano": 30,\n  "Grande": 65\n}'}
                              {...field}
                              rows={4}
                              className="font-mono text-sm bg-background"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4 p-4 border rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-2">
                          <BookText className="h-5 w-5 text-primary"/>
                          <div>
                              <FormLabel>Reglas de Deshabilitación</FormLabel>
                              <FormDescription>
                                  Define reglas para deshabilitar opciones cuando otra es seleccionada.
                              </FormDescription>
                          </div>
                      </div>
                      <div className="space-y-3">
                          {disableRulesFields.map((field, index) => (
                              <div key={field.id} className="flex items-end gap-2 p-3 border rounded-lg bg-background shadow-sm">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-4 flex-grow">
                                      <FormField
                                          control={menuForm.control}
                                          name={`disableRules.${index}.when`}
                                          render={({ field }) => (
                                              <FormItem>
                                                  <FormLabel className="text-xs">Cuando se selecciona...</FormLabel>
                                                  <Select onValueChange={field.onChange} value={field.value}>
                                                      <FormControl>
                                                          <SelectTrigger>
                                                              <SelectValue placeholder="Elige una opción" />
                                                          </SelectTrigger>
                                                      </FormControl>
                                                      <SelectContent>
                                                          {allVariantOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                                      </SelectContent>
                                                  </Select>
                                                  <FormMessage />
                                              </FormItem>
                                          )}
                                      />
                                      <FormField
                                          control={menuForm.control}
                                          name={`disableRules.${index}.disable`}
                                          render={({ field }) => (
                                              <FormItem>
                                                  <FormLabel className="text-xs">Deshabilitar...</FormLabel>
                                                  <Popover>
                                                      <PopoverTrigger asChild>
                                                          <FormControl>
                                                              <Button
                                                                  variant="outline"
                                                                  role="combobox"
                                                                  className="w-full justify-between font-normal"
                                                              >
                                                                  <span className="truncate">
                                                                    {field.value?.length > 0 ? field.value.join(', ') : "Elige opciones"}
                                                                  </span>
                                                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                              </Button>
                                                          </FormControl>
                                                      </PopoverTrigger>
                                                      <PopoverContent className="w-full p-0">
                                                          <ScrollArea className="max-h-60">
                                                              <div className="p-4 space-y-2">
                                                                  {allVariantOptions.map(opt => (
                                                                      <div key={opt} className="flex items-center space-x-2">
                                                                          <Checkbox
                                                                              id={`${field.name}-${opt}`}
                                                                              checked={field.value?.includes(opt)}
                                                                              onCheckedChange={(checked) => {
                                                                                  const current = field.value || [];
                                                                                  const newValue = checked ? [...current, opt] : current.filter(v => v !== opt);
                                                                                  field.onChange(newValue);
                                                                              }}
                                                                          />
                                                                          <Label htmlFor={`${field.name}-${opt}`} className="font-normal">{opt}</Label>
                                                                      </div>
                                                                  ))}
                                                              </div>
                                                          </ScrollArea>
                                                      </PopoverContent>
                                                  </Popover>
                                                  <FormMessage />
                                              </FormItem>
                                          )}
                                      />
                                  </div>
                                  <Button type="button" variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive/90" onClick={() => removeDisableRule(index)}>
                                      <Trash2 className="h-4 w-4" />
                                  </Button>
                              </div>
                          ))}
                      </div>
                      <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => appendDisableRule({ when: "", disable: [] })}
                      >
                          <Plus className="mr-2 h-4 w-4" />
                          Agregar Regla
                      </Button>
                  </div>

                  <div className="space-y-4 p-4 border rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-2">
                          <GitBranchPlus className="h-5 w-5 text-primary"/>
                          <div>
                              <FormLabel>Reglas de Visibilidad Condicional</FormLabel>
                              <FormDescription>
                                  Muestra grupos de variantes solo cuando otra opción es seleccionada.
                              </FormDescription>
                          </div>
                      </div>
                      <div className="space-y-3">
                          {showRulesFields.map((field, index) => (
                              <div key={field.id} className="flex items-end gap-2 p-3 border rounded-lg bg-background shadow-sm">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-4 flex-grow">
                                      <FormField
                                          control={menuForm.control}
                                          name={`showRules.${index}.when`}
                                          render={({ field }) => (
                                              <FormItem>
                                                  <FormLabel className="text-xs">Cuando se selecciona...</FormLabel>
                                                  <Select onValueChange={field.onChange} value={field.value}>
                                                      <FormControl>
                                                          <SelectTrigger>
                                                              <SelectValue placeholder="Elige una opción" />
                                                          </SelectTrigger>
                                                      </FormControl>
                                                      <SelectContent>
                                                          {allVariantOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                                      </SelectContent>
                                                  </Select>
                                                  <FormMessage />
                                              </FormItem>
                                          )}
                                      />
                                      <FormField
                                          control={menuForm.control}
                                          name={`showRules.${index}.show`}
                                          render={({ field }) => (
                                              <FormItem>
                                                  <FormLabel className="text-xs">Mostrar grupos...</FormLabel>
                                                  <Popover>
                                                      <PopoverTrigger asChild>
                                                          <FormControl>
                                                              <Button
                                                                  variant="outline"
                                                                  role="combobox"
                                                                  className="w-full justify-between font-normal"
                                                              >
                                                                  <span className="truncate">
                                                                    {field.value?.length > 0 ? field.value.join(', ') : "Elige grupos de variantes"}
                                                                  </span>
                                                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                              </Button>
                                                          </FormControl>
                                                      </PopoverTrigger>
                                                      <PopoverContent className="w-full p-0">
                                                          <ScrollArea className="max-h-60">
                                                              <div className="p-4 space-y-2">
                                                                  {allVariantTypes.map(type => (
                                                                      <div key={type} className="flex items-center space-x-2">
                                                                          <Checkbox
                                                                              id={`${field.name}-${type}`}
                                                                              checked={field.value?.includes(type)}
                                                                              onCheckedChange={(checked) => {
                                                                                  const current = field.value || [];
                                                                                  const newValue = checked ? [...current, type] : current.filter(v => v !== type);
                                                                                  field.onChange(newValue);
                                                                              }}
                                                                          />
                                                                          <Label htmlFor={`${field.name}-${type}`} className="font-normal">{type}</Label>
                                                                      </div>
                                                                  ))}
                                                              </div>
                                                          </ScrollArea>
                                                      </PopoverContent>
                                                  </Popover>
                                                  <FormMessage />
                                              </FormItem>
                                          )}
                                      />
                                  </div>
                                  <Button type="button" variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive/90" onClick={() => removeShowRule(index)}>
                                      <Trash2 className="h-4 w-4" />
                                  </Button>
                              </div>
                          ))}
                      </div>
                      <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => appendShowRule({ when: "", show: [] })}
                      >
                          <Plus className="mr-2 h-4 w-4" />
                          Agregar Regla
                      </Button>
                  </div>

                  {features?.inventory_management && <div className="space-y-4 p-4 border rounded-lg bg-secondary/50">
                    <div className="flex items-center gap-2">
                        <ChefHat className="h-5 w-5 text-primary"/>
                        <div>
                            <FormLabel>Receta para Inventario</FormLabel>
                            <FormDescription>
                                Conecta este platillo al inventario para descontar stock automáticamente con cada venta.
                            </FormDescription>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {recipeFields.map((field, index) => {
                             const selectedInventoryItem = inventory.find(i => i.id === menuForm.watch(`recipe.${index}.inventoryItemId`));
                             return (
                                <div key={field.id} className="flex items-end gap-2 p-3 border rounded-lg bg-background shadow-sm">
                                    <FormField
                                        control={menuForm.control}
                                        name={`recipe.${index}.inventoryItemId`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel className="text-xs">Ingrediente</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecciona..." />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {(inventory || []).map(inv => <SelectItem key={inv.id} value={inv.id}>{inv.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={menuForm.control}
                                        name={`recipe.${index}.amount`}
                                        render={({ field }) => (
                                            <FormItem className="w-32">
                                                <FormLabel className="text-xs">Cantidad</FormLabel>
                                                <div className="flex items-center">
                                                    <FormControl>
                                                        <Input type="number" placeholder="0.0" {...field} />
                                                    </FormControl>
                                                    {selectedInventoryItem && <span className="ml-2 text-xs text-muted-foreground">{selectedInventoryItem.unit}</span>}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive/90" onClick={() => removeRecipe(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendRecipe({ inventoryItemId: "", amount: 0 })}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar Ingrediente a Receta
                    </Button>
                </div>}

                </div>
              </ScrollArea>
              <DialogFooter>
                 <Button type="button" variant="secondary" onClick={() => setItemModalOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingMenuItem ? "Guardar Cambios" : "Agregar Platillo"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isInventoryModalOpen} onOpenChange={setInventoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingInventoryItem ? 'Editar Ingrediente' : 'Agregar Ingrediente'}</DialogTitle>
          </DialogHeader>
           <Form {...inventoryForm}>
            <form onSubmit={inventoryForm.handleSubmit(handleSaveInventoryItem)} className="space-y-4">
              <FormField
                control={inventoryForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Ingrediente</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Camarón" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={inventoryForm.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Actual</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                    control={inventoryForm.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidad</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Unidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="kg">Kilogramo (kg)</SelectItem>
                            <SelectItem value="g">Gramo (g)</SelectItem>
                            <SelectItem value="lt">Litro (lt)</SelectItem>
                            <SelectItem value="ml">Mililitro (ml)</SelectItem>
                            <SelectItem value="pz">Pieza (pz)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
              <FormField
                control={inventoryForm.control}
                name="lowStockThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Umbral de Stock Bajo</FormLabel>
                    <FormDescription>Recibirás una alerta visual cuando el stock llegue a esta cantidad.</FormDescription>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setInventoryModalOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingInventoryItem ? 'Guardar Cambios' : 'Agregar Ingrediente'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>


      <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás realmente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el platillo del menú.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className={buttonVariants({ variant: "destructive" })}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!tableToDelete} onOpenChange={() => setTableToDelete(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
              <AlertDialogTitle>¿Seguro que quieres eliminar la mesa?</AlertDialogTitle>
              <AlertDialogDescription>
                  Esta acción no se puede deshacer. La mesa #{tableToDelete?.id} será eliminada permanentemente.
              </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setTableToDelete(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteTable} className={buttonVariants({ variant: "destructive" })}>Eliminar Mesa</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
