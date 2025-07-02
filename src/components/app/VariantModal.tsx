
"use client";

import * as React from 'react';
import type { MenuItem, OrderItem, VariantOption } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface VariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  dish: MenuItem | null;
  onAddItem: (item: Omit<OrderItem, 'id' | 'status' | 'category' | 'menuItemId'>, menuItemId: string) => void;
}

export function VariantModal({ isOpen, onClose, dish, onAddItem }: VariantModalProps) {
  const [currentPrice, setCurrentPrice] = React.useState(0);
  
  // States for Simple Mode
  const [simpleSelections, setSimpleSelections] = React.useState<Record<string, string | string[]>>({});
  
  // States for Mixto Mode
  const [prep1Selections, setPrep1Selections] = React.useState<Record<string, string | string[]>>({});
  const [prep2Selections, setPrep2Selections] = React.useState<Record<string, string | string[]>>({});

  const isMixto = dish?.isMixto === true;

  const getSelectionsForRules = (prep?: 'prep1' | 'prep2') => {
    if (!isMixto) return Object.values(simpleSelections).flat();
    if (prep === 'prep1') return Object.values(prep1Selections).flat();
    if (prep === 'prep2') return Object.values(prep2Selections).flat();
    // For general checks in mixto mode, combine both preps
    return [...Object.values(prep1Selections).flat(), ...Object.values(prep2Selections).flat()];
  };

  const getDisabledOptions = (prep?: 'prep1' | 'prep2') => {
    if (!dish || !dish.disableRules) return new Set<string>();
    const currentSelections = getSelectionsForRules(prep);
    const toDisable = new Set<string>();
    dish.disableRules.forEach(rule => {
        if (currentSelections.includes(rule.when)) {
            rule.disable.forEach(optionToDisable => toDisable.add(optionToDisable));
        }
    });
    return toDisable;
  };
  
  const getVisibleVariantTypes = (prep?: 'prep1' | 'prep2') => {
    if (!dish) return new Set<string>();
    const allTypes = (dish.variants || []).map(v => v.type);
    const conditionalTypes = new Set((dish.showRules || []).flatMap(r => r.show));
    const initiallyVisible = new Set(allTypes.filter(t => !conditionalTypes.has(t)));
    if (!dish.showRules) return initiallyVisible;
    const currentSelections = getSelectionsForRules(prep);
    (dish.showRules || []).forEach(rule => {
      if (currentSelections.includes(rule.when)) {
        rule.show.forEach(typeToShow => initiallyVisible.add(typeToShow));
      }
    });
    return initiallyVisible;
  };


  React.useEffect(() => {
    if (isOpen && dish) {
      if (isMixto) {
          const initialSelections: Record<string, string | string[]> = {};
          (dish.variants || []).forEach(v => {
              initialSelections[v.type] = v.allowMultiple ? [] : '';
          });
          setPrep1Selections(JSON.parse(JSON.stringify(initialSelections)));
          setPrep2Selections(JSON.parse(JSON.stringify(initialSelections)));
      } else {
          const initialSelections: Record<string, string | string[]> = {};
          (dish.variants || []).forEach(v => {
              initialSelections[v.type] = v.allowMultiple ? [] : '';
          });
          setSimpleSelections(initialSelections);
      }
      setCurrentPrice(dish.price);
    }
  }, [dish, isOpen, isMixto]);

  // Price calculation effect
  React.useEffect(() => {
    if (!dish || !isOpen) return;

    if (isMixto) {
      // For mixto dishes, the price is fixed as per the current data model.
      setCurrentPrice(dish.price);
      return;
    }

    const addonsPrice = Object.values(simpleSelections)
      .flat()
      .filter(Boolean)
      .reduce((sum, option) => {
        const price = dish.variantPrices?.[option as string] || 0;
        return sum + price;
      }, 0);
    setCurrentPrice(dish.price + addonsPrice);
  }, [simpleSelections, dish, isOpen, isMixto]);


  const isPrepValid = (selections: Record<string, string | string[]>, visibleTypes: Set<string>) => {
    if (!dish) return true;
    return (dish.variants || [])
      .filter(v => visibleTypes.has(v.type) && v.isRequired)
      .every(v => {
        const selection = selections[v.type];
        return Array.isArray(selection) ? selection.length > 0 : !!selection;
      });
  };
  
  const isFormValid = React.useMemo(() => {
      if (!dish) return true;
      if (isMixto) {
        // At least one prep must be valid and have selections
        const p1Visible = getVisibleVariantTypes('prep1');
        const p2Visible = getVisibleVariantTypes('prep2');
        const p1Valid = isPrepValid(prep1Selections, p1Visible);
        const p2Valid = isPrepValid(prep2Selections, p2Visible);
        const p1HasSelections = getSelectionsForRules('prep1').length > 0;
        
        return p1Valid && p2Valid && p1HasSelections;
      } else {
        const visibleTypes = getVisibleVariantTypes();
        return isPrepValid(simpleSelections, visibleTypes);
      }
  }, [dish, isMixto, simpleSelections, prep1Selections, prep2Selections]);


  const handleAddItem = () => {
    if (!dish || !isFormValid) return;
    let finalVariants: string[] = [];
    if (isMixto) {
        const prep1Final = Object.entries(prep1Selections).map(([type, val]) => ({type, val: Array.isArray(val) ? val.join(', '): val})).filter(v => v.val);
        const prep2Final = Object.entries(prep2Selections).map(([type, val]) => ({type, val: Array.isArray(val) ? val.join(', '): val})).filter(v => v.val);
        
        if (prep1Final.length > 0) {
            finalVariants.push(`Prep 1: ${prep1Final.map(v => v.val).join(', ')}`);
        }
        if (prep2Final.length > 0) {
            finalVariants.push(`Prep 2: ${prep2Final.map(v => v.val).join(', ')}`);
        }
    } else {
        finalVariants = Object.values(simpleSelections).flat().filter(Boolean) as string[];
    }
    
    const itemToAdd = {
      name: dish.name,
      price: currentPrice,
      qty: 1,
      variants: finalVariants,
    };
    onAddItem(itemToAdd, dish.id);
    onClose();
  };
  
  const handleVariantChange = (
      type: string, 
      value: string | string[], 
      allowMultiple: boolean,
      prep?: 'prep1' | 'prep2'
  ) => {
    const setSelections = prep === 'prep1' ? setPrep1Selections : (prep === 'prep2' ? setPrep2Selections : setSimpleSelections);
    
    setSelections(prev => {
        const newSelections = { ...prev };
        if (allowMultiple) {
            newSelections[type] = value as string[];
        } else {
            newSelections[type] = prev[type] === value ? '' : value;
        }
        return newSelections;
    });
  };

  const renderVariantGroup = (variantType: VariantOption, prep?: 'prep1' | 'prep2') => {
    const selections = prep === 'prep1' ? prep1Selections : (prep === 'prep2' ? prep2Selections : simpleSelections);
    const disabledOptions = getDisabledOptions(prep);

    return (
        <div key={variantType.type}>
          <h4 className="font-semibold text-lg text-foreground mb-2">
            {variantType.type}
            {variantType.isRequired && <span className="text-destructive ml-1">*</span>}
          </h4>
          <ToggleGroup 
              type={variantType.allowMultiple ? "multiple" : "single"}
              value={selections[variantType.type]}
              onValueChange={(value) => handleVariantChange(variantType.type, value, !!variantType.allowMultiple, prep)}
              className="flex flex-wrap gap-2 justify-start"
          >
              {variantType.options.map(option => (
                  <ToggleGroupItem 
                    key={option} 
                    value={option}
                    disabled={disabledOptions.has(option)}
                    className="border-2 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground data-[state=on]:border-accent h-auto p-3 text-base"
                  >
                      {option}
                  </ToggleGroupItem>
              ))}
          </ToggleGroup>
        </div>
    );
  };
  
  if (!dish) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-secondary/80 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isMixto ? `Elige 2 Estilos de preparación: ${dish.name}` : `Variantes de ${dish.name}`}
          </DialogTitle>
        </DialogHeader>
        
        {isMixto ? (
            <Tabs defaultValue="prep1" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="prep1">Preparación 1</TabsTrigger>
                    <TabsTrigger value="prep2">Preparación 2</TabsTrigger>
                </TabsList>
                <ScrollArea className="max-h-[50vh] mt-4">
                    <TabsContent value="prep1" className="pr-4 space-y-6">
                        {(dish.variants || []).filter(v => getVisibleVariantTypes('prep1').has(v.type)).map(v => renderVariantGroup(v, 'prep1'))}
                    </TabsContent>
                    <TabsContent value="prep2" className="pr-4 space-y-6">
                        {(dish.variants || []).filter(v => getVisibleVariantTypes('prep2').has(v.type)).map(v => renderVariantGroup(v, 'prep2'))}
                    </TabsContent>
                </ScrollArea>
            </Tabs>
        ) : (
            <ScrollArea className="max-h-[60vh] p-1">
                <div className="space-y-6 pr-4">
                    {(dish.variants || []).filter(v => getVisibleVariantTypes().has(v.type)).map(v => renderVariantGroup(v))}
                </div>
            </ScrollArea>
        )}

        <DialogFooter>
          <Button 
            type="button" 
            size="lg" 
            className="w-full" 
            onClick={handleAddItem}
            disabled={!isFormValid}
          >
            {isFormValid
              ? `Agregar al Pedido ($${currentPrice.toFixed(2)})`
              : 'Completa los campos obligatorios'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    