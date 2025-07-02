"use client";

import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ConnectionStatusProps {
    isConnected: boolean;
}

export function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
    const statusText = isConnected ? "En línea" : "Reconectando...";
    const statusColor = isConnected ? "text-green-500" : "text-amber-500";
    const tooltipText = isConnected 
        ? "Conexión estable con el servicio en tiempo real." 
        : "Se perdió la conexión. Intentando reconectar automáticamente. Los cambios se guardarán al recuperar la conexión.";

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center space-x-2">
                         <span className={cn("relative flex h-3 w-3")}>
                            {isConnected ? (
                                <>
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </>
                            ) : (
                                <>
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                </>
                            )}
                        </span>
                        <span className={cn("text-sm font-medium", isConnected ? 'text-foreground' : statusColor )}>
                            {statusText}
                        </span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{tooltipText}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
