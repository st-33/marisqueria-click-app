"use client";

import * as React from 'react';
import type { Table } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PrintableTicketProps {
  table: Table | undefined;
  total: number;
}

export const PrintableTicket = React.forwardRef<HTMLDivElement, PrintableTicketProps>(
  ({ table, total }, ref) => {
    // Defer date generation to the client side to avoid hydration mismatch.
    const [printDate, setPrintDate] = React.useState('');

    React.useEffect(() => {
        setPrintDate(format(new Date(), "dd/MM/yyyy HH:mm:ss", { locale: es }));
    }, []);

    if (!table) return null;

    return (
      <div ref={ref} className="p-1 font-mono text-xs text-black bg-white w-[280px]">
        <style type="text/css" media="print">
          {"@page { size: 80mm auto; margin: 0; } body { margin: 0.5cm; }"}
        </style>
        <div className="text-center">
            <h1 className="font-bold text-sm mb-1">MarisqueríaClick</h1>
            <p className="text-xs">Gracias por su preferencia</p>
        </div>
        <hr className="my-2 border-black border-dashed" />
        <div className="text-xs">
            <p>Mesa: #{table.id}</p>
            <p>Fecha: {printDate}</p>
        </div>
        <hr className="my-2 border-black border-dashed" />
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left w-4">#</th>
              <th className="text-left">Producto</th>
              <th className="text-right">Importe</th>
            </tr>
          </thead>
          <tbody>
            {(table.order || []).map((item, index) => (
              <tr key={item.id + index}>
                <td className="align-top pr-1">{item.qty}</td>
                <td className="align-top">
                  {item.name}
                  {item.variants && item.variants.length > 0 && (
                    <div className="text-[10px] pl-1 leading-tight">
                      ({item.variants.join(', ')})
                    </div>
                  )}
                </td>
                <td className="align-top text-right">${(item.price * item.qty).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr className="my-2 border-black border-dashed" />
        <div className="flex justify-between font-bold text-sm">
          <span>TOTAL:</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <hr className="my-2 border-black border-dashed" />
        <p className="text-center mt-2 text-xs">¡Vuelva pronto!</p>
      </div>
    );
  }
);
PrintableTicket.displayName = 'PrintableTicket';
