
"use client";

import * as React from 'react';
import type { Menu, MenuItem, OrderItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VariantModal } from './VariantModal';
import { Info } from 'lucide-react';
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

  const MenuGrid = ({ items, category }: { items: MenuItem[], category: 'platillos' | 'bebidas_postres' }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pr-4">
      {items.map(dish => (
        <Card 
            key={dish.id} 
            className="flex flex-col bg-background/50 backdrop-blur-sm border-2 border-primary/20 shadow-lg hover:shadow-primary/20 transition-all duration-200 ease-in-out cursor-pointer hover:ring-2 hover:ring-primary"
            onClick={() => handleSelectDish(dish, category)}
        >
            <CardHeader className="p-2 pb-1 flex-row items-start justify-between flex-grow">
                <CardTitle className="text-base font-semibold leading-tight text-left" title={dish.name}>
                    {dish.name}
                </CardTitle>
                {dish.description && (
                <Popover>
                    <PopoverTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="shrink-0 h-6 w-6 -mr-1 -mt-1"
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
            </CardHeader>
            <CardContent className="p-2 pt-0 flex flex-col justify-end items-start">
                <p className="text-primary font-bold text-lg">${dish.price > 0 ? dish.price.toFixed(2) : 'Varía'}</p>
            </CardContent>
        </Card>
      ))}
    </div>
  );

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
