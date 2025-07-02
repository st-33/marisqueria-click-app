"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function BackButton() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;
  const backHref = restaurantId ? `/${restaurantId}` : '/';

  return (
    <Button asChild variant="outline" size="icon" className="absolute top-4 left-4 z-50 rounded-full shadow-lg">
      <Link href={backHref} aria-label="Volver a la selección de rol">
        <ArrowLeft className="h-5 w-5" />
      </Link>
    </Button>
  );
}
