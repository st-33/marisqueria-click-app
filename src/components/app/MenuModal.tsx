
"use client";

import * as React from 'react';
import type { Menu, MenuItem, OrderItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VariantModal } from './VariantModal';
import { Info, UtensilsCrossed, GlassWater } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  menu: Menu;
  onAddItem: (item: Omit<OrderItem, 'id' | 'status'>) => void;
}

export function MenuModal({ isOpen, onClose, menu, onAddItem }: MenuModalProps) {
  const [isVariantModalOpen, setVariantModalOpen] = React.useState(false);
  const [currentDish, setCurrentDish] = React.useState<MenuItem | null>(null);
  const [currentDishCategory, setCurrentDishCategory] = React.useState<'platillos' | 'bebidas_postres'>('platillos');

  const handleSelectDish = (dish: MenuItem, category: 'platillos' | 'bebidas_postres') => {
    if (dish.variants && dish.variants.length > 0) {
      setCurrentDish(dish);
      setCurrentDishCategory(category);
      setVariantModalOpen(true);
    } else {
      onAddItem({
        name: dish.name,
        price: dish.price,
        qty: 1,
        variants: [],
        category: category,
        menuItemId: dish.id,
      });
    }
  };
  
  const handleAddWithVariants = (item: Omit<OrderItem, 'id' | 'status' | 'category' | 'menuItemId'>, menuItemId: string) => {
    onAddItem({
        ...item,
        category: currentDishCategory,
        menuItemId: menuItemId,
    });
    setVariantModalOpen(false);
  };

  if (!menu) return null;

  const MenuGrid = ({ items, category }: { items: MenuItem[], category: 'platillos' | 'bebidas_postres' }) => {
    const Icon = category === 'platillos' ? UtensilsCrossed : GlassWater;
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pr-4">
        {items.map(dish => (
            <Card 
                key={dish.id} 
                className="group relative flex flex-col overflow-hidden bg-card/80 backdrop-blur-sm border border-border/20 shadow-lg hover:border-primary/50 hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => handleSelectDish(dish, category)}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <CardHeader className="relative z-10 p-3 flex-grow flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-base font-bold leading-tight text-card-foreground" title={dish.name}>
                            {dish.name}
                        </CardTitle>
                        {dish.description && (
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="shrink-0 h-6 w-6 -mr-1 -mt-1 text-card-foreground/70 hover:text-card-foreground"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Info className="h-4 w-4" />
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 text-sm">
                            {dish.description}
                            </PopoverContent>
                        </Popover>
                        )}
                    </div>
                    <div className="flex justify-between items-end mt-2">
                        <p className="text-accent font-extrabold text-xl">${dish.price > 0 ? dish.price.toFixed(2) : 'Varía'}</p>
                        <Icon className="h-5 w-5 text-accent/80" />
                    </div>
                </CardHeader>
            </Card>
        ))}
        </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col p-0 bg-secondary/80 backdrop-blur-sm">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-2xl">Menú</DialogTitle>
        </DialogHeader>
        <div className="flex-1 flex flex-col min-h-0 p-4">
          <Tabs defaultValue="platillos" className="flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="platillos">Platillos</TabsTrigger>
              <TabsTrigger value="bebidas_postres">Bebidas y Postres</TabsTrigger>
            </TabsList>
            <ScrollArea className="flex-grow mt-4">
                <TabsContent value="platillos" className="m-0">
                  <MenuGrid items={menu.platillos || []} category="platillos" />
                </TabsContent>
                <TabsContent value="bebidas_postres" className="m-0">
                  <MenuGrid items={menu.bebidas_postres || []} category="bebidas_postres" />
                </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>
      {currentDish && (
        <VariantModal
            isOpen={isVariantModalOpen}
            onClose={() => setVariantModalOpen(false)}
            dish={currentDish}
            onAddItem={handleAddWithVariants}
        />
      )}
    </Dialog>
  );
}
