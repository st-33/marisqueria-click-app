"use client";

import * as React from 'react';
import type { Table } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { PrintableTicket } from './PrintableTicket';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table | undefined;
  total: number;
  onMarkAsPaid: () => void;
}

export function AccountModal({ isOpen, onClose, table, total, onMarkAsPaid }: AccountModalProps) {
  const componentRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Mesa-${table?.id}-Cuenta`,
  });
  
  if (!table) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl">Cuenta de Mesa #{table.id}</DialogTitle>
        </DialogHeader>
        <div className="py-2">
            <ScrollArea className="max-h-64 font-mono text-foreground text-sm">
                <div className="pr-4 space-y-1">
                {(table.order || []).map((item, index) => (
                    <div key={item.id + index} className="flex justify-between">
                    <span className="w-1/12">{item.qty}x</span>
                    <span className="w-8/12 truncate" title={item.name}>{item.name}</span>
                    <span className="w-3/12 text-right">${(item.price * item.qty).toFixed(2)}</span>
                    </div>
                ))}
                </div>
            </ScrollArea>
        </div>
        <div className="border-t border-dashed border-gray-400 my-2"></div>
        <div className="flex justify-between items-center mt-2">
            <span className="text-lg font-semibold">TOTAL:</span>
            <span className="text-4xl font-extrabold text-primary">${total.toFixed(2)}</span>
        </div>
        <DialogFooter className="mt-4 flex-col gap-2 sm:flex-col sm:space-x-0">
          <Button 
            type="button" 
            size="lg" 
            className="w-full"
            variant="outline"
            onClick={handlePrint}
          >
            <Printer className="mr-2 h-5 w-5" />
            Imprimir Ticket
          </Button>
          <Button 
            type="button" 
            size="lg" 
            className="w-full bg-[hsl(var(--chart-2))] hover:bg-[hsl(var(--chart-2))]/90 text-primary-foreground" 
            onClick={onMarkAsPaid}
          >
            Marcar como Pagado
          </Button>
        </DialogFooter>

        <div className="hidden">
          <PrintableTicket ref={componentRef} table={table} total={total} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
