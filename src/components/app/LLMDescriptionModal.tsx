"use client";

import * as React from 'react';
import { getDishDescriptionAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sparkles } from 'lucide-react';

interface LLMDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  dishName: string;
}

export function LLMDescriptionModal({ isOpen, onClose, dishName }: LLMDescriptionModalProps) {
  const [description, setDescription] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen && dishName) {
      const fetchDescription = async () => {
        setIsLoading(true);
        setDescription('');
        const result = await getDishDescriptionAction(dishName);
        setDescription(result);
        setIsLoading(false);
      };
      fetchDescription();
    }
  }, [isOpen, dishName]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Sparkles className="h-5 w-5 mr-2 text-accent" />
            Descripción del Platillo
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 min-h-[100px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="ml-3 text-muted-foreground">Generando descripción...</p>
            </div>
          ) : (
            <p className="text-base leading-relaxed text-foreground">{description}</p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
